# 🎓 EduCore AI

**The Intelligent Campus Management & Learning Ecosystem**

EduCore is a next-generation academic platform designed to bridge the gap between students, faculty, and administration through AI-driven insights and streamlined workflows. Built for modern universities, it transforms passive data into actionable intelligence.

---

## 🚀 Key Features

### 🤖 For Students: The AI Study Agent
- **Personalized Learning**: Chat with an AI agent that knows your curriculum.
- **Multimodal Interaction**: Voice-to-text integration for natural querying.
- **Academic Tracking**: Real-time attendance heatmaps and history.

### 📊 For Admin: Command Center
- **Behavioral Risk Matrix**: Predictive analytics identifying students with <75% attendance before they fail.
- **AI Diffusion Analytics**: Track how AI is being utilized across different departments.
- **Campus Overview**: High-level KPIs on enrollments, active campus density, and critical alerts.

### 👨‍🏫 For Faculty: Operational Excellence
- **Automated Timetables**: Smart generator that handles breaks and room allocations.
- **Material Management**: Centralized hub for uploading and tracking study resources.
- **Leave Management**: Digitized request and approval workflow.

---

## 🛠 Tech Stack

- **Frontend**: React 18 with Vite (Ultra-fast HMR)
- **Styling**: TailwindCSS & Custom Glassmorphic CSS
- **Animations**: Framer Motion (Smooth layout transitions)
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security)
- **Analytics**: Recharts (Dynamic data visualization)
- **AI Integration**: Gemini & NVIDIA NIM Models

---

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sathvik-Nagesh/EduCore.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_GEMINI_API_KEY=your_gemini_key
   ```

4. **Run in development mode**
   ```bash
   npm run dev
   ```

---

## 🛠 Recent Updates (Production Ready)

- ✅ **Fixed Deployment Pipelines**: Resolved TypeScript compilation errors and build-time dependency collisions for Vercel.
- ✅ **Light Mode Optimization**: Full UI overhaul for maximum visibility and accessibility.
- ✅ **Live Data Integration**: Connected Admin Dashboard to real-time Supabase analytics.
- ✅ **Enhanced RLS Security**: Implemented secure database access policies for demo environments.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
