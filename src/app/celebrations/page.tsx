"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CelebrationModal } from "@/components/celebration-modal"
import { FirstProductOptimized } from "@/components/celebrations/first-product-optimized"
import { FirstChatGPTSale } from "@/components/celebrations/first-chatgpt-sale"
import { HundredProductsReady } from "@/components/celebrations/hundred-products-ready"

export default function CelebrationsPage() {
  const [activeModal, setActiveModal] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-slate-900">Celebration Modals</h1>
          <p className="text-lg text-slate-600">
            Preview milestone celebration screens that appear when users hit key achievements.
          </p>
        </div>

        <div className="grid gap-4">
          <Button
            size="lg"
            variant="outline"
            onClick={() => setActiveModal("first-product")}
            className="justify-start h-auto p-6"
          >
            <div className="text-left space-y-1">
              <div className="font-semibold text-lg">First Product Optimized</div>
              <div className="text-sm text-slate-500">Celebrates when a user optimizes their first product</div>
            </div>
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => setActiveModal("first-sale")}
            className="justify-start h-auto p-6"
          >
            <div className="text-left space-y-1">
              <div className="font-semibold text-lg">First ChatGPT Sale</div>
              <div className="text-sm text-slate-500">Celebrates the first sale made through ChatGPT Shopping</div>
            </div>
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => setActiveModal("hundred-products")}
            className="justify-start h-auto p-6"
          >
            <div className="text-left space-y-1">
              <div className="font-semibold text-lg">100 Products Ready</div>
              <div className="text-sm text-slate-500">Celebrates when 100 products are ChatGPT Shopping ready</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Celebration Modals */}
      <CelebrationModal open={activeModal === "first-product"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <FirstProductOptimized
          productName="Nike Air Max 90"
          productId="1"
          beforeLevel={6}
          afterLevel={9}
          onClose={() => setActiveModal(null)}
        />
      </CelebrationModal>

      <CelebrationModal open={activeModal === "first-sale"} onOpenChange={(open) => !open && setActiveModal(null)}>
        <FirstChatGPTSale productName="Nike Air Max 90" price="$89.99" onClose={() => setActiveModal(null)} />
      </CelebrationModal>

      <CelebrationModal
        open={activeModal === "hundred-products"}
        onOpenChange={(open) => !open && setActiveModal(null)}
      >
        <HundredProductsReady averageCompliance={8.2} optimizedPercentage={95} onClose={() => setActiveModal(null)} />
      </CelebrationModal>
    </div>
  )
}
