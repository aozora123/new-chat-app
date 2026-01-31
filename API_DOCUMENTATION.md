# ChatApp API Documentation

## Overview

This document provides comprehensive documentation for the ChatApp RESTful API. The API follows REST principles and uses JSON for data exchange.

**Base URL**: `http://localhost:3000/api`

**Authentication**: Most endpoints require a JWT token in the `Authorization` header.

---

## Table of Contents

- [Authentication](#authentication)
- [Conversations](#conversations)
- [Messages](#messages)
- [Tags](#tags)
- [Error Responses](#error-responses)
- [Data Models](#data-models)

---

## Authentication

### Register User

Create a new user account.

**Endpoint**: `POST /auth/register`

**Authentication**: Not required

**Request Body**:

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password123@"
}
```

**Validation Rules**:
- `username`: 3-50 characters, letters, numbers, and underscores only
- `email`: Valid email format, max 100 characters
- `password`: 6-100 characters, must contain uppercase, lowercase, number, and special character

**Success Response** (201 Created):

```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Error Response** (409 Conflict):

```json
{
  "error": "Username or email already exists"
}
```

---

### Login

Authenticate a user and receive a JWT token.

**Endpoint**: `POST /auth/login`

**Authentication**: Not required

**Request Body**:

```json
{
  "username": "john_doe",
  "password": "Password123@"
}
```

**Success Response** (200 OK):

```json
{
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Error Response** (404 Not Found):

```json
{
  "error": "Invalid credentials"
}
```

---

### Get Current User

Get the currently authenticated user's information.

**Endpoint**: `GET /auth/me`

**Authentication**: Required (Bearer token)

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200 OK):

```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Response** (401 Unauthorized):

```json
{
  "error": "User not authenticated"
}
```

---

### Get All Users

Get a list of all users (passwords excluded).

**Endpoint**: `GET /auth/users`

**Authentication**: Required (Bearer token)

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200 OK):

```json
[
  {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "username": "jane_smith",
    "email": "jane@example.com",
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
]
```

---

## Conversations

### Get All Conversations

Get all conversations for the authenticated user.

**Endpoint**: `GET /conversations`

**Authentication**: Required (Bearer token)

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200 OK):

```json
[
  {
    "id": 1,
    "title": "Project Discussion",
    "userId": 1,
    "isGroup": false,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T12:30:00.000Z",
    "Messages": [
      {
        "id": 1,
        "content": "Hello everyone!",
        "senderType": "user",
        "senderId": 1,
        "conversationId": 1,
        "createdAt": "2024-01-15T12:30:00.000Z"
      }
    ],
    "Tags": [
      {
        "id": 1,
        "name": "Work",
        "userId": 1,
        "color": "#007bff",
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "GroupMembers": []
  }
]
```

---

### Get Conversation by ID

Get a specific conversation by ID.

**Endpoint**: `GET /conversations/:id`

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `id` (integer, required): Conversation ID

**Success Response** (200 OK):

```json
{
  "id": 1,
  "title": "Project Discussion",
  "userId": 1,
  "isGroup": false,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T12:30:00.000Z",
  "Messages": [
    {
      "id": 1,
      "content": "Hello everyone!",
      "senderType": "user",
      "senderId": 1,
      "conversationId": 1,
      "createdAt": "2024-01-15T12:30:00.000Z",
      "Sender": {
        "id": 1,
        "username": "john_doe"
      }
    }
  ],
  "Tags": [
    {
      "id": 1,
      "name": "Work",
      "userId": 1,
      "color": "#007bff",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "GroupMembers": []
}
```

**Error Response** (403 Forbidden):

```json
{
  "error": "Access forbidden"
}
```

---

### Create Conversation

Create a new conversation.

**Endpoint**: `POST /conversations`

**Authentication**: Required (Bearer token)

**Request Body**:

```json
{
  "title": "New Project",
  "isGroup": false
}
```

**Validation Rules**:
- `title`: 1-100 characters, required
- `isGroup`: Boolean, optional (default: false)

**Success Response** (201 Created):

```json
{
  "id": 2,
  "title": "New Project",
  "userId": 1,
  "isGroup": false,
  "createdAt": "2024-01-15T13:00:00.000Z",
  "updatedAt": "2024-01-15T13:00:00.000Z"
}
```

---

### Update Conversation

Update conversation title.

**Endpoint**: `PUT /conversations/:id`

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `id` (integer, required): Conversation ID

**Request Body**:

```json
{
  "title": "Updated Project Name"
}
```

**Validation Rules**:
- `title`: 1-100 characters, required

**Success Response** (200 OK):

```json
{
  "id": 2,
  "title": "Updated Project Name",
  "userId": 1,
  "isGroup": false,
  "createdAt": "2024-01-15T13:00:00.000Z",
  "updatedAt": "2024-01-15T13:30:00.000Z"
}
```

**Error Response** (403 Forbidden):

```json
{
  "error": "Access forbidden"
}
```

---

### Delete Conversation

Delete a conversation and all associated data.

**Endpoint**: `DELETE /conversations/:id`

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `id` (integer, required): Conversation ID

**Success Response** (200 OK):

```json
{
  "message": "Conversation deleted successfully"
}
```

**Error Response** (403 Forbidden):

```json
{
  "error": "Access forbidden"
}
```

---

### Add Tag to Conversation

Associate a tag with a conversation.

**Endpoint**: `POST /conversations/:id/tags`

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `id` (integer, required): Conversation ID

**Request Body**:

```json
{
  "tagId": 1
}
```

**Validation Rules**:
- `tagId`: Positive integer, required

**Success Response** (200 OK):

```json
{
  "id": 1,
  "title": "Project Discussion",
  "userId": 1,
  "isGroup": false,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T12:30:00.000Z",
  "Tags": [
    {
      "id": 1,
      "name": "Work",
      "userId": 1,
      "color": "#007bff",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

**Error Response** (400 Bad Request):

```json
{
  "error": "Tag already added to conversation"
}
```

---

### Remove Tag from Conversation

Remove a tag association from a conversation.

**Endpoint**: `DELETE /conversations/:id/tags`

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `id` (integer, required): Conversation ID

**Request Body**:

```json
{
  "tagId": 1
}
```

**Validation Rules**:
- `tagId`: Positive integer, required

**Success Response** (200 OK):

```json
{
  "id": 1,
  "title": "Project Discussion",
  "userId": 1,
  "isGroup": false,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T12:30:00.000Z",
  "Tags": []
}
```

---

### Add Member to Group

Add a human member to a group conversation.

**Endpoint**: `POST /conversations/:id/members`

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `id` (integer, required): Conversation ID

**Request Body**:

```json
{
  "memberId": 2
}
```

**Validation Rules**:
- `memberId`: Positive integer, required

**Success Response** (201 Created):

```json
{
  "id": 1,
  "conversationId": 1,
  "userId": 2,
  "memberType": "human",
  "createdAt": "2024-01-15T14:00:00.000Z",
  "User": {
    "id": 2,
    "username": "jane_smith",
    "email": "jane@example.com"
  }
}
```

**Error Response** (400 Bad Request):

```json
{
  "error": "User is already a member of this group"
}
```

---

### Add Bot to Group

Add a bot member to a group conversation.

**Endpoint**: `POST /conversations/:id/bots`

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `id` (integer, required): Conversation ID

**Request Body**:

```json
{
  "botType": "customer_service"
}
```

**Validation Rules**:
- `botType`: String, max 50 characters, optional (default: "friendly")

**Available Bot Types**:
- `customer_service`: Professional and helpful
- `technical`: Logical and knowledgeable
- `humorous`: Fun and entertaining
- `creative`: Imaginative and innovative
- `advisor`: Mature and experienced

**Success Response** (201 Created):

```json
{
  "id": 2,
  "conversationId": 1,
  "memberType": "bot",
  "botType": "customer_service",
  "createdAt": "2024-01-15T14:30:00.000Z"
}
```

---

### Get Bot Roles

Get all available bot role configurations.

**Endpoint**: `GET /conversations/bot-roles`

**Authentication**: Required (Bearer token)

**Success Response** (200 OK):

```json
[
  {
    "type": "customer_service",
    "name": "客服机器人",
    "personality": "专业、耐心、乐于助人，擅长解决问题和提供详细信息",
    "responseTendency": "详细解释、提供解决方案、保持专业态度"
  },
  {
    "type": "technical",
    "name": "技术机器人",
    "personality": "逻辑严谨、知识渊博，擅长技术问题和代码分析",
    "responseTendency": "提供技术细节、分析问题根因、给出具体实现方案"
  },
  {
    "type": "humorous",
    "name": "幽默机器人",
    "personality": "活泼开朗、幽默感强，擅长调节气氛和讲笑话",
    "responseTendency": "使用幽默语言、讲笑话、轻松愉快的回答方式"
  },
  {
    "type": "creative",
    "name": "创意机器人",
    "personality": "富有想象力、创意十足，擅长头脑风暴和创新思考",
    "responseTendency": "提供创意想法、鼓励创新、跳出常规思维"
  },
  {
    "type": "advisor",
    "name": "顾问机器人",
    "personality": "成熟稳重、经验丰富，擅长提供建议和指导",
    "responseTendency": "给出专业建议、分享经验、提供战略性思考"
  }
]
```

---

## Messages

### Get Messages by Conversation

Get all messages for a specific conversation.

**Endpoint**: `GET /messages/:conversationId/messages`

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `conversationId` (integer, required): Conversation ID

**Success Response** (200 OK):

```json
[
  {
    "id": 1,
    "content": "Hello everyone!",
    "senderType": "user",
    "senderId": 1,
    "conversationId": 1,
    "createdAt": "2024-01-15T12:30:00.000Z",
    "Sender": {
      "id": 1,
      "username": "john_doe"
    }
  },
  {
    "id": 2,
    "content": "Hi! How are you?",
    "senderType": "ai",
    "senderId": null,
    "conversationId": 1,
    "createdAt": "2024-01-15T12:30:01.000Z",
    "Sender": null
  }
]
```

**Error Response** (403 Forbidden):

```json
{
  "error": "Access forbidden"
}
```

---

### Create Message

Send a new message to a conversation.

**Endpoint**: `POST /messages`

**Authentication**: Required (Bearer token)

**Request Body**:

```json
{
  "content": "Hello, how are you?",
  "conversationId": 1
}
```

**Validation Rules**:
- `content`: 1-1000 characters, required
- `conversationId`: Positive integer, required

**Success Response** (200 OK):

```json
{
  "message": "Message sent successfully",
  "userMessage": {
    "id": 3,
    "content": "Hello, how are you?",
    "senderType": "user",
    "senderId": 1,
    "conversationId": 1,
    "createdAt": "2024-01-15T14:00:00.000Z"
  },
  "aiProcessingStatus": "AI response being generated"
}
```

**Behavior**:
- For non-group conversations: An AI response will be generated automatically
- For group conversations: Bot members will respond based on the configured strategy
- Human members in groups will generate simulated responses

---

### Delete Message

Delete a specific message.

**Endpoint**: `DELETE /messages/:messageId`

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `messageId` (integer, required): Message ID

**Success Response** (200 OK):

```json
{
  "message": "Message deleted successfully"
}
```

**Error Response** (403 Forbidden):

```json
{
  "error": "Access forbidden"
}
```

---

## Tags

### Get All Tags

Get all tags for the authenticated user.

**Endpoint**: `GET /tags`

**Authentication**: Required (Bearer token)

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response** (200 OK):

```json
[
  {
    "id": 1,
    "name": "Work",
    "userId": 1,
    "color": "#007bff",
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Personal",
    "userId": 1,
    "color": "#28a745",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### Create Tag

Create a new tag.

**Endpoint**: `POST /tags`

**Authentication**: Required (Bearer token)

**Request Body**:

```json
{
  "name": "Important",
  "color": "#dc3545"
}
```

**Validation Rules**:
- `name`: 1-50 characters, required
- `color`: Valid hex color code (e.g., #007bff), optional (default: #007bff)

**Success Response** (201 Created):

```json
{
  "id": 3,
  "name": "Important",
  "userId": 1,
  "color": "#dc3545",
  "createdAt": "2024-01-15T15:00:00.000Z"
}
```

---

### Update Tag

Update an existing tag.

**Endpoint**: `PUT /tags/:id`

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `id` (integer, required): Tag ID

**Request Body**:

```json
{
  "name": "Urgent",
  "color": "#ff0000"
}
```

**Validation Rules**:
- `name`: 1-50 characters, required
- `color`: Valid hex color code, optional

**Success Response** (200 OK):

```json
{
  "id": 3,
  "name": "Urgent",
  "userId": 1,
  "color": "#ff0000",
  "createdAt": "2024-01-15T15:00:00.000Z",
  "updatedAt": "2024-01-15T15:30:00.000Z"
}
```

**Error Response** (403 Forbidden):

```json
{
  "error": "Access forbidden"
}
```

---

### Delete Tag

Delete a tag and all its associations.

**Endpoint**: `DELETE /tags/:id`

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `id` (integer, required): Tag ID

**Success Response** (200 OK):

```json
{
  "message": "Tag deleted successfully"
}
```

**Error Response** (403 Forbidden):

```json
{
  "error": "Access forbidden"
}
```

---

### Get Conversations by Tag

Get all conversations associated with a specific tag.

**Endpoint**: `GET /tags/:tagId/conversations`

**Authentication**: Required (Bearer token)

**URL Parameters**:
- `tagId` (integer, required): Tag ID

**Success Response** (200 OK):

```json
[
  {
    "id": 1,
    "title": "Project Discussion",
    "userId": 1,
    "isGroup": false,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T12:30:00.000Z",
    "Tags": [
      {
        "id": 1,
        "name": "Work",
        "userId": 1,
        "color": "#007bff",
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "Messages": [
      {
        "id": 1,
        "content": "Hello everyone!",
        "senderType": "user",
        "senderId": 1,
        "conversationId": 1,
        "createdAt": "2024-01-15T12:30:00.000Z"
      }
    ]
  }
]
```

**Error Response** (403 Forbidden):

```json
{
  "error": "Access forbidden"
}
```

---

## Error Responses

### Standard Error Format

All error responses follow this format:

```json
{
  "error": "Error message description"
}
```

### Validation Errors

For validation errors, additional details are provided:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "msg": "Username must be between 3 and 50 characters",
      "param": "username",
      "location": "body"
    }
  ]
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required or failed |
| 403 | Forbidden - User doesn't have permission |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 415 | Unsupported Media Type - Invalid Content-Type |
| 500 | Internal Server Error - Server error |

---

## Data Models

### User

```typescript
{
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}
```

### Conversation

```typescript
{
  id: number;
  title: string;
  userId: number;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
  Messages?: Message[];
  Tags?: Tag[];
  GroupMembers?: GroupMember[];
}
```

### Message

```typescript
{
  id: number;
  content: string;
  senderType: 'user' | 'ai' | 'bot';
  senderId?: number;
  conversationId: number;
  createdAt: string;
  Sender?: User;
}
```

### Tag

```typescript
{
  id: number;
  name: string;
  userId: number;
  color: string;
  createdAt: string;
  updatedAt?: string;
}
```

### GroupMember

```typescript
{
  id: number;
  conversationId: number;
  userId?: number;
  memberType: 'human' | 'bot';
  botType?: string;
  createdAt: string;
  User?: User;
}
```

---

## Authentication

### JWT Token Usage

Include the JWT token in the `Authorization` header for protected endpoints:

```
Authorization: Bearer <your-jwt-token>
```

### Token Expiration

- JWT tokens expire after 24 hours
- After expiration, users must login again to obtain a new token

---

## Rate Limiting

Currently, there is no rate limiting implemented. Consider implementing rate limiting for production use.

---

## CORS

The API supports CORS for the following origins:
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://localhost:5174`
- `http://127.0.0.1:5174`

---

## Testing

### Example cURL Commands

#### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","email":"john@example.com","password":"Password123@"}'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"Password123@"}'
```

#### Get Conversations
```bash
curl -X GET http://localhost:3000/api/conversations \
  -H "Authorization: Bearer <your-token>"
```

#### Create Message
```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{"content":"Hello!","conversationId":1}'
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial API release |

---

## Support

For issues or questions, please contact the development team or create an issue in the project repository.
