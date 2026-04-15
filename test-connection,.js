const db = require("./db");

async function test() {
  try {
    await db.connect();
    const health = await db.healthCheck();
    console.log("✅ Connected:", health);
    await db.disconnect();
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
  }
}

test();