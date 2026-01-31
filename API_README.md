# ChatApp API Documentation

This directory contains comprehensive API documentation for the ChatApp backend service.

## Documentation Files

### 1. API_DOCUMENTATION.md
A detailed Markdown documentation file that includes:
- Complete endpoint descriptions
- Request/response examples
- Validation rules
- Error handling
- Data models
- cURL examples

**Best for**: Reading and understanding the API structure

### 2. openapi.json
An OpenAPI 3.0 specification file that can be used with:
- Swagger UI
- Postman
- API testing tools
- Code generators

**Best for**: Integration with API tools and automated testing

## Quick Start

### Using Markdown Documentation
Simply open [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) in any Markdown viewer or text editor.

### Using OpenAPI Specification

#### Option 1: Swagger UI (Recommended)
1. Install Swagger UI:
```bash
npm install -g swagger-ui-cli
```

2. Start Swagger UI:
```bash
swagger-ui-cli serve openapi.json
```

3. Open browser to: `http://localhost:8080`

#### Option 2: Online Swagger Editor
1. Visit: https://editor.swagger.io/
2. Copy and paste the content of `openapi.json`
3. View and interact with the API documentation

#### Option 3: Import to Postman
1. Open Postman
2. Click "Import" → "Upload Files"
3. Select `openapi.json`
4. Postman will automatically create collections for all endpoints

## API Overview

### Base URL
```
http://localhost:3000/api
```

### Authentication
Most endpoints require JWT authentication:
```
Authorization: Bearer <your-jwt-token>
```

### Main Resources

| Resource | Endpoints | Description |
|----------|-----------|-------------|
| Authentication | 4 | Register, login, get user info |
| Conversations | 9 | CRUD, tags, members, bots |
| Messages | 3 | Send, receive, delete messages |
| Tags | 5 | CRUD, filter conversations |

### Key Features

#### 1. RESTful Design
- Proper HTTP methods (GET, POST, PUT, DELETE)
- Resource-based URLs
- Consistent response formats
- Standard HTTP status codes

#### 2. JWT Authentication
- Secure token-based authentication
- 24-hour token expiration
- User-specific data access

#### 3. Input Validation
- Request body validation
- Parameter validation
- Detailed error messages
- Type checking

#### 4. Error Handling
- Consistent error format
- Appropriate HTTP status codes
- Detailed error messages
- Validation error details

#### 5. AI & Bot Support
- AI-powered responses
- Multiple bot personalities
- Group conversation support
- Smart response strategies

#### 6. Tag System
- Organize conversations
- Filter by tags
- Color-coded tags
- Many-to-many relationships

#### 7. Group Conversations
- Add human members
- Add AI bots
- Multiple bot types
- Simulated human responses

## Testing the API

### Using cURL

#### Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password123@"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Password123@"
  }'
```

#### Get conversations (requires token)
```bash
curl -X GET http://localhost:3000/api/conversations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Create a message
```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "content": "Hello, world!",
    "conversationId": 1
  }'
```

### Using Postman

1. Import the `openapi.json` file into Postman
2. Set up environment variables:
   - `base_url`: `http://localhost:3000/api`
   - `token`: Your JWT token from login response
3. Use the pre-configured collections

### Using Swagger UI

1. Start Swagger UI with the OpenAPI spec
2. Use the "Try it out" button to test endpoints
3. Fill in required parameters
4. Click "Execute" to make requests

## API Endpoints Summary

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user
- `GET /auth/users` - Get all users

### Conversations
- `GET /conversations` - Get all conversations
- `GET /conversations/:id` - Get conversation by ID
- `POST /conversations` - Create conversation
- `PUT /conversations/:id` - Update conversation
- `DELETE /conversations/:id` - Delete conversation
- `POST /conversations/:id/tags` - Add tag to conversation
- `DELETE /conversations/:id/tags` - Remove tag from conversation
- `POST /conversations/:id/members` - Add member to group
- `POST /conversations/:id/bots` - Add bot to group
- `GET /conversations/bot-roles` - Get available bot roles

### Messages
- `GET /messages/:conversationId/messages` - Get messages by conversation
- `POST /messages` - Create message
- `DELETE /messages/:messageId` - Delete message

### Tags
- `GET /tags` - Get all tags
- `POST /tags` - Create tag
- `PUT /tags/:id` - Update tag
- `DELETE /tags/:id` - Delete tag
- `GET /tags/:tagId/conversations` - Get conversations by tag

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

## HTTP Status Codes

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

## Error Response Format

### Standard Error
```json
{
  "error": "Error message description"
}
```

### Validation Error
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

## CORS Configuration

The API supports CORS for the following origins:
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://localhost:5174`
- `http://127.0.0.1:5174`

## Security Considerations

### Authentication
- All protected endpoints require a valid JWT token
- Tokens expire after 24 hours
- Passwords are hashed using bcrypt
- Users can only access their own resources

### Input Validation
- All inputs are validated before processing
- SQL injection protection via parameterized queries
- XSS protection via proper escaping

### Rate Limiting
- Currently not implemented (consider for production)
- Consider implementing rate limiting per user/IP

## Development

### Starting the Server
```bash
cd backend
npm install
npm run dev
```

### Running Tests
```bash
npm test
```

### Updating Documentation
When modifying the API:
1. Update the controller code
2. Update `API_DOCUMENTATION.md` with changes
3. Update `openapi.json` with new endpoints
4. Test all modified endpoints
5. Update this README if needed

## Support

For issues or questions:
- Check the [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed information
- Review the [openapi.json](./openapi.json) for technical specifications
- Contact the development team
- Create an issue in the project repository

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial API release |

## License

This API is part of the ChatApp project. See the main project LICENSE file for details.
