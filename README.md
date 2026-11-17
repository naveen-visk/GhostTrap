👻 GhostTrap – Active Cyber Deception & Honeypot

Don't Just Block Attackers. Trap, Deceive, Fingerprint, and Track Them.

GhostTrap is an active cyber deception and honeypot project designed to detect suspicious activity, redirect potential attackers into a simulated environment, and collect useful security telemetry for defensive analysis.

Instead of simply blocking suspicious requests with traditional 403 errors, GhostTrap demonstrates how deception techniques can be used to study attacker behaviour in a controlled environment.

---

🚨 Problem Statement

Traditional Web Application Firewalls (WAFs) often block suspicious requests immediately. This may alert attackers and encourage them to modify their techniques.

Common automated attacks target exposed routes such as:

- "/admin"
- "/login"
- "/.env"

Small startups and open-source projects may not have access to expensive enterprise Security Operations Center (SOC) solutions.

GhostTrap aims to demonstrate an affordable and lightweight alternative using active deception techniques.

---

💡 Our Solution

GhostTrap introduces an Active Deception & Smart Honeypot Sandbox.

It provides a simulated environment where suspicious interactions can be observed and analysed without exposing actual administrative data.

The system focuses on three major concepts:

1. Active Deception: Redirecting suspicious interactions into a simulated Mirage Admin Vault.
2. Security Telemetry: Collecting browser and interaction-related information for defensive analysis.
3. Canary Beacon Trap: Using decoy files and tracking identifiers to demonstrate suspicious access detection.

---

✨ Key Features

1. Multi-Vector Heuristic Classifier

- Regex-based detection logic.
- Demonstration of SQL Injection patterns.
- XSS pattern detection.
- Path Traversal pattern detection.
- Brute-force input detection.

2. Live SOC Command Dashboard

- Defender-focused monitoring interface.
- Threat score visualization (0–100).
- Security event logs.
- One-click JSON forensic report export.

3. Mirage Admin Vault

- Simulated administrative environment.
- Decoy data for controlled demonstrations.
- Observation of suspicious interactions.

4. Browser Fingerprinting & Telemetry

Uses browser APIs such as:

- Navigator API
- Intl API
- Browser and operating-system information
- Screen resolution information

The collected information is intended for defensive analysis and demonstration purposes.

5. Canary Beacon Trap

- Decoy CSV file concept.
- Canary identifiers such as "#CNRY-8821".
- Demonstration of suspicious decoy-file access events.

---

🛠️ Technology Stack

Component| Technology
Frontend| HTML
Styling| Tailwind CSS
Detection Engine| JavaScript ES6+
Detection Logic| Regex Heuristics
Browser Telemetry| Navigator & Intl APIs
State Management| Local Storage
Forensic Reports| JSON Exporter

---

🏗️ System Architecture

GhostTrap follows a lightweight client-side prototype architecture.

Detection Layer

- Analyses suspicious input patterns.
- Applies heuristic-based detection.

Deception Layer

- Provides a simulated Mirage Admin Vault.
- Demonstrates decoy interactions.

Telemetry Layer

- Collects available browser-related information.
- Records demonstration events.

Dashboard Layer

- Displays threat scores and event logs.
- Supports JSON forensic report export.

---

🎯 Target Audience

- Open-source maintainers.
- Startups and small development teams.
- Cybersecurity educators.
- CTF trainers.
- Security researchers and students.

---

📊 Expected Impact

GhostTrap demonstrates how active deception can help defenders:

- Study suspicious interactions.
- Understand common attack patterns.
- Collect useful security telemetry.
- Analyse decoy access events.
- Explore affordable defensive security solutions.

---

🚀 Project Roadmap

Phase 1 – Prototype (Current)

- Dual-view sandbox interface.
- Regex-based detection engine.
- Browser fingerprinting demonstration.
- One-click JSON forensic export.

Phase 2 – Beta Development

- Gemini LLM integration for dynamic simulated SQL outputs.
- Automated Discord and Telegram canary alerts.
- Improved telemetry and event analysis.

Phase 3 – Scalability

- Lightweight Express.js middleware.
- Simplified integration with existing applications.
- Improved deployment and monitoring capabilities.

Roadmap features are planned enhancements and should not be considered part of the current prototype.

---

🔒 Security & Ethical Considerations

GhostTrap is designed as a defensive cybersecurity demonstration.

- Uses a simulated environment for deception.
- Does not require real attacker interaction for its demonstrations.
- Uses decoy data rather than actual sensitive credentials.
- Browser telemetry is intended for security analysis.
- Future integrations will follow appropriate privacy and security practices.

Note: The current prototype demonstrates client-side detection and simulated honeypot functionality. It is not a replacement for a production WAF, backend security monitoring system, or enterprise SOC platform.

---

👨‍💻 Team – Chai & Commits

Developed for 13th Protocol: An AI Hackathon 2026.

- Amit
- Naveen
- Krati
- Haider

Voyager Coding Club, KCC ITM

---

🌟 Our Vision

Our vision is to shift cybersecurity from passive defence towards intelligent deception.

Don't Just Block Attackers. Trap, Deceive, Fingerprint, and Track Them.

Built for Defender Intelligence.