
- [hadbit-v3](#hadbit-v3)
  - [🚀 プロジェクト概要](#-プロジェクト概要)
    - [目的（Aim）：狙い](#目的aim狙い)
    - [概要（Overview）：](#概要overview)
  - [🛠 技術スタックと選定理由](#-技術スタックと選定理由)
  - [📋 基本仕様](#-基本仕様)
    - [1. 開発・実行環境](#1-開発実行環境)
    - [2. フロントエンド](#2-フロントエンド)
    - [3. バックエンド \& BaaS](#3-バックエンド--baas)
  - [📂 ディレクトリ構成](#-ディレクトリ構成)
  - [要件](#要件)
    - [非機能要件](#非機能要件)
    - [スタート画面](#スタート画面)
    - [登録画面 Logs](#登録画面-logs)
    - [マスタ編集画面 Items](#マスタ編集画面-items)
    - [統計画面 Analystic](#統計画面-analystic)
  - [画面一覧とURL設計](#画面一覧とurl設計)
  - [各画面の責務](#各画面の責務)
    - [1. スタート画面 (`/dashboard`)](#1-スタート画面-dashboard)
    - [2. 登録画面 (`/logs`)](#2-登録画面-logs)
    - [3. マスタ編集画面 (`/Items`)](#3-マスタ編集画面-items)
    - [4. 統計画面 (`/analytics`)](#4-統計画面-analytics)
  - [論理構成図（テーブル定義）](#論理構成図テーブル定義)
    - [1. hadbit\_items (習慣項目マスタ)](#1-hadbit_items-習慣項目マスタ)
      - [1.item\_style](#1item_style)
  - [1. 登山テンプレート](#1-登山テンプレート)
  - [2. ランニングテンプレート](#2-ランニングテンプレート)
  - [3. 外食テンプレート](#3-外食テンプレート)
  - [4. 映画鑑賞テンプレート](#4-映画鑑賞テンプレート)
  - [実装のアドバイス：テンプレート処理の指針](#実装のアドバイステンプレート処理の指針)
    - [2. hadbit\_trees (習慣項目階層管理)](#2-hadbit_trees-習慣項目階層管理)
    - [3. hadbit\_logs (実施記録)](#3-hadbit_logs-実施記録)
    - [構成のポイント](#構成のポイント)
  - [DDL](#ddl)
- [クエリ頑張る系](#クエリ頑張る系)
  - [DB接続方法](#db接続方法)
- [Todo](#todo)
- [履歴](#履歴)


# hadbit-v3

日々の習慣すべき項目を**hadbit**として、それを記録し続けるためのアプリ


* [Github](https://github.com/sickboy0001/hadbit-v3)
* [Vercel](https://hadbit-v3.vercel.app/dashboard)


## 🚀 プロジェクト概要

* 個人個人で習慣化すべき項目を分類化、リストアップして、
* 習慣化はやりたくても、やりきれないもの・・・成果を含めて記録できる状態を目指すサービスです。
  * 最初はNotionでそれっぽい物作ってたけど、操作感や実施することのモチベーション上げるための画面作れなくて自分で作成した次第
* React NextJS Vercel Supabaseでの構成想定


### 目的（Aim）：狙い
* 「習慣をつける」はなかなか実践したくてもできないものそれを支援するためのツール

### 概要（Overview）：

* Dashboard：現在の状況の表示、ログイン後のスタート画面
* Items:習慣化したい項目を登録
* Logs：実際に記録するための画面、記録した結果も確認可能
* Analytics：分析、各項目の実際の常用の確認

---

## 🛠 技術スタックと選定理由

|技術要素|役割・選定理由|
|-|-|
|**Python / FastAPI**|サーバーサイドの主軸。Router/Service層を分けたクリーンな構成の学習と実践。|
|**htmx**|フロントエンドのUX向上。HTMLベースで動的な非同期通信を実現し、複雑さを軽減。|
|**DaisyUI (Tailwind CSS)**|UIコンポーネントライブラリ。直接CSSを書く手間を省き、一貫したデザインを迅速に構築。|
|**Docker**|環境のポータビリティ確保。Render以外のホスト環境への移行も容易にするため。|
|**Render**|サーバーサイドおよびDockerとの親和性が高く、Vercel以外の有力な選択肢として採用。|
|**kyoeb**|Renderだと重いので回避|
|**Supabase**|データベース(PostgreSQL)および認証基盤(Auth)として利用。|

---

## 📋 基本仕様

### 1\. 開発・実行環境

* **エディタ**: Visual Studio Code (VS Code)
* **開発支援**: Gemini Code Assist
* **ランタイム**: TypeScript React 

### 2\. フロントエンド

* **非同期通信**: React NextJS
* **スタイリング**: Shadcnui (Tailwind CSS)

### 3\. バックエンド \& BaaS

* **DB/Auth**: Supabase (PostgreSQL / Supabase Auth)

---

## 📂 ディレクトリ構成


```text
src/
├── app/                        # 画面（Pages）およびルートハンドラー
│   ├── (auth)/                 # 認証周りの処理グループ
│   │   ├── login/              # ログイン処理・画面
│   │   └── signup/             # 新規ユーザー登録用の画面
│   ├── (user)/                 # 認証済みページグループ
│   │   ├── dashboard/          # ダッシュボード
│   │   │   └── page.tsx        # 入り口のサーバーコンポーネント
│   │   ├── logs/               # 習慣化の記録の確認
│   │   │   └── page.tsx        # 入り口のサーバーコンポーネント
│   │   └── items/              # 習慣化のマスタの確認
│   │       └── page.tsx        # 入り口のサーバーコンポーネント
│   ├── globals.css             # グローバルスタイル
│   ├── layout.tsx              # ルートレイアウト
│   └── page.tsx                # トップページ
├── components/                 # 再利用可能なUIコンポーネント
│   ├── auth/                   # 認証周りのコンポーネント
│   │   ├── login/              # ログイン関連部品
│   │   └── signup/             # 新規登録関連部品
│   ├── layout/                 # Atomicデザイン：layoutコンポーネント
│   ├── organisms/              # Atomicデザイン：organismsコンポーネント
│   ├── pages/                  # 各ページから呼び出されるページ単位のコンポーネント
│   └── ui/                     # shadcn/ui等の基本コンポーネント
├── constants/                  # 定数情報、解説コメントなど
├── service/                    # ビジネスロジック（データ取得・集計関数など）
├── lib/                        # 共通ロジック
│   ├── supabase/               # Supabase関連
│   │   ├── auth.ts             # 認証ロジック
│   │   └── db.ts               # データベース操作
│   ├── util.ts                 # 汎用ユーティリティ
│   ├── utilNumber.ts           # 数値操作ユーティリティ
│   └── utilDate.ts             # 日付操作ユーティリティ
└── middleware.ts               # 認証状態に基づいたリダイレクト制御

```

## 要件
### 非機能要件
- **表示順の変更:** よく使うボタンを上に持ってくる（ソート機能）は必要
  - マスタ編集画面で変更して、それに合わせて登録画面で作成する
- **完了状態の可視化:** 登録画面の下のほうに、登録済みのデータが見えるようにする。

###  スタート画面
- 最初にログインしたときに見える画面です。
- ここから「登録画面」や「マスタ編集画面」「統計画面」に遷移する
### 登録画面 Logs
- ログイン後利用可能
- 登録された習慣化マスタから画面を作成して、習慣化の記録を残す
- 例えば、マスタとして運動→階段利用があったときには、階段利用のボタンを準備
- 押下することで、階段利用を行ったこと登録する

- **記録の単位:** 「「1日に何度も」押せるのか（例：階段利用は1日何回も発生する）。
- **取り消し機能:** 間違えてボタンを押した場合、その場で削除・修正は可能。トーストで表示、編集、削除を展開できる
- **日付の概念:** デフォルトは今日だが、編集画面で日時は変更できることとする

###  マスタ編集画面 Items
- 習慣化したい項目について登録する
- マスタ自体は階層化機能をもつ
- 基本はタイトル、項目の親子関係をもつ
  - 運動→ランニング、運動→スクワッド、運動→クランク、学習→Schoo、学習→Audible、余暇→のみ、余暇→外食など
- **階層の深さ:** 親→子の2階層固定
- **マスタの削除・変更:** 既に記録があるマスタ（例：「ランニング」）を削除したり名前を変えたりした場合、過去の記録は更新された状態で見える
 
### 統計画面 Analystic
- 何をどの程度習慣化して実施した見れる画面
- 指定された項目、カテゴリーを、日ごと、週ごと、月ごとにどれだけ実施したか見れる画面にする
- カレンダー形式のヒートマップ、週間の棒グラフでの展開が可能

## 画面一覧とURL設計

| 画面名 | URL (Path) | 画面名（システム上の識別子） | 説明 |
| --- | --- | --- | --- |
| **スタート画面** | `/dashboard` | `Dashboard` | ログイン後の拠点となるポータル。各機能へのハブ |
| **登録画面** | `/hadbit/logs` | `Logs` | 習慣化マスタをボタン表示し、実績を記録するメイン画面。 |
| **マスタ編集画面** | `/hadbit/Items` | `Items` | カテゴリや項目の階層構造、表示順を設定する画面。 |
| **統計画面** | `/hadbit/analytics` | `Analytics` | 日・週・月ごとの実施状況を可視化する画面。 |

## 各画面の責務

### 1. スタート画面 (`/dashboard`)

* **導線:** `/Logs`, `/Items`, `/analytics` への大きなナビゲーションボタンを配置。
* **状態:** ログインしていない場合は `/login` へリダイレクトする制御が必要です。

### 2. 登録画面 (`/logs`)

* **動的生成:** `/Items` で定義された「表示順」に従ってボタンを配置します。
* **履歴表示:** 画面下部にその日の履歴一覧を表示。

### 3. マスタ編集画面 (`/Items`)

* **構造:** 親カテゴリ（運動など）の中に子項目（ランニングなど）をネストして表示。
* **ソート:** ドラッグ＆ドロップ、または「↑↓」ボタンで順序を入れ替え、その順序（`sort_order`）をDBに保存します。

### 4. 統計画面 (`/analytics`)

* 様々な表現で習慣化の進捗を可視化する画面。

---

## 論理構成図（テーブル定義）

---

### 1. hadbit_items (習慣項目マスタ)

習慣項目の基本情報を保持します。`user_id` が `UUID` に変更されています。

| カラム名 | データ型 | NULL許容 | 説明 | 備考 |
| --- | --- | --- | --- | --- |
| **id** | SERIAL | NO | 項目の一意識別ID | 主キー |
| **user_id** | **UUID** | NO | 所有者ユーザーのID | 外部キー (`auth.users.id`) |
| name | TEXT | NO | 習慣の名前 |  |
| short_name | TEXT | YES | 略称 |  |
| description | TEXT | YES | 詳細説明 |  |
| parent_flag | BOOLEAN | YES | 親カテゴリフラグ | デフォルト: false |
| public_flag | BOOLEAN | YES | 公開設定 | デフォルト: false |
| visible_flag | BOOLEAN | YES | 表示有無 | デフォルト: true |
| delete_flag | BOOLEAN | YES | 削除フラグ | デフォルト: false |
| **is_deleted** | BOOLEAN | YES | 削除状態（新設） | デフォルト: false |
| item_style | JSONB | YES | UIスタイル設定 | JSON形式 |
| updated_at | TIMESTAMP | NO | 最終更新日時 | 既定値: CURRENT_TIMESTAMP |
| created_at | TIMESTAMP | NO | レコード作成日時 | 既定値: CURRENT_TIMESTAMP |

---

#### 1.item_style

- JSON形式で、item_styleのテンプレートを指定できるものとする。
- 情報としてはパーツの並びとパーツ毎の情報をもつ
- パーツ毎の情報
  - 前置詞、インプット、後置詞をセットとする
    - インプットは、数値（数値、少数含むかどうか、Placeholder、文字数（幅））か、文字列（日本語、英語、改行含む）かを選べる
    - 前置詞、後置詞はコンテンツの有無で表示、非表示を選べる
- 例）
  - パーツセット
    - 項目名、
      - 前置詞１、インプット１、後置詞１(改行：有無)
      - 前置詞２、インプット２、後置詞２(改行：有無)、
      - 入力項目１、入力項目２、
      - 結果
    - 登山
      - 前置詞１：（空白）、インプット１：Placeholder：`山`、後置詞１：（空白）
      - 前置詞２：`(`、インプット２：Placeholder：`詳細`、後置詞２：`)`
      - 前置詞３：`[`、インプット３:Placeholder：`時間`、後置詞３`時間]`
      - 入力項目１：`六甲山`、入力項目２：`芦屋・有馬`、入力項目３：`2.5`→結果 `六甲山(芦屋・有馬)[2.5時間]`
    - ランニング１
      - 前置詞１：（空白）、インプット１：Placeholder：`距離`、後置詞１：（空白）
      - 前置詞２：`[`、インプット２:Placeholder：`分`、後置詞２`分]`
      - 前置詞３：`[`、インプット３:Placeholder：`場所`、後置詞３`]`
      - 入力項目１：`3.3`、入力項目２：`30`、入力項目３：`御堂筋`→結果 `3.3Km[30分][御堂筋]`
    - 有酸素運動・ジム
      - 前置詞１：（空白）、インプット１：Placeholder：`分`、後置詞１：（空白）
      - 前置詞２：`x`、インプット２:Placeholder：`回数`、後置詞２``
      - 前置詞３：`[機器：`、インプット３:Placeholder：`機器`、後置詞３`]`
      - 例１）入力項目１：`30`、入力項目２：`3`、入力項目３：`バイク`→結果 `30分x3[機器：バイク]`
      - 例２）入力項目１：`30`、入力項目２：`1`、入力項目３：`ランニング`→結果 `30分x1[機器：ランニング]`
    - 登山
      - 前置詞１：（空白）、インプット１：Placeholder：`山`、後置詞１：（空白）
      - 前置詞２：`(`、インプット２：Placeholder：`詳細`、後置詞２：`)`
      - 前置詞３：`[`、インプット３:Placeholder：`時間`、後置詞３`時間]`
      - 例１）入力項目１：`六甲山`、入力項目２：`芦屋・有馬`、入力項目３：`2.5`→結果 `六甲山(芦屋・有馬)[2.5時間]`
    - 外食
      - 前置詞１：`店：`、インプット１：Placeholder：`店`、後置詞１：（空白）
      - 前置詞２：`(`、インプット２：Placeholder：`場所`、後置詞２：`)`
      - 前置詞３：`[`、インプット３：Placeholder：`円`、後置詞３：`円・`
      - 前置詞４：``、インプット４：Placeholder：`人数`、後置詞４：`人]`
      - 例１）入力項目１：`ケンタ`、入力項目２：`南千里`、入力項目３：`９００`、入力項目４：`１`→結果 `店：ケンタ(南千里)[900円・1人]`
    - 立ち飲み
      - 前置詞１：`店：`、インプット１：Placeholder：`店`、後置詞１：（空白）
      - 前置詞２：`(`、インプット２：Placeholder：`場所`、後置詞２：`)`
      - 前置詞３：`[`、インプット３：Placeholder：`円`、後置詞３：`円]`
      - 例１）入力項目１：`こてつ`、入力項目２：`なんば`、入力項目３：`１６００`→結果 `店：こてつ(なんば)[1600円]`
    - のみ
      - 前置詞１：`店：`、インプット１：Placeholder：`店`、後置詞１：（空白）
      - 前置詞２：`(`、インプット２：Placeholder：`場所`、後置詞２：`)`
      - 前置詞３：`[`、インプット３：Placeholder：`円`、後置詞３：`円]`
      - 例１）入力項目１：`xxxx`、入力項目２：`ｙｙｙｙ`、入力項目３：`２０００`→結果 `店：xxxx(ｙｙｙｙ)[3600円]`
    - 映画
      - 前置詞１：（空白）、インプット１：Placeholder：`タイトル`、後置詞１：（空白）
      - 前置詞２：`(`、インプット２：Placeholder：`場所`、後置詞２：`)`
      - 前置詞３：（空白）、インプット３：Placeholder：`評価（１－５）`、後置詞２：`点`
      - 例１）入力項目１：`沈黙の艦隊`、入力項目２：`難波`、入力項目３：`３．５`→結果 `沈黙の艦隊(難波)[3.5点]`
      - 例２）入力項目１：`寄生獣（実写）`、入力項目２：`ama-pra`、入力項目３：`３．５`→結果 `寄生獣（実写）(ama-pra)[3.5点]`
    - 書籍
      - 前置詞１：（空白）、インプット１：Placeholder：`タイトル`、後置詞１：（空白）
      - 前置詞２：`(`、インプット２：Placeholder：`進捗`、後置詞２：`%)`
      - 例１）入力項目１：`ホモデウス上巻`、入力項目２：`100`→結果 `ホモデウス上巻(100%)`
      - 例２）入力項目１：`nexus`、入力項目２：`50`→結果 `nexus(50%)`


**現状**
```sql
select * from hadbit_items
order by updated_at desc
-- item_style
-- ex1)
-- (空白、Nullで落ちることは許容される)
-- ex2)
-- {"style":{"icon":"BicepsFlexed","color":"#FF5733"}}
-- ex3)
-- {"style":{"icon":"","color":""}}
```

**更新後**
- 映画
    - 前置詞１：（空白）、インプット１：Placeholder：`タイトル`、後置詞１：（空白）
    - 前置詞２：`(`、インプット２：Placeholder：`場所`、後置詞２：`)`
    - 前置詞３：（空白）、インプット３：Placeholder：`評価（１－５）`、後置詞２：`点`
```JSONB
{
  "style":{"icon":"BicepsFlexed","color":"#FF5733"}
  "template":[
    "input1":{"prefix":"","type":"string","placeholder":"タイトル","suffix":""},
    "input2":{"prefix":"(","type":"string","placeholder":"場所","suffix":")"},
    "input3":{"prefix":"[","type":"number","placeholder":"評価（１－５）","suffix":"点"]}
  ]
}
```
対象のデータ
- ランニング１
  - 前置詞１：（空白）、インプット１：Placeholder：`距離`、後置詞１：`Km`
  - 前置詞２：`[`、インプット２:Placeholder：`分`、後置詞２`分]`
  - 前置詞３：`[`、インプット３:Placeholder：`場所`、後置詞３`]`
  - 前置詞４：`memo:`、インプット３:Placeholder：`フリーコメント`、後置詞３``
  - 入力項目１：`3.3`、入力項目２：`30`、入力項目３：`御堂筋`→結果 `3.3Km[30分][御堂筋]memo:xxxxxxx`

テンプレート
```JSONB
{
  "style":{"icon":"BicepsFlexed","color":"#FF5733"}
  "template":[
    "input1":{"name":"distance",prefix":"","type":"real","placeholder":"距離","suffix":"km"},
    "input2":{"name":"time",prefix":"[","type":"number","placeholder":"分","suffix":"]"},
    "input3":{
      "name":"location"
      ,"prefix":"["
      ,"type":"string"
      ,"placeholder":"場所"
      ,"suffix":"]"
    }
    "input4":{
      "name":"memo"
      ,"prefix":"memo:"
      ,"type":"text"
      ,"placeholder":"フリーコメント"
      ,"suffix":""

    }    
  ]
}
```
各テンプレートについて、「入力UIでの項目」「内部のJSON定義（nameとの紐付け）」「実際の結果」を整理しました。

これらを指針にすることで、どのテンプレートでも**「入力した時だけ前置詞・後置詞が現れる」**という一貫した挙動を実現できます。

---

## 1. 登山テンプレート

山名と場所、時間をコンパクトにまとめます。

* **入力項目案:**
* 山名(`mountain`): 六甲山
* 詳細(`area`): 芦屋・有馬
* 時間(`time`): 2.5


* **フォーマット設定:** `{mountain}{area}{time}`
* **生成ロジック:**
* `area` の `prefix/suffix`: `(` / `)`
* `time` の `prefix/suffix`: `[` / `時間]`


* **結果:** **`六甲山(芦屋・有馬)[2.5時間]`**

```JSONB
{
  "style": { "icon": "Mountain", "color": "#16A34A" },
  "config": { "result_format": "{mountain}{area}{time}" },
  "fields": [
    { "name": "mountain", "label": "山名", "type": "string", "placeholder": "山名", "prefix": "", "suffix": "", "hide_if_empty": true },
    { "name": "area", "label": "詳細", "type": "string", "placeholder": "ルートなど", "prefix": "(", "suffix": ")", "hide_if_empty": true },
    { "name": "time", "label": "所要時間", "type": "number", "subtype": "real", "placeholder": "時間", "prefix": "[", "suffix": "時間]", "hide_if_empty": true }
  ]
}
```

---

## 2. ランニングテンプレート

距離と時間を1行目に、場所とメモを2行目に分けるパターンです。

* **入力項目案:**
* 距離(`distance`): 3.3
* 時間(`duration`): 30
* 場所(`location`): 御堂筋
* メモ(`memo`): 膝の調子が良い


* **フォーマット設定:** `{distance}{duration}\n{location}{memo}`
* **生成ロジック:**
* `distance`: suffix=`Km`
* `duration`: prefix=`[` / suffix=`分]`
* `location`: prefix=`[` / suffix=`]`
* `memo`: prefix=`memo:` / suffix=``


* **結果:**
**`3.3Km[30分]`**
**`[御堂筋]memo:膝の調子が良い`**

```JSONB
{
  style: { icon: "Run", color: "#3B82F6" },
  config: { result_format: "{distance}{duration}\n{location}{memo}" },
  fields: [
    {
      id: "f_dist",
      name: "distance",
      label: "距離",
      type: "number",
      width: "small",
      placeholder: "0.0",
      prefix: "",
      suffix: "Km",
      hide_if_empty: true,
    },
    {
      id: "f_dur",
      name: "duration",
      label: "時間",
      type: "number",
      width: "small",
      placeholder: "分",
      prefix: "[",
      suffix: "分]",
      hide_if_empty: true,
    },
    {
      id: "f_loc",
      name: "location",
      label: "場所",
      type: "string",
      width: "normal",
      placeholder: "コース名",
      prefix: "[",
      suffix: "]",
      hide_if_empty: true,
    },
    {
      id: "f_memo",
      name: "memo",
      label: "メモ",
      type: "text",
      width: "big",
      placeholder: "体調など",
      prefix: "memo:",
      suffix: "",
      hide_if_empty: true,
    },
  ],
}
```


---

## 3. 外食テンプレート

「誰と」「いくら」を柔軟に。人数が未入力でも崩れないようにします。

* **入力項目案:**
* 店名(`shop`): ケンタ
* 場所(`location`): 南千里
* 金額(`price`): 900
* 人数(`people`): 1


* **フォーマット設定:** `{shop}{location}\n{details}`
* ※`details` は `price` と `people` を内包する特殊なグループとして扱うか、シンプルに `{shop}{location}\n{price}{people}` でも可。


* **生成ロジック:**
* `shop`: prefix=`店：`
* `location`: prefix=`(` / suffix=`)`
* `price`: prefix=`[` / suffix=`円`
* `people`: prefix=`・` / suffix=`人]` （※入力がある時だけ「・」が出る）


* **結果:**
**`店：ケンタ(南千里)`**
**`[900円・1人]`**


```JSONB
{
  "style": { "icon": "Utensils", "color": "#EA580C" },
  "config": { "result_format": "{shop}{location}\n{price_group}" },
  "fields": [
    { "name": "shop", "label": "店名", "type": "string", "placeholder": "店名", "prefix": "店：", "suffix": "", "hide_if_empty": true },
    { "name": "location", "label": "場所", "type": "string", "placeholder": "エリア", "prefix": "(", "suffix": ")", "hide_if_empty": true },
    { "name": "price_group", "label": "会計詳細", "type": "group", "prefix": "[", "suffix": "]", "hide_if_empty": true, "comment": "priceとpeopleをまとめる仮想グループ" },
    { "name": "price", "label": "金額", "type": "number", "subtype": "integer", "placeholder": "金額", "prefix": "", "suffix": "円", "hide_if_empty": true },
    { "name": "people", "label": "人数", "type": "number", "subtype": "integer", "placeholder": "人数", "prefix": "・", "suffix": "人", "hide_if_empty": true }
  ]
}
```


---

## 4. 映画鑑賞テンプレート

タイトルと評価を強調し、媒体（場所）を添えます。

* **入力項目案:**
* 作品名(`title`): 沈黙の艦隊
* 場所(`media`): 難波
* 評価(`rating`): 3.5


* **フォーマット設定:** `{title}{media}{rating}`
* **生成ロジック:**
* `media`: prefix=`(` / suffix=`)`
* `rating`: prefix=`[` / suffix=`点]`


* **結果:** **`沈黙の艦隊(難波)[3.5点]`**

```JSONB
{
  "style": { "icon": "Clapperboard", "color": "#E11D48" },
  "config": { "result_format": "{title}{media}{rating}" },
  "fields": [
    { "name": "title", "label": "作品名", "type": "string", "placeholder": "タイトル", "prefix": "", "suffix": "", "hide_if_empty": true },
    { "name": "media", "label": "場所/媒体", "type": "string", "placeholder": "映画館/配信名", "prefix": "(", "suffix": ")", "hide_if_empty": true },
    { "name": "rating", "label": "評価", "type": "number", "subtype": "real", "placeholder": "0.0", "prefix": "[", "suffix": "点]", "hide_if_empty": true }
  ]
}
```

---

## 実装のアドバイス：テンプレート処理の指針

システムを構築する際は、以下の「合成ルール」を共通関数にすると、メンテナンスが楽になります。

1. **フィールド合成関数**: `renderField(field, value)`
* `value` が空（`""`, `null`, `undefined`）なら空文字を返す。
* 値があるなら `field.prefix + value + field.suffix` を返す。


2. **全体合成関数**: `renderTemplate(config, values)`
* `config.result_format` 内の `{name}` を、上の関数で生成した文字列で置換する。
* 最後に、**連続する改行や、中身が空になった行をトリミング**する処理を入れると、見た目が非常に綺麗になります。



この構成で、実際にデータの保存や、画面でのプレビュー表示のロジックを作成していけそうでしょうか？もし特定の言語（TypeScriptなど）での実装サンプルが必要であれば、いつでもお伝えくださいね。


### 2. hadbit_trees (習慣項目階層管理)

ツリー構造と並び順を管理します。今回の設計変更で **`user_id` が追加** されています。

| カラム名 | データ型 | NULL許容 | 説明 | 備考 |
| --- | --- | --- | --- | --- |
| **item_id** | INTEGER | NO | 対象の項目ID | 主キー / 外部キー (`hadbit_items.id`) |
| **user_id** | **UUID** | NO | 所有者ユーザーのID | 外部キー (`auth.users.id`) |
| parent_id | INTEGER | YES | 親項目のID | 0 または NULL でルート |
| order_no | INTEGER | YES | 表示順序 |  |

---

### 3. hadbit_logs (実施記録)

ユーザーの習慣実施履歴です。`user_id` が `UUID` に更新されています。

| カラム名 | データ型 | NULL許容 | 説明 | 備考 |
| --- | --- | --- | --- | --- |
| **id** | SERIAL | NO | 記録の一意識別ID | 主キー |
| **user_id** | **UUID** | NO | 実施したユーザーのID | 外部キー (`auth.users.id`) |
| item_id | INTEGER | NO | 対象の項目ID | 外部キー (`hadbit_items.id`) |
| done_at | TIMESTAMP | YES | 実施日時 |  |
| comment | TEXT | YES | 実施時のメモ |  |
| updated_at | TIMESTAMP | NO | 最終更新日時 | 既定値: CURRENT_TIMESTAMP |
| created_at | TIMESTAMP | NO | レコード作成日時 | 既定値: CURRENT_TIMESTAMP |
| JSONB | TIMESTAMP | NO | レコード作成日時 | 既定値: CURRENT_TIMESTAMP |

**JSONB** {"distance": 5.2, "unit": "km", "duration_sec": 1800}






### 構成のポイント

* **階層構造の実現**: `hadbit_item_tree` で `parent_id` が `NULL` のものを取得すれば「親カテゴリ」、特定の `parent_id` を持つものを取得すれば「そのカテゴリに属する子項目」として抽出可能です。
* **表示順の制御**: `hadbit_item_tree` の `order_no` を書き換えることで、ユーザーごとに自由な並び替え（非機能要件）に対応しています。
* **カスケード削除**: `hadbit_item_tree` には `on delete CASCADE` が設定されているため、`habit_items` から物理削除された場合、自動的にツリー構造からも除外されるようになっています。


## DDL
新テーブル対応
```sql

create table public.hadbit_items (
  id serial not null,
  user_id uuid not null,
  name text not null,
  short_name text null,
  description text null,
  parent_flag boolean null default false,
  public_flag boolean null default false,
  visible_flag boolean null default true,
  delete_flag boolean null default false,
  updated_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  created_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  item_style jsonb null,
  constraint hadbit_items_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_hadbit_items_user_id on public.hadbit_items using btree (user_id) TABLESPACE pg_default;


create table public.hadbit_trees (
  item_id integer not null,
  user_id uuid not null,
  parent_id integer null,
  order_no integer null,
  constraint hadbit_trees_pkey primary key (item_id),
  constraint fk_hadbit_trees_item_id foreign KEY (item_id) references hadbit_items (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_hadbit_trees_item_id on public.hadbit_trees using btree (item_id) TABLESPACE pg_default;

create table public.hadbit_logs (
  id serial not null,
  user_id uuid not null,
  item_id integer not null,
  done_at timestamp without time zone null,
  updated_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  created_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  comment text null,
  constraint hadbit_logs_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_hadbit_logs_user_id on public.hadbit_logs using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_hadbit_logs_item_id on public.hadbit_logs using btree (item_id) TABLESPACE pg_default;


-- 1. detailsカラムの追加
ALTER TABLE hadbit_logs 
ADD COLUMN details JSONB;

-- 2. (推奨) 既存レコードとの整合性が取れた後、検索を高速化したい場合に実行
-- JSONBの場合、NULLが含まれていてもGINインデックスは作成可能です
CREATE INDEX idx_hadbit_logs_details ON hadbit_logs USING GIN (details);

-- 3. カラムの説明を追加
COMMENT ON COLUMN hadbit_logs.details IS '実施記録の詳細（JSON形式）。既存データとの兼ね合いによりNULL許容。';


```

# クエリ頑張る系
```sql
SELECT 
  -- 親アイテムの情報
  parent_item.user_id,
  parent_item.id           AS parent_id,
  parent_tree.order_no     AS parent_sort_order,
  parent_item.name         AS parent_name, 
  parent_item.short_name   AS parent_short_name,
  parent_item.description  AS parent_description,

  -- 子アイテムの情報
  child_tree.item_id       AS child_id,
  child_tree.order_no      AS child_sort_order,
  child_item.name          AS child_name,
  child_item.short_name    AS child_short_name,
  child_item.description   AS child_description 
FROM hadbit_trees AS parent_tree
INNER JOIN hadbit_items AS parent_item
  ON parent_tree.item_id = parent_item.id
  AND parent_item.user_id = 1
INNER JOIN habdit_trees AS child_tree
  ON child_tree.parent_id = parent_tree.item_id
INNER JOIN hadbit_items AS child_item
  ON child_tree.item_id = child_item.id
  AND child_item.user_id = 1
WHERE parent_tree.parent_id = 0
ORDER BY 
  parent_sort_order, 
  child_sort_order;

```

## DB接続方法
```
// lib/db.ts
import postgres from 'postgres'

// Supabaseの「Transaction mode」か「Session mode」のURLを使用
const connectionString = process.env.DATABASE_URL!
const sql = postgres(connectionString, {
  prepare: false // Supabaseのトランザクションモード(Port 6543)を使う場合はfalseを推奨
})

export default sql

// app/items/page.tsx
import sql from '@/lib/db'

export default async function Page() {
  // まさにSQLをそのまま記載
  const items = await sql`
    SELECT * FROM items 
    WHERE status = ${'active'}
    ORDER BY created_at DESC
  `

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  )
}
```

###　注意点
接続先URL（Connection String）:
Supabaseの設定画面にある Transaction mode (ポート 6543) のURLを使ってください。Next.jsはサーバーレス環境（Vercelなど）で動くため、接続数が急増してもパンクしないようにするためです。

# Todo
- [ ] ダッシュボードの画面見直し、設定を個人の情報として持たすことにする。
- [x] 習慣化の項目（hadbititem）、項目事に備考入れるテンプレート持てるように
  - （体重だとｘｘKgのｘｘ部分入れれるようにする）
- [x] データ(hadbitlog)に対してテンプレートベースで入力できること
- [x] サインアップ画面
- [x] 習慣化の項目（hadbititem）に備考入れる　名前、短縮銘、説明の説明
- [x] 習慣化の項目（hadbititem）に対して、色を指定する（現行ランダム）
- [x] 習慣化の項目（hadbititem）にアイコンを付ける　Contentsに定義、候補はもつ
- [x] スタートページ、ゲスト用画面


# 履歴
- 2026/2/12
  - LocalStorageの利用、デザイン調整
- 2026/2/12
  - テンプレート機能実装。Logsに落とす情報構造化できるように
- 2026/2/10
  - V1,V2機能はカバー完了
- 2026/2/8
  - おおむね完了かな
  - 第二ステップとしては、スタイル、テンプレートかな。
- 2026/2/7
  - [デプロイ](https://hadbit-v3.vercel.app/dashboard)
  - AntiGravity→Vscodeで作成
  - 残ダッシュボード、記録参照の機能について諸々・・・ 
  - test
- 2026/2/6
  - バージョンアップ想定で作り直し


