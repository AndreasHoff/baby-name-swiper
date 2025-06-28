# Linting Setup

This project uses ESLint with TypeScript for code quality and consistency.

## Scripts

- `npm run lint` - Run ESLint on all files
- `npm run lint:check` - Run ESLint with strict checking (no warnings allowed) - used in build process
- `npm run lint:fix` - Run ESLint and automatically fix fixable issues
- `npm run type-check` - Run TypeScript type checking without emitting files

## Configured Rules

### TypeScript & JavaScript
- **Unused variables/functions**: Errors for unused variables and functions (prefix with `_` to ignore)
- **Unused imports**: Automatically detects and flags unused imports
- **No console.log**: Warns about console.log (allows console.warn and console.error)
- **No debugger**: Errors on debugger statements
- **Prefer const**: Enforces const over let when possible
- **No var**: Prevents usage of var keyword

### React Specific
- **Exhaustive deps**: Warns about missing dependencies in useEffect
- **React refresh**: Ensures components export properly for hot reload

### TypeScript Best Practices
- **No explicit any**: Warns when using `any` type
- **Type-safe linting**: Uses rules that don't require TypeScript project parsing (deployment-friendly)

## IDE Integration

### VS Code
The project includes VS Code settings (`.vscode/settings.json`) that:
- Automatically runs ESLint fix on save
- Organizes imports on save
- Validates TypeScript and JavaScript files
- Shows ruler lines at 80 and 120 characters

### Pre-commit Hooks
Husky is configured to run `lint-staged` before each commit, which:
- Runs ESLint --fix on staged TypeScript/JavaScript files
- Only processes files that are being committed
- Prevents commits with linting errors

## Build Process
The build script (`npm run build`) includes `npm run lint:check` which:
- Runs ESLint with `--max-warnings 0` (treats warnings as errors)
- Prevents builds with any linting issues
- Ensures code quality in production deployments

## Fixing Linting Issues

### Automatic Fixes
Many issues can be fixed automatically:
```bash
npm run lint:fix
```

### Manual Fixes
For issues that require manual fixing:
1. Run `npm run lint` to see all issues
2. Open the file in VS Code (will show ESLint errors inline)
3. Fix the issues based on the error messages

### Ignoring Specific Rules
To ignore a specific rule for a line or block:
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = someApiCall();

/* eslint-disable @typescript-eslint/no-explicit-any */
const config: any = {
  // complex config
};
/* eslint-enable @typescript-eslint/no-explicit-any */
```

### Prefixing with Underscore
For intentionally unused variables/parameters:
```typescript
const MyComponent: React.FC<Props> = ({ someProp, _unusedProp }) => {
  const _unusedVariable = 'ignored by linter';
  return <div>{someProp}</div>;
};
```

## Benefits

1. **Catch bugs early**: Unused variables often indicate bugs or incomplete code
2. **Consistent code style**: Enforces consistent patterns across the codebase
3. **Better IDE experience**: Real-time error highlighting and auto-fixing
4. **Prevent production issues**: Blocks deployments with code quality issues
5. **Team collaboration**: Ensures all team members follow the same standards
