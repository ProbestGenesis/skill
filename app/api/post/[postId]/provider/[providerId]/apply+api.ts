import { prisma } from "@/lib/prisma";
export async function PUT(
  req: Request,
  { providerId, postId }: Record<string, string>
) {
  try {

    const { avarage_price } = await req.json()
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return new Response(
        JSON.stringify({
          message: "Cette publication à été supprimé",
          stauts: 404,
        }),
        { status: 500 }
      );
    }

    const provider = await prisma.provider.findUnique({
      where: {
        userId: providerId,
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!provider) {
      return new Response(
        JSON.stringify({
          message: "Vous n'êtes pas enregistré en tant que prestataire",
          status: 403,
        }),
        { status: 500 }
      );
    }

    if (post.providerId) {
      return new Response(
        JSON.stringify({
          message: "Cette demande a déjà été prise en charge",
          status: 401,
        }),
        { status: 401 }
      );
    }

    if (post.providerId === provider.id) {
      return new Response(
        JSON.stringify({
          message: "Vous avez déjà postuler pour ce service",
          status: 401,
        }),
        { status: 401 }
      );
    }
    //const newProviders = [...post.applyProviders, provider.id]

    {
      /* if(post.applyProviders.includes(provider.id)){
      return new Response(
        JSON.stringify({message: "Vous avez déjà postuler pour ce service", status: 401}), {status: 401}
      )
    } */
    }

    await prisma.post.update({
      where: {
        id: post.id,
      },
      data: {
        providerId: provider.id,
        avarage_price: avarage_price
      },
    });

    return new Response(
      JSON.stringify({
        message:
          "Merci d'avoir postuler. Vous recevrez une notification si vous êtes selectionné ",
        status: 200,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue", status: 500 }),
      { status: 500 }
    );
  }
}
