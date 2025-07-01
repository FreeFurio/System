# RegisterUI Backend

Backend service for the RegisterUI application, built with Node.js, Express, and Firebase.

## Features

- User registration with email verification (OTP)
- Secure authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting and security headers
- Error handling and logging
- Environment-based configuration

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher) or yarn
- Firebase project with Realtime Database
- Gmail account for sending emails (or configure another email service)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd RegisterUI/Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   # Firebase Configuration
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   FIREBASE_APP_ID=your_firebase_app_id
   FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
   FIREBASE_DATABASE_URL=your_firebase_database_url

   # Email Configuration
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_specific_password

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests (TODO: Add tests)

## Project Structure

```
Backend/
├── config/               # Configuration files
│   └── config.mjs        # Environment configuration
├── controllers/          # Route controllers
│   └── auth.controller.mjs
├── middlewares/          # Custom express middlewares
│   └── error.middleware.mjs
├── routes/               # Route definitions
│   └── auth.routes.mjs
├── services/             # Business logic and external services
│   ├── email.service.mjs
│   └── firebase.service.mjs
├── utils/                # Utility functions
│   └── errorHandler.mjs
├── .env                  # Environment variables
├── .gitignore
├── package.json
├── README.md
└── server.mjs           # Express application entry point
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/otp/send` - Send OTP to email for registration
- `POST /api/v1/auth/otp/verify` - Verify OTP
- `POST /api/v1/auth/register/complete` - Complete registration
- `POST /api/v1/auth/login` - User login

## Environment Variables

See `.env.example` for all available environment variables.

## Security

- Input validation and sanitization
- Rate limiting
- Security headers (helmet)
- XSS protection
- NoSQL injection protection
- HTTP Parameter Pollution protection

## Error Handling

All errors are handled by the error handling middleware and return a consistent JSON response format:

```json
{
  "status": "error",
  "message": "Error message"
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.
