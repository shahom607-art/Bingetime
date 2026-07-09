# Build Project Workflow

Follow these steps to clean node_modules (if locked), install dependencies, and build the Next.js application.

## Step 1: Clean and Install Dependencies

If you get lock/directory errors (like `ENOTEMPTY`), run:
```powershell
# In PowerShell:
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force node_modules
npm install
```

Otherwise, simply run:
```bash
npm install
```

## Step 2: Typecheck Code

Run static analysis to check for TypeScript errors:
```bash
npx -y tsc --noEmit
```

## Step 3: Build Web Application

Compile the application for production:
```bash
npm run build
```
