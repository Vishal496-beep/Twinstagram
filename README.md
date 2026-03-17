<<<<<<< HEAD
# Twinstagram
A MERN Stack application Twitter+Instagram
# Twinstagram
A MERN Stack application Twitter+Instagram
# This is a backend of Pinstagram
    javaScript, mongoDB, Express, cloudinary are used


# we should always while working have to restart the file preview
[*Model link](https://stackblitz.com/edit/stackblitz-starters-ersmd6ug?file=models%2Ftodos%2Fsub_todo.models.js)

# backend ~

    Always use async/await or try catch approch in database because 'databse is in another continent'
# middleware simply means k like /instagram par click krne k baad jo b request gyi or response bhejna h uske beech ka difference like if user is loggedin or if a user is admin
(err, req, res, next) next jb bhi use kia h iska matlb h ki middleware ki baat hori h
# we use app.get app.post  but  app.use we are going to use when we want to configure or for middlewares
# higher order functions are jo function as a parameter b accept krte h or as a function bhi

# arrow fnction kbhi bhi this use nhi krta user.model mei isliye hmesha function use krns chhahiye


# app.use
     .use hmesha mostly jb bhi middleware inject krna hota h toh use hoga 

# access tokens~
     those tokens which expires shortly like 1 day 15min or so 
#  refresh tokens ~
     are those tokens which are longer . ex=> 1month , 1year

# user.controller.js ~
    here in login we are using user and User the difference is clear that User.findone or .findbyid can be accessed by only databse we havesaved

# req, _, next
    sometimes we see this instead of res#

    
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
