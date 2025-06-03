## Tauri desktop app

This is a React + Tailwind + TypeScript + Tauri + rust app.

## Structure

The project follows a modular structure:

```
src/
├── app/                  # App configuration and global styles
├── components/           # Reusable UI components
│   ├── ui/               # Base UI components (shadcn)
│   └── footer/           # Footer components
├── docs/                 # Documentation MDX files
├── hooks/                # Custom React hooks
├── lib/                  # Core utilities and services
│   ├── queries/          # React Query hooks
│   ├── repositories/     # Data access layer
│   ├── services/         # Business logic services
│   └── utils/            # Helper utilities
├── shared/               # Shared components and utilities
└── views/                # Page-level components
```

`src-tauri/` # Rust backend code for Tauri
├── src/ # Rust source files
│ ├── main.rs # Entry point for Tauri app
│ ├── database.rs # Database operations
│ └── git_commands.rs # Git-related commands
└── Cargo.toml # Rust dependencies

## Architecture

The application follows a layered architecture pattern:

1. **Database Layer** (Rust)

    - SQLite database managed by Tauri
    - File system operations for configuration and data

2. **Repository Layer**

    - Data access patterns for external APIs
    - Abstracts data sources (GitHub, Vercel, etc.)

3. **Service Layer**

    - Business logic implementation
    - Coordinates between repositories
    - Handles caching and data transformation

4. **Query/Mutation Layer**

    - React Query hooks for data fetching
    - Manages loading, error, and success states

5. **Component Layer**

    - Reusable UI components
    - Consumes data from queries/mutations

6. **View Layer**
    - Page-level components
    - Routing and layout management

Data flows through these layers as follows:
`Database <> Repository <> Service <> Query/Mutation <> Component <> View`

For Tauri-specific functionality:

- Rust commands are exposed via `invoke` from the frontend
- Services coordinate between Tauri commands and web APIs
- Environment detection determines which APIs to use

## Code style

### Types

- We only use types. No interfaces. Only exception is when we are extending a type from a library.
- We prefix types with `T`. For example `TUser`.
- If there's only 1 local (non-exported) type, we call the type `TProps`. If therere are multiple, one is called `TProps` and the others are prefixed with `T`. For example `TProps` and `TItem`. Except if we're exporting both.
- For core business logic like authentication, database actions. We try to use a structure where we infer base props for example (does not exist yet) `TBaseAPI` or `TCRUDFactory`.

### SoC

- We use seperation of concerns. For example inside a `module` we would have `api/{queries,mutations,schemas,models,services,repositories}` where `queries` , `mutations`, and other `.ts` files make use of a barrel export from `index.ts` in the `api` folder.

### File convention

- We write kebab case only.
- Filenames should be self explaining. For example `user-creation-form.tsx` instead of `user-form.tsx`. or `get-user.ts` instead of `user.ts`. Or `create-user.ts` instead of `user.ts`. Or `authentication-repository.ts` instead of `auth.ts`. or `authentication-service.ts` instead of `auth.ts`.

### Functional

- We write purely functional style code
- We don't write arrow constants, but stricly `function Foo({bar}: TProps)`
- W e DON"T write classes, eventho it's principle is great. Instead we write private functions in an \abstracted way. As long we don't write `class`. `constructor` or `this` we're good.

## Storage, state managemnt, and persitance.

First off, we have documentation for storage apis which can be read over at `src/docs/storage.mdx`. and `src/docs/storage-api.mdx`.

The browser differs from the Tauri app in the way it handles storage. The browser uses `localStorage` and `sessionStorage` while the Tauri app uses a custom storage system. The custom storage system is used to store data that needs to persist across app restarts. The `localStorage` and `sessionStorage` is used to store data that needs to persist across page reloads.
