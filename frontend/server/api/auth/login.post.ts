import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const prisma = usePrisma();

  const { username, password } = body;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ role: user.role, username: user.username }, config.jwtSecret, { expiresIn: '30d' });

    return { token, expiresIn: 2592000, user: { username: user.username, role: user.role } };
  }

  throw createError({
    statusCode: 401,
    statusMessage: 'Invalid credentials',
  });
});
