// app/hadbit/items/page.tsx (Server Component)
import { createClient } from "@/lib/supabase/server";
import TemplateTester from "@/components/pages/TemplateTester";
import { redirect } from "next/navigation";

export default async function ItemsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  //  userId={user.id}
  return <TemplateTester userId={user.id} />;
}
