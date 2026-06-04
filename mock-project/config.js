// Mock config file containing placeholder secrets for scanner validation

export const CONFIG = {
  // AWS Creds
  awsAccessKey: "AKIAIOSFODNN7EXAMPLE", // Matches SEC-002
  
  // Database URI
  dbUri: "postgresql://db_admin:P@ssword123!@db.aegis-internal.net:5432/production_db", // Matches SEC-005
  
  // Slack alert Webhook
  slackWebhook: "https://hooks.slack.com/services/T12345678/B12345678/aBcDeFgHiJkLmNoPqRsTuVwX", // Matches SEC-004
  
  // Mock API Token
  apiToken: "token = 'xoxb-1234567890-1234567890123-abcdef1234567890'" // Matches SEC-001
};
