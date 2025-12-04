import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { userId }: Record<string, string>) {
  try {
    const { name, email } = await req.json();

    if (!name) {
      return new Response(JSON.stringify({ message: 'Votre nom est requis', status: 400 }), {
        status: 400,
      });
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: name,
        email: email,
      },
    });

    return new Response(
      JSON.stringify({
        message: 'Les informations ont été ajouter a votre compte avec succèss',
        status: 201,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({ message: 'Une erreur est survenue, Reéssayer', stauts: 500 }),
      { status: 500 }
    );
  }
}
