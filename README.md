# Chat Application

A modern, beautiful chat application featuring individual and group conversations, AI integration, and tagging system. The application supports both English and Chinese interfaces, with preset bot personalities for different use cases.

## Features

- **User Authentication**: Register and login with JWT-based authentication
- **Personal Conversations**: Create, manage, and participate in private conversations
- **Group Conversations**: Multi-user and multi-bot group chats with different bot personalities
- **Tagging System**: Organize conversations with customizable tags (individual conversations only)
- **AI Integration**: Multiple bot personalities with different "characters" and "response tendencies"
- **Bot Roles**: Preset bot roles including customer service, technical, humorous, creative, and advisor bots
- **Intelligent Bot Response**: Smart selection of bots based on message content
- **Anti-bot-loop Mechanism**: Prevents endless bot-to-bot conversations
- **Responsive Design**: Beautiful UI that works on all devices

## Tech Stack

### Frontend
- **Framework**: Vue 3 with Composition API
- **State Management**: Pinia
- **Routing**: Vue Router
- **Build Tool**: Vite 4.4.5
- **Styling**: CSS with modern gradients and animations
- **TypeScript**: 5.1.6

### Backend
- **Language**: TypeScript 4.9.4
- **Framework**: Express.js 4.18.2
- **Database**: SQLite 5.1.4 with Sequelize ORM 6.28.0
- **Authentication**: JWT (JSON Web Tokens) 9.0.0
- **Password Hashing**: bcrypt 5.1.0
- **CORS**: cors 2.8.5
- **Environment Variables**: dotenv 16.0.3

### Development Tools
- **Node.js**: v16 or higher
- **npm**: 9.x or higher
- **TypeScript**: 4.9.4
- **nodemon**: 2.0.20 (for development)

## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- npm (9.x or higher)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```env
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-in-production

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Bot Configuration
   DEFAULT_BOT_RESPONSE_TIMEOUT=10000
   MAX_RETRY_ATTEMPTS=3
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   
   The server will start on `http://localhost:3000`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173`

### Building for Production
1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Start the backend in production mode:
   ```bash
   cd backend
   npm start
   ```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Configuration
PORT=3000
NODE_ENV=development

# Bot Configuration
DEFAULT_BOT_RESPONSE_TIMEOUT=10000
MAX_RETRY_ATTEMPTS=3
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info (requires auth)

### Conversations
- `GET /api/conversations` - Get all user's conversations (requires auth)
- `GET /api/conversations/:id` - Get specific conversation by ID (requires auth)
- `POST /api/conversations` - Create new conversation (requires auth)
- `PUT /api/conversations/:id` - Update conversation title (requires auth)
- `DELETE /api/conversations/:id` - Delete conversation (requires auth)
- `POST /api/conversations/:id/members` - Add human member to group conversation (requires auth)
- `POST /api/conversations/:id/bots` - Add bot to group conversation (requires auth)
- `GET /api/conversations/bots/roles` - Get all preset bot roles (requires auth)

### Messages
- `GET /api/conversations/:conversationId/messages` - Get messages for conversation (requires auth)
- `POST /api/messages` - Send new message (requires auth)
- `DELETE /api/messages/:messageId` - Delete message (requires auth)

### Tags
- `GET /api/tags` - Get all user's tags (requires auth)
- `POST /api/tags` - Create new tag (requires auth)
- `PUT /api/tags/:id` - Update tag (requires auth)
- `DELETE /api/tags/:id` - Delete tag (requires auth)
- `POST /api/conversations/:id/tags` - Add tag to conversation (requires auth)
- `DELETE /api/conversations/:id/tags` - Remove tag from conversation (requires auth)

## Database Schema

### Users
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| username | STRING | Unique username |
| email | STRING | Unique email address |
| password | STRING | Hashed password |

### Conversations
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| title | STRING | Conversation title |
| userId | INTEGER | Foreign key to Users (creator) |
| isGroup | BOOLEAN | True if group conversation, false otherwise |

### Messages
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| content | TEXT | Message content |
| senderType | ENUM | 'user', 'ai', or 'bot' |
| senderId | INTEGER | Foreign key to Users (for user messages) or GroupMembers (for bot messages) |
| conversationId | INTEGER | Foreign key to Conversations |

### Tags
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| name | STRING | Tag name |
| userId | INTEGER | Foreign key to Users (creator) |
| color | STRING | Tag color (hex code) |

### GroupMembers
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| conversationId | INTEGER | Foreign key to Conversations |
| userId | INTEGER | Foreign key to Users (null for bots) |
| memberType | ENUM | 'human' or 'bot' |
| botType | STRING | Bot type (e.g., 'customer_service', 'technical', etc.) |

### ConversationTag (Junction Table)
| Field | Type | Description |
|-------|------|-------------|
| conversationId | INTEGER | Foreign key to Conversations |
| tagId | INTEGER | Foreign key to Tags |

## Technical Architecture

### Project Structure

#### Backend
```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   └── database.ts   # Database configuration
│   ├── controllers/      # API controllers
│   │   ├── authController.ts      # Authentication-related endpoints
│   │   ├── conversationController.ts  # Conversation-related endpoints
│   │   ├── messageController.ts   # Message-related endpoints
│   │   └── tagController.ts       # Tag-related endpoints
│   ├── middleware/       # Middleware functions
│   │   ├── auth.ts       # Authentication middleware
│   │   └── errorHandler.ts  # Error handling middleware
│   ├── models/           # Database models
│   │   └── index.ts      # All database models and associations
│   ├── routes/           # API routes
│   │   ├── auth.ts       # Authentication routes
│   │   ├── conversations.ts  # Conversation routes
│   │   ├── messages.ts   # Message routes
│   │   └── tags.ts       # Tag routes
│   ├── services/         # Business logic services
│   │   └── aiService.ts  # AI response generation service
│   └── server.ts         # Main server file
├── database.sqlite       # SQLite database file
├── package.json          # Backend dependencies
└── tsconfig.json         # TypeScript configuration
```

#### Frontend
```
frontend/
├── src/
│   ├── router/           # Vue Router configuration
│   │   └── index.ts      # Route definitions
│   ├── stores/           # Pinia stores
│   │   ├── auth.ts       # Authentication store
│   │   └── chat.ts       # Chat-related store
│   ├── views/            # Vue components
│   │   ├── ChatView.vue  # Main chat interface
│   │   ├── DashboardView.vue  # User dashboard
│   │   ├── LoginView.vue  # Login page
│   │   └── RegisterView.vue  # Registration page
│   ├── App.vue           # Root Vue component
│   └── main.ts            # Main entry point
├── package.json          # Frontend dependencies
└── vite.config.ts        # Vite configuration
```

## Technical Design Decisions

### Technology Stack Selection

#### Backend
- **TypeScript**: Chosen for its type safety and improved developer experience, reducing runtime errors and improving code maintainability.
- **Express.js**: Selected for its simplicity, flexibility, and extensive middleware ecosystem, making it ideal for building RESTful APIs.
- **SQLite**: Opted for simplicity and ease of deployment, avoiding the need for a separate database server. Suitable for small to medium-sized applications.
- **Sequelize ORM**: Chosen for its powerful features, including model definitions, associations, and query building, while abstracting away database-specific syntax.
- **JWT Authentication**: Selected for its stateless nature, allowing for easier scaling and better performance compared to session-based authentication.

#### Frontend
- **Vue 3 with Composition API**: Chosen for its reactivity system, component-based architecture, and improved TypeScript support. The Composition API provides better code organization and reusability.
- **Pinia**: Selected as the state management solution due to its simplicity, TypeScript support, and improved dev tools integration compared to Vuex.
- **Vue Router**: Opted for its simplicity and seamless integration with Vue 3, providing client-side routing for single-page applications.
- **Vite**: Chosen for its fast development server, optimized builds, and modern tooling, significantly improving developer experience.

### Core Logic Implementation

#### 1. Tagging System
- **Design Approach**: Implemented as a many-to-many relationship between conversations and tags using a junction table (ConversationTag). This allows for flexible tagging of conversations with multiple tags.
- **Key Considerations**:
  - **Scalability**: The junction table approach ensures efficient querying of conversations by tag, even as the number of conversations and tags grows.
  - **Security**: Tags are user-specific, ensuring users can only access their own tags.
  - **UX**: Added visual indicators for tags in the conversation list and detailed view, with color-coding for better organization.
  - **Restriction**: Tags are only available for individual conversations, not group chats, to maintain simplicity and focus on the primary use case.

#### 2. AI API Call Robustness
- **Design Approach**: Implemented a resilient AI service with error handling, fallback responses, and retry mechanisms.
- **Key Considerations**:
  - **Error Handling**: Comprehensive try-catch blocks to handle API failures and network errors.
  - **Fallback Responses**: Predefined default responses to ensure the system always has something to return, even if the AI service fails.
  - **Response Diversity**: Multiple response templates for each bot type to avoid repetitive answers and improve user engagement.
  - **Timeout Management**: Simulated API call delays to create a more natural conversation flow, with random delays for different bot responses.

#### 3. Group Conversations
- **Design Approach**: Implemented as a separate conversation type with associated group members, supporting both human users and AI bots.
- **Key Considerations**:
  - **Multi-bot Support**: Designed to handle multiple bots in a single conversation, each with its own personality and response tendencies.
  - **Bot Selection Strategies**: Implemented three strategies for bot responses:
    - **All Bots**: Every bot in the group responds to each message.
    - **Random Bot**: A random bot is selected to respond.
    - **Smart Selection**: The most appropriate bot is selected based on message content and keyword matching.
  - **Anti-bot-loop Mechanism**: Implemented a two-layer protection:
    - **Recent Message Check**: Prevents bot responses if the last message was also from a bot.
    - **Continuous Bot Check**: Prevents responses if there are multiple consecutive bot messages.
  - **Guaranteed Response**: Ensures at least one bot responds to human messages, even if it's a generic or fallback response.
  - **Performance**: Used setTimeout to parallelize bot response generation, preventing bottlenecks and creating a more natural conversation flow.

## Bot Personalities

### Preset Bot Roles

1. **Customer Service Bot**
   - **Personality**: Professional, patient, and helpful
   - **Response Tendency**: Provides detailed explanations, offers solutions, and maintains a professional attitude
   - **Use Case**: Handling customer inquiries and support requests

2. **Technical Bot**
   - **Personality**: Logical, knowledgeable, and precise
   - **Response Tendency**: Provides technical details, analyzes root causes, and offers specific implementation solutions
   - **Use Case**: Technical support and code analysis

3. **Humorous Bot**
   - **Personality**: Cheerful, outgoing, and humorous
   - **Response Tendency**: Uses humor, tells jokes, and maintains a lighthearted tone
   - **Use Case**: Entertainment and mood enhancement

4. **Creative Bot**
   - **Personality**: Imaginative, innovative, and creative
   - **Response Tendency**: Offers creative ideas, encourages innovation, and thinks outside the box
   - **Use Case**: Brainstorming and creative problem-solving

5. **Advisor Bot**
   - **Personality**: Mature, experienced, and wise
   - **Response Tendency**: Offers professional advice, shares experiences, and provides strategic thinking
   - **Use Case**: Career and personal advice

## Usage Examples

### Creating a Group Conversation with Bots
1. Click the "New" button in the dashboard
2. Select "Group" as the conversation type
3. Enter a conversation title
4. Select at least one bot from the available bot roles
5. Click "Create" to create the group conversation
6. Start sending messages - the system will select the most appropriate bot to respond

### Using Tags
1. Click the "+ New Tag" button in the sidebar
2. Enter a tag name and select a color
3. Click "Create" to create the tag
4. Select an individual conversation
5. Click the "+" button next to the tag to add it to the conversation
6. View tagged conversations in the dashboard for better organization

## Security Considerations

- **Password Hashing**: All user passwords are hashed using bcrypt before being stored in the database.
- **JWT Authentication**: Secure token-based authentication with configurable expiration times.
- **Authorization Checks**: Comprehensive checks to ensure users can only access their own resources.
- **Input Validation**: Server-side validation of all user inputs to prevent malicious data.
- **CORS Configuration**: Properly configured CORS policies to prevent cross-origin attacks.

## Future Enhancements

- **Real-time Communication**: Implement WebSockets for real-time message delivery without polling.
- **File Uploads**: Add support for uploading and sharing files in conversations.
- **Message Encryption**: Implement end-to-end encryption for private conversations.
- **Advanced AI Integration**: Connect to external AI services (e.g., OpenAI API) for more intelligent responses.
- **User Profiles**: Add user profiles with avatars and personal information.
- **Notification System**: Implement push notifications for new messages.
- **Search Functionality**: Add search capabilities for messages and conversations.
- **Internationalization**: Support for multiple languages beyond English and Chinese.

## License

This project is licensed under the MIT License.

## License

This project is licensed under the MIT License.