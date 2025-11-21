import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { userId, providerId }: Record<string, string>
) {
  try {
    const data = await prisma.skills.findMany({
      where: {
        providerId: providerId,
      },
      include: {
        provider: {
          include: {
            user: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue", status: 500 }),
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { userId, providerId }: Record<string, string>
) {
  try {
    const { title, description, averagePrice } = await req.json();

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
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
        JSON.stringify({
          message: "Vous n'êtes pas authorisé a executé cette action",
          stauts: 401,
        }),
        { status: 401 }
      );
    }
    if (!title || !description) {
      return new Response(
        JSON.stringify({
          message: "Le service doit avoir un nom et une description",
          status: 400,
        }),
        { status: 400 }
      );
    }

    await prisma.skills.create({
      data: {
        title,
        description,
        average_price: Number(averagePrice),
        provider: {
          connect: {
            id: provider.id,
          },
        },
      },
    });

    return new Response(
      JSON.stringify({
        message: "Votre service a été ajouté avec succès",
        status: 201,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue", stauts: 500 }),
      { status: 500 }
    );
  }
}
