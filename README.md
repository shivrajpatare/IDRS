# IDRS: Adaptive Disaster Lifecycle Management Platform

![IDRS Banner](https://images.unsplash.com/photo-1454789548928-9efd52dc4031?q=80&w=2000&auto=format&fit=crop)

**IDRS** is an intelligent, phase-aware disaster management platform designed specifically for the unique operational challenges in India. It bridges the critical gap between public citizens facing emergencies and the centralized Command Control Rooms coordinating relief efforts.

By operating across **PRE**, **MID**, and **POST** disaster phases, IDRS ensures predictive resource allocation, real-time SOS prioritization, automated misinformation filtering, and transparent post-disaster recovery tracking.

---

## 🌟 Key Features

### 📡 Real-time Command Dashboard
* **Unified Map**: High-fidelity Leaflet-based dark mode maps overlaying live SOS pings, facility statuses, and resource unit positions.
* **Smart SOS Queue**: Incoming distress signals are automatically processed by the ML Priority Engine, factoring in injury severity, zone density, and time decay to ensure critical cases are routed first.
* **Facilities Monitor**: Live tracking of Hospital beds and Shelter capacities with WebSocket-powered visual alerts for overflowing zones.
* **Verification Center**: AI-driven credibility scoring immediately flags anonymous or suspicious reports to prevent misinformation loops.

### 📱 Citizen PWA (Progressive Web App)
* **Offline First**: Offline SOS queueing. If network drops during a cyclone or flood, SOS data is stored in IndexedDB and instantly synced upon reconnection.
* **Animated UI**: Built with `framer-motion` for a premium, responsive, and calming aesthetic during high-stress situations.
* **Recovery Workflows**: Direct pipeline for citizens to file Aid Claims and Missing Person reports securely from the POST_DISASTER phase tab.

### 🧠 ML Service Layer
* `/score/sos-priority`: Calculates dynamic SOS scores.
* `/score/credibility`: Authenticates and scores incoming incident reports.
* `/score/fraud`: Prevents duplicate identity and cluster anomalies during Aid Registration.
* `/match/missing-person`: Pattern matching for missing persons against found registries.

---

## 🏗 Architecture & Tech Stack

IDRS operates as a Monorepo comprised of three primary services:

1. **Frontend**: Vite + React + TypeScript + Tailwind CSS + Framer Motion
2. **Backend Engine**: FastAPI + SQLAlchemy + Python WebSockets
3. **ML Service**: FastAPI microservice for AI inference
4. **Database**: SQLite (Development) / PostgreSQL + PostGIS (Production)

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18+)
* **Python** (3.9+)
* **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/idrs.git
cd idrs
```

### 2. Setup the Main Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt

# Start the server (runs on port 8000)
uvicorn main:app --reload --port 8000
```

### 3. Setup the ML Service
```bash
# Open a new terminal
cd ml
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt

# Start the ML server (runs on port 8001)
uvicorn main:app --reload --port 8001
```

### 4. Setup the Citizen & Command Frontend
```bash
# Open a new terminal
cd frontend
npm install

# Start the Vite development server (runs on port 5173)
npm run dev
```

---

## 💻 Running the Demo Simulation
Once all three servers are running, navigate to `http://localhost:5173/command` in your browser. 

1. Open the **Demo Controls** drawer located in the top-right corner.
2. Click **Start PRE Phase** to initialize the platform.
3. Click **Trigger Flood Event (MID)** to watch the WebSockets simulate 5 staggered SOS requests and update facility statuses in real time.
4. Click **Simulate Rescue Progress** to see the system auto-assign units.
5. Alternatively, click **Run Full Auto Demo** to watch the entire 60-second lifecycle autonomously.

---

## 📖 API Documentation
With the backend running, interactive Swagger API documentation is automatically generated.
* **Main Backend Docs**: `http://localhost:8000/docs`
* **ML Service Docs**: `http://localhost:8001/docs`

---

## 🛡 Security & Best Practices
* **RBAC Implementation**: Routes are strictly guarded via JWT tokens, separating Citizen endpoints from Operator/Admin control functions.
* **Audit Logging**: Every critical state mutation (SOS Assignment, Facility Update) triggers the robust internal Audit Logger.
* **Rate Limiting & Fraud**: Built-in logic prevents SOS spam and flags potentially fraudulent relief claims during the recovery phase.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/idrs/issues).

## 📄 License
This project is proprietary.
