import { PrismaClient } from "~/prisma/generated/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export async function POST(req: Request, {userId}: Record<string, string>) {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const { profession, bio, availability, location } = await req.json();
    
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
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
        availability: availability,
        location,
        user: {
          connect: {
            id: user?.id,
          },
        },
      },
    });
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: "Provider",
      },
    });

    await prisma.$accelerate.invalidate({
      tags: [`${user.id}`]
    })
    return new Response(
      JSON.stringify({
        message:
          "Votre profil a été completer, vous êtes maintenant un prestaire de service",
        status: 201,
      }),
      { status: 201 }
    );
  } catch (error) {
    
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue", status: 500 }),
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const query = new URL(req.url).searchParams.get("query") ?? "";

    const where = query ? { profession: query } : {};
    
    const providers = await prisma.provider.findMany({
      where,
      include: {
        skills: true,
        user: true
      }
    });
   
    return new Response(
      JSON.stringify(providers),
      { status: 200 }
    );
  } catch (error) {
   
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue", status: 500 }),
      { status: 500 }
    );
  }
}
