# 🌌 Project Genesis — AI Operating System for Life

> A production-ready, full-stack intelligent personal OS that manages your tasks, studies, finances, habits, and documents — powered by AI.

---

## ✨ Features

| Module | Capabilities |
|---|---|
| 🔐 **Authentication** | JWT login/signup, forgot password, profile management |
| 📊 **AI Dashboard** | Productivity score, task/mood/habit/finance overview, live sync |
| 📅 **Smart Calendar** | Event CRUD, AI conflict detection & time suggestion |
| 📚 **Study Planner** | AI-generated daily schedule, weekly milestones, revision plan |
| ✅ **Task Manager** | Full CRUD, priority prediction, AI "What's Next?" engine |
| 📝 **AI Notes** | Markdown editor, tag search, image attachment |
| 🧠 **Document Brain** | PDF/DOCX/TXT/PPT RAG pipeline, flashcards, quiz, Q&A |
| 💬 **Chat Assistant** | Context-aware AI companion using your tasks, notes & profile |
| 💰 **Finance Module** | Income/expense tracker, charts, linear regression forecasting |
| 🔥 **Habits Tracker** | Daily check-ins, streak counter, AI completion predictions |
| 😊 **Mood Journal** | Sentiment analysis, emotion tagging, analytics |
| 📈 **Productivity Analytics** | Heatmaps, bar/line charts, 30-day activity grid |
| 🎯 **Recommendations** | Interest-based books, courses, videos, projects |
| 🔔 **Smart Notifications** | Budget alerts, exam reminders, habit nudges |
| 🎤 **Voice Assistant** | Speech-to-text commands, text-to-speech feedback |
| 🛡️ **Admin Panel** | User management, system stats, audit logs |

---

## 🏗️ Tech Stack

### Backend
- **FastAPI** — High-performance async REST API
- **SQLAlchemy** + **Alembic** — ORM & database migrations
- **SQLite** (dev) / **PostgreSQL** (production)
- **JWT Authentication** via `python-jose` & `passlib`
- **LangChain** + **OpenAI API** — LLM-powered responses
- **ChromaDB** — Local vector database for RAG
- **SentenceTransformers** — Offline embeddings (`all-MiniLM-L6-v2`)
- **Scikit-learn** / **NumPy** — Statistical analysis & forecasting
- **PyPDF2**, **python-docx**, **python-pptx** — Document parsing

### Frontend
- **React 19** + **Vite** — Fast, modern frontend
- **Tailwind CSS v3** — Utility-first styling with glassmorphism
- **Framer Motion** — Smooth animations & transitions
- **Chart.js** / **react-chartjs-2** — Interactive data visualizations
- **Axios** — HTTP client with JWT interceptors
- **React Router v6** — Client-side routing
- **react-markdown** — Markdown rendering in Notes
- **Lucide React** — Icon set

### DevOps
- **Docker** + **Docker Compose** — Containerized deployment
- **Nginx** — Static file serving for React frontend
- **Uvicorn** — ASGI server for FastAPI

---

## 📁 Project Structure

