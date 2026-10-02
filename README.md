# 🎴 Sight Words Memory

英語の Sight Words を使ったメモリーゲーム（神経衰弱）です。  
1〜4人で遊べます（ひとりモードあり）。カードをめくると英単語が読み上げられます。

## 遊び方

1. プレイヤー数（1〜4人）と名前を入力
2. カテゴリ（単語セット）を選ぶ
3. 難易度を選ぶ（4・8・12・16ペア）
4. カードをクリック → 英単語が音声で流れます
5. 同じペアを見つけたらマッチ！そのプレイヤーのターンが続きます
6. 全ペアがそろったら「音を聞いて単語を選ぶ」ミニ確認（3問）→ 結果 🏆

## 学習記録について

- 神経衰弱のめくり間違いは「位置の取り違え」なので、苦手問題（wrongAnswers）には送りません。
- 学習記録（WiseXP / WiseGame の correct・total・wrongAnswers）は、終了後のミニ確認 3問の正誤だけで作ります。

## URLパラメータ（ディープリンク）

| パラメータ | 値 | 動作 |
|---|---|---|
| `players` | `1`〜`4` | 人数を指定（名前入力をとばす） |
| `pairs` | `4` / `8` / `12` / `16` | ペア数を指定（難易度選択をとばす） |
| `set` | カテゴリID（カンマ区切りで複数可）または `all` | 単語セットを指定（カテゴリ選択をとばす） |

例: `/?players=1&pairs=4&set=pronouns` … ひとり・4ペア・だいめいし で即開始。  
カテゴリID: `pronouns, articles, be_aux, questions, verbs1〜verbs5, people, school, places, nature, food_time, things, adj1〜adj3, adverbs, prepositions, numbers, expressions`  
指定がない項目は通常どおり画面で選びます。

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
