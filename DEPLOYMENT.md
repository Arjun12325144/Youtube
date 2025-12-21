# YouTube Clone - Complete Deployment Guide

## 🚀 Quick Start

This guide covers deploying both the frontend (Next.js) and backend (Express.js) with all features:
- Video streaming & uploads
- User authentication (Firebase)
- Comments with translation
- Premium subscription plans (Razorpay)
- Video downloads
- Video calling (WebRTC)
- Location-based theming

---

## 📋 Prerequisites

1. **GitHub account** - for version control
2. **MongoDB Atlas account** - for database
3. **Firebase project** - for authentication
4. **Razorpay account** - for payments (test mode works without verification)
5. **Vercel account** - for frontend hosting (free)
6. **Render/Railway account** - for backend hosting (free tier available)

---

## 🗄️ Database Setup (MongoDB Atlas)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free cluster
3. Create a database user with read/write permissions
4. Add `0.0.0.0/0` to IP whitelist (for deployment)
5. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/youtube-clone`

---

## 🔐 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Google Sign-In** in Authentication
4. Add your deployment domains to authorized domains
5. Get your Firebase config from Project Settings > General

---

## 💳 Razorpay Setup (Optional - for Premium Plans)

1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to Settings > API Keys
3. Generate test API keys
4. Note down both Key ID and Key Secret

---

## 🖥️ Backend Deployment (Express.js)

### Option 1: Render (Recommended)

1. Push your `server/` folder to GitHub
2. Go to [render.com](https://render.com) → "New +" → "Web Service"
3. Connect your repository and select the `server` directory
4. Configure:
   - **Name**: youtube-clone-api
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://your-connection-string
   PORT=4000
   CORS_ORIGIN=https://your-vercel-url.vercel.app
   
   # Firebase (from your Firebase config)
   FIREBASE_API_KEY=your-api-key
   FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   
   # Razorpay (for premium features)
   RAZORPAY_KEY_ID=rzp_test_xxx
   RAZORPAY_KEY_SECRET=your-secret-key
   
   # Email (for invoices - optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

6. Click "Create Web Service"

### Option 2: Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects Node.js
5. Add environment variables (same as Render)
6. Get your deployed URL from Railway dashboard

### Option 3: DigitalOcean App Platform

1. Go to [digitalocean.com/products/app-platform](https://digitalocean.com/products/app-platform)
2. Create App → Choose GitHub
3. Configure build settings and environment variables
4. Deploy

---

## 🌐 Frontend Deployment (Next.js on Vercel)

1. Push your `youtube/` folder to GitHub
2. Go to [vercel.com](https://vercel.com) → "Add New" → "Project"
3. Import your GitHub repository
4. **IMPORTANT**: Set Root Directory to `youtube`
5. Vercel auto-detects Next.js

### Environment Variables on Vercel:
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.onrender.com
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com

# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc

# Razorpay (public key only for frontend)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
```

6. Click "Deploy"

---

## 🔧 Post-Deployment Configuration

### Update CORS on Backend
After getting your Vercel URL, update the backend `CORS_ORIGIN`:
```
CORS_ORIGIN=https://your-app.vercel.app
```

### Firebase Authorized Domains
1. Go to Firebase Console → Authentication → Settings
2. Add your Vercel domain to "Authorized domains"

### Razorpay Webhook (Optional)
1. Go to Razorpay Dashboard → Webhooks
2. Add endpoint: `https://your-backend.onrender.com/payment/webhook`
3. Select events: `payment.captured`, `payment.failed`

---

## 📁 File Structure for Deployment

```
your-repo/
├── server/              # Backend (deploy to Render/Railway)
│   ├── index.js
│   ├── package.json
│   ├── socket.js
│   ├── controller/
│   ├── Models/
│   ├── routes/
│   └── uploads/         # File uploads directory
│
├── youtube/             # Frontend (deploy to Vercel)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   └── vercel.json
│
└── DEPLOYMENT.md
```

---

## ✅ Features Checklist

| Feature | Backend Route | Frontend Page |
|---------|--------------|---------------|
| User Auth | `/auth` | Sign-in button |
| Video Upload | `/video/upload` | Channel page |
| Video Playback | `/video/:id` | `/watch/[id]` |
| Comments | `/comment` | Watch page |
| Like/Dislike | `/like` | Watch page |
| Subscriptions | `/subscribe` | Channel page |
| Watch History | `/history` | `/history` |
| Watch Later | `/watchlater` | `/watch-later` |
| Downloads | `/download` | `/downloads` |
| Premium Plans | `/payment` | `/premium` |
| Search | `/video/search` | `/search` |
| Video Call | Socket.IO | Channel header |

---

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Ensure `CORS_ORIGIN` in backend matches your Vercel URL exactly
   - Include/exclude `www` consistently

2. **Socket.IO Not Connecting**
   - Check `NEXT_PUBLIC_BACKEND_URL` is correct
   - Ensure WebSocket is enabled on your hosting platform

3. **File Upload Fails**
   - Check file size limits in `index.js`
   - Ensure `uploads/` directory exists
   - Consider using cloud storage (Cloudinary/AWS S3) for production

4. **Authentication Fails**
   - Verify Firebase domains are authorized
   - Check Firebase config is correctly set

5. **Payment Issues**
   - Use Razorpay test keys for development
   - Verify webhook URL is accessible

---

## 🔒 Security Checklist

- [ ] All API keys are in environment variables, NOT in code
- [ ] MongoDB IP whitelist is configured
- [ ] Firebase security rules are set
- [ ] HTTPS is enabled (automatic on Vercel/Render)
- [ ] Rate limiting is configured on backend
- [ ] Input validation is in place

---

## 📈 Performance Tips

1. **Enable Vercel Analytics** for frontend monitoring
2. **Add MongoDB indexes** for frequently queried fields
3. **Use CDN** for video files (Cloudinary/AWS CloudFront)
4. **Enable gzip compression** on backend
5. **Configure caching headers** for static assets

---

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Check the deployment logs on Render/Vercel
3. Verify all environment variables are set correctly
4. Test API endpoints using Postman/Thunder Client

---

## 🎉 You're Done!

Your YouTube Clone is now live! Share your URL:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-api.onrender.com`
