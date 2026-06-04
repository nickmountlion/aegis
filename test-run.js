import { scanDirectory } from './aegis-scanner/src/index.js';
import { generateMarkdownReport, generateHTMLReport } from './aegis-compliance/src/index.js';
import path from 'path';

async function main() {
  console.log("Running self-test verification for AEGIS AI Core...\n");
  
  const mockProjPath = path.resolve('./mock-project');
  
  try {
    const results = await scanDirectory(mockProjPath);
    console.log(`Scan completed successfully on ${mockProjPath}`);
    console.log(`Files Scanned: ${results.meta.filesScanned}`);
    console.log(`Total Findings: ${results.meta.totalIssues}`);
    console.log(`Critical Count (Expect 3: AWS, Postgres, API Token): ${results.meta.criticalCount}`);
    console.log(`High Count (Expect 4: Slack Webhook, Eval, SQL Injection, Cmd/MD5 if any): ${results.meta.highCount}`);
    console.log(`Medium Count (Expect 1: XSS innerHTML): ${results.meta.mediumCount}`);
    
    // Assertions
    if (results.meta.filesScanned !== 2) {
      throw new Error(`Expected 2 files scanned, got ${results.meta.filesScanned}`);
    }
    
    if (results.meta.totalIssues < 6) {
      throw new Error(`Expected at least 6 security issues, got ${results.meta.totalIssues}`);
    }

    console.log("\nDetails of Issues Found:");
    results.issues.forEach(i => {
      console.log(`- [${i.severity}] ${i.ruleId} in ${i.file}:L${i.line} -> ${i.ruleName}`);
    });

    console.log("\nGenerating compliance evidence reports...");
    const gitInfo = {
      latestCommit: "f83b1a20d41e779a1fca1e35d1f88764",
      author: "Antigravity Automated Tester",
      signedCommitsCount: 12
    };

    const markdown = generateMarkdownReport(results, gitInfo);
    const html = generateHTMLReport(results, gitInfo);

    if (!markdown.includes("A.8.28") || !html.includes("A.8.28")) {
      throw new Error("Compliance reports missing control A.8.28");
    }

    console.log("\n[SUCCESS] AEGIS AI modules verified successfully. All unit assertions passed!");
  } catch (err) {
    console.error("\n[FAILURE] Verification failed:", err.message);
    process.exit(1);
  }
}

main();
