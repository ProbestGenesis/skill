import { prisma } from "@/lib/prisma";

import { createClient, processLock } from '@supabase/supabase-js'

 const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
        
export async function POST(req: Request, { userId }: Record<string, string>) {
  try {
    const formData = await req.formData();
    //@ts-ignore
    const file = formData?.get("file");

    if (!(file instanceof Blob)) {
      return new Response(
        JSON.stringify({ message: "Aucun fichier valide fourni", status: 400 }),
        { status: 400 }
      );
    }

    const filename = `${userId}.jpeg`;

    const { error: uploadError } = await supabase.storage
      .from("profil-pictures")
      .upload(filename, file, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.log(uploadError)
      return new Response(
        JSON.stringify({ message: "Échec de l’upload", status: 500 }),
        { status: 500 }
      );
    }

    const { data: publicData } = supabase.storage
      .from("profil-pictures")
      .getPublicUrl(filename);

    if (!publicData?.publicUrl) {
      return new Response(
        JSON.stringify({ message: "URL publique introuvable", status: 500 }),
        { status: 500 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { image: publicData.publicUrl },
    });

    return new Response(
      JSON.stringify({
        message: "Votre photo de profil a été ajoutée",
        status: 200,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Une erreur est survenue", status: 500 }),
      { status: 500 }
    );
  }
}
