export default defineEventHandler(async () => {
  const prisma = usePrisma();

  const genres = await prisma.genre.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return genres;
});
