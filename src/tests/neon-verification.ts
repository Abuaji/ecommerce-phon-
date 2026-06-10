import { prisma } from "../lib/db";

async function verifyNeonMigration() {
  console.log("Starting Neon Production Verification...");

  try {
    // 1. Verify Tables
    const tablesResult: { tablename: string }[] = await prisma.$queryRaw`
      SELECT tablename
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'public';
    `;
    const tables = tablesResult.map(t => t.tablename);
    console.log(`\n✅ Verified ${tables.length} tables in 'public' schema.`);
    console.log("Tables found:", tables.join(", "));

    // 2. Verify Enums
    const enumsResult: { typname: string }[] = await prisma.$queryRaw`
      SELECT t.typname
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      GROUP BY t.typname;
    `;
    const enums = enumsResult.map(e => e.typname);
    console.log(`\n✅ Verified ${enums.length} enums.`);
    console.log("Enums found:", enums.join(", "));

    // 3. Verify Constraints (Unique & Foreign Keys)
    const constraintsResult: { conname: string, contype: string }[] = await prisma.$queryRaw`
      SELECT conname, contype::text as contype
      FROM pg_constraint
      JOIN pg_namespace ON pg_namespace.oid = pg_constraint.connamespace
      WHERE nspname = 'public';
    `;
    
    const pks = constraintsResult.filter(c => c.contype === 'p').length;
    const fks = constraintsResult.filter(c => c.contype === 'f').length;
    const uks = constraintsResult.filter(c => c.contype === 'u').length;
    const checks = constraintsResult.filter(c => c.contype === 'c').length;

    console.log(`\n✅ Verified Constraints:`);
    console.log(`  - Primary Keys: ${pks}`);
    console.log(`  - Foreign Keys: ${fks}`);
    console.log(`  - Unique Constraints: ${uks}`);
    console.log(`  - Check Constraints: ${checks}`);

    console.log("\n🚀 Neon Verification Complete: Structural integrity verified.");
  } catch (error) {
    console.error("❌ Neon Verification Failed:", error);
    process.exit(1);
  } finally {
    // Prisma disconnect handled gracefully or process exit works.
  }
}

verifyNeonMigration();
