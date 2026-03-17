# 📺 Twinstagram | Hybrid Social Media Platform  

Twinstagram is a full-stack social media ecosystem that merges the best of video streaming (YouTube-style) and micro-blogging (Twitter-style). Built with the **MERN Stack**, it features a complex backend architecture to handle diverse content types and user interactions seamlessly.



[Image of MERN stack architecture diagram]


## 🚀 Live Links
- **Frontend:** [Link Paste Kar]
- **Backend API:** [Link Paste Kar]

---

## ✨ Features  

### 🔐 Advanced Authentication  
- Secure **Register & Login** with JWT (Access & Refresh Tokens).  
- Passwords secured with **Bcrypt** hashing.  
- Cookie-based session management for enhanced security.

### 🎥 Video Streaming & Management
- High-quality video uploads handled via **Cloudinary**.  
- Real-time **Like/Unlike** and **View counts**.  
- Dynamic video suggestions based on content.

### 🐦 Micro-Blogging (Tweets)
- Dedicated **Tweet System** for short-form text updates.  
- Integrated interaction between video creators and their community.

### 👤 Profile & Analytics (Dashboard)
- **User Profile:** Shows subscriber counts, following status, and all uploaded content.  
- **Dashboard:** A central hub for creators to track their video performance and manage their tweets.

### ⚡ Performance Optimization
- **Optimistic UI Updates:** Follow and Like actions reflect instantly on the UI for a zero-lag experience.  
- **MongoDB Aggregation:** Complex pipelines used to fetch user stats and content status in a single query.

---

## 🛠 Tech Stack  

- **Frontend:** React.js, Tailwind CSS, Axios, Lucide Icons, React Router Dom  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB Atlas  
- **Cloud Storage:** Cloudinary (Images & Videos)  

---

## 🏗 System Architecture  

The project follows the **MVC (Model-View-Controller)** pattern with a dedicated service layer for Cloudinary and authentication middlewares.



---

## 📸 App Walkthrough  

| **Register** | **Login** |
| :---: | :---: |
| ![Register](./frontend/src/screenshots/Register.png) | ![Login](./frontend/src/screenshots/Login.png) |

| **User Dashboard** | **User Profile** |
| :---: | :---: |
| ![Dashboard](./frontend/src/screenshots/Dashboard.png) | ![Profile](./frontend/src/screenshots/Profile.png) |

| **Video Feed** | **Tweets Section** |
| :---: | :---: |
| ![Video](./frontend/src/screenshots/video.png) | ![Tweets](./frontend/src/screenshots/Tweets.png) |
## 🔧 Installation & Local Setup  

1. **Clone the repository** ```bash
   git clone [https://github.com/vishal496-beep/Twinstagram.git](https://github.com/vishal496-beep/Twinstagram.git)