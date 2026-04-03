# 🎴 Sight Words Memory

英語の Sight Words を使ったメモリーゲーム（神経衰弱）です。  
2〜4人で遊べます。カードをめくると英単語が読み上げられます。

## 遊び方

1. プレイヤー数（2〜4人）と名前を入力
2. 難易度を選ぶ（8・12・16ペア）
3. カードをクリック → 英単語が音声で流れます
4. 同じペアを見つけたらマッチ！そのプレイヤーのターンが続きます
5. 全ペアがそろったらゲーム終了 🏆

## ローカル開発

```bash
npm install
npm run dev
```

## Vercel へのデプロイ

1. このリポジトリを GitHub に push
2. [vercel.com](https://vercel.com) でプロジェクトをインポート
3. フレームワーク: **Vite** を選択（自動検出されます）
4. 設定はそのまま → **Deploy**

## 技術スタック

- **React 18** + **Vite 5**
- **Web Speech API** — 英単語の音声読み上げ
- **CSS 3D Transforms** — カードフリップアニメーション
- **Fredoka One** + **Baloo 2** — フォント（Google Fonts）
