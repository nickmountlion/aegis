// Mapping registry of ISO/IEC 27001:2022 Controls supported by AEGIS AI
export const ISO27001_CONTROLS = {
  "A.8.28": {
    name: "Secure Coding",
    category: "Technological Controls",
    objective: "Ensure rules and principles for secure coding are established and applied to software development.",
    evidenceRequirements: [
      "Verification that SAST scanning is active on code repository.",
      "List of rules checked (credentials leaks, SQL injection, XSS).",
      "Analysis of code coverage and number of modules reviewed."
    ],
    evaluate: (scanMeta, issues) => {
      const active = scanMeta.filesScanned > 0;
      const status = scanMeta.criticalCount === 0 && scanMeta.highCount === 0 ? "COMPLIANT" : "NON-COMPLIANT (Pending Vulnerability Resolution)";
      return {
        status,
        score: active ? Math.max(0, 100 - (scanMeta.criticalCount * 25) - (scanMeta.highCount * 10)) : 0,
        notes: active 
          ? `Repository scanning is active. Scanned ${scanMeta.filesScanned} files. Found ${scanMeta.totalIssues} issues.`
          : "No files scanned. Cannot prove secure coding verification."
      };
    }
  },
  "A.8.29": {
    name: "Security Testing in Development",
    category: "Technological Controls",
    objective: "Ensure security testing activities are defined and executed during the development lifecycle.",
    evidenceRequirements: [
      "Verification of security vulnerability testing processes.",
      "Vulnerability metrics reporting (critical, high, medium, low counts)."
    ],
    evaluate: (scanMeta, issues) => {
      const active = scanMeta.filesScanned > 0;
      const status = active ? "COMPLIANT" : "NON-COMPLIANT";
      return {
        status,
        score: active ? 100 : 0,
        notes: active
          ? `Security testing executed. Metrics: Critical: ${scanMeta.criticalCount}, High: ${scanMeta.highCount}, Medium: ${scanMeta.mediumCount}, Low: ${scanMeta.lowCount}.`
          : "No security testing evidence found."
      };
    }
  },
  "A.8.32": {
    name: "Design, Development and System Acceptance",
    category: "Technological Controls",
    objective: "Establish and apply secure design, development, and system acceptance procedures.",
    evidenceRequirements: [
      "Repository integrity checks (tracking modifications, commit verification).",
      "Scan execution date and sign-off timestamps."
    ],
    evaluate: (scanMeta, issues, gitInfo = {}) => {
      const hasGit = !!gitInfo.latestCommit;
      const verifiedCommits = gitInfo.signedCommitsCount > 0;
      return {
        status: hasGit ? "COMPLIANT" : "COMPLIANT (Local mode, git audit details missing)",
        score: hasGit ? (verifiedCommits ? 100 : 80) : 70,
        notes: hasGit
          ? `System acceptance checked. Git repository detected. Last commit: ${gitInfo.latestCommit.substring(0, 7)} by ${gitInfo.author}. Signed commits detected: ${gitInfo.signedCommitsCount || 0}.`
          : "Local codebase analyzed. Access and modification logs should be integrated with version control for maximum compliance score."
      };
    }
  }
};
