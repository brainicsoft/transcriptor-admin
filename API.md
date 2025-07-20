# 📡 API: Module Usage Tracking

## Endpoint

`GET /api/modules/usage`

Tracks or checks module usage for the authenticated user. This endpoint is typically used to check and/or increment the usage count for a specific module feature (e.g., text, map, conclusion) for a given module tier.

---

## 🔐 Authentication

- **Required**: Yes (Bearer token)
- Pass the token in the `Authorization` header:
  ```http
  Authorization: Bearer <token>
  ```

---

## 🔧 Query Parameters

| Name      | Type    | Required | Description                                                      |
|-----------|---------|----------|------------------------------------------------------------------|
| `module`  | string  | ✅ Yes   | The ID of the module tier                                        |
| `tier`    | string  | ✅ Yes   | The ID of the tier (used for frontend routing, not backend logic) |
| `type`    | string  | 🚫 No    | One of: `text`, `conclusion`, `map`                              |
| `count`   | boolean | 🚫 No    | If `true`, will increment the usage count for the given type     |

---

## 🟢 Success Response

- **Status:** 200 OK
- **Content:**

```json
{
  "success": true,
  "usage": {
    "textProductionCount": 49,
    "conclusionCount": 0,
    "mapCount": 0
  }
}
```

---

## 🔴 Error Responses

- **401 Unauthorized**
  ```json
  { "success": false, "message": "Unauthorized" }
  ```
- **400 Bad Request** (missing module)
  ```json
  { "success": false, "message": "Missing moduleTierId" }
  ```
- **404 Not Found** (module not found)
  ```json
  { "success": false, "message": "Module not found" }
  ```
- **403 Forbidden** (limit reached or feature not supported)
  ```json
  { "success": false, "message": "You cannot access text. Limit reached." }
  ```
  or
  ```json
  { "success": false, "message": "This module does not support \"text\"." }
  ```
- **500 Internal Server Error**
  ```json
  { "success": false, "message": "Internal Server Error" }
  ```

---

## 💻 Example: Frontend Usage

Below is a real-world example of how to call this API from a frontend (HTML/JS):

```html
<script>
  // need to add this line for authentication 
  window.AUTH_TOKEN = "{{TOKEN}}";

  // Extract query parameters from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const moduleId = urlParams.get("module");
  const tier = urlParams.get("tier");

  function callApi(type) {
    if (!window.AUTH_TOKEN) {
      alert("Missing token.");
      return;
    }
    if (!moduleId || !tier) {
      alert("Missing 'module' or 'tier' in the URL.");
      return;
    }
    const url = `/api/modules/usage?module=${moduleId}&tier=${tier}&type=${type}&count=true`;
    fetch(url, {
      headers: {
        Authorization: `Bearer ${window.AUTH_TOKEN}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then(data => {
      console.log(`Secure data for type=\"${type}\":`, data);
      alert(`API call (${type}) successful. Check console.`);
    })
    .catch(err => {
      console.error(`API call (${type}) failed:`, err);
      alert(`API call (${type}) failed. Check console.`);
    });
  }

  // Example usage:
  // callApi("text");
  // callApi("map");
</script>
```

---

## 📝 Notes
- The `tier` parameter is used for frontend routing and is not required by the backend logic, but is included in the demo for completeness.
- The `type` parameter determines which feature's usage is checked/incremented. If omitted, the API returns the current usage counts without incrementing.
- The `count=true` parameter increments the usage count for the specified type if possible.
- All requests must be authenticated.