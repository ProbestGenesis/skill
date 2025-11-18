import { PrismaClient, Provider, User } from "~/prisma/generated/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

type ProviderData = Provider & { user: User };
export async function GET(req: Request, { userId }: Record<string, string>) {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const post = await prisma.post.findFirst({
      where: {
        userId: userId,
        providerId: null,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        user: true,
      },
    });

    const providerIds = post?.applyProviders ?? [];
    const providers = (
      await Promise.all(
        providerIds.map(async (item: string) => {
          return await prisma.provider.findUnique({
            where: {
              id: item,
            },
            include: {
              user: true,
            },
          });
        })
      )
    ).filter(Boolean) as ProviderData[];

    const data = { post, providers };
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue", status: 500 }),
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { userId }: Record<string, string>) {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const { body, title, profession, location } = await req.json();
  

  try{
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
      JSON.stringify({ message: "Erreur d'authentification", status: 401 }),
      { status: 401 }
    );
  }
  if (!profession) {
    return new Response(
      JSON.stringify({
        message: "Vous devez selectionner une profession pour le service rechercher",
        status: 400,
      }),
      { status: 400 }
    );
  }
  if (!body) {
    return new Response(
      JSON.stringify({
        message: "La publication ne peut pas être vide",
        status: 400,
      }),
      {
        status: 400,
      }
    );
  }

  const post = await prisma.post.create({
    data: {
      body,
      user:{
        connect: {
          id: userId
        }
      },
      location: location,
      profession: profession.value
    },
  });

  return new Response(
    JSON.stringify({ message: "Votre demande a été publié", status: 201 }),
    { status: 201 }
  );
  }
  catch(error){
    console.log(error)
      return new Response(
    JSON.stringify({ message: "Une erreur s'est produite", status: 500 }),
    { status: 500 }
  );
  }
 
}
