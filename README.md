# Hotel Management & Booking Online
Fullstack web application for hotel management and online booking, 
including customer booking, admin setup, and hotel operation modules.

## Project Structure
hotel-booking/
├── client/
├── server/
└── README.md

## Tech Stack
**Frontend**: React + TypeScript (Vite), React Router, Axios, Zustand, 
React Hook Form, Yup, React Toastify, TailwindCSS  
**Backend**: Node.js + Express, Sequelize ORM (MySQL), JWT Authentication, 
bcrypt, dotenv, CORS, Multer, express-validator, helmet, compression, 
morgan, nodemon  
**Database**: MySQL

## Quick Start

### Dependencies
- Node.js >= 18  
- npm >= 9  
- MySQL >= 8.0

### Backend
1. `cd server`
2. `npm install`
3. Create `.env`
    ```
    PORT=your_port
    DB_HOST=localhost
    DB_USER=your_user
    DB_PASS=yourpassword
    DB_NAME=your_db
    JWT_SECRET=your_jwt_secret
    ```
4. `npx sequelize-cli db:migrate`
5. `npm run dev`  
   `Server: http://localhost:3000`

### Frontend
1. `cd client`
2. `npm install`
3. `npm run dev`  
   `Client: http://localhost:5173`

## API (REST)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `POST /api/auth/logout`
- `GET /api/auth/profile`

### Users
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### Rooms
- `GET /api/rooms`
- `GET /api/rooms/:id`
- `POST /api/rooms`
- `PUT /api/rooms/:id`
- `DELETE /api/rooms/:id`
- `GET /api/rooms/available?from=&to=&type=`

### Bookings
- `GET /api/bookings`
- `GET /api/bookings/:id`
- `POST /api/bookings`
- `PUT /api/bookings/:id`
- `DELETE /api/bookings/:id`
- `GET /api/bookings/me`
- `PATCH /api/bookings/:id/cancel`
- `GET /api/bookings/check/:bookingNumber`

### Payments
- `POST /api/payments`
- `GET /api/payments/:bookingId`

### Reviews
- `GET /api/reviews`
- `GET /api/reviews?roomId={id}`
- `POST /api/reviews`
- `PATCH /api/reviews/:id/approve`
- `PATCH /api/reviews/:id/reject`

### Services
- `GET /api/services`
- `POST /api/services`
- `PUT /api/services/:id`
- `DELETE /api/services/:id`
- `POST /api/services/use`

### Promotions
- `GET /api/promotions`
- `POST /api/promotions`
- `PUT /api/promotions/:id`
- `DELETE /api/promotions/:id`

### Operations
- `POST /api/checkin`
- `POST /api/checkout`
- `POST /api/use-service`
- `GET /api/reports?from=&to=`

### Banners
- `GET /api/banners`
- `POST /api/banners`
- `PUT /api/banners/:id`
- `DELETE /api/banners/:id`
- `GET /api/banners?position=home`

## Database (Main Tables)
- `roles`: Defines user roles within the system
- `users`: Stores user information (linked to roles)
- `refresh_tokens`: Stores JWT refresh tokens 
- `rooms`: Room details  
- `room_types`: Room type definitions
- `bookings`: Booking information (linked to users, rooms)
- `payments`: Payment records (linked to bookings) 
- `services`: List of available hotel services
- `service_usages`: Records of services used (linked to bookings, services)
- `promotions`: Promotion and discount information
- `checkin_checkout`: Check-in and check-out details
- `banners`: Banner images displayed on the frontend
- `reviews`: Stores user reviews for rooms (linked to users, rooms)

### Roles
- **Admin**: Manage rooms, users, services, promotions, and reports
- **Staff**: Handle bookings, check-in/out, and payments
- **Customer**: Browse and book rooms, view booking history

## Security
- Passwords hashed using bcrypt
- JWT used for authentication & role-based access
- Helmet + compression + CORS for API protection
