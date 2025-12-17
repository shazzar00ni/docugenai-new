# API Documentation

## Overview

This API provides access to our documentation generation service.

## Authentication

All API requests require authentication using an API key:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.docugenai.com/v1/generate
```

## Endpoints

### Generate Documentation

**POST** `/v1/generate`

Generate a documentation website from markdown files.

**Request Body:**

```json
{
  "files": [
    {
      "name": "README.md",
      "content": "# My Docs\n\nContent here..."
    }
  ],
  "theme": "default"
}
```

**Response:**

```json
{
  "success": true,
  "html": "<html>...</html>",
  "url": "https://docs.example.com"
}
```

### List Themes

**GET** `/v1/themes`

Get available documentation themes.

**Response:**

```json
{
  "themes": [
    {
      "id": "default",
      "name": "Default",
      "preview": "https://..."
    }
  ]
}
```

## Rate Limits

- Free tier: 10 requests per hour
- Pro tier: 1000 requests per hour
- Enterprise: Unlimited

## Error Codes

| Code | Description         |
| ---- | ------------------- |
| 400  | Bad Request         |
| 401  | Unauthorized        |
| 429  | Rate Limit Exceeded |
| 500  | Server Error        |

## Support

For support, email support@docugenai.com or visit our [help center](https://help.docugenai.com).
