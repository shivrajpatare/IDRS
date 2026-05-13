# IDRS — Next-Gen Disaster Intelligence & Command Nexus

![IDRS Command Dashboard](https://raw.githubusercontent.com/shivrajpatare/IDRS/main/preview.png)

## 🌐 Vision
The **Intelligent Disaster Response System (IDRS)** is a high-fidelity, military-grade tactical simulation and coordination hub designed for the **National Disaster Management Authority (NDMA)**. It leverages real-time geospatial intelligence, neural AI analysis, and hyper-local GPS tracking to orchestrate large-scale rescue operations across complex urban environments like Greater Chennai.

---

## 🚀 Core Pillars

### 1. 🛰️ Tactical Command Nexus
A professional-grade situational awareness engine for mission commanders.
*   **Obsidian-Visuals**: High-contrast, dark-ops mapping engine powered by MapLibre-GL.
*   **Real-Time Interception**: Dynamic tracking of rescue assets (AS-01, AS-02, AS-03) with live flight/path interpolation.
*   **Strategic Overrides**: Instant scenario modeling for Floods, Cyclones, and mass asset deployment.
*   **Verified Truth Layer**: Replacement of synthetic markers with real-world hospitals, shelters, and NGO hubs.

### 2. 🧠 Gemini AI Tactical Advisor
Synthesizing chaos into actionable intelligence using **Gemini 2.5 Flash**.
*   **Situational Briefings**: Real-time AI-generated tactical summaries based on live distress feeds.
*   **Threat Evaluation**: Automated threat-level scoring with 90%+ confidence modeling.
*   **Coordinated Recommendations**: AI-driven action plans for surgical resource allocation.

### 3. 📱 Personal Citizen Nexus
A GPS-aware portal designed for public safety and recovery.
*   **Voyager Navigation**: A clean, daylight-optimized street-level map for easy city navigation.
*   **Live GPS Handshake**: Near-instant device localization using high-accuracy geolocation protocols.
*   **Hyper-Local Weather**: Real-time atmospheric conditions (temp, humidity, wind) synced to the user's exact coordinates.
*   **Smart Extraction Routing**: Intelligence-led routing to the nearest available "Safe Zone" or Medical Node.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Framer Motion |
| **Mapping** | MapLibre-GL, Carto Voyager/Dark-Matter |
| **Intelligence** | Gemini 2.5 Flash (via Google Generative AI) |
| **Backend** | FastAPI (Python), Uvicorn |
| **Communication** | WebSocket (Live Feed), HTTP/REST |
| **Styling** | Tailwind CSS, Lucide Icons |

---

## 📦 Installation & Setup

### 1. Prerequisites
*   Node.js (v18+)
*   Python 3.9+
*   Gemini API Key (Google AI Studio)

### 2. Backend Initialization
```bash
cd idrs/backend
pip install -r requirements.txt
python main.py
```

### 3. Frontend Initialization
```bash
cd idrs/frontend
npm install
npm run dev
```

---

## 🛡️ Strategic Deployment
IDRS is designed to handle **High-Stakes Coordination**. 
*   **Red SOS Dots**: Represent live, GPS-verified citizen distress signals.
*   **Blue/Orange Assets**: Represent coordinated NDRF/SDRF rescue units.
*   **Strategic Scenarios**: Commanders can toggle between Flood and Cyclone overlays to adapt to shifting environmental threats.

---

## 👨‍💻 Author
**Shivraj Patare**  
*Strategic Response Intelligence Lead*

---
*Powered by the Luminous Protocol v4.2*
