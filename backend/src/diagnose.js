// Run this from your backend folder: node src/diagnose.js
// It will tell you exactly which route file is broken.

const routes = [
  "./routes/authRoutes",
  "./routes/userRoutes",
  "./routes/logRoutes",
  "./routes/passwordRoutes",
  "./routes/projectRoutes",
  "./routes/taskRoutes",
  "./routes/documentRoutes",
  "./routes/statsRoutes",
  "./routes/messageRoutes",
  "./routes/notificationRoutes",
];

console.log("🔍 Checking all route files...\n");

routes.forEach((r) => {
  try {
    const mod = require(r);
    const type = typeof mod;
    const isRouter =
      type === "function" ||
      (type === "object" && mod !== null && typeof mod.handle === "function");

    if (isRouter) {
      console.log(`✅  ${r}`);
    } else {
      console.log(`❌  ${r}  ← exports a ${type}, not a router! Check module.exports`);
    }
  } catch (err) {
    console.log(`💥  ${r}  ← REQUIRE ERROR: ${err.message}`);
  }
});

console.log("\nDone. Fix any ❌ or 💥 lines above.");
