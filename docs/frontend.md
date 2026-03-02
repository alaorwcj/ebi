# Frontend Architecture

The EBI Vila Paula frontend relies on **React 18** managed via **Vite**.

## Folder Structure (frontend/)
- `src/components`: Reusable UI components.
- `src/pages`: Higher-order components representing distinct URLs.
- `src/context`: React Contexts (e.g., `AuthContext` to hold the current user session).
- `src/services`: API abstraction layers wrapping `fetch` and extracting token operations.
- `src/hooks`: Custom React Hooks.
- `assets/` and `public/`: Static, unmanaged files.

## Styling
The system embraces utility-first CSS styling leveraging **Tailwind CSS**.
For common interface elements (Buttons, Inputs, Dialogs, Cards), the application integrates **shadcn/ui**. Components under `src/components/ui/` represent shadcn-generated primitive wrappers. 

## Network Interception & API
The `src/services/api.js` acts as an interceptor. It attaches the `Authorization: Bearer <TOKEN>` to all requests mapping out to the FastAPI backend. It also encapsulates token refresh or forceful redirecting to the login page (`/login`) on hard `401 Unauthorized`.

## React Router
Navigational state is strictly dictated by React Router DOM. Component access is governed by `AuthContext.Provider` resolving User roles and rendering `ProtectedRoute` components in `App.jsx` where appropriately scoped.
