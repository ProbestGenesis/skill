import { Post, User } from "@/prisma/generated/prisma";
import { prisma } from "@/lib/prisma";
import * as Location from "expo-location";
import { calculDistance } from "@/lib/calculDistance";

export async function GET(
  req: Request,
  { userId, providerId }: Record<string, string>
) {
  type Posts = Post & { user: User };
  try {
    const url = new URL(req.url);
    const lat = parseFloat(url.searchParams.get("lat") || "0");
    const long = parseFloat(url.searchParams.get("long") || "0");

    if (isNaN(lat) || isNaN(long)) {
      return new Response(
        JSON.stringify({ error: "Veuillez activer votre localisation" }),
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true
      }
    })

    if(!user){
       return new Response(
        JSON.stringify({ message: "Erreur d'authentification", stauts: 401 }),
        { status: 401 }
      ); 
    }
    const provider = await prisma.provider.findUnique({
      where: {
        id: providerId
      }
    })

    if(!provider){
       return new Response(
        JSON.stringify({ message: "Vous n'êtes pas authorisé a executé cette action", stauts: 401 }),
        { status: 401 }
      ); 
    }
    const profession = provider.profession
    const posts = await prisma.post.findMany({
      where: {
        userId: { not: userId },
        providerId: null,
        profession: profession
      },
      include: {
        user: true,
      },
    });

    type Location = Location.LocationObject;

    function trierParDistance(posts: Posts[], lat: number, long: number) {
      return posts
        .map((post) => {
          const latA = post.location?.latitude;
          const longA = post.location?.longitude;

          if (latA == null || longA == null) {
            return { ...post, distance: Infinity };
          }

          const distance = calculDistance(lat, long, latA, longA);

          return { ...post, distance };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 4);
    }

    const sortedCustomerPosts = trierParDistance(posts, lat, long);
    return new Response(JSON.stringify(sortedCustomerPosts), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({}), { status: 500 });
  }
}
