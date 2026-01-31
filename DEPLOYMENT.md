# 部署说明文档

本文档提供了将聊天应用部署到生产环境的详细步骤和指导。

## 环境要求

### 系统要求
- **操作系统**: Linux (Ubuntu 20.04+), macOS, Windows
- **Node.js**: v16 或更高版本
- **npm**: 9.x 或更高版本
- **Git**: 2.20 或更高版本

### 硬件要求
- **CPU**: 至少 1 核
- **内存**: 至少 1GB
- **存储空间**: 至少 200MB

## 部署步骤

### 1. 获取代码

```bash
git clone https://github.com/aozora123/new-chat-app.git
cd new-chat-app
```

### 2. 后端部署

#### 2.1 安装依赖

```bash
cd backend
npm install
```

#### 2.2 配置环境变量

创建 `.env` 文件，根据实际情况修改配置：

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Configuration
PORT=3000
NODE_ENV=production

# Bot Configuration
DEFAULT_BOT_RESPONSE_TIMEOUT=10000
MAX_RETRY_ATTEMPTS=3
```

**注意**: 生产环境中请使用强密码作为 `JWT_SECRET`，并定期更换。

#### 2.3 构建生产版本

```bash
npm run build
```

#### 2.4 启动后端服务

```bash
npm start
```

### 3. 前端部署

#### 3.1 安装依赖

```bash
cd ../frontend
npm install
```

#### 3.2 构建生产版本

```bash
npm run build
```

#### 3.3 部署静态文件

构建完成后，静态文件将生成在 `dist` 目录中。您可以使用以下方法部署：

##### 方法 1: 使用 Nginx 或 Apache 部署

将 `dist` 目录中的所有文件复制到 Web 服务器的根目录：

```bash
# 示例：使用 Nginx
cp -r dist/* /var/www/html/
```

##### 方法 2: 使用静态文件托管服务

将 `dist` 目录中的文件上传到静态文件托管服务，如：
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

### 4. 配置前端 API 地址

在前端部署前，确保修改 API 地址配置。打开 `frontend/src/stores/auth.ts` 和 `frontend/src/stores/chat.ts` 文件，修改 API 基础 URL：

```typescript
// 示例：修改为您的后端 API 地址
const API_BASE_URL = 'https://your-backend-api.com/api';
```

## 容器化部署 (可选)

### 使用 Docker Compose

1. 创建 `docker-compose.yml` 文件：

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your-super-secret-jwt-key-change-in-production
      - PORT=3000
    volumes:
      - ./backend/database.sqlite:/app/database.sqlite

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
```

2. 创建后端 `Dockerfile`：

```dockerfile
# backend/Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

3. 创建前端 `Dockerfile`：

```dockerfile
# frontend/Dockerfile
FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

4. 启动服务：

```bash
docker-compose up -d
```

## 常见问题及解决方案

### 1. 后端服务无法启动

**症状**: 服务启动失败，日志显示错误信息。

**解决方案**:
- 检查端口是否被占用：`lsof -i :3000`
- 检查环境变量配置是否正确
- 检查数据库文件权限：`chmod 644 backend/database.sqlite`

### 2. 前端无法连接到后端 API

**症状**: 前端页面加载正常，但无法发送消息或登录。

**解决方案**:
- 检查前端 API 地址配置是否正确
- 检查后端服务是否正在运行
- 检查网络防火墙是否允许前端访问后端 API
- 检查 CORS 配置是否正确

### 3. 数据库连接错误

**症状**: 后端服务启动失败，日志显示数据库连接错误。

**解决方案**:
- 检查数据库文件是否存在：`ls -la backend/database.sqlite`
- 检查数据库文件权限是否正确
- 检查 Sequelize 配置是否正确

### 4. 机器人不回复消息

**症状**: 发送消息后，机器人没有回复。

**解决方案**:
- 检查群组中是否添加了机器人
- 检查机器人响应策略配置是否正确
- 检查 AI 服务是否正常工作

## 监控与维护

### 日志管理

- **后端日志**: 运行 `npm start` 时，日志会输出到控制台。可以使用进程管理工具如 PM2 来管理日志。
- **前端日志**: 可以在浏览器开发者工具的控制台中查看前端日志。

### 数据库备份

定期备份 SQLite 数据库文件：

```bash
cp backend/database.sqlite backend/database.sqlite.bak
```

### 性能优化

1. **启用 Gzip 压缩**：在 Nginx 或 Apache 中启用 Gzip 压缩，减少传输数据大小。

2. **使用 CDN**：将静态资源部署到 CDN，提高加载速度。

3. **数据库优化**：
   - 定期清理旧消息
   - 为常用查询添加索引

4. **使用进程管理工具**：

```bash
# 安装 PM2
npm install -g pm2

# 使用 PM2 启动后端服务
cd backend
pm run build
pm install -g pm2
pm run build
pm start
```

## 安全建议

1. **使用 HTTPS**：在生产环境中，使用 HTTPS 保护数据传输。

2. **限制 API 访问**：使用防火墙或 API 网关限制 API 访问。

3. **定期更新依赖**：定期更新项目依赖，修复安全漏洞。

4. **使用环境变量**：避免在代码中硬编码敏感信息，使用环境变量管理配置。

5. **实现速率限制**：防止 API 滥用，实现速率限制。

## 故障排查

### 检查服务状态

```bash
# 检查后端服务状态
curl -X GET http://localhost:3000/api/auth/me

# 检查前端页面是否可访问
curl -I http://localhost/
```

### 查看错误日志

```bash
# 后端错误日志
cd backend
npm run start 2>&1 | tail -50

# 前端错误日志
在浏览器中打开开发者工具，查看控制台错误信息
```

## 联系与支持

如果您在部署过程中遇到问题，可以通过以下方式获取支持：

- **GitHub Issues**: 在项目仓库中创建 Issue
- **Email**: [your-email@example.com]

---

**部署成功后**，您的聊天应用将可以通过配置的域名或 IP 地址访问。用户可以注册账号、创建对话、添加标签、创建群组并与机器人交互。