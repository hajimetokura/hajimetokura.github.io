# hajimetokura.github.io

Portfolio of Hajime Tokura — https://hajimetokura.github.io/

## 更新のしかた

1. 元の写真フォルダ（architecture / furniture / products / art）に写真を足す・名前を直す
   - 同じ作品の写真は、末尾の番号だけ変える（`hut_1.jpg` `hut_2.jpg`）
2. `python3 -I tools/build.py <元の写真フォルダ>` を動かす（画像と data/works.js ができる）
3. 作品名・年・担当・撮影者を `data/meta.js` に書く
4. `index.html` をブラウザで開いて確かめる（黄色の「要確認」は自分の Mac でだけ出る）
5. commit して push

元の写真・PDF はリポに入れない。写真の権利は LICENSE のとおり。
