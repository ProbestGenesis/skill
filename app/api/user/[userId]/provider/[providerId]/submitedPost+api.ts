import { Post, User } from "@/prisma/generated/prisma";
import { prisma } from "@/lib/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

export async function GET(
  req: Request,
  { userId, providerId }: Record<string, string>
) {

  try {

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true
      }
    })

    if(!user){
       return new Response(
        JSON.stringify({ message: "Erreur d'authentification", stauts: 401 }),
        { status: 401 }
      ); 
    }
    const provider = await prisma.provider.findUnique({
      where: {
        id: providerId
      },
      select: {
        id: true
      }
    })

    if(!provider){
       return new Response(
        JSON.stringify({ message: "Vous n'êtes pas authorisé a executé cette action", stauts: 401 }),
        { status: 401 }
      ); 
    }
    const data = await prisma.post.findMany({
      where: {
        providerId: provider?.id ,
      },
      include: {
        user: true
      },
      take: 2,
    });

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.log(error)
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue", status: 500 }),
      { status: 500 }
    );
  }
}

