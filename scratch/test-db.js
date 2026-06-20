const { prisma } = require('../packages/db/dist/index.js');

async function main() {
  const users = await prisma.user.findMany();
  console.log("All users in database:");
  console.dir(users, { depth: null });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
