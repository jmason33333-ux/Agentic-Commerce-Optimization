import { DashboardHeader } from "@/components/dashboard-header"
import { ChatGPTComparison } from "@/components/chatgpt-comparison"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-warm-bg">
      <DashboardHeader />

      <main className="w-full max-w-[1920px] mx-auto px-8 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">See the Difference</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Watch how AI optimization transforms your product's visibility in ChatGPT Shopping results
            </p>
          </div>

          <ChatGPTComparison />

          <div className="flex justify-center">
            <Link href="/products">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700">
                Optimize Your Products
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
