// Vercel Serverless Function entry point
// Connects Vercel `/api/*` requests to Express app
const app = require("../server/server");

module.exports = app;
