// Rules for common code vulnerabilities (SAST)
export const vulnerabilityRules = [
  {
    id: "VULN-001",
    name: "Unsafe Eval Execution",
    severity: "HIGH",
    description: "Detected use of eval(), which can execute arbitrary code string and lead to Remote Code Execution (RCE).",
    pattern: /\beval\s*\(\s*[^)]+\)/g,
    fileTypes: [".js", ".jsx", ".ts", ".tsx", ".py"]
  },
  {
    id: "VULN-002",
    name: "SQL Injection Susceptibility",
    severity: "HIGH",
    description: "Detected potential SQL query generated via string concatenation instead of parameterized queries.",
    pattern: /(SELECT|INSERT|UPDATE|DELETE)\s+.*\s+FROM\s+.*\s+WHERE\s+.*\s*(\+|=.*?\$\{)/i,
    fileTypes: [".js", ".jsx", ".ts", ".tsx", ".py", ".go", ".java"]
  },
  {
    id: "VULN-003",
    name: "Cross-Site Scripting (XSS) via innerHTML",
    severity: "MEDIUM",
    description: "Detected assignment to innerHTML which can allow injection of executable scripts if inputs are not sanitized.",
    pattern: /\.innerHTML\s*=/g,
    fileTypes: [".js", ".jsx", ".ts", ".tsx", ".html"]
  },
  {
    id: "VULN-004",
    name: "Command Injection Vulnerability",
    severity: "HIGH",
    description: "Detected execution of operating system commands using unsanitized string inputs.",
    pattern: /(child_process\.exec|execSync|os\.system|subprocess\.run)\s*\(\s*['"`]?.*\$.*['"`]?\)/g,
    fileTypes: [".js", ".ts", ".py"]
  },
  {
    id: "VULN-005",
    name: "Unsecure Cryptographic Hash",
    severity: "MEDIUM",
    description: "Detected usage of md5 or sha1 hashing algorithm, which are cryptographically broken and subject to collisions.",
    pattern: /(createHash\s*\(\s*['"`](md5|sha1)['"`]\)|hashlib\.(md5|sha1)\s*\()/gi,
    fileTypes: [".js", ".ts", ".py"]
  }
];
