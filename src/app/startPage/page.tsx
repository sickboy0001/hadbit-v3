import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, BarChart3, Shield } from "lucide-react";

export default function StartPage() {
  return (
    <div className="flex flex-col min-h-screen w-5/6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="px-6 h-16 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold italic">H</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Hadbit</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">ログイン</Button>
          </Link>
          <Link href="/signup">
            <Button>始める</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 relative overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] -z-10 opacity-30 pointer-events-none" />

        <div className="lg:grid lg:grid-cols-2 lg:items-center gap-12 py-12">
          {/* Hero Section */}
          <section className="py-12 px-6 text-center space-y-8 lg:px-12 relative z-10">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              ✨ 新しい習慣形成アプリ
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter max-w-3xl mx-auto bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 drop-shadow-sm">
              習慣を記録し、
              <br className="hidden sm:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                未来を変える
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Hadbitは、あなたの毎日の小さな積み重ねを可視化し、
              目標達成をサポートする習慣化プラットフォームです。
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="gap-2 h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105"
                >
                  今すぐ始める <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </section>

          {/* Features */}
          <section className="py-12 px-6">
            <div className="max-w-md mx-auto space-y-6">
              {/* Card 1 */}
              <div className="group p-6 rounded-2xl bg-background/60 backdrop-blur-md border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-5 text-left">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">簡単記録</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      ワンタップで日々の習慣を記録。 ストレスなく継続できます。
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group p-6 rounded-2xl bg-background/60 backdrop-blur-md border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-5 text-left">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">データ分析</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      継続率や状況をグラフで確認。 成長を実感できます。
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group p-6 rounded-2xl bg-background/60 backdrop-blur-md border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-5 text-left">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">プライバシー</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      あなたのデータは安全に保護されます。
                      安心してご利用ください。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="py-8 px-6 border-t text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Hadbit. All rights reserved.</p>
      </footer>
    </div>
  );
}
