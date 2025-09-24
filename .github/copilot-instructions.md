# Copilot Instructions for sportify_store

## Project Overview
- **Monorepo structure**: Contains `client` (React + Vite frontend) and `server` (Node.js backend).
- **Frontend**: Built with React, Vite, and Tailwind CSS. Key directories: `src/components`, `src/pages`, `src/data`, `src/hooks`, `src/lib`.
- **Backend**: Node.js server in `server/server.js`, with config in `server/config.js`.

## Developer Workflows
- **Frontend development**: Run `npm install` and `npm run dev` in `client/` to start Vite dev server.
- **Backend development**: Run `npm install` and `node server.js` in `server/` to start API server.
- **Build**: Use `npm run build` in `client/` for production build.
- **Linting**: Run `npx eslint .` in `client/` (uses custom ESLint config).

## Key Patterns & Conventions
- **Component organization**: UI components in `src/components/ui/`, dashboard features in `src/components/dashboard/`, pages in `src/pages/`.
- **Data flow**: Mock/data files in `src/data/`; hooks in `src/hooks/` for reusable logic.
- **Styling**: Tailwind CSS via `tailwind.config.ts` and `postcss.config.js`.
- **Utils**: Shared utilities in `src/lib/utils.jsx`.
- **No TypeScript in frontend**: Despite some config files, main code is in `.jsx`.

## Integration Points
- **Frontend-backend communication**: API calls from React components/pages to Node.js server endpoints (see `server/server.js`).
- **Assets**: Static files in `client/public/` and `src/assets/`.

## Examples
- **Add a new dashboard feature**: Create a component in `src/components/dashboard/`, add a page in `src/pages/dashboard/`, update data in `src/data/dashboardData.jsx`.
- **Custom UI**: Extend or reuse components from `src/components/ui/`.

## External Dependencies
- **React, Vite, Tailwind CSS** (frontend)
- **Node.js, Express** (backend)

## Tips for AI Agents
- Always check both `client/` and `server/` for cross-cutting changes.
- Follow existing file and folder conventions for new features.
- Reference `README.md` and config files for build/lint details.
- Prefer functional React components and hooks.

---
_If any section is unclear or missing, please provide feedback for further refinement._
