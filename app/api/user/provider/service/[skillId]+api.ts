import { PrismaClient } from "~/prisma/generated/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export async function GET(req: Request, { skillId }: Record<string, string>) {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());

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
  { skillId }: Record<string, string>
) {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const { description, district, id, location } = await req.json();


    if (!id) {
      return new Response(
        JSON.stringify({ message: "Erreur d'authentification", status: 401 }),
        { status: 401 }
      );
    }
    const skills = await prisma.skills.findUnique({
      where: {
        id: skillId,
      },
      include: {
        provider: {
         select: {
            id: true,
            user: {
              select:{
                id: true
              }
            }
         }
        },
      },
    });


    if(skills && skills.provider && skills.provider.user){
      const service = await prisma.service.create({
        data: {
            customer: {
                connect: {
                    id: id
                }
            },
            provider: {
                connect: {
                    id: skills.provider.user.id
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
    }
    else{
     
    return new Response(JSON.stringify({message: "Le prestataire ou ce service n'est plus disponible", status: 404}), {status: 404})
    }

    
    
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue", stauts: 500 }),
      { status: 500 }
    );
  }
}
