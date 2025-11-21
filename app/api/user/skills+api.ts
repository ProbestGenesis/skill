import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try{
    const { title, description, id, averagePrice } = await req.json();


    if (!title || !description) {
      return new Response(
        JSON.stringify({ message: "Le service doit avoir un nom et une description", status: 400 }),
        { status: 400 }
      );
    }

    const skills = await prisma.skills.create({
      data: {
        title,
        description,
        average_price: Number(averagePrice),
        provider: {
          connect: {
            id: id,
          },
        },
      },
    });
 
    return new Response(
      JSON.stringify({
        message:
          "Votre service a été ajouté avec succès",
        status: 201,
      }),
      { status: 201 }
    );
  }

  catch(error){
    console.log(error)
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue", stauts: 500 }),
      { status: 500 }
    );
  }
}
