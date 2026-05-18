# MiMo Coder

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Tech](https://img.shields.io/badge/tech-vanilla%20HTML%2FCSS%2FJS-orange)
![API](https://img.shields.io/badge/API-Xiaomi%20MiMo%20V2.5-FF6900)
![License](https://img.shields.io/badge/license-MIT-blue)

**MiMo Coder** is a polished, browser-native AI code assistant powered by the Xiaomi MiMo API. It provides a modern Cursor/VS Code-inspired chat workspace for software engineering help, including code generation, debugging, refactoring, architecture guidance, and explanations.

> Built for the Xiaomi MiMo 100T Token Creator Incentive Program and designed to clearly showcase MiMo's OpenAI-compatible streaming chat completions API.

## Screenshot

![MiMo Coder screenshot placeholder](https://placehold.co/1200x720/0d1117/ff6900?text=MiMo+Coder+Screenshot)

## Features

- **Xiaomi MiMo API integration** using the OpenAI-compatible `/chat/completions` endpoint
- **Streaming responses** with Server-Sent Events for real-time assistant output
- **Modern dark UI** inspired by Cursor and VS Code
- **Markdown rendering** via marked.js
- **Syntax-highlighted code blocks** via highlight.js
- **Copy button** on every code block
- **Conversation history** with active chat highlighting
- **Persistent local storage** for conversations and API key
- **Settings modal** for securely entering your MiMo API key in the browser
- **Responsive mobile layout** with collapsible sidebar
- **Empty state** with high-quality suggested coding prompts

## How to Use

No installation, build step, or server is required.

1. Download or clone this project.
2. Open `index.html` in a modern browser.
3. Click the gear icon in the top-right corner.
4. Paste your Xiaomi MiMo API key and save.
5. Start chatting with **MiMo Coder**.

Because this app runs entirely in the browser, your conversations and API key are stored locally in `localStorage` on your device.

## MiMo API Configuration

MiMo Coder uses Xiaomi MiMo's OpenAI-compatible API:

- **Base URL:** `https://token-plan-sgp.xiaomimimo.com/v1`
- **Endpoint:** `/chat/completions`
- **Model:** `mimo-v2.5-pro`
- **Streaming:** Enabled

System prompt used by the app:

```text
You are MiMo Coder, an expert AI coding assistant powered by Xiaomi MiMo. Help users with code, debugging, architecture, and software engineering.
```

## Tech Stack

- **HTML5** for structure
- **CSS3** for the responsive dark product UI
- **Vanilla JavaScript** for state, streaming, rendering, persistence, and API calls
- **marked.js CDN** for markdown rendering
- **highlight.js CDN** for syntax highlighting
- **Browser localStorage** for API key and conversation persistence

## Project Structure

```text
mimo-coder/
├── index.html   # App shell and CDN imports
├── styles.css   # Modern dark UI styling
├── app.js       # Chat logic, MiMo API streaming, persistence
└── README.md    # Documentation
```

## Browser Compatibility

MiMo Coder uses modern browser APIs including `fetch`, `ReadableStream`, `TextDecoder`, `localStorage`, and the Clipboard API. Current versions of Chrome, Edge, Firefox, and Safari are recommended.

## Security Note

This static app stores the API key in browser `localStorage` for convenience. For team deployments or public hosting, consider adding a small backend proxy so API keys are not exposed in the client.

## License

MIT License

Copyright (c) 2026 MiMo Coder contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files, to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, subject to inclusion of this copyright notice and permission notice in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