```
project-genesis/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entrypoint
│   │   ├── config.py            # Settings (env vars)
│   │   ├── database.py          # SQLAlchemy engine & session
│   │   ├── models.py            # 12 database models
│   │   ├── schemas.py           # Pydantic validation schemas
│   │   ├── auth.py              # JWT utilities
│   │   ├── routers/             # 16 API route modules
│   │   └── services/            # AI, analysis & speech engines
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/          # Sidebar, GlassCard, Charts, VoiceButton
│   │   ├── context/             # AuthContext (JWT management)
│   │   ├── pages/               # 13 feature pages
│   │   ├── App.jsx              # Routing with protected/admin guards
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global glassmorphism design system
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🗃️ Database Schema

| Table | Key Fields |
|---|---|
| `users` | id, email, hashed_password, full_name, interests, daily_hours_goal, role |
| `tasks` | id, user_id, title, category, priority, due_date, completed, predicted_due_date |
| `notes` | id, user_id, title, content (Markdown), tags, image_url |
| `calendar_events` | id, user_id, title, start_time, end_time, is_ai_scheduled |
| `habits` | id, user_id, name, category, completions, streak |
| `expenses` | id, user_id, amount, type (income/expense), category, date |
| `study_plans` | id, user_id, subjects, exam_date, available_hours, schedule |
| `mood_journal` | id, user_id, entry, sentiment, emotions, mood_score, date |
| `uploaded_files` | id, user_id, filename, file_type, file_path, file_size |
| `notifications` | id, user_id, title, message, type, is_read |
| `recommendations` | id, user_id, title, resource_type, url, reasoning |
| `system_logs` | id, user_id, action, details, timestamp |

---

## 🤖 AI Modules

| Engine | Description |
|---|---|
| **RAG Pipeline** | Embeds PDF/DOCX/TXT/PPT with SentenceTransformers, stores in ChromaDB, runs cosine similarity retrieval |
| **Study Planner AI** | LangChain prompt to generate daily blocks, weekly milestones, revision checkpoints |
| **Task Prioritizer** | Weighted scoring by priority + deadline proximity for "What Next?" |
| **Mood Analyzer** | Lexicon-based sentiment & emotion tagging (Positive/Neutral/Negative) |
| **Finance Predictor** | NumPy `polyfit` linear regression on daily expense history |
| **Habit Predictor** | Streak-based Markov-style completion probability |
| **Productivity Scorer** | Weighted composite of tasks (40%), habits (30%), study (20%), mood (10%) |
| **Speech Interpreter** | Regex NLP to parse voice commands into structured API actions |
| **Recommendation Engine** | Interest & performance-based catalog matching |

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# 1. Clone the repository
git clone <repo-url>
cd project-genesis

# 2. Set environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your OPENAI_API_KEY (optional) and SECRET_KEY

# 3. Start all services
docker-compose up --build

# Access the app:
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8000
# API Docs:  http://localhost:8000/docs
```

### Option 2: Local Development

#### Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env as needed (SQLite works out of the box)

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
# Runs at http://localhost:5173
```

---

## 🌐 API Documentation

Once the backend is running, visit **http://localhost:8000/docs** for the interactive Swagger UI.

### Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new account |
| POST | `/api/auth/login` | Authenticate & get JWT token |
| GET | `/api/dashboard/` | Aggregated dashboard payload |
| GET/POST | `/api/tasks/` | Task CRUD |
| GET | `/api/tasks/suggest-next` | AI next task suggestion |
| GET/POST | `/api/calendar/` | Calendar events |
| POST | `/api/calendar/suggest-time` | Conflict detection & scheduling |
| POST | `/api/study/` | Generate AI study plan |
| POST | `/api/rag/upload` | Upload document for RAG indexing |
| POST | `/api/rag/query` | Query document with AI |
| POST | `/api/chat/` | Chat with AI companion |
| GET | `/api/finance/forecast` | Spending forecast |
| POST | `/api/habits/{id}/complete` | Log habit completion |
| GET | `/api/habits/predictions` | AI habit predictions |
| POST | `/api/mood/` | Log mood journal entry |
| GET | `/api/mood/analytics` | Mood analysis report |
| GET | `/api/productivity/score` | Compute productivity score |
| GET | `/api/productivity/analytics` | Charts & heatmap data |
| GET | `/api/recommendations/` | AI learning recommendations |
| POST | `/api/voice/command` | Process voice transcript |
| GET | `/api/admin/stats` | Admin system statistics |

---

## 🎨 Design System

| Token | Value |
|---|---|
| Background | `#0A0915` — Deep Space Black |
| Glass Panel | `rgba(20, 18, 40, 0.45)` + `backdrop-filter: blur(16px)` |
| Accent Cyan | `#00F2FE` — Tasks, Voice, RAG |
| Accent Violet | `#9F7AEA` — AI features |
| Accent Pink | `#FF007A` — Finance, Alerts |
| Accent Mint | `#00F5A0` — Habits, Success |
| Font Primary | **Inter** |
| Font Display | **Outfit** |

---

## ☁️ Deployment

### Vercel (Frontend)
```bash
cd frontend
npm run build
# Deploy the `dist/` folder to Vercel
```

### Render (Backend)
1. Create a new **Web Service** on Render
2. Connect your GitHub repo, set root to `backend/`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables: `DATABASE_URL`, `SECRET_KEY`, `OPENAI_API_KEY`

---

## 🔒 Security Notes

- Change `SECRET_KEY` before deploying to production
- Set `allow_origins` in CORS to your actual frontend domain
- Store API keys in environment variables, never in code
- Use PostgreSQL for production (SQLite is for local dev only)

---

## 📄 License

MIT License — Built with ❤️ as Project Genesis, an AI-powered personal operating system.
