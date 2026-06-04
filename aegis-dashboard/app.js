// Interactive Application Logic for AEGIS AI Compliance Dashboard

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const runScanBtn = document.getElementById('run-scan-btn');
  const scanPathInput = document.getElementById('scan-path-input');
  
  const statScore = document.getElementById('stat-compliance-score');
  const statStatus = document.getElementById('stat-readiness-status');
  const statFiles = document.getElementById('stat-files-count');
  const statIssues = document.getElementById('stat-issues-count');
  
  const controlsContainer = document.getElementById('controls-list-container');
  const findingsTableBody = document.getElementById('findings-table-body');
  const severityFilter = document.getElementById('severity-filter');
  const markdownOutput = document.getElementById('markdown-report-output');
  
  const copyMarkdownBtn = document.getElementById('copy-markdown-btn');
  const downloadHtmlBtn = document.getElementById('download-html-btn');

  let activeData = null; // Store fetched data locally

  // 1. Tab Navigation
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      
      // Update buttons
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update contents
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === targetTab) {
          content.classList.add('active');
        }
      });
    });
  });

  // 2. Scan Execution Handler
  runScanBtn.addEventListener('click', async () => {
    const path = scanPathInput.value.trim() || '.';
    
    // Set loading state
    runScanBtn.disabled = true;
    document.body.classList.add('scanning');
    runScanBtn.querySelector('.btn-text').textContent = 'Scanning...';
    
    try {
      const response = await fetch(`/api/scan?path=${encodeURIComponent(path)}`);
      if (!response.ok) {
        throw new Error(`Server returned error: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Unknown scanner error');
      }

      activeData = data;
      updateUI(data);
      
    } catch (err) {
      alert(`Scan failed: ${err.message}`);
      console.error(err);
    } finally {
      // Restore button state
      runScanBtn.disabled = false;
      document.body.classList.remove('scanning');
      runScanBtn.querySelector('.btn-text').textContent = 'Run Security Scan';
    }
  });

  // 3. UI Update Logic
  function updateUI(data) {
    const { scanResults, gitInfo, markdownReport } = data;
    const { meta, issues } = scanResults;
    
    // Calculate compliance score
    // Standard rule: start with 100%, deduct based on findings severity
    const score = meta.filesScanned > 0 
      ? Math.max(0, 100 - (meta.criticalCount * 25) - (meta.highCount * 10) - (meta.mediumCount * 3))
      : 0;

    // A. Update Executive Stats
    statScore.textContent = `${score}%`;
    statFiles.textContent = meta.filesScanned;
    statIssues.textContent = meta.totalIssues;

    const readiness = score >= 90 ? 'AUDIT READY' : 'REMEDIATION REQ.';
    statStatus.textContent = readiness;
    statStatus.className = 'stat-value ' + (score >= 90 ? 'text-success' : 'text-warning');

    // B. Render ISO 27001 Controls Tab
    renderControls(meta, issues, gitInfo);

    // C. Render Findings Table
    renderFindings(issues);

    // D. Render Markdown Export Tab
    markdownOutput.textContent = markdownReport;
  }

  // 4. ISO 27001 Controls Renderer
  function renderControls(meta, issues, gitInfo) {
    const controls = {
      "A.8.28": {
        name: "Secure Coding",
        objective: "Ensure rules and principles for secure coding are established and applied to software development.",
        reqs: [
          "Verification that SAST scanning is active on code repository.",
          "List of rules checked (credentials leaks, SQL injection, XSS).",
          "Analysis of code coverage and number of modules reviewed."
        ],
        eval: () => {
          const active = meta.filesScanned > 0;
          const status = meta.criticalCount === 0 && meta.highCount === 0 ? "COMPLIANT" : "NON-COMPLIANT";
          const score = active ? Math.max(0, 100 - (meta.criticalCount * 25) - (meta.highCount * 10)) : 0;
          return {
            status,
            score,
            notes: active 
              ? `Repository scanning is active. Scanned ${meta.filesScanned} files. Found ${meta.totalIssues} issues.`
              : "No files scanned. Cannot prove secure coding verification."
          };
        }
      },
      "A.8.29": {
        name: "Security Testing in Development",
        objective: "Ensure security testing activities are defined and executed during the development lifecycle.",
        reqs: [
          "Verification of security vulnerability testing processes.",
          "Vulnerability metrics reporting (critical, high, medium, low counts)."
        ],
        eval: () => {
          const active = meta.filesScanned > 0;
          const status = active ? "COMPLIANT" : "NON-COMPLIANT";
          return {
            status,
            score: active ? 100 : 0,
            notes: active
              ? `Security testing executed. Metrics: Critical: ${meta.criticalCount}, High: ${meta.highCount}, Medium: ${meta.mediumCount}, Low: ${meta.lowCount}.`
              : "No security testing evidence found."
          };
        }
      },
      "A.8.32": {
        name: "Design, Development and System Acceptance",
        objective: "Establish and apply secure design, development, and system acceptance procedures.",
        reqs: [
          "Repository integrity checks (tracking modifications, commit verification).",
          "Scan execution date and sign-off timestamps."
        ],
        eval: () => {
          const hasGit = !!gitInfo.latestCommit;
          const verifiedCommits = gitInfo.signedCommitsCount > 0;
          return {
            status: hasGit ? "COMPLIANT" : "COMPLIANT (Local mode)",
            score: hasGit ? (verifiedCommits ? 100 : 80) : 70,
            notes: hasGit
              ? `System acceptance checked. Git repository detected. Last commit: ${gitInfo.latestCommit.substring(0, 7)} by ${gitInfo.author}. Signed commits: ${gitInfo.signedCommitsCount || 0}.`
              : "Local workspace analyzed. Version control details must be integrated for formal audit report."
          };
        }
      }
    };

    controlsContainer.innerHTML = ''; // clear

    Object.entries(controls).forEach(([controlId, ctrl]) => {
      const ev = ctrl.eval();
      const badgeClass = ev.status.startsWith('COMPLIANT') ? 'badge-success' : 'badge-error';
      
      const reqItems = ctrl.reqs.map(r => `
        <li><span class="bullet-check">✓</span> ${r}</li>
      `).join('');

      const card = document.createElement('div');
      card.className = 'control-card';
      card.innerHTML = `
        <div class="control-header">
          <div>
            <span class="control-id">${controlId}</span>
            <h3 class="control-title">${ctrl.name}</h3>
          </div>
          <span class="badge ${badgeClass}">${ev.status}</span>
        </div>
        <p class="control-desc"><strong>Objective:</strong> ${ctrl.objective}</p>
        <div class="evidence-box">
          <h4>Required Auditor Evidence Checklist:</h4>
          <ul>${reqItems}</ul>
        </div>
        <div class="score-row">
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${ev.score}%"></div>
          </div>
          <span class="score-text">Score: <strong>${ev.score}%</strong></span>
        </div>
        <p class="audit-notes"><em>Audit Notes:</em> ${ev.notes}</p>
      `;
      controlsContainer.appendChild(card);
    });
  }

  // 5. Findings Table Renderer
  function renderFindings(issues) {
    findingsTableBody.innerHTML = ''; // clear
    const filter = severityFilter.value;

    const filteredIssues = issues.filter(issue => {
      if (filter === 'ALL') return true;
      if (filter === 'CRITICAL') return issue.severity === 'CRITICAL';
      if (filter === 'HIGH') return issue.severity === 'CRITICAL' || issue.severity === 'HIGH';
      if (filter === 'MEDIUM') return issue.severity === 'CRITICAL' || issue.severity === 'HIGH' || issue.severity === 'MEDIUM';
      return true;
    });

    if (filteredIssues.length === 0) {
      findingsTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4 text-muted">
            No active security issues found matching the criteria.
          </td>
        </tr>
      `;
      return;
    }

    filteredIssues.forEach(issue => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><span class="sev-badge sev-${issue.severity}">${issue.severity}</span></td>
        <td class="path-text">${issue.ruleId}</td>
        <td>${issue.file}</td>
        <td class="path-text">${issue.line}</td>
        <td><div class="code-snippet">${escapeHtml(issue.snippet)}</div></td>
        <td>${issue.description}</td>
      `;
      findingsTableBody.appendChild(row);
    });
  }

  // 6. Filtering Actions
  severityFilter.addEventListener('change', () => {
    if (activeData) {
      renderFindings(activeData.scanResults.issues);
    }
  });

  // 7. Clipboard and Download Actions
  copyMarkdownBtn.addEventListener('click', () => {
    if (!activeData) {
      alert('Please run a scan first.');
      return;
    }
    navigator.clipboard.writeText(activeData.markdownReport)
      .then(() => alert('Markdown report copied to clipboard!'))
      .catch(err => alert(`Failed to copy: ${err.message}`));
  });

  downloadHtmlBtn.addEventListener('click', () => {
    if (!activeData) {
      alert('Please run a scan first.');
      return;
    }
    
    const blob = new Blob([activeData.htmlReport], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ISO27001_Compliance_Evidence.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
