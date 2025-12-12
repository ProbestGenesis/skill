import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { userId }: Record<string, string>) {
  try{  
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
        },
     })

     return new Response(
      JSON.stringify({id: user?.provider?.id}),
      { status: 200 } 
    );
  } 

  catch(error){
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue", stauts: 500 }),
      { status: 500 }
    );
  }

}

export async function POST(req: Request, {userId}: Record<string, string>) {
  try {
    const { profession, bio, availability, location } = await req.json();
    
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true
      }
    })
    if (!user) {
      return new Response(
        JSON.stringify({ message: "Erreur d'authentification", status: 401 }),
        { status: 401 }
      );
    }
    
    await prisma.provider.create({
      data: {
        profession,
        bio,
        location,
        availability: availability,
        user: {
          connect: {
            id: user?.id,
          },
        },
      },
    });
    await prisma.user.update({
      where: {
        id: user?.id,
      },
      data: {
        role: "Provider",
      },
    });

    return new Response(
      JSON.stringify({
        message:
          "Votre profil a été completer, vous êtes maintenant un prestaire de service",
        status: 201,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.log(error)
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue", status: 500 }),
      { status: 500 }
    );
  }
}

