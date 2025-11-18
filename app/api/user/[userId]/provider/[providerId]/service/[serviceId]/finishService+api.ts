import { PrismaClient } from "~/prisma/generated/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { date } from "zod";

export async function POST(
  req: Request,
  { userId, serviceId }: Record<string, string>
) {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const { code, id } = await req.json();

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        provider: {
          select: {
            mission_nb: true,
          },
        },
      },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ message: "Erreur d'authentification", stauts: 401 }),
        { status: 401 }
      );
    }
    const provider = await prisma.provider.findUnique({
      where: {
        userId: user?.id,
      },
      select: {
        id: true,
        mission_nb: true,
      },
    });

    if (!provider) {
      return new Response(
        JSON.stringify({ message: "Vous n'êtes pas autorisé", stauts: 401 }),
        { status: 401 }
      );
    }

    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    });

    if (user?.id !== service?.providerId) {
      return new Response(
        JSON.stringify({ message: "Authorisation réfusé", stauts: 401 }),
        { status: 401 }
      );
    }

    if (service?.code !== code) {
      return new Response(
        JSON.stringify({ message: "Code incorrect réessayer", stauts: 404 }),
        { status: 404 }
      );
          }
    async function updateServiceStatus() {
     await prisma.service.update({
          where: {
            id: serviceId,
          },
          data: {
            status: "finished",
          },
        });
      }

    async function updateUserProvidingMissionCount() {
       await prisma.provider.update({
          where: {
            id: provider?.id,
          },
          data: {
            mission_nb: provider?.mission_nb ? provider?.mission_nb + 1 : 1,
          },
        });
      }

     Promise.all([
        updateServiceStatus(),
        updateUserProvidingMissionCount(),
      ]).then(() => {
        return new Response(
          JSON.stringify({
            message: "Merci pour le service rendu!",
            stauts: 200,
          }),
          { status: 200 }
        );
      })
      .catch(error => {
         return new Response(
          JSON.stringify({
            message: "Une erreur s'est produit lors de la mise a jour des informations",
            stauts: 500,
          }),
          { status: 500 }
        );
      })
        

  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue", stauts: 500 }),
      { status: 500 }
    );
  }
}
