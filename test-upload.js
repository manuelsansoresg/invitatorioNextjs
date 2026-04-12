import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function test() {
  try {
    const dbFile = await prisma.file.create({
      data: {
        name: "test.jpg",
        mimeType: "image/jpeg",
        data: Buffer.from("fake image"),
      },
    });
    console.log(dbFile);
  } catch(e) {
    console.error(e);
  }
}
test();
