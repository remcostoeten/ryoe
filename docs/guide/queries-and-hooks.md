## Queries and Hooks

```tree
src/
├── api/
│   └── queries/
│       └── notes/
│           └── get-note-history.ts
│   └── mutations/
│       └── notes/
├── services/
│   ├── note-service.ts → src/api/queries/notes/ + src/api/mutations/notes/
│   └── note-history-service.ts → src/api/queries/notes/get-note-history.ts
└── application/
    └── features/
        └── workspace/
            └── modules/
                └── notes/
                    └── hooks/ → src/api/queries/notes/
```
