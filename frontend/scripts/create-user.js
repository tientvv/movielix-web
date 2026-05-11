const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2];
  const password = process.argv[3];
  const role = process.argv[4] || 'USER';

  if (!username || !password) {
    console.error('Usage: node create-user.js <username> <password> [role]');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
      },
    });

    console.log(`User created successfully! ID: ${user.id}, Username: ${user.username}, Role: ${user.role}`);
  } catch (err) {
    if (err.code === 'P2002') {
      console.error('Error: Username already exists.');
    } else {
      console.error('Error creating user:', err);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
