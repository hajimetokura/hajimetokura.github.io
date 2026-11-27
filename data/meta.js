// 作品ごとの情報。ここは手で直すファイル。
// 左の名前（"kumeseizai-hut" など）は data/works.js の id と同じにする。
// 書かなかった項目は、ファイル名から作った仮の名前になり、
// 自分の Mac で開いたときだけ黄色の「要確認」が出る（公開したページには出ない）。
//
//   title: 作品名（英語）       ja: 作品名（日本語、小さく添える）
//   year:  年                   tags: 手法・素材のタグ（例: ["CNC", "Wood"]）
//   role:  担当（例: "Computational Design"）
//   by:    チームの名前（例: "VUILD"）。自分ひとりの作品なら書かない
//   photo: 撮影者（例: "Hayato Kurobe"）
window.META = {
  "sdim0003": { title: "Material Remix Stool", role: "New Cross Section / Material Remix", photo: "Hajime Tokura" },
  "soundzougan-obon": { role: "New Cross Section / Material Remix", photo: "Hajime Tokura", tags: ["Sound"] },
  "soundmilling-city": { tags: ["Sound", "CNC"] },
  "soundmillingzzz": { tags: ["Sound", "CNC"] },
  "bend-cnc-chair": { tags: ["CNC"] },
  "simple-cnc-chair": { tags: ["CNC"] },
};

// 自己紹介とリンク
window.PROFILE = {
  name: "Hajime Tokura",
  line: "",          // 例: "Designer / Computational fabrication"
  links: [
    // { label: "Instagram", url: "https://www.instagram.com/..." },
    // { label: "VUILD", url: "https://vuild.co.jp/" },
  ],
};
