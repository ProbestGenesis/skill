import { prisma } from '@/lib/prisma';
import { date } from "zod";

export async function POST(req: Request, { serviceId }: Record<string, string>) {
  const { code, id } = await req.json();

  try {
    const service = await prisma.service.findUnique({
      where: {
        code,
      },
    })

    const user = await prisma.user.findUnique({
        where: {
            id: id
        },
        include: {
            provider: {
                select: {
                    mission_nb: true
                }
            }
        }
    })

    const isYourProvider = service?.providerId === user?.id ?  true : false
    if (service && user && user?.provider?.mission_nb, isYourProvider) {

      await prisma.service.update({
        where: {
          id: serviceId,
          code: code,
        },
        data: {
          completedAt: new Date(),
          status: "finished",
        },
      });

      const mission_nb = user?.provider?.mission_nb  || 0
      await prisma.provider.update({
        where: {
            userId: user?.id
        },
        data: {
            mission_nb: mission_nb + 1
        }
      })
      return new Response(JSON.stringify({message: "Merci pour le service rendu", status: 200}), {status: 200})
    }

    else{
        return new Response(JSON.stringify({message: "Code incorrect", status: 404}), {status: 404})
    }
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue", stauts: 500 }),
      { status: 500 }
    );
  }
}
