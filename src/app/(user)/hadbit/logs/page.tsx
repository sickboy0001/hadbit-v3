import Logs from "@/components/pages/Logs";
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
  return <Logs userId={user.id} />;
}
