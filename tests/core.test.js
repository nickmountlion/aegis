import path from 'path';
import { scanDirectory } from '../aegis-scanner/src/index.js';
import { generateMarkdownReport, generateHTMLReport, ISO27001_CONTROLS } from '../aegis-compliance/src/index.js';

describe('AEGIS Core Smoke & Compliance Tests', () => {
  const mockDir = path.resolve('./mock-project');

  test('scanDirectory detects expected fixture findings in mock-project', async () => {
    const results = await scanDirectory(mockDir);
    expect(results.meta.filesScanned).toBe(2);
    expect(results.meta.totalIssues).toBeGreaterThanOrEqual(6);

    const ruleIds = results.issues.map((issue) => issue.ruleId);
    expect(ruleIds).toEqual(
      expect.arrayContaining(['SEC-001', 'SEC-002', 'SEC-004', 'VULN-001', 'VULN-002', 'VULN-003'])
    );
  });

  test('generateMarkdownReport and generateHTMLReport include ISO 27001 controls', async () => {
    const results = await scanDirectory(mockDir);
    const gitInfo = {
      latestCommit: 'abc1234567890',
      author: 'CI Test Runner',
      signedCommitsCount: 1
    };

    const md = generateMarkdownReport(results, gitInfo);
    const html = generateHTMLReport(results, gitInfo);

    for (const controlId of Object.keys(ISO27001_CONTROLS)) {
      expect(md).toContain(controlId);
      expect(html).toContain(controlId);
    }
    expect(html).not.toContain('<div>" + content + "</div>');
  });
});
