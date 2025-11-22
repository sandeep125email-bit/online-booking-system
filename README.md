📘 Online Booking System

A modern full-stack booking platform that supports scheduling services, viewing bookings, admin management, and smart UI features such as dark mode, chatbot, notifications, and optional email/SMS alerts.

This project includes both Frontend (HTML + CSS + JS) and Backend (Node.js + Express).


🚀 Live Demo
🔹 Frontend (GitHub Pages)

👉 https://sandeep125email-bit.github.io/online-booking-system/


🔹 Backend (Render)

👉 https://online-booking-system-j7wh.onrender.com/


✨ Features
🌐 User Features

Online booking form (service, date, time, user info)

LocalStorage booking backup

Smart confirmation messages

Browser desktop notifications

Light/Dark mode toggle

Minimal chatbot (OpenAI optional)


🛠 Admin Features

Secure admin key for server access

View local + server bookings

See real-time new bookings

JSON persistent storage on server


📡 Backend Features

Node.js + Express API

Stores bookings in bookings.json

Optional:

Email confirmation (Nodemailer)

SMS confirmation (Twilio)

Chatbot replies via OpenAI API



🧱 Project Structure
online-booking-system/
│
├── server/
│   ├── server.js
│   ├── chat-proxy.js
│   ├── email-sms.js
│   ├── bookings.json
│   ├── package.json
│   └── .env   <-- not uploaded
│
├── index.html
├── admin.html
├── script.js
├── admin.js
├── style.css
└── README.md


⚙️ Backend Setup (Local)
1️⃣ Install Dependencies
cd server
npm install


2️⃣ Create .env
PORT=3000
ADMIN_KEY=changeme123

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM=

OPENAI_KEY=


3️⃣ Run Server
node server.js


🌍 Deployment (Frontend + Backend)
Frontend → GitHub Pages

Move frontend files (index.html, admin.html, script.js, admin.js, style.css) to repo root.

Commit & push.

Go to GitHub → Settings → Pages.

Select:

Branch: main

Folder: /root

Save → GitHub publishes your site.

Backend → Render

Create a new Web Service

Connect GitHub repo

Root directory: server/

Build Command:

npm install


Start Command:

node server.js


Add .env variables in Render Dashboard

Deploy




🔧 Technologies Used
Frontend

HTML5

CSS3

Vanilla JavaScript

Backend

Node.js

Express.js

Nodemailer

Twilio

OpenAI API (optional)



👨‍💻 Developer

Kanchanpally Sandeep
📧 sandeep.125.email@gmail.com

📱 8374701408
🔗 https://github.com/sandeep125email-bit



⭐ How to Use This Project

User fills booking form

Booking is saved locally

Backend also saves booking in bookings.json

Admin logs in using admin key

Admin reviews all bookings



🏁 Future Enhancements

Full authentication system

Database integration (MongoDB / Firebase)

Complete mobile app version

Payment gateway integration



🎉 Thank you for visiting this project!

