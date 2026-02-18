// app/hadbit/items/page.tsx (Server Component)
import { createClient } from "@/lib/supabase/server";
import Items from "@/components/pages/Items";
import { redirect } from "next/navigation";

export default async function ItemsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <Items userId={user.id} />;
}
