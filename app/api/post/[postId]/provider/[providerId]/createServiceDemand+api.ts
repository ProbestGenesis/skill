import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { providerId, postId }: Record<string, string>) {
   
  try{
    const { location } = await req.json()
     const provider = await prisma.provider.findUnique({
       where: {
        id: providerId
       },
       include: {
        user: {
            select: {
                id: true
            }
        }
       }
     })

     if(!provider){
        return new Response(
          JSON.stringify({ message: "Le compte de ce prestataire n'existe plus", status: 404 }),
          { status: 404 }
        );
     }
     const post = await prisma.post.findUnique({
        where: {
            id: postId
        },
        include: {
            user: {
                select: {
                    id:true,
                    location: true,
                    district: true
                }
            },
            service: {
              select: {
                id: true
              }
            }
        }
     })

     if(!post){
         return new Response(
          JSON.stringify({ message: "Cette demande de service n'existe plus", status: 404 }),
          { status: 404 }
        );
     }

     if(post.service){
        return new Response(
          JSON.stringify({ message: "Cette demande est encours de traitement", status: 404 }),
          { status: 404 }
        );
     }

     await prisma.service.create({
        data: {
            provider: {
                connect: {
                    id: provider?.user.id
                },
                
            },
            location: location,
            description: post.body,
            title: post.title,
            customer: {
                connect: {
                    id: post?.user.id
                }
            },
            district: post?.user.district,
            post: {
                connect: {
                    id: post.id
                }
            }

        }
     })

     await prisma.post.update({
        where: {
          id: post?.id
        },
        data: {
          providers: {
            connect: {
              id: provider?.id
            }
          }
        }
     })

      return new Response(
          JSON.stringify({ message: "Le prestataire a été contacté avec success", status: 200 }),
          { status: 200 }
        );
     
  }

  catch(error){
         console.log(error)
         return new Response(
          JSON.stringify({ message: "Une erreur est survenue", status: 500 }),
          { status: 500 }
        );
  }

}