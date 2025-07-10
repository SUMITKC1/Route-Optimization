# Route Optimization App

A modern, full-stack web application for optimizing travel routes with a beautiful, user-friendly interface. Built with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript.

---

## 🚀 Features

- **User Authentication:** Secure login and signup with JWT.
- **Interactive Map:** Select start and destination points on a live map.
- **Route Optimization:** Multiple algorithms (Nearest Neighbor, 2-Opt, 3-Opt, Genetic) for best route calculation.
- **Journey History:** View, delete, and clear your past journeys. Each user sees only their own history.
- **Live Address Labels:** All points are labeled with real addresses using reverse geocoding.
- **Responsive UI:** Clean, animated, and mobile-friendly design.
- **Profile Management:** Update username, email, password, and avatar.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript, Mongoose
- **Database:** MongoDB
- **Maps & Geocoding:** Google Maps API, OpenStreetMap Nominatim
- **Authentication:** JWT (JSON Web Tokens),Google OAuth

---

## 📸 UI Screenshots

### Login Page
<img width="1920" height="1080" alt="login" src="https://github.com/user-attachments/assets/0780849c-b996-4eff-b020-c33372527485" />

### Signup Page
<img width="1920" height="1080" alt="signup" src="https://github.com/user-attachments/assets/0a30026c-8371-4145-8cb5-db543f248f22" />

### Landing Page
<img width="1920" height="1080" alt="landing (5)" src="https://github.com/user-attachments/assets/f632f95d-28c8-4b5e-a92a-91092c3b75e7" />

### Journey Page
<img width="1920" height="1080" alt="journey" src="https://github.com/user-attachments/assets/871d974e-f6b3-4a80-a891-62379fc4ec36" />

### History Page
<img width="1920" height="1080" alt="history (2)" src="https://github.com/user-attachments/assets/2522c1f0-b471-49ad-89d8-742d03571a20" />


---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB (local or Atlas)

### 1. Clone the repository
```sh
git clone https://github.com/SUMITKC1/Route-Optimization.git
cd Route-Optimization
```

### 2. Install dependencies
```sh
cd client
npm install
cd ../server
npm install
```

### 3. Set up environment variables
- Copy `.env.example` to `.env` in both `client` and `server` (if provided), and fill in your API keys and MongoDB URI.

### 4. Run the app
- **Backend:**
  ```sh
  cd server
  npm run dev
  ```
- **Frontend:**
  ```sh
  cd client
  npm start
  ```

---

## 📖 Project Structure

```
Route-Optimization/
├── client/      # React frontend
├── server/      # Node/Express backend
├── README.md
├── .gitignore
└── ...
```

---

## ✨ Credits
- Developed by [SUMITKC1](https://github.com/SUMITKC1)
- UI/UX, code, and documentation by the project author

---

## 📄 License
This project is licensed under the MIT License.
