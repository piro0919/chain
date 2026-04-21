# Chain

> Markdown to org chart generator — online tool.

[🔗 Live Site](https://chain.kkweb.io)

## ✨ Features

- 📝 Paste Markdown and instantly render an org chart
- 🔄 Live preview as you type
- 📱 Responsive layout
- 💾 Export to image

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: Tailwind CSS v4 + shadcn/ui
- **Language**: TypeScript
- **Linter/Formatter**: Biome

## 🚀 Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📂 Project Structure

```text
src/
├── app/         # App Router pages
├── components/  # Shared components (shadcn/ui)
└── lib/         # Utilities
```

## 📋 Scripts

| Command          | Description               |
| ---------------- | ------------------------- |
| `pnpm dev`       | Start development server  |
| `pnpm build`     | Production build          |
| `pnpm lint`      | Run Biome linter          |
| `pnpm typecheck` | TypeScript type check     |

## 📄 License

MIT
