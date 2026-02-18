// app/hadbit/items/page.tsx (Server Component)
import { createClient } from "@/lib/supabase/server";
import Items from "@/components/pages/Items";
import LegacyDataConvert from "@/components/pages/LegacyDataConvert";
import { redirect } from "next/navigation";

export default async function ItemsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  if (!user.email) {
    return <div>Email is required for data conversion.</div>;
  }

  return <LegacyDataConvert userId={user.id} email={user.email} />;
}
