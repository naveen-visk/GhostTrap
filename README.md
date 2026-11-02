# 🛡️ GhostTrap: Autonomous Cyber Deception & Honeynet SOC Engine

[![Node.js Version](https://img.shields.io/badge/Node.js-v24.x-green.svg)](https://nodejs.org/)
[![Architecture](https://img.shields.io/badge/Architecture-Active%20Deception-orange.svg)]()
[![Defense](https://img.shields.io/badge/Framework-MITRE%20ATT%26CK-red.svg)](https://attack.mitre.org/)
[![Team](https://img.shields.io/badge/Team-Chai%20%26%20Commits-blue.svg)]()
[![Status](https://img.shields.io/badge/Status-Hackathon%20Production%20Ready-emerald.svg)]()

> **GhostTrap** is an intelligent, agentless cyber deception and adaptive honeypot framework that transforms enterprise security from passive defense into proactive threat entrapment. Instead of just blocking malicious actors, GhostTrap lulls attackers into a **"Mirage Vault"**—a realistic decoy environment where dynamic synthetic payloads, fake credentials, and Canary tokens are served while capturing every keystroke and telemetry signal in real-time.

---

## 🎯 The Core Problem

Traditional cybersecurity defenses (Firewalls, WAFs) suffer from three fatal flaws:
1. **Zero-Day Blindness**: Signatures fail against unknown or novel attack vectors.
2. **Alert Fatigue**: SOC analysts drown in thousands of false positives daily.
3. **Information Asymmetry**: Attackers only need to find one flaw to succeed, while defenders must secure everything.

---

## 💡 The GhostTrap Solution

GhostTrap flips the asymmetric advantage back to the defenders through **Active Deception Technology**:

```
                       [ Incoming Threat / Attacker ]
                                     |
                                     v
                       [ GhostTrap Deception Proxy ]
                        /                         \
         (Benign Traffic)                         (Malicious Payload)
                |                                          |
                v                                          v
      [ Normal App Routes ]                     [ Mirage Sandbox Vault ]
                                                • Synthetic SQL Database Dump
                                                • Decoy AWS Secrets (.env)
                                                • Fake Admin SSO Session
                                                           |
                                                           v
                                            [ Real-Time SOC Telemetry ]
                                            • Instant Audio Siren & Radar Blip
                                            • MITRE ATT&CK Matrix Tagging
                                            • 1-Click Forensic JSON Export
```

### 🌟 Key Innovations
1. **The Mirage Vault (Dynamic Synthetic Deception)**:
   - When an attacker executes SQL Injection (`' OR '1'='1'`), GhostTrap generates realistic fake user records containing honeypot credentials. The attacker believes they have breached the database and wastes critical time exfiltrating useless decoy data.
2. **Cryptographic Canary Tripwires**:
   - Decoy configuration files (`aws_secret_keys.env`, `staff_credentials.csv`) are embedded with unique tracking beacons (`#CNRY-8821`). The moment an attacker attempts to use or query the fake token, a **CRITICAL** alarm is fired.
3. **Agentless Passive Fingerprinting**:
   - Captures client IP, browser signatures, request methods, and exact payloads with **zero host overhead**.
4. **Military-Grade Defender SOC Console**:
   - Real-time WebSocket event streaming.
   - Dynamic Threat Severity Scoring (0–100).
   - Enterprise MITRE ATT&CK mapping (`T1190`, `T1110`, `T1552`, `T1083`).
   - Web Audio tactical alerts.
   - 1-Click Forensic JSON / PDF incident reporting.
5. **Interactive Attack Simulator**:
   - Built-in simulation trigger bar to effortlessly demonstrate attacks live in front of hackathon judges without needing complex attack infrastructure.

---

## 🚀 Live Demo & Presentation Walkthrough

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher (Tested on Node.js `v24.22.0`)
- **Git**

### 2. Quickstart Installation

```bash
# 1. Clone repository
git clone https://github.com/naveen-visk/ghosttrap.git
cd ghosttrap

# 2. Install dependencies (Express + WebSockets)
npm install

# 3. Start the GhostTrap Deception Engine
npm start
```

### 3. Accessing the Interfaces
- **Defender SOC Console**: [http://localhost:3000](http://localhost:3000)
- **Attacker Decoy Trap**: [http://localhost:3000/bait](http://localhost:3000/bait)

---

## 🧪 Testing Attacks (2-Laptop Hackathon Setup)

### Option A: From Laptop 2 or Judge's Smartphone
1. Connect both devices to the same Wi-Fi or mobile hotspot.
2. Find Laptop 1's IP address (`ipconfig` on Windows, e.g., `192.168.1.5`).
3. Open `http://<laptop-1-ip>:3000/bait` on Laptop 2 or the judge's phone.
4. Try typing `' OR '1'='1'` into the database search box or click "Exfiltrate".
5. Observe the instant red alert and audio chime on Laptop 1!

### Option B: Automated Attack Script (`attack_sim.bat`)
Run the included batch script on Laptop 2:
```cmd
attack_sim.bat
```
Select `[6]` to launch a multi-vector attack wave across SQLi, Brute-Force, Directory Traversal, and Canary Exfiltration.

### Option C: Built-in Judge Demo Simulator Bar
On the Defender SOC Console (`http://localhost:3000`), click any button on the top toolbar:
- `[🚨 SQL Injection]`
- `[🔑 Brute Force]`
- `[🪤 Canary Trip]`
- `[📂 Path Traversal]`
- `[⚡ RCE Exploit]`

---

## 📊 MITRE ATT&CK Matrix Coverage

| Technique ID | Name | GhostTrap Detection & Containment |
| :--- | :--- | :--- |
| **T1190** | Exploit Public-Facing Application | Catches SQLi & Command Injection patterns; returns fake database tables |
| **T1110** | Brute Force Authentication | Intercepts dictionary attacks on `/api/v1/auth/login`; returns decoy session tokens |
| **T1552** | Unsecured Credentials | Tracks unauthorized queries for Canary AWS/Stripe keys via `/canary/:token` |
| **T1083** | File & Directory Discovery | Intercepts path traversal probes (`/.env`, `/etc/passwd`, `wp-admin`) |

---

## 👥 Team: Chai & Commits

- **Member 1**: Backend & Systems Architecture Lead (Node.js, WebSocket Streaming, Deception Core)
- **Member 2**: Frontend & Cyber SOC Lead (Glassmorphism UI, Radar Visuals, Audio Synthesizer)
- **Member 3**: Attack Simulation & GitHub DevOps (Payload Scripting, Canary Token Design, Documentation)
- **Member 4**: Threat Intelligence & Pitch Presentation (Canva Deck, Elevator Pitch, Judge Q&A Defense)

---

## ⚖️ Ethical & Educational Disclaimer
*GhostTrap is developed strictly for research, educational, and authorized cyber defense purposes as part of a competitive hackathon submission. Decoy techniques must always be deployed in compliance with local cybersecurity and network regulations.*
