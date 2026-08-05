const path = require("path");
const { execSync } = require("child_process");
require("dotenv").config({ path: path.join(__dirname, ".env.test") });

// Se ejecuta una sola vez antes de toda la suite: deja la base de datos de test
// con el esquema y el seed aplicados, igual que en desarrollo.
module.exports = async function globalSetup() {
  execSync("npx tsx src/database/migrate.ts --seed", {
    cwd: __dirname,
    stdio: "inherit",
    env: process.env,
  });
};
