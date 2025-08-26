# 🚀 AI-Powered Digital Marketing System

> **A comprehensive full-stack application that combines AI content generation, SEO analysis, design tools, and automated social media posting.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-orange.svg)](https://openai.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime%20DB-yellow.svg)](https://firebase.google.com/)

## ✨ Features

### 🤖 AI Content Generation
- **GPT-4o Integration** - Generate high-quality content for social media
- **Platform-Specific Content** - Optimized for Facebook, Instagram, and Twitter
- **SEO Analysis** - AI-powered content scoring and optimization suggestions
- **Multi-Language Support** - Generate content in multiple languages

### 📱 Social Media Automation
- **Multi-Platform Posting** - Automated posting to Facebook, Instagram, Twitter
- **Scheduled Posts** - Plan and schedule content for optimal engagement
- **Content Optimization** - Platform-specific character limits and formatting
- **Testing Mode** - Safe development environment without app review

### 🎨 Design & Media Tools
- **Visual Content Creation** - Design tools for social media graphics
- **Image Management** - Upload, store, and manage media files
- **Template System** - Pre-designed templates for quick content creation
- **Export Options** - Save designs as PNG/JPG for posting

### 👥 User Management
- **Authentication System** - Secure user registration and login
- **Role-Based Access** - Different permission levels for users
- **Profile Management** - User profiles with preferences and settings
- **Real-time Notifications** - Socket.io powered notifications

## 🏗️ Architecture

```
System/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── services/      # API communication
│   │   └── styles/        # CSS and styling
│   └── public/            # Static assets
│
├── server/                # Node.js Backend (Express)
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   │   ├── aiService.js   # OpenAI integration
│   │   └── socialMediaService.js # Social media APIs
│   ├── routes/           # API endpoints
│   ├── config/           # Configuration files
│   ├── utils/            # Utility functions
│   └── docs/             # Documentation
│
└── package.json          # Monorepo configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key
- Firebase project
- Social media developer accounts (for posting features)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd System
   ```

2. **Install dependencies:**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   ```

3. **Environment Setup:**
   ```bash
   # Copy environment template
   cp server/.env.example server/.env
   
   # Add your API keys to server/.env
   ```

4. **Start Development Servers:**
   ```bash
   # Start backend (from server directory)
   cd server && npm run dev
   
   # Start frontend (from client directory)
   cd client && npm run dev
   ```

5. **Access the application:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

## 🔧 Configuration

### Required Environment Variables

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_DATABASE_URL=your_database_url

# Social Media APIs (Testing Mode)
FB_APP_ID=your_facebook_app_id
FB_APP_SECRET=your_facebook_app_secret
TWITTER_API_KEY=your_twitter_api_key
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
```

## 📚 API Documentation

### AI Content Generation
```bash
# Generate content for specific platform
POST /api/v1/ai/generate-all
{
  "platform": "instagram",
  "topic": "New product launch"
}

# Analyze SEO score
POST /api/v1/ai/analyze-seo
{
  "content": "Your content here",
  "contentType": "headline"
}
```

### Social Media Automation
```bash
# Generate and post automatically
POST /api/v1/social/generate-and-post
{
  "topic": "Coffee shop opening",
  "platforms": [{"name": "facebook"}, {"name": "twitter"}],
  "tokens": { /* platform tokens */ }
}

# Post to multiple platforms
POST /api/v1/social/post-multiple
{
  "content": { /* generated content */ },
  "platforms": ["facebook", "instagram"],
  "tokens": { /* authentication tokens */ }
}
```

## 🧪 Testing Mode

The system is configured for **development/testing mode**:
- ✅ No app review required from social media platforms
- ✅ Safe testing with developer accounts
- ✅ Limited to test users and pages
- ✅ Full API functionality for development

See `server/docs/TESTING_SETUP.md` for detailed testing instructions.

## 🛠️ Technologies

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **CSS3** - Responsive styling
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js & Express** - Server framework
- **OpenAI API** - GPT-4o integration
- **Firebase** - Realtime database and authentication
- **Socket.io** - WebSocket communication
- **Axios** - HTTP client for API calls

### APIs & Services
- **OpenAI GPT-4o** - AI content generation and SEO analysis
- **Facebook Graph API** - Facebook and Instagram posting
- **Twitter API v2** - Twitter posting and media upload
- **Firebase Realtime Database** - Data storage and sync

## 📈 Performance & Scalability

- **Rate Limiting** - Configurable API rate limits
- **Error Handling** - Comprehensive error recovery
- **Retry Logic** - Automatic retry for failed requests
- **Caching** - Content caching for improved performance
- **Monitoring** - Logging and analytics ready

## 🔒 Security Features

- **JWT Authentication** - Secure user sessions
- **Input Validation** - Sanitized user inputs
- **CORS Protection** - Cross-origin request security
- **Rate Limiting** - DDoS protection
- **Environment Variables** - Secure API key management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@yourproject.com
- 📖 Documentation: `server/docs/`
- 🐛 Issues: GitHub Issues tab

---

**Built with ❤️ using AI-powered technology**