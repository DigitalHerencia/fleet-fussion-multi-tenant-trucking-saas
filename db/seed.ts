import { db } from "./index";
import { promises as fs } from "fs";
import path from "path";
import { sql } from "drizzle-orm";

async function seed() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "db", "seed.sql");
    const sqlContent = await fs.readFile(sqlFilePath, "utf8");

    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(";")
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0);

    // Execute each statement
    for (const statement of statements) {
      await db.execute(sql.raw(`${statement};`));
    }
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seed();
