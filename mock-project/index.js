// Mock project with typical vulnerabilities for testing AEGIS AI

function processUserInput(input) {
  // 1. Unsafe eval vulnerability
  eval("console.log(" + input + ")");
}

function getUserQuery(userId) {
  // 2. SQL injection susceptibility
  const query = "SELECT * FROM users WHERE id = " + userId;
  return query;
}

function updateUI(content) {
  // 3. XSS vulnerability via innerHTML
  const container = document.getElementById("app-container");
  container.innerHTML = "<div>" + content + "</div>";
}
