# Rounds Studio V2

A modern, desktop-based IDE for creating "Rounds" mods and card packs. Built with React (Vite) and Electron.

## Features
- **Visual Card Editor**: Design cards with real-time preview (HTML/CSS representation).
- **Monaco Editor**: Integrated code editor with IntelliSense-like feel for C# snippets.
- **Project Management**: Create, save, and load multiple card packs.
- **Desktop App**: Runs as a standalone `.exe` (Windows).

## Development

### Prerequisites
- Node.js (v18+)
- Git

### Setup
```bash
npm install
```

### Run Locally (Web Mode)
```bash
npm run dev
```

### Run Locally (Electron Mode)
```bash
npm run electron:dev
```

### Build for Windows
```bash
npm run electron:build
```

## Architecture
- `src/`: React source code.
- `electron/`: Main process for desktop wrapper.
- `release/`: Output folder for `.exe`.

## License
GNU GPLv3
