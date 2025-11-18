import { PrismaClient, Provider } from "~/prisma/generated/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import * as Location from "expo-location";
import { calculDistance } from "~/lib/calculDistance";


export async function GET(req: Request) {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());

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
    const providers = await prisma.provider.findMany({
      include: {
        user: true,
        skills: {
          select: {
            title: true,
          },
        },
      },
    });

    type Location = Location.LocationObject;

    function trierParDistance(
      providers: Provider[],
      lat: number,
      long: number
    ) {
      return providers
        .map((provider) => {
          const latA = provider.location?.coords?.latitude;
          const longA = provider.location?.coords?.longitude;

          if (latA == null || longA == null) {
            return { ...provider, distance: Infinity };
          }

          const distance = calculDistance(lat, long, latA, longA);
         
          return { ...provider, distance };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 4);
    }

    const sortedProviders = trierParDistance(providers, lat, long);
    return new Response(JSON.stringify(sortedProviders), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({}), { status: 500 });
  }
}
