import { PrismaClient } from "~/prisma/generated/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export async function GET(req: Request, { userId  }: Record<string, string>) {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    
    const services = await prisma.service.findMany({
      where: { customerId: userId },
      select: { providerId: true },
    });


    const objectProviderIds = Array.from(
      new Set(services.map((service) => service.providerId))
    );

     console.log("yourRecentProvider", objectProviderIds)

    const providers = await prisma.provider.findMany({
      where: {
        id: { in: objectProviderIds },
      },
      include: {
        user: {
          select: {
            id: true, 
            name: true, 
            image: true
          }
        }
      }
    });

   

    return new Response(JSON.stringify(providers), { status: 200 });
  } catch (error) {
    console.error("Erreur dans GET /providers:", error);
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue", status: 500 }),
      { status: 500 }
    );
  }
}