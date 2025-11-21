import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { userId }: Record<string, string>) {
  try {
       const posts = await prisma.post.findMany({
          where: {
            userId: userId,
          },
          orderBy: {
            updatedAt: "desc"
          },
         select: {
           id: true,
           user: true
          },
          take: 2 
       })
       
       console.log(posts)

       return new Response(JSON.stringify(posts), {status: 200})
  }
 catch(error){
    console.log(error)
     return new Response(
          JSON.stringify({ message: "Une erreur est survenue", status: 500 }),
          { status: 500 }
        );
      }
  }
