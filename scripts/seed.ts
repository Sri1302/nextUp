// Seeds the @demo creator into the database in DATABASE_URL (e.g. your Neon database).
// Usage: npm run db:seed
import { getDb } from "../lib/db";
import { seedDemo } from "../lib/db/seed";

getDb()
  .then(seedDemo)
  .then((created) => {
    console.log(created ? "Demo creator @demo created." : "Demo creator already exists.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
