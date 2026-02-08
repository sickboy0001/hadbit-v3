import Analytics from "@/components/pages/Analytics";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // ログインしていない場合の処理（リダイレクトなど）
    return <div>Please login</div>;
  }
  return <Analytics userId={user.id} />;
}
