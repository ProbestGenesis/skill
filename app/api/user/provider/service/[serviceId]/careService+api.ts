import { PrismaClient } from "~/prisma/generated/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export async function PUT(req: Request, { serviceId }: Record<string, string>) {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {

    const getService = await prisma.service.update({
      where: {
        id: serviceId
      },
      data: {
        status: "in_progress"
      }
    })


    return new Response(JSON.stringify({message: "Vous avez pris en charge ce service", status: 200 }), {status: 200})
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue", stauts: 500 }),
      { status: 500 }
    );
  }
}
