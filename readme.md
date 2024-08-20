# Highway Server

## Overview

Highway Server is a robust backend application built using Node.js, Express, and TypeScript. It provides essential services such as user authentication, OTP verification, and password management. Deployed on Vercel, the server is designed to be scalable, secure, and efficient, making it an ideal solution for modern web applications.

## Features

- **User Registration:** Secure registration with email validation and password strength checks.
- **OTP Verification:** Endpoints for verifying and resending OTP codes.
- **User Authentication:** Secure login and password reset functionalities.
- **Error Handling:** Custom error responses and validation for robust API interactions.

## Technologies

- **Node.js:** Runtime environment for building scalable server-side applications.
- **Express.js:** Web application framework for Node.js, providing routing and middleware support.
- **TypeScript:** Adds static typing to JavaScript for improved development experience.
- **bcrypt:** Library for hashing passwords and ensuring secure authentication.
- **express-validator:** Middleware for validating and sanitizing user inputs.
- **Vercel:** Deployment platform for seamless hosting and scaling.

## Installation

Follow these steps to set up the server locally:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/highway-server.git
   cd highway-server
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables:**

   Create a `.env` file in the root directory with the following content:

   ```env
   PORT=8080
   ORIGIN=http://your-frontend-url

   # OTP Verification Creds
   EMAIL = email id for otp verification
   PASS = your email password
   SERVICE = service name
   MESSAGE_FROM = from name

   # Database CREDENTIAL
   DB_QUERY=postgres://user:password@host/database_name
   
   # SECRET KEY FOR JWT token
   SECRET_KEY= add a secret key

   ```

4. **Run the Server:**

   Start the server:
   ```bash
   npm run build
   ```

   ```bash
   # before starting dev server write this command
   npm run drizzle-push
   ```

   ```bash
   npm start
   ```

   Run server installation demo picture
   ![Run_the_server](./readme-assets/normal-server.avif)

   For development with auto-reloading:

   ```bash
   # write this in new terminal
   npm run watch-tsc
   ```
   ```bash
   # before starting dev server write this command
   npm run drizzle-push
   ```
   ```bash
   # write this in second terminal
   npm run start-dev
   ```
   
   Run server installation demo picture
   ![Run_development_server](./readme-assets/dev-setup.avif)

## API Endpoints

### Authentication

- **POST /api/v1/auth/register**  
  Register a new user. Requires `firstName`, `lastName`, `password`, `contactMode`, and `email`.

- **POST /api/v1/auth/verify-otp**  
  Verify the OTP code. Requires `otpCode`.

- **GET /api/v1/auth/resend-otp**  
  Resend OTP to the user.

- **POST /api/v1/auth/login**  
  Authenticate a user with `email` and `password`.

- **PATCH /api/v1/auth/reset-password**  
  Reset the user's password. Requires `currentPassword` and `updatedPassword`.

### User

- **GET /api/v1/user/current**  
  Retrieve the details of the currently authenticated user.

## Error Handling

Errors are handled with custom messages and HTTP status codes:

- **Validation Errors:** Returns a 422 status code with details about the validation failure.
- **Server Errors:** Returns a 500 status code for general server issues.

## Deployment

The server is deployed on Vercel. You can access the application at:

- **Production URL:** [Production Link](https://highway-server.vercel.app)

To deploy to production, use the command:

```bash
vercel --prod
```

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- **Drizzle ORM:** For managing database interactions.
- **Express Validator:** For input validation.