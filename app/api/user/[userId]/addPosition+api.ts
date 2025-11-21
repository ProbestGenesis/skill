import { prisma } from "@/lib/prisma";
export async function POST(req: Request, { userId }: Record<string, string>) {
  const { district, city, location } = await req.json()
  try{
    await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            district, 
            city,
            location
        }
    })

    
    return new Response(JSON.stringify({message: "Votre information ont été ajouter avec success", status: 200}), {status: 200})
  }

  catch(error){
    return new Response(
          JSON.stringify({ message: "Une erreur est survenue", stauts: 500 }),
          { status: 500 }
        );
  }

}