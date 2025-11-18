import { PrismaClient } from "~/prisma/generated/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export async function GET(req: Request, { userId }: Record<string, string>) {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      include: {
        provider: {
         select: {
          id: true
         }
        }
      }
    })

     if (!user) {
      return new Response(
        JSON.stringify({ message: "porblème d'authentification", stauts: 401 }),
        { status: 401 }
      );
    }
    const services = await prisma.service.findMany({
      where: {
        OR: [{ customerId: userId }, { providerId: user.provider?.id }],
      },
      include: {
        provider: {
          include: {
            user: true
          }
        },
        skills: {
          select: {
            title: true,
            description: true,
          },
        },
      },
      cacheStrategy: {
        swr: 60,
        ttl: 10,
        tags: ["services"]
      },
    });

    return new Response(JSON.stringify(services), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue", stauts: 500 }),
      { status: 500 }
    );
  }
}

