import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { userId }: Record<string, string>) {
  try {
    const services = await prisma.service.findMany({
      where: {
        customerId: userId,
      },
      include: {
        customer: {
          select: {
            id: true,
          },
        },
      },
    });

    let customersId: string[] = [];
    services.map((item) => {
      if (!customersId.includes(item.customer.id)) {
        customersId.push(item.customer.id);
      }
    });

    const customers = await prisma.user.findMany({
      where: {
        id: {
          in: customersId, 
        },
      },
    });

    return new Response(JSON.stringify(customers), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue", status: 500 }),
      { status: 500 }
    );
  }
}
