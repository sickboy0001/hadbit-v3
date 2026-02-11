// app/hadbit/items/page.tsx (Server Component)
import { createClient } from "@/lib/supabase/server";
import TemplateTester from "@/components/pages/TemplateTester";

export default async function ItemsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // ログインしていない場合の処理（リダイレクトなど）
    return <div>Please login</div>;
  }

  //  userId={user.id}
  return <TemplateTester userId={user.id} />;
}
