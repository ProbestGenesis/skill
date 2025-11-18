import { prisma } from "@/lib/prisma"


export async function POST(req: Request) {
  try {
    const user = await prisma.user.create({
      data: {
        email: "bonjoudddr@gmail.com"
      }
    })
    return new Response(JSON.stringify({ message: "ok", user }), {
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ message: "Une erreur", error: String(error) }), { status: 400 })
  }
}


  export async function GET(req: Request) {
    try {
      const users = await prisma.user.findMany({})
      return new Response(JSON.stringify(users), { status: 200 })
    } catch (error) {
      return new Response(JSON.stringify({ message: "Une erreur", error: String(error) }), { status: 400 })
    }
  }
