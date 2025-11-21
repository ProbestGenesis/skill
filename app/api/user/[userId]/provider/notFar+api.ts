import { prisma } from "@/lib/prisma";
import { Provider } from "@/prisma/generated/prisma";
import { calculDistance } from "@/lib/calculDistance";

export async function GET(req: Request, { userId }: Record<string, string>) {
  try {
    console.log("with userId")
    const url = new URL(req.url);
    const lat = parseFloat(url.searchParams.get("lat") || "0");
    const long = parseFloat(url.searchParams.get("long") || "0");

    if (isNaN(lat) || isNaN(long)) {
      return new Response(
        JSON.stringify({ error: "Invalid latitude or longitude" }),
        { status: 400 }
      );
    }

    const providers = await prisma.provider.findMany({
      where: {
        NOT: {
          userId: userId,
        },
      },
      include: {
        user: true,
        skills: {
          select: {
            title: true,
          },
        },
      },
    });

    function trierParDistance(
      providers: Provider[],
      lat: number,
      long: number
    ) {
      return providers
        .map((provider) => {
          const latA = provider.location?.latitude;
          const longA = provider.location?.longitude;

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
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  } 
}
