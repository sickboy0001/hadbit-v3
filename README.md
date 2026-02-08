
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
    - [2. hadbit\_trees (習慣項目階層管理)](#2-hadbit_trees-習慣項目階層管理)
    - [3. hadbit\_logs (実施記録)](#3-hadbit_logs-実施記録)
    - [構成のポイント](#構成のポイント)
  - [DDL](#ddl)
- [クエリ頑張る系](#クエリ頑張る系)
  - [DB接続方法](#db接続方法)
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


---

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

# 履歴
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


