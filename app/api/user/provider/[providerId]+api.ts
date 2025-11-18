import { PrismaClient } from "~/prisma/generated/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export async function GET(req: Request, { providerId }: Record<string, string>) {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const providerData = await prisma.provider.findUnique({
      where: {
        userId: providerId,
      },
      include: {
        skills: true,
        user: true
      },
    });

    return  new Response(JSON.stringify(providerData), {status: 200} )
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue", stauts: 500 }),
      { status: 500 }
    );
  }
}
