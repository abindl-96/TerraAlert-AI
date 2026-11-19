# ⛰️ TerraAlert AI — Landslide Prediction

### AI-Powered Landslide Risk Prediction and Early Warning System

**TerraAlert AI focuses specifically on predicting landslide risk—not general disaster monitoring.** It is a web-based platform designed to estimate location-specific landslide probability using historical and real-time environmental information. The project documentation describes a prediction workflow using machine learning and the **Gemini AI API**, alongside weather and location data services. Its goal is to help communities and government authorities prepare for landslide hazards through risk dashboards, alerts, incident reports, and safety guidance—without requiring IoT devices.

> **Implementation note:** The features below describe the project's documented scope. Availability and accuracy of live predictions, third-party integrations, and automated alerts should be verified against the deployed application and configured API services. Risk estimates are informational and are not a substitute for official emergency warnings.

## ✨ Features

### 👤 User module
- Search locations by name or coordinates.
- View location-specific landslide risk probabilities informed by environmental data.
- Receive email alerts when risk exceeds a configured threshold (documented default: **50%**).
- Read safety guidelines and recommended actions.
- Submit landslide observations and incident reports.
- Download regional reports and trend analyses.
- Choose preferred languages for alerts and dashboards.

### 🛡️ Admin module
- Monitor regional landslide probabilities.
- Manage user accounts.
- Verify and approve submitted incident reports.
- Send bulk email alerts to users and authorities.
- Maintain safety guidelines and educational resources.
- Review incident reports, usage statistics, and AI-generated reports.

### 🏛️ Government authority module
- View high-risk zones and regional dashboards.
- Receive alerts when defined risk thresholds are exceeded.
- Download risk reports, forecasts, and trends.
- Review incident histories and reports from users.
- Configure alert thresholds and notification frequency.

## 🧰 Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React, JavaScript, CSS, Vite |
| Backend | Node.js, Express.js |
| Database | MySQL (`mysql2`) |
| AI integration | Gemini AI API (as described in project documentation) |
| Environmental/location data | Weather and location APIs (provider depends on configuration) |
| Email notifications | Nodemailer |
| Authentication | JWT and role-based access control (documented design) |

The project document also mentions Leaflet/Google Maps, Recharts/Chart.js, and Tailwind/Material UI as possible UI libraries; check the installed dependencies to confirm which are used.

## 📁 Repository structure

```text
TerraAlert-AI/
├── Backend/
│   ├── config/
│   ├── controllers/
│   ├── migrations/
│   ├── routes/
│   ├── Index.js
│   ├── package.json
│   └── database_schema.sql
├── terraalert_ai/
│   ├── public/
│   ├── src/
│   │   ├── Components/
│   │   │   ├── Admin/
│   │   │   ├── Government/
│   │   │   └── USER/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚀 Getting started

### Prerequisites
- Node.js and npm
- MySQL Server
- Git
- Credentials for any external services enabled by your installation

### 1. Clone the repository

```bash
git clone https://github.com/abindl-96/TerraAlert-AI.git
cd TerraAlert-AI
```

### 2. Configure MySQL

1. Start MySQL Server.
2. Create a database (use the database name expected by your backend configuration).
3. Import the appropriate schema from `Backend/database_schema.sql` or another **sanitized** SQL export.
4. Set the backend database host, port, username, password, and database name according to `Backend/config/db.js` and your local setup.

For example, in MySQL:

```sql
CREATE DATABASE terraalert;
```

`terraalert` is an example name; use the name required by your application's configuration. Never commit real credentials or private database dumps.

### 3. Start the backend

```bash
cd Backend
npm install
npm start
```

Ensure the MySQL server is running before starting the backend. Configure any required API keys, email credentials, and JWT secrets securely using environment variables or your application's supported configuration method. Consult the setup documents in `Backend/` for project-specific requirements.

### 4. Start the frontend

Open a second terminal from the repository root:

```bash
cd terraalert_ai
npm install
npm run dev
```

Open the local URL printed by Vite (commonly `http://localhost:5173/`).

## 🔐 Security and configuration

- Keep `.env` files, API keys, database passwords, and email credentials out of Git.
- Review all SQL scripts and exports for personal information before making the repository public.
- Use example configuration files with placeholder values when documenting setup.
- If secrets were previously committed, remove them from Git history and rotate the affected credentials.


## 🧭 Future improvements

Potential enhancements include more extensive prediction validation, additional environmental data sources, interactive risk maps, multilingual accessibility improvements, and richer alert delivery options.

## ⚠️ Disclaimer

TerraAlert AI is an academic/software project. Predictions and alerts should not be relied upon as official hazard assessments or emergency instructions. Always follow warnings and evacuation guidance from authorized agencies.

## 👨‍💻 Developer

GitHub: [@abindl-96](https://github.com/abindl-96)

## 🔗 Repository

[TerraAlert-AI](https://github.com/abindl-96/TerraAlert-AI)
