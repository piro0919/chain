# CLAUDE.md

このファイルはClaude Codeがこのリポジトリで作業する際のガイドラインです。

## プロジェクト概要

- **サービス名**: Chain（組織図作成ツール）
- **フレームワーク**: Next.js 16 (App Router, Turbopack)
- **UI**: Tailwind CSS v4
- **言語**: TypeScript (strict mode)
- **リンター/フォーマッター**: Biome

## 開発コマンド

```bash
pnpm dev          # 開発サーバー起動
pnpm build        # プロダクションビルド
pnpm start        # プロダクションサーバー起動
pnpm lint         # Biome によるリント
pnpm lint:fix     # Biome による自動修正
pnpm format       # Biome によるフォーマット
pnpm typecheck    # TypeScript 型チェック
pnpm secretlint   # シークレット検出
pnpm knip         # 未使用コード検出
```

## ディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx    # ルートレイアウト
│   ├── page.tsx      # トップページ
│   ├── globals.css   # グローバルCSS
│   └── [feature]/    # 機能別ディレクトリ
│       ├── _components/  # ページ固有コンポーネント
│       ├── actions.ts    # Server Actions
│       ├── schema.ts     # Zodスキーマ・型定義
│       └── page.tsx      # ページコンポーネント
├── components/           # 共通コンポーネント
│   └── ui/               # shadcn/ui (自動生成、編集禁止)
└── lib/                  # ユーティリティ
```

## コーディング規約

### 命名規則

- **ファイル名**: kebab-case または PascalCase（コンポーネント）
- **変数・関数**: camelCase
- **型・インターフェース**: PascalCase（`type` を使用、`interface` は使わない）
- **定数**: UPPER_SNAKE_CASE

### コンポーネント

- Props型は `ComponentNameProps` 形式で定義
- `src/components/ui/` は shadcn/ui で生成するため直接編集しない
- ページ固有のコンポーネントは `_components/` に配置

### インポート

- `@/` エイリアスを使用（`src/` を指す）
- 型のみのインポートは `import type` を使用（Biome の `useImportType` ルール）
- インポートは Biome により自動でソートされる

### 関数

- `_` で始まる引数は未使用として許容される

## Git フック

Lefthook により pre-commit で以下が実行されます：

- Biome（リント＆フォーマット＆自動修正）
- TypeScript 型チェック
- Secretlint（シークレット検出）

コミットメッセージは Conventional Commits 形式に従ってください：

```
feat: 新機能を追加
fix: バグ修正
docs: ドキュメントのみの変更
style: コードの意味に影響しない変更
refactor: バグ修正でも機能追加でもないコード変更
test: テストの追加・修正
chore: ビルドプロセスやツールの変更
```
