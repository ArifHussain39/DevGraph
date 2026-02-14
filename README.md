<p align="center">
  <img src="public/svg/Logo.svg" width="60" alt="DevGraph Logo" />
</p>

<h1 align="center">DevGraph</h1>

<p align="center">
  <strong>Interactive JSON Visualizer — Transform JSON into beautiful, interactive graph diagrams in real time.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#usage">Usage</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#license">License</a>
</p>

---

## ✨ Features

### 🖥️ Editor Panel
- **Monaco Editor** — Full-featured code editor with JSON syntax highlighting
- **Real-time Validation** — Instant error detection with line/column markers
- **Auto-format** — One-click JSON prettification
- **Debounced Parsing** — Efficient re-rendering with 300ms debounce

### 📊 Graph Visualization
- **Card-style Nodes** — Each JSON object rendered as a card with key-value rows
- **Type-based Coloring** — Strings (green), numbers (blue), booleans (red), objects (purple), arrays (orange), null (gray)
- **Labeled Edges** — Edge labels show the key name connecting parent → child
- **Color Swatches** — Hex color values display their actual color inline
- **Expand / Collapse** — Click any card to collapse/expand its children
- **Zoom, Pan & Fit-to-View** — Full viewport controls with minimap
- **Node Highlighting** — Hover to highlight nodes

### 📥 Import Options
- Paste JSON directly into the editor
- Upload a `.json` / `.yaml` / `.xml` file
- Load built-in **sample JSON**
- Fetch JSON from any **URL**

### 📤 Export
- **PNG** — Export graph as a raster image
- **SVG** — Export graph as a vector image
- **JSON** — Download the current JSON data

### 🔄 Format Conversion
| From | To |
|------|------|
| JSON | YAML |
| YAML | JSON |
| JSON | CSV |
| XML | JSON |

### ⚡ Code Generation
Generate code from your JSON structure:
- **TypeScript** interfaces
- **JSON Schema** (draft-07)
- **Go** structs (with JSON tags)
- **Rust** structs (with serde derive)

### 🎨 UI & UX
- **Dark / Light Theme** toggle
- **Resizable Split Panels** — Drag to resize editor vs graph
- **Search** — Find nodes by key or value
- **Copy to Clipboard** — One-click copy for generated code
- **Responsive** layout

### 🔒 Privacy
- **100% Client-side** — No data is ever sent to a server
- All parsing, conversion, and generation happens in the browser

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Graph | [@xyflow/react](https://reactflow.dev/) (React Flow v12) |
| Editor | [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react) |
| State | [Zustand](https://zustand-demo.pmnd.rs/) |
| Panels | [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) |
| Export | [html-to-image](https://github.com/bubkoo/html-to-image) |
| YAML | [js-yaml](https://github.com/nodeca/js-yaml) |
| XML | [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ArifHussain39/DevGraph.git
cd DevGraph

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
pnpm build
pnpm start
```

---

## 📖 Usage

1. **Paste or upload JSON** into the editor panel on the left
2. The **graph** renders automatically on the right
3. **Click** any card node to expand/collapse its children
4. Use the **Import** menu to load sample data or fetch from a URL
5. Use the **Export** menu to download the graph as PNG/SVG
6. Use **Convert** to transform between JSON, YAML, CSV, XML
7. Use **Generate** to produce TypeScript, JSON Schema, Go, or Rust code

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with fonts & ThemeProvider
│   └── page.tsx            # Main app page
├── components/             # React components
│   ├── CustomNode.tsx      # Card-style React Flow node
│   ├── EditorPanel.tsx     # Monaco editor panel
│   ├── GraphPanel.tsx      # React Flow graph panel
│   ├── Navbar.tsx          # Top navigation bar with dropdowns
│   ├── SplitPanel.tsx      # Resizable split layout
│   └── ThemeProvider.tsx   # Dark/light theme sync
├── hooks/
│   └── useDebounce.ts      # Debounce hook
├── store/
│   └── store.ts            # Zustand state management
├── styles/
│   └── globals.css         # Design system & theme variables
└── utils/
    ├── codeGenerators.ts   # TS / JSON Schema / Go / Rust generators
    ├── formatConverters.ts # JSON ↔ YAML, CSV, XML converters
    ├── jsonParser.ts       # JSON parse, format, validate
    ├── jsonToFlow.ts       # JSON → React Flow transformer
    └── sampleData.ts       # Sample JSON data
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using Next.js, React Flow & Monaco Editor
</p>
