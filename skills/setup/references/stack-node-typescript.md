# Node/TypeScript Stack Reference

Reference for Claude when setting up Node.js + TypeScript projects. Read this when the user selects a framework during `/setup`.

---

## Dependencies by Framework

### Vite (React SPA)

```
deps:       vite @vitejs/plugin-react react react-dom
devDeps:    typescript @types/node @types/react @types/react-dom vitest jest ts-jest
```

### Next.js (Full-stack React)

```
deps:       next react react-dom
devDeps:    typescript @types/node @types/react @types/react-dom eslint-config-next jest ts-jest
```

### Express (REST API)

```
deps:       express
devDeps:    typescript @types/node @types/express ts-node tsx jest ts-jest
```

### Fastify (REST API)

```
deps:       fastify
devDeps:    typescript @types/node ts-node tsx jest ts-jest
```

### Common devDeps (all frameworks)

```
typescript @types/node jest ts-jest
```

---

## tsconfig.json Patterns

### Vite

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

### Next.js

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "strict": true,
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "skipLibCheck": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Express / Fastify

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "node",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Directory Structure

### Vite

```
src/
src/components/
src/pages/
public/
```

### Next.js (App Router)

```
app/
components/
lib/
public/
```

### Express

```
src/
src/routes/
src/services/
src/middleware/
```

### Fastify

```
src/
src/routes/
src/plugins/
src/services/
```

---

## Framework-Specific Commands

### Vite

```json
"scripts": {
  "dev":   "vite",
  "build": "vite build",
  "test":  "vitest",
  "lint":  "eslint src --ext ts,tsx"
}
```

### Next.js

```json
"scripts": {
  "dev":   "next dev",
  "build": "next build",
  "start": "next start",
  "test":  "jest",
  "lint":  "next lint"
}
```

### Express / Fastify

```json
"scripts": {
  "dev":   "tsx watch src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "test":  "jest",
  "lint":  "eslint src --ext ts"
}
```
