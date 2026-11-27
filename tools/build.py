#!/usr/bin/env python3
"""元の写真フォルダから、公開用の画像と作品の一覧を作る。

使い方:  python3 -I tools/build.py ~/Desktop/web_portfolio

- 読むのは architecture / furniture / products / art の 4 フォルダだけ。
  フォルダの外に置いた写真・PDF は読まない（公開されない）。
- フォルダ名がタグになる。
- ファイル名の末尾の番号だけが違う写真は 1 つの作品にまとめる。
    kumeseizai_hut1 / kumeseizai_hut_2 → kumeseizai-hut
    light_object_A / light_object_B   → light-object
- 画像は長辺 800px と 1600px の WebP にし、写真に付いている情報を消す（-strip）。
- 作品名・年・担当などは data/meta.js に手で書く（このスクリプトは触らない）。
"""
import json
import pathlib
import re
import subprocess
import sys

CATEGORIES = ["architecture", "furniture", "products", "art"]  # 並べる順
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".tif", ".tiff"}
SIZES = [800, 1600]
OG_SOURCE = "shiiba_sauna"  # 共有したときに出る写真（ファイル名、拡張子なし）

ROOT = pathlib.Path(__file__).resolve().parent.parent
IMG = ROOT / "img"
DATA = ROOT / "data"


def slug(s: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", s.lower())
    return s.strip("-")


def work_key(stem: str) -> str:
    """末尾の番号を外して、作品の名前にする。"""
    m = re.match(r"^(.*?)[-_ ](\d{1,3}|[A-Z])$", stem)  # name_2, name-2, name_A
    if m:
        return m.group(1)
    m = re.match(r"^(.*[a-z])(\d{1,2})$", stem)  # name1, name12（SDIM0003 は対象外）
    if m:
        return m.group(1)
    return stem


def magick(*args):
    subprocess.run(["magick", *args], check=True)


def main():
    if len(sys.argv) != 2:
        sys.exit("使い方: python3 -I tools/build.py <元の写真フォルダ>")
    src = pathlib.Path(sys.argv[1]).expanduser()
    IMG.mkdir(exist_ok=True)
    DATA.mkdir(exist_ok=True)

    works, made, og_file = [], set(), None
    for cat in CATEGORIES:
        folder = src / cat
        if not folder.is_dir():
            print(f"フォルダがない: {cat}（とばします）")
            continue
        files = sorted(
            (p for p in folder.iterdir() if p.suffix.lower() in EXTS and not p.name.startswith(".")),
            key=lambda p: p.name.lower(),
        )
        groups: dict[str, list[pathlib.Path]] = {}
        for p in files:
            groups.setdefault(work_key(p.stem), []).append(p)
            if p.stem == OG_SOURCE:
                og_file = p
        for key, photos in groups.items():
            wid = slug(key)
            images = []
            for i, p in enumerate(photos, 1):
                name = wid if len(photos) == 1 else f"{wid}-{i}"
                for size in SIZES:
                    out = IMG / f"{name}-{size}.webp"
                    made.add(out.name)
                    if out.exists() and out.stat().st_mtime >= p.stat().st_mtime:
                        continue
                    magick(str(p), "-auto-orient", "-resize", f"{size}x{size}>", "-strip", "-quality", "80", str(out))
                w, h = subprocess.run(
                    ["magick", "identify", "-format", "%w %h", str(IMG / f"{name}-1600.webp")],
                    check=True, capture_output=True, text=True,
                ).stdout.split()
                images.append({"src": name, "w": int(w), "h": int(h)})
            works.append({"id": wid, "category": cat, "file": key, "images": images})
            print(f"{cat:13} {wid}  ({len(photos)} 枚)")

    if og_file:
        magick(str(og_file), "-auto-orient", "-resize", "1200x630^", "-gravity", "center",
               "-extent", "1200x630", "-strip", "-quality", "82", str(IMG / "og.jpg"))
        made.add("og.jpg")

    # いまの一覧にない古い画像を片付ける（名前を変えた写真の残り）
    for old in IMG.iterdir():
        if old.name not in made and old.suffix in {".webp", ".jpg"}:
            old.unlink()
            print(f"片付け: {old.name}")

    (DATA / "works.js").write_text(
        "// tools/build.py が作るファイル。手で直さない（作品名などは data/meta.js へ）\n"
        "window.WORKS = " + json.dumps(works, ensure_ascii=False, indent=1) + ";\n",
        encoding="utf-8",
    )
    print(f"\n{len(works)} 作品 / 画像 {len(made)} ファイル")


if __name__ == "__main__":
    main()
