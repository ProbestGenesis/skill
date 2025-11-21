import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { userId }: Record<string, string>) {
  const page = URL.parse(req.url)?.searchParams.get('page') ? URL.parse(req.url)?.searchParams.get('page') : 1

  try {
       const posts = await prisma.post.findMany({
          where: {
            userId: userId,
          },
          orderBy: {
            updatedAt: "desc"
          },
          include: {
            user: true
          },
          take: 2 * parseInt(page)
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
