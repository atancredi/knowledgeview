
# KnowledgeView

A minimal, local-first web viewer for Obsidian and Markdown knowledge bases. Built to be fast, entirely browser-based, and completely private. Built with Gemini Pro.

## Features

- **Zero-Server Setup:** Uses the HTML5 File System API to read local `.md` folders directly in the browser. No backend required.
- **Spotlight Search:** A `cmdk` powered command bar with a custom scoring algorithm that instantly searches across folder paths, file titles, tags, and content.
- **First-Class Markdown:** Renders Obsidian-flavored markdown, including `[[Wikilinks]]`, YAML frontmatter (for tags), and full LaTeX math support.

## Tech Stack

- **Framework:** React + Vite
- **Styling:** Tailwind CSS + CSS Variables
- **Search:** Custom JS token-scoring algorithm + `cmdk`
- **Markdown Processing:** `react-markdown`, `remark-math`, `rehype-katex`, `front-matter`

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```


3. Open the app in your browser, click **Select Obsidian Folder**, and point it to your root vault.

### Building for Offline Use

To create a single, double-clickable file that you can use anywhere without running a server:

   ```bash
   npm run build
   ```

Grab the resulting `index.html` from the `dist/` folder.
*(Note: requires the `vite-plugin-singlefile` configuration).*

You can just copy and paste this directly into a `README.md` file in the root of your project! Let me know if you want to add or tweak anything.
