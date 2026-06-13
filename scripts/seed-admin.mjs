// Admin seeder script
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_Ytk3jpqre4ov@ep-late-hill-apbqalti.c-7.us-east-1.aws.neon.tech/neondb?sslmode=verify-full"
});

async function seed() {
  const client = await pool.connect();
  try {
    // Check if any admin exists
    const existingAdmins = await client.query('SELECT email, "fullName", status FROM admin_users LIMIT 10');
    
    if (existingAdmins.rows.length > 0) {
      console.log('EXISTING_ADMINS:');
      existingAdmins.rows.forEach(r => console.log(' -', r.email, '|', r.fullName, '|', r.status));
      await client.end();
      await pool.end();
      return;
    }

    console.log('No admins found. Creating Super Admin...');

    // Create the Super Admin role
    const roleRes = await client.query(`
      INSERT INTO roles (id, name, description, "isSystem", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'Super Admin', 'Full access to all modules', true, now(), now())
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `);
    const roleId = roleRes.rows[0].id;

    // Add all permissions
    const modules = ['DASHBOARD', 'PRODUCTS', 'ORDERS', 'INVENTORY', 'CUSTOMERS', 'REVIEWS', 'MARKETING', 'SETTINGS', 'REPORTS'];
    for (const mod of modules) {
      await client.query(`
        INSERT INTO role_permissions (id, "roleId", module, actions)
        VALUES (gen_random_uuid(), $1, $2, $3)
        ON CONFLICT ("roleId", module) DO NOTHING
      `, [roleId, mod, JSON.stringify(['*'])]);
    }
    // Wildcard permission
    await client.query(`
      INSERT INTO role_permissions (id, "roleId", module, actions)
      VALUES (gen_random_uuid(), $1, '*', $2)
      ON CONFLICT ("roleId", module) DO NOTHING
    `, [roleId, JSON.stringify(['*'])]);

    // Hash password
    const password = 'Admin@1234';
    const hash = await bcrypt.hash(password, 12);

    // Create admin user
    await client.query(`
      INSERT INTO admin_users (id, "fullName", email, password, "roleId", status, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'Super Admin', 'admin@lumina.com', $1, $2, 'ACTIVE', now(), now())
    `, [hash, roleId]);

    console.log('SUCCESS: Super Admin created!');
    console.log('Email: admin@lumina.com');
    console.log('Password: Admin@1234');
    console.log('Role: Super Admin (full access)');
  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
