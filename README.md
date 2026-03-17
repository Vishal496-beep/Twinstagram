

    
=======
# 🎥 Twinstagram | Full-Stack Video Hosting Platform

Twinstagram is a high-performance video streaming and social interaction platform built with the **MERN Stack**. It features a robust backend architecture and a modern, responsive UI, designed to handle video uploads, user interactions, and complex data relationships.



## 🚀 Live Demo
- **Frontend:** [Your Vercel Link Here]
- **Backend API:** [Your Render/Railway Link Here]

## 🛠 Tech Stack
- **Frontend:** React.js, Tailwind CSS, Axios, Lucide React (Icons), React Router Dom
- **Backend:** Node.js, Express.js, JWT (Authentication), Cookie-parser
- **Database:** MongoDB Atlas (Cloud)
- **Media Management:** Cloudinary API (Video & Image storage)

---

## ✨ Key Features

### ⚡ Optimized User Experience
- **Optimistic UI Updates:** Follow/Unfollow and Like actions reflect instantly on the UI using React `useCallback` and `useState` management, providing a zero-latency feel while the backend syncs in the background.
- **Responsive Design:** Fully fluid layout for Mobile, Tablet, and Desktop.

### 🔐 Secure Authentication
- **JWT Authentication:** Implemented secure login using Access and Refresh Tokens stored in HTTP-only cookies to prevent XSS attacks.
- **Protected Routes:** User-specific actions (like, comment, follow) are guarded by custom Auth middlewares.

### 📊 Advanced Backend Logic
- **MongoDB Aggregation Pipelines:** Used complex pipelines to calculate real-time stats like subscriber counts, like status, and personalized video feeds.
- **Efficient Media Handling:** Integrated Cloudinary for seamless video uploads and automatic thumbnail generation.

---

## 🏗 System Architecture

The project follows a modular "Controller-Service-Route" pattern on the backend for scalability.



1. **User Schema:** Manages profiles, history, and watch lists.
2. **Video Schema:** Handles metadata, views, and visibility status.
3. **Follower Schema:** Manages many-to-many relationships between users (Follower-Profile logic).
4. **Like/Comment Schemas:** Dedicated collections for high-frequency interactions.

---

## 📸 Screenshots

| Home Page | Video Player | User Profile |
| :---: | :---: | :---: |
| ![Home](your_screenshot_link) | ![Player](your_screenshot_link) | ![Profile](your_screenshot_link) |

---

## 🛠 Installation & Local Setup

1. **Clone the repository**
   ```bash
   git clone [https://github.com/](https://github.com/)[your-username]/[your-repo-name].git
>>>>>>> c75f460 (added screenshots)
