import { prisma } from "@/lib/prisma";
export async function GET(req: Request, { userId, providerId,  skillId }: Record<string, string>) {
  try {
    const skills = await prisma.skills.findUnique({
      where: {
        id: skillId,
      },
      include: {
        provider: {
          include: {
            user: true,
            skills: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      cacheStrategy: {
        swr: 600,
        ttl: 600,
      },
    });

    return new Response(JSON.stringify(skills), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue", stauts: 500 }),
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { userId, providerId, skillId}: Record<string, string>
) {
  try {
    const { description, district, location} = await req.json();
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
        id: providerId,
      },
      select: {
        id: true,
      },
    });

    if (!provider) {
      return new Response(
        JSON.stringify({ message: "Vous n'êtes pas autorisé", stauts: 401 }),
        { status: 401 }
      );
    }

    const skills = await prisma.skills.findUnique({
      where: {
        id: skillId,
      },
     select: {
      id: true
     }
    });

     if (!skills) {
      return new Response(
        JSON.stringify({ message: "Le service n'a pas été retrouvé", stauts: 401 }),
        { status: 401 }
      );
    }
    await prisma.service.create({
        data: {
            customer: {
                connect: {
                    id: user.id
                }
            },
            provider: {
                connect: {
                    id: provider?.id
                }
            },
            skills: {
                connect: {
                   id: skills?.id
                }
            },
            description,
            role: "Customer",
            district,
            location

        }
    })

    return new Response(JSON.stringify({message: "Votre demande a été envoyé avec success", status: 201}), {status: 201})
    
  } catch (error) {
    console.log(error)
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue", stauts: 500 }),
      { status: 500 }
    );
  }
}
