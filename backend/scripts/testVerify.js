import { randomBytes } from 'crypto';
import prisma from '../src/prismaClient.js';
import { storeVerificationToken } from '../src/lib/emailVerificationStore.js';

const user = await prisma.user.findUnique({
  where: { email: 'testverify@gmail.com' },
  select: { id: true, isVerified: true },
});

console.log('User before verify:', user);

const rawToken = randomBytes(32).toString('hex');
await storeVerificationToken(rawToken, user.id);
console.log('Token planted. Hit this URL:');
console.log(`http://localhost:4001/api/v1/auth/verify-email?token=${rawToken}`);

await prisma.$disconnect();
process.exit(0);
