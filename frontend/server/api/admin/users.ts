import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  const prisma = usePrisma();
  const method = event.method;

  // GET — List all users (excluding password)
  if (method === 'GET') {
    verifyAdmin(event);

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return users;
  }

  // POST — Create new user
  if (method === 'POST') {
    verifyAdmin(event);
    const body = await readBody(event);

    const { username, password, role } = body;

    if (!username || !password) {
      throw createError({ statusCode: 400, statusMessage: 'Username and password are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          role: role || 'USER',
        },
        select: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw createError({ statusCode: 400, statusMessage: 'Username already exists.' });
      }
      throw error;
    }
  }

  // DELETE — Delete a user
  if (method === 'DELETE') {
    verifyAdmin(event);
    const body = await readBody(event);

    if (!body.id) {
      throw createError({ statusCode: 400, statusMessage: 'User id is required.' });
    }

    await prisma.user.delete({ where: { id: body.id } });

    return { deleted: true };
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
});
