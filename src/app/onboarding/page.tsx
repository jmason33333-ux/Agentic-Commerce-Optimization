"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ShoppingBag, Sparkles, CheckCircle2, Store, TrendingUp, X, Check, Loader2 } from "lucide-react"
import Link from "next/link"

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [storeUrl, setStoreUrl] = useState("")
  const [syncProgress, setSyncProgress] = useState(0)

  // Simulate syncing progress
  const startSync = () => {
    setCurrentStep(3)
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setTimeout(() => setCurrentStep(4), 500)
      }
      setSyncProgress(Math.min(progress, 100))
    }, 400)
  }

  const totalSteps = 4
  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-3 mb-12">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                step <= currentStep ? "bg-[#8B5CF6] scale-110" : "bg-slate-300"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <Card className="p-12 text-center border-slate-200 shadow-sm">
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-3 text-balance">Welcome to Agent-Ready Catalog</h1>
                <p className="text-slate-600 text-lg">by Nobo Studio</p>
              </div>

              {/* Illustration */}
              <div className="flex items-center justify-center gap-6 py-8">
                <div className="h-20 w-20 rounded-2xl bg-[#F5F3FF] flex items-center justify-center">
                  <Store className="h-10 w-10 text-[#8B5CF6]" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-1 w-12 bg-[#8B5CF6] rounded-full" />
                  <div className="h-1 w-12 bg-[#8B5CF6] rounded-full" />
                  <div className="h-1 w-12 bg-[#8B5CF6] rounded-full" />
                </div>
                <div className="h-20 w-20 rounded-2xl bg-[#F5F3FF] flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-[#8B5CF6]" />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-slate-700 text-lg">Let's get your store ready for ChatGPT Shopping</p>
                <p className="text-slate-500">This will take about 3 minutes</p>
              </div>

              <div className="bg-[#FAFAF9] rounded-xl p-6 text-left space-y-3">
                <p className="font-semibold text-slate-900 mb-4">What we'll do:</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      1
                    </div>
                    <p className="text-slate-700">Connect your Shopify store</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      2
                    </div>
                    <p className="text-slate-700">Sync your product catalog</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      3
                    </div>
                    <p className="text-slate-700">Run initial compliance check</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      4
                    </div>
                    <p className="text-slate-700">Preview your first optimizations</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Button
                  onClick={() => setCurrentStep(2)}
                  className="w-full h-12 text-base bg-[#8B5CF6] hover:bg-[#7C3AED]"
                >
                  Get Started
                </Button>
                <button className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
                  Skip for now (not recommended)
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Connect Shopify */}
        {currentStep === 2 && (
          <Card className="p-12 border-slate-200 shadow-sm">
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Connect Your Shopify Store</h2>
              </div>

              {/* Shopify Logo */}
              <div className="flex justify-center py-4">
                <div className="h-16 w-16 rounded-2xl bg-[#96BF48] flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-white" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Store URL</label>
                  <Input
                    type="text"
                    placeholder="mystore.myshopify.com"
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  We'll redirect you to Shopify to authorize access. We only request permission to:
                </p>

                <div className="bg-[#F5F3FF] rounded-xl p-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#8B5CF6] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700">Read product information</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#8B5CF6] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700">Read inventory levels</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#8B5CF6] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700">Read order data (for attribution)</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-6 space-y-3">
                  <p className="text-sm font-medium text-slate-700">We will never:</p>
                  <div className="flex items-start gap-3">
                    <X className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">Modify products without your approval</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <X className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">Access customer payment information</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button variant="ghost" onClick={() => setCurrentStep(1)} className="flex-1 h-12">
                  Back
                </Button>
                <Button
                  onClick={startSync}
                  disabled={!storeUrl}
                  className="flex-1 h-12 text-base bg-[#8B5CF6] hover:bg-[#7C3AED]"
                >
                  Connect with Shopify
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Syncing Products */}
        {currentStep === 3 && (
          <Card className="p-12 text-center border-slate-200 shadow-sm">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Syncing Your Products...</h2>
              </div>

              {/* Animated Spinner */}
              <div className="flex justify-center py-8">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-[#F5F3FF] flex items-center justify-center">
                    <Loader2 className="h-12 w-12 text-[#8B5CF6] animate-spin" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                  <span>Found: 247 products</span>
                  <span>Synced: {Math.floor((syncProgress / 100) * 247)} of 247</span>
                </div>
                <Progress value={syncProgress} className="h-3" />
                <p className="text-2xl font-bold text-[#8B5CF6]">{Math.floor(syncProgress)}%</p>
              </div>

              <p className="text-slate-500">This usually takes 1-2 minutes</p>

              <div className="bg-[#FAFAF9] rounded-xl p-6 text-left space-y-4">
                <p className="font-semibold text-slate-900">What we're doing:</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <p className="text-slate-700">Importing product data</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <p className="text-slate-700">Analyzing compliance levels</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-[#8B5CF6] animate-spin flex-shrink-0" />
                    <p className="text-slate-700">Generating AI suggestions</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full border-2 border-slate-300 flex-shrink-0" />
                    <p className="text-slate-400">Preparing your dashboard</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 4: First Look / Results */}
        {currentStep === 4 && (
          <Card className="p-12 border-slate-200 shadow-sm">
            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <Sparkles className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Your Store is Connected!</h2>
                <p className="text-slate-600">We analyzed 247 products. Here's what we found:</p>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F5F3FF] rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-[#8B5CF6] mb-1">6.2/10</div>
                  <p className="text-sm text-slate-600">Average Compliance</p>
                </div>
                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-green-700 mb-1">75%</div>
                  <p className="text-sm text-slate-600">Ready for ChatGPT</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-amber-700 mb-1">61</div>
                  <p className="text-sm text-slate-600">Need Optimization</p>
                </div>
                <div className="bg-[#F5F3FF] rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-[#8B5CF6] mb-1">143</div>
                  <p className="text-sm text-slate-600">AI Suggestions Ready</p>
                </div>
              </div>

              {/* Quick Wins */}
              <div className="bg-[#FAFAF9] rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#8B5CF6]" />
                  <p className="font-semibold text-slate-900">Quick Wins (approve now to reach Level 8+):</p>
                </div>
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="flex items-start gap-2">
                    <span className="text-[#8B5CF6]">•</span>
                    <span>Add missing "material" field to 34 products</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#8B5CF6]">•</span>
                    <span>Optimize 28 product titles</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#8B5CF6]">•</span>
                    <span>Add weight to 19 products</span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-slate-50 rounded-xl p-6 space-y-3">
                <p className="font-semibold text-slate-900">Next Steps:</p>
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      1
                    </div>
                    <span>Review pending optimizations</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      2
                    </div>
                    <span>Approve quick wins (5 minutes)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      3
                    </div>
                    <span>Enable ChatGPT checkout for ready products</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Link href="/">
                  <Button className="w-full h-12 text-base bg-[#8B5CF6] hover:bg-[#7C3AED]">Go to Dashboard</Button>
                </Link>
                <Button variant="ghost" className="w-full h-12">
                  Take a Quick Tour
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
