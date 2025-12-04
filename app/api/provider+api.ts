import { prisma } from "@/lib/prisma"
export async function POST(req: Request) {
  try {
    const { profession, bio, id, availability, location } = await req.json();
    
    if (!id) {
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
            id: id,
          },
        },
      },
    });
    await prisma.user.update({
      where: {
        id: id,
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

export async function GET(req: Request) {
  try {
    const query = new URL(req.url).searchParams.get("query") ?? "";

    const where = query ? { profession: query } : {};
    console.log(query)
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
    console.log(error)
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue", status: 500 }),
      { status: 500 }
    );
  }
}
