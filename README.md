# 🤖 Interviewer.ai

> **An AI-Powered Smart Interview Platform designed to help users master their next interview through dynamic mock sessions, real-time feedback, and personalized insights.**

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)
![Redux](https://img.shields.io/badge/redux-%23593d88.svg?style=for-the-badge&logo=redux&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)

---

## ✨ Key Features

* **🧠 Adaptive AI Intelligence:** Difficulty adjusts automatically based on the selected job role and experience level.
* **🎙️ Smart Voice Interviews:** Dynamic, real-time follow-up questions generated contextually based on user answers.
* **⏱️ Timer-Based Simulation:** Replicates real interview pressure with strict time tracking.
* **📄 Resume-Based Generation:** Upload a resume to generate highly tailored, project-specific questions.
* **📊 Comprehensive Evaluation:** Answers are scored across multiple metrics, including communication skills, technical accuracy, and confidence.
* **📈 History & Analytics:** Track progress over time with visual performance graphs and historical data.
* **📥 Downloadable Reports:** Export detailed PDF reports outlining strengths, weaknesses, and actionable improvement insights.

---

## 🛠️ Tech Stack

**Frontend:**
* React (Vite)
* Tailwind CSS (Styling & Responsive Design)
* Framer Motion (Smooth UI Animations)
* Redux Toolkit (Global State Management)
* React Router DOM (Navigation & Protected Routes)
* React Icons

**Backend:**
* Node.js & Express.js
* MongoDB & Mongoose
* JSON Web Tokens (JWT) & HTTP-Only Cookies (Authentication)

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
* Node.js (v16 or higher)
* MongoDB (Local instance or MongoDB Atlas URI)

### 1. Clone the Repository
```bash
git clone https://github.com/RaviKumarYadav15/mock_interviewer.ai
cd interviewer-ai
```

2. Backend Setup
```bash
cd server
npm install
```

Create a .env file in the server directory and add the following variables:
```bash
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
```

3. Frontend Setup
Open a new terminal window/tab:

```bash
cd client
npm install
```
Start the Vite development server:
```bash
npm run dev
```

The application should now be running at http://localhost:5173.

📁 Project Structure (High Level)
``` text
interviewer-ai/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── assets/         # Images, icons, static files
│   │   ├── components/     # Reusable UI (Navbar, Footer, Modals)
│   │   ├── pages/          # Route views (Home, Interview, History)
│   │   ├── redux/          # Redux slices and store configuration
│   │   └── App.jsx         # Main layout and routing
├── server/                 # Express Backend
│   ├── controllers/        # Route logic (Auth, User, Interviews)
│   ├── models/             # Mongoose database schemas
│   ├── routes/             # API endpoint definitions
│   └── index.js            # Server entry point
└── README.md

```

👨‍💻 Author
Ravi Kumar Yadav -> https://github.com/RaviKumarYadav15/
