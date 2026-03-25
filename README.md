# 🏆 Daily Sports Trivia

[![Live](https://img.shields.io/badge/live-daily--sports--trivia.com-22c55e?style=flat-square)](https://daily-sports-trivia.com)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Node](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![AWS](https://img.shields.io/badge/deployed-AWS-FF9900?style=flat-square&logo=amazon-aws)](https://daily-sports-trivia.com)

> Think you know sports? One quiz. Every day. Test your knowledge.

**[▶ Play today's quiz](https://daily-sports-trivia.com)**

![Demo of quiz](./assets/Demo.gif)

---

## 🌟 Highlights

- 🗓️ A brand new 10-question quiz drops every day at midnight (same questions for every player, worldwide)
- 🔥 Tracks your daily streak with a calendar heatmap 
- 📊 Personal stats: accuracy %, percentile rank among users, and a score-over-time chart
- 🏅 Leaderboard ranking against other players (registered only)
- 📤 Share your result as an emoji grid
- 🔐 Sign in with Google or create an account with email and password
- ⏱️ Live countdown to the next quiz reset displayed on the navbar

---

## ℹ️ Overview

Daily Sports Trivia delivers a new 10-question sports quiz per day. It is automatically fetched, stored, and served to every player at midnight. Questions span as a dynamic easy, medium, and hard difficulty across all major sports.

You can play as a guest or create an account to track your streak, compare your score against other players, and view your personal stats.

### 👤 Author

Built by [Nikit Chhita](https://github.com/NikitChhita) — full-stack, solo, from database schema to cloud deployment.

---

## 🚀 Screens of the website

<img src="./assets/Results.png" width="800" alt="Results Screen" />

### Stats & Activity
<p align="left">
  <img src="./assets/Stats.png" width="350" alt="Stats Modal" />
  <img src="./assets/Streak.png" width="350" alt="Streak Modal" />
</p>

---

## 🛠️ Tech Stack

**Frontend** — React 18, Vite, shadcn/ui, Tailwind CSS, Recharts

**Backend** — Node.js, Express, Sequelize ORM, Passport.js, JWT, node-cron

**Database** — MySQL 8 on AWS RDS (May migrate to mySQL ran on EC2 Server in the future)

**Auth** — Google OAuth 2.0 + bcrypt email/password 

**Hosting Infrastructure** — AWS: EC2, RDS, S3, CloudFront 

---

## ⬇️ Steps to run locally

Requires **Node.js 20+** and **MySQL 8**.

```bash
git clone https://github.com/NikitChhita/daily-sports-trivia.git
cd daily-sports-trivia
```

```bash
# Backend
cd backend && npm install
cp .env.example .env   # fill in your info
npm run dev
```

```bash
# Frontend
cd frontend && npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## 💭 Feedback

Found a bug or want to request a feature? [Open an issue](https://github.com/NikitChhita/daily-sports-trivia/issues) — all feedback is welcome.
