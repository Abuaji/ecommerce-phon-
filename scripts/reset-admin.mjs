// Reset admin password and fetch full admin info
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_Ytk3jpqre4ov@ep-late-hill-apbqalti.c-7.us-east-1.aws.neon.tech/neondb?sslmode=verify-full"
});

async function run() {
  const client = await pool.connect();
  try {
    const newPassword = 'Admin@1234';
    const hash = await bcrypt.hash(newPassword, 12);

    // Update the existing admin password
    const res = await client.query(`
      UPDATE admin_users 
      SET password = $1, "updatedAt" = now()
      WHERE email = 'admin@example.com'
      RETURNING email, "fullName", status, "roleId"
    `, [hash]);

    console.log('Password reset for:', res.rows[0].email);
    console.log('Full Name:', res.rows[0].fullName);
    console.log('New Password: Admin@1234');

    // Get role & permissions
    const roleRes = await client.query(`
      SELECT r.name as role_name, rp.module, rp.actions
      FROM roles r
      JOIN role_permissions rp ON rp."roleId" = r.id
      WHERE r.id = $1
    `, [res.rows[0].roleId]);

    console.log('\nPermissions:');
    roleRes.rows.forEach(r => console.log(`  ${r.role_name} > ${r.module}: ${r.actions}`));

    // Count inventory
    const invRes = await client.query(`
      SELECT COUNT(*) as total,
      SUM(CASE WHEN "availableStock" = 0 THEN 1 ELSE 0 END) as out_of_stock,
      SUM(CASE WHEN "availableStock" > 0 AND "availableStock" < 10 THEN 1 ELSE 0 END) as low_stock,
      SUM(CASE WHEN "availableStock" >= 10 THEN 1 ELSE 0 END) as in_stock,
      SUM("availableStock") as total_units
      FROM inventory
    `);
    const inv = invRes.rows[0];
    console.log('\nInventory Summary:');
    console.log('  Total Products:', inv.total);
    console.log('  In Stock:', inv.in_stock);
    console.log('  Low Stock (<10):', inv.low_stock);
    console.log('  Out of Stock:', inv.out_of_stock);
    console.log('  Total Units:', inv.total_units);

    // Order counts
    const ordRes = await client.query(`
      SELECT status, COUNT(*) as count FROM orders GROUP BY status ORDER BY count DESC
    `);
    console.log('\nOrders by Status:');
    ordRes.rows.forEach(r => console.log(`  ${r.status}: ${r.count}`));

    // Revenue
    const revRes = await client.query(`
      SELECT SUM(amount) as revenue FROM payments WHERE status = 'CAPTURED'
    `);
    console.log('\nTotal Revenue (Captured):', '₹' + ((revRes.rows[0].revenue || 0) / 100).toLocaleString());

    // Customers
    const custRes = await client.query(`SELECT COUNT(*) as total, SUM(CASE WHEN "isGuest" = false THEN 1 ELSE 0 END) as registered FROM customers`);
    console.log('\nCustomers:');
    console.log('  Total:', custRes.rows[0].total);
    console.log('  Registered:', custRes.rows[0].registered);
    console.log('  Guests:', custRes.rows[0].total - custRes.rows[0].registered);

  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
