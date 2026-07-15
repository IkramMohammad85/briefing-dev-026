

## Requirements

- Node.js 18+ and npm

## Getting started

```bash
npm install
npm start        # gulp serve — builds, opens a dev server with live reload
```

```bash
npm run build    # gulp build — one-off production build into dist/
```

Dev server runs at `http://localhost:3000` (BrowserSync also exposes a
control UI at `:3001`). Edit anything in `src/` and the browser updates
automatically — full reload for HTML/JS/images, CSS-injected (no reload)
for Sass changes.

