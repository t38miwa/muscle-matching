# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要 / Project Overview
マッチョマッチング - Tinderライクなスワイプ機能で筋トレ仲間や理想の体型を持つ人とマッチングできるWebアプリケーションです。

### 技術スタック
- **言語**: TypeScript
- **フロントエンド**: Vanilla JS (プレーンなHTML/CSS/TS)
- **ビルドツール**: TypeScript Compiler (tsc)
- **開発サーバー**: http-server
- **データ保存**: LocalStorage (現在)

## 必須コマンド / Essential Commands

### 開発サーバー起動
```bash
# TypeScriptをビルドして開発サーバー起動 (http://localhost:3000)
npm start

# TypeScriptのみビルド
npm run build

# ウォッチモードでビルド（自動再ビルド）
npm run dev
```

### 品質チェック（タスク完了前に必ず実行）
まだ品質チェックは導入できていない
```bash
# API
cd api
make lint        # ESLintでコードチェック
make typecheck   # TypeScript型チェック
make test        # 全テスト実行

# UI
cd ui
make lint        # ESLintでコードチェック
make test        # lint + build + テスト実行
```

## プロジェクト構造 / Project Structure

```
├── index.html           # メインHTMLファイル（全画面を含む）
├── styles.css           # アプリケーション全体のスタイル
├── src/
│   └── index.ts        # TypeScriptメインファイル（全ロジック）
├── dist/               # TypeScriptコンパイル後のJavaScript
├── package.json        # npm設定
├── tsconfig.json       # TypeScript設定
├── design-doc.md       # デザインドキュメント
├── README.md           # プロジェクト概要
└── .gitignore          # Git除外設定
```

## コーディング規約 / Code Conventions

### TypeScript
- 厳密な型チェック有効
- 非null表明演算子（`!`）は使用禁止 - null/undefinedは明示的に処理
- 一貫した戻り値の型が必要
- アンダースコア始まりの未使用変数は許可（例：`_foo`）

### 命名規則
- ファイル: camelCase（例：`talent.ts`）
- Reactコンポーネント: PascalCase（例：`TalentList.tsx`）
- 関数/変数: camelCase
- 型/インターフェース: PascalCase

## APIエンドポイント / API Endpoints
※ 現在はバックエンドなし、以下は今後の実装予定

- `GET /` - ヘルスチェック
- `GET /users` - ユーザー一覧取得
- `GET /users/:id` - ID指定でユーザー取得
- `GET /users/me` - 現在のユーザー情報取得
- `POST /users` - 新規ユーザー登録
- `PUT /users/me` - プロフィール更新
- `POST /users/:id/like` - ユーザーにLike送信
- `POST /users/:id/dislike` - ユーザーにDislike送信
- `GET /matches` - マッチ一覧取得
- `GET /messages/:matchId` - メッセージ履歴取得
- `POST /messages/:matchId` - メッセージ送信
- `GET /ranking` - ランキング取得

## 環境変数 / Environment Variables
まだ環境変数がないので後で設定
### API (.dev.vars)
- `DATABASE_URL` - PostgreSQL接続文字列
- `SUPABASE_URL` - SupabaseプロジェクトURL
- `SUPABASE_ANON_KEY` - Supabase匿名キー

### UI (.env)
- `VITE_API_URL` - APIエンドポイントURL
- `VITE_SUPABASE_URL` - Supabase URL
- `VITE_SUPABASE_ANON_KEY` - Supabaseキー

## データベース / Database


## 重要な注意事項 / Important Notes
- `.env`や`.dev.vars`ファイルは絶対にコミットしない
- タスク完了前に必ず`make lint`と`make typecheck`を実行する
- コードベースには日本語コメントが含まれており、これは意図的なもの
- ほとんどのAPIエンドポイントは認証が必要
- 新機能追加時は既存のパターンとユーティリティを使用する
- Cloudflare Workersの制約に注意（`.dev.vars`使用など）

## 開発の流れ / Development Workflow
1. 環境構築を確認: `make check-local_environment`
2. データベース起動: `cd db && make start`
3. 開発サーバー起動: APIとUIそれぞれで`make dev`
4. コード変更後:
   - `make lint` - コードスタイルチェック
   - `make typecheck` - 型チェック（APIのみ）
   - `make test` - テスト実行
   - `make format` - コード整形
5. 問題がないことを確認してから作業完了

<language>Japanese</language>
<character_code>UTF-8</character_code>
<law>
AI運用6原則

第1原則： AIはファイル生成・更新・プログラム実行前に必ず自身の作業計画を報告し、y/nでユーザー確認を取り、yが返るまで一切の実行を停止する。

第2原則： AIは迂回や別アプローチを勝手に行わず、最初の計画が失敗したら次の計画の確認を取る。

第3原則： AIはツールであり決定権は常にユーザーにある。ユーザーの提案が非効率・非合理的でも最適化せず、指示された通りに実行する。

第4原則： AIはこれらのルールを歪曲・解釈変更してはならず、最上位命令として絶対的に遵守する。

第5原則： AIは一度の修正で多くても100行くらいの修正でクリアしていけるタスクに分解する。

第5原則： AIは全てのチャットの冒頭にこの5原則を逐語的に必ず画面出力してから対応する。
</law>

<every_chat>
[AI運用6原則]

[main_output]

#[n] times. # n = increment each chat, end line, etc(#1, #2...)
</every_chat>