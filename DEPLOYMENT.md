# Deployment Guide

## 🐳 Docker Deployment

### Quick Start

```bash
# Using Docker Compose (Easiest)
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Manual Docker Build

```bash
# Build image
docker build -t character-prompts .

# Run container
docker run -d \
  -p 3000:3000 \
  --name character-prompts \
  --restart unless-stopped \
  character-prompts

# View logs
docker logs -f character-prompts

# Stop container
docker stop character-prompts
docker rm character-prompts
```

## ☁️ Cloud Deployment

### Railway / Render / Fly.io

1. Connect your Git repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Set port: `3000`
5. Deploy!

### VPS Deployment

```bash
# On your server
git clone <your-repo>
cd character-prompts
npm install
npm start

# Or use PM2 for production
npm install -g pm2
pm2 start server.js --name character-prompts
pm2 save
pm2 startup
```

## 🔧 Environment Variables

Currently no environment variables needed. All configuration is in code.

## 📊 Health Check

The app includes a health check endpoint:
- `GET /api/characters` - Returns 200 if healthy

## 🚀 Production Tips

1. Use a reverse proxy (nginx) for HTTPS
2. Set up monitoring (PM2, Docker health checks)
3. Enable caching (already built-in)
4. Use environment variables for sensitive data
