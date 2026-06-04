// Rules for secret scanning
export const secretRules = [
  {
    id: "SEC-001",
    name: "Generic API Key / Secret Token",
    severity: "CRITICAL",
    description: "Detected a potential API Key or Token matching entropy patterns.",
    pattern: /(?:key|secret|token|password|passwd|auth|api_key|apikey|secret_key|private_key)\s*[:=]\s*['"`]([a-zA-Z0-9_\-+=]{16,80})['"`]/gi,
    // Avoid matches on common placeholders
    exclude: /placeholder|your_|my_|dummy|test|secret_here/i
  },
  {
    id: "SEC-002",
    name: "AWS Access Key ID",
    severity: "CRITICAL",
    description: "Detected an AWS Access Key ID, which can grant programmatic access to AWS resources.",
    pattern: /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g
  },
  {
    id: "SEC-003",
    name: "Private Key",
    severity: "CRITICAL",
    description: "Detected a private key structure. Exposing private cryptographic keys compromises security.",
    pattern: /-----BEGIN\s+([A-Z0-9\s_]+)\s+PRIVATE\s+KEY-----/gi
  },
  {
    id: "SEC-004",
    name: "Slack Webhook URL",
    severity: "HIGH",
    description: "Detected a Slack Webhook URL. It could be used to post unauthorized messages to Slack channels.",
    pattern: /https:\/\/hooks\.slack\.com\/services\/T[a-zA-Z0-9_]{8,11}\/B[a-zA-Z0-9_]{8,11}\/[a-zA-Z0-9_]{22,24}/g
  },
  {
    id: "SEC-005",
    name: "Database Connection String",
    severity: "CRITICAL",
    description: "Detected a raw database URI containing password credentials.",
    pattern: /(mongodb(?:\+srv)?|postgres|postgresql|mysql|mssql):\/\/[a-zA-Z0-9_]+:[a-zA-Z0-9_\-%+]+@[a-zA-Z0-9.-]+:\d+\/[a-zA-Z0-9_\-]+/gi
  }
];
