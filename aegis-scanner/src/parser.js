import fs from 'fs';
import path from 'path';
import { secretRules } from './rules/secrets.js';
import { vulnerabilityRules } from './rules/vulnerabilities.js';

// Recursive directory traversal helper
async function getFiles(dir, ignoredFolders = ['node_modules', '.git', 'dist', 'build', '.gemini']) {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      if (ignoredFolders.includes(dirent.name)) {
        return [];
      }
      return getFiles(res, ignoredFolders);
    }
    return res;
  }));
  return files.flat();
}

/**
 * Scan a single file for security issues
 * @param {string} filePath - Absolute path to file
 * @param {string} relativePath - Relative path from workspace root
 * @returns {Promise<Array>} List of issues found
 */
async function scanFile(filePath, relativePath) {
  const issues = [];
  const ext = path.extname(filePath).toLowerCase();
  
  // Skip binaries and large non-source files
  const textExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.java', '.c', '.cpp', '.cs', '.php', '.html', '.css', '.json', '.yaml', '.yml', '.md', '.txt', '.sh'];
  if (!textExtensions.includes(ext)) {
    return issues;
  }

  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const lineContent = lines[i];
      const lineNum = i + 1;

      // 1. Scan for Secrets (Apply to all text files)
      for (const rule of secretRules) {
        rule.pattern.lastIndex = 0; // reset regex index
        let match;
        
        while ((match = rule.pattern.exec(lineContent)) !== null) {
          // Check exclusions
          if (rule.exclude && rule.exclude.test(lineContent)) {
            continue;
          }
          
          issues.push({
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            file: relativePath,
            line: lineNum,
            snippet: lineContent.trim(),
            description: rule.description
          });
          
          // Break loop to avoid multiple duplicate reports on same line for same rule
          break;
        }
      }

      // 2. Scan for Code Vulnerabilities (Filtered by file type)
      for (const rule of vulnerabilityRules) {
        if (rule.fileTypes && !rule.fileTypes.includes(ext)) {
          continue;
        }
        rule.pattern.lastIndex = 0; // reset
        let match;
        
        while ((match = rule.pattern.exec(lineContent)) !== null) {
          issues.push({
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            file: relativePath,
            line: lineNum,
            snippet: lineContent.trim(),
            description: rule.description
          });
          break;
        }
      }
    }
  } catch (err) {
    // Suppress errors for directories, permission errors, etc.
    // console.error(`Error scanning ${filePath}:`, err);
  }

  return issues;
}

/**
 * Scan directory recursively for vulnerabilities and secrets
 * @param {string} targetDir - Target directory path
 * @returns {Promise<{issues: Array, meta: Object}>} Results metadata and array of issue objects
 */
export async function scanDirectory(targetDir) {
  const absoluteTarget = path.resolve(targetDir);
  const issues = [];
  const start = Date.now();
  
  try {
    const allFiles = await getFiles(absoluteTarget);
    
    for (const file of allFiles) {
      const relative = path.relative(absoluteTarget, file);
      const fileIssues = await scanFile(file, relative);
      issues.push(...fileIssues);
    }
  } catch (error) {
    throw new Error(`Failed to scan directory: ${error.message}`);
  }

  return {
    issues,
    meta: {
      scanTimeMs: Date.now() - start,
      filesScanned: (await getFiles(absoluteTarget)).length,
      totalIssues: issues.length,
      criticalCount: issues.filter(i => i.severity === 'CRITICAL').length,
      highCount: issues.filter(i => i.severity === 'HIGH').length,
      mediumCount: issues.filter(i => i.severity === 'MEDIUM').length,
      lowCount: issues.filter(i => i.severity === 'LOW').length
    }
  };
}
