## 📡 API: Process Module Usage

**Endpoint:** `GET /api/modules/usage?module=hello&type=text&count=true`

Tracks or checks module usage for the logged-in user.

### 🔐 Auth Required

User must be authenticated (e.g., via session or token).

### 🔧 Query Parameters

| Name             | Type    | Required | Description                          |
|------------------|---------|----------|--------------------------------------|
| `moduleTierId`   | string  | ✅ Yes   | The ID of the module tier            |
| `incrementType`  | string  | 🚫 No    | One of: `text`, `conclusion`, `map`  |
| `incrementCount` | boolean | 🚫 No    | If `true`, will decrement the count  |

### ✅ Example

```json
GET /api/modules/usage?module=hello&type=text&count=true


✅ Success Response
json ```
Copy
Edit
{
  "success": true,
  "usage": {
    "textProductionCount": 49,
    "conclusionCount": 0,
    "mapCount": 0
  }
}
❌ Blocked (Limit Reached)
json
Copy
Edit
{
  "success": false,
  "message": "You cannot access text. Limit reached."
}
css
Copy
Edit
```

Let me know if you want this converted to a Markdown file or added to a full project `README.md`.