# Chain

マークダウンから組織図を作成できるオンラインツール

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: Tailwind CSS v4
- **Language**: TypeScript
- **Linter/Formatter**: Biome

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Scripts

| Command          | Description               |
| ---------------- | ------------------------- |
| `pnpm dev`       | Start development server  |
| `pnpm build`     | Production build          |
| `pnpm start`     | Start production server   |
| `pnpm lint`      | Run Biome linter          |
| `pnpm lint:fix`  | Run Biome with auto-fix   |
| `pnpm format`    | Format code with Biome    |
| `pnpm typecheck` | TypeScript type check     |
| `pnpm knip`      | Find unused code          |

## Project Structure

```text
src/
├── app/              # App Router pages
├── components/       # Shared components
│   └── ui/           # shadcn/ui components
└── lib/              # Utilities
```

## License

Private
