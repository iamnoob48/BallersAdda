import { PrismaClient } from "@prisma/client";
import { geocodeAddress } from "../src/lib/geocode.js";

const prisma = new PrismaClient();

async function backfill() {
  const academies = await prisma.academy.findMany({
    where: {
      OR: [{ latitude: null }, { longitude: null }],
    },
    select: { id: true, name: true, address: true, city: true, state: true, country: true, pinCode: true },
  });

  console.log(`Found ${academies.length} academies without coordinates.\n`);

  let success = 0;
  let failed = 0;

  for (const academy of academies) {
    try {
      const coords = await geocodeAddress({
        address: academy.address,
        city: academy.city,
        state: academy.state,
        country: academy.country,
        pinCode: academy.pinCode,
      });

      if (coords) {
        await prisma.academy.update({
          where: { id: academy.id },
          data: { latitude: coords.latitude, longitude: coords.longitude },
        });
        console.log(`  ✓ ${academy.name} → ${coords.latitude}, ${coords.longitude}`);
        success++;
      } else {
        console.log(`  ✗ ${academy.name} → no results from geocoder`);
        failed++;
      }

      // Nominatim rate limit: 1 req/sec
      await new Promise((r) => setTimeout(r, 1100));
    } catch (e) {
      console.log(`  ✗ ${academy.name} → ${e.message}`);
      failed++;
    }
  }

  console.log(`\nDone. Success: ${success}, Failed: ${failed}`);
  await prisma.$disconnect();
}

backfill().catch((e) => {
  console.error(e);
  process.exit(1);
});
