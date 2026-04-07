import postgres from 'postgres';

const sql = postgres('postgresql://postgres:Samolan123@localhost:5456/nnpcur');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    const result = await sql`SELECT 1 as test`;
    console.log('✓ Database connection successful:', result);
    
    // Check if users table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('✓ Available tables:', tables.map(t => t.table_name));
    
    // Check if admin user exists
    const users = await sql`SELECT username, role FROM users WHERE username = 'admin'`;
    console.log('✓ Admin user check:', users);
    
    // Create admin user if it doesn't exist
    if (users.length === 0) {
      console.log('Creating admin user...');
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash('admin123', 10);
      
      await sql`
        INSERT INTO users (id, username, password, email, first_name, last_name, role, created_at, updated_at)
        VALUES ('1752146292132', 'admin', ${hashedPassword}, 'admin@nnpc.com', 'System', 'Administrator', 'admin', NOW(), NOW())
      `;
      console.log('✓ Admin user created successfully!');
    } else {
      console.log('✓ Admin user already exists');
    }
    
    console.log('✅ Database setup completed!');
    console.log('Login credentials: admin / admin123');
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await sql.end();
  }
}

testDatabase();
