---
name: testing-workflows
description: "Verification commands and testing workflows for Kiro (Chrome DevTools MCP), Antigravity/Claude (browser_subagent), and CLI-only environments."
---

# Testing Workflows

## With Kiro (Chrome DevTools MCP)

After implementing or modifying a frontend feature:

1. Navigate to the affected page (`mcp_chrome_devtools_navigate_page`)
2. Wait for content to load (`mcp_chrome_devtools_wait_for`)
3. Take a snapshot to verify elements render correctly (`mcp_chrome_devtools_take_snapshot`)
4. Check console for errors (`mcp_chrome_devtools_list_console_messages` with types `["error"]`)
5. Check network requests for failed API calls (`mcp_chrome_devtools_list_network_requests`)
6. If login is required, log in first via `/login` using `admin@example.com` / `Password123`
7. For visual verification, take a screenshot (`mcp_chrome_devtools_take_screenshot`)
8. For accessibility audits, use `mcp_chrome_devtools_lighthouse_audit`

## With Antigravity / Claude (browser_subagent)

After implementing or modifying a frontend feature:

1. Use the `browser_subagent` tool to open the browser
2. Navigate to `http://localhost:3000/login`
3. Login with `admin@example.com` / `Password123`
4. Navigate to the affected page
5. Visually verify the page renders correctly (take screenshot if needed)
6. Check for visible JS errors or broken UI

> **Note:** Antigravity does NOT have Chrome DevTools MCP. Use `browser_subagent` for all browser-based verification. It records a `.webp` video to the artifacts directory.

## Without Browser (CLI-Only)

### Frontend

```bash
npx tsc --noEmit          # TypeScript check (must pass)
npm audit                 # No new vulnerabilities
npm run dev               # Start dev server at localhost:3000
```

Test pages in browser:

- Login: http://localhost:3000/login (admin@example.com / Password123)
- Dashboard: http://localhost:3000/dashboard
- Backoffice Members: http://localhost:3000/dashboard/backoffice-members
- Client Members: http://localhost:3000/dashboard/client-members
- Mitra Members: http://localhost:3000/dashboard/mitra-members
- Design System: http://localhost:3000/design-system
- Notifications: http://localhost:3000/dashboard/notifications

### Backend

```bash
php -l <file>             # PHP syntax check on all modified files

# Routes verification
docker exec lingkarid.local php artisan route:list --path=<prefix>

# Login and get token
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"login":"admin@example.com","password":"Password123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['access_token'])")

# Test any endpoint
curl -s http://localhost:8000/api/v1/backoffice/<endpoint> \
  -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" | python3 -m json.tool

# Database verification
docker exec -it lingkar-id-backend-pgsql-1 psql -U sail -d lingkar_id
```

### Postman

1. Import `postman/Lingkar_ID_API.postman_collection.json`
2. Set `APP_URL` = `http://localhost:8000`
3. Run "Login" first — auto-saves `ACCESS_TOKEN`
4. Test any endpoint
