import { readFileSync } from "node:fs";
import { executeMigration, close } from "../src/database.mjs";
try {
  await executeMigration(
    readFileSync(
      new URL("../supabase/migrations/001_initial.sql", import.meta.url),
      "utf8",
    ),
  );
  console.log("Estrutura do banco criada/verificada.");
} finally {
  await close();
}
