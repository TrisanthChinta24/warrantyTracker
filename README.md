# Warranty Tracker

Warranty Tracker is a full-stack web application backend designed to manage product warranties, user accounts, document uploads, and automated warranty expiry notifications. It provides secure and scalable REST APIs to support a frontend web or mobile client.

## Project Overview
The system allows users to digitally store warranty details, upload proof documents, and receive automated reminders before warranty expiration. The backend follows a modular and scalable architecture built using Node.js, Express.js, and MongoDB.

## Features

### User Management
- User registration and login
- JWT-based authentication
- Secure password hashing using bcrypt
- Protected API routes

### Warranty Management
- Create, view, update, and delete warranty records
- Store product details and warranty duration
- Track warranty start and expiry dates

### File Upload Support
- Upload warranty receipts and invoices
- Secure file handling using Multer
- Files stored in the `/uploads` directory

### Automated Notifications
- Scheduled background jobs using node-cron
- Daily scan for expiring warranties
- Automated alert notifications (email/SMS – extensible)

### Security & Reliability
- JWT authentication middleware
- Request validation
- Centralized error handling
- Environment variable configuration for sensitive data

## Technology Stack

### Backend
- Node.js
- Express.js

### Database
- MongoDB (Mongoose)

### Libraries & Tools
- Multer – File uploads
- bcrypt – Password hashing
- jsonwebtoken – Authentication
- node-cron – Scheduled jobs
- Mongoose – Database modeling

## Project Architecture
The backend follows a modular MVC-inspired structure:
# Warranty Tracker

Warranty Tracker is a full-stack web application backend designed to manage product warranties, user accounts, document uploads, and automated warranty expiry notifications. It provides secure and scalable REST APIs to support a frontend web or mobile client.

## Project Overview
The system allows users to digitally store warranty details, upload proof documents, and receive automated reminders before warranty expiration. The backend follows a modular and scalable architecture built using Node.js, Express.js, and MongoDB.

## Features

### User Management
- User registration and login
- JWT-based authentication
- Secure password hashing using bcrypt
- Protected API routes

### Warranty Management
- Create, view, update, and delete warranty records
- Store product details and warranty duration
- Track warranty start and expiry dates

### File Upload Support
- Upload warranty receipts and invoices
- Secure file handling using Multer
- Files stored in the `/uploads` directory

### Automated Notifications
- Scheduled background jobs using node-cron
- Daily scan for expiring warranties
- Automated alert notifications (email/SMS – extensible)

### Security & Reliability
- JWT authentication middleware
- Request validation
- Centralized error handling
- Environment variable configuration for sensitive data

## Technology Stack

### Backend
- Node.js
- Express.js

### Database
- MongoDB (Mongoose)

### Libraries & Tools
- Multer – File uploads
- bcrypt – Password hashing
- jsonwebtoken – Authentication
- node-cron – Scheduled jobs
- Mongoose – Database modeling

## Getting Started

### Prerequisites
- Node.js
- MongoDB

### Setup
1. Clone the repository
2. Install dependencies using `npm install`
3. Create a `.env` file with required environment variables
4. Run the server using `npm start`

## Project Architecture

The backend follows a modular MVC-inspired structure:

```text
src/
├── models/        # Database schemas
├── controllers/   # Business logic
├── routes/        # REST API routes
├── services/      # Reusable services
├── middlewares/   # Auth, validation, error handling
├── jobs/          # Cron jobs for notifications
├── config/        # DB and environment config
uploads/           # Uploaded files
public/            # Static files
```



## API Endpoints
- `/auth` – User authentication
- `/warranties` – Warranty CRUD operations
- `/uploads` – File upload handling
- `/notifications` – Warranty alerts and reminders

(All private routes are secured using JWT authentication.)

## Application Workflow
1. User registers/logs in and receives a JWT token.
2. User adds warranty details with optional document uploads.
3. Warranty data is stored in MongoDB, files stored locally.
4. Cron job runs daily to check for expiring warranties.
5. Notifications are triggered automatically.

## Future Enhancements
- Email and push notifications
- Warranty analytics dashboard
- OCR extraction from uploaded receipts
- Cloud storage integration (AWS S3 / GCP)
- Two-factor authentication
- Multi-language support

## Author
Developed by **Trisanth Chinta**
