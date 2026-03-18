'use client'

import { Button } from "@/components/ui/button";
import { Check, Pencil, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface PricingTier {
    name: string;
    icon: React.ReactNode;
    price: number;
    description: string;
    features: string[];
    popular?: boolean;
    color: string;
    priceId?: string;
}

function CreativePricing({
    tag = "Simple Pricing",
    title = "Make Short Videos That Pop",
    description = "Edit, enhance, and go viral in minutes",
    tiers,
}: {
    tag?: string;
    title?: string;
    description?: string;
    tiers: PricingTier[];
}) {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)

    const handleSubscribe = async (priceId: string | undefined, tierName: string) => {
        if (!priceId) {
            router.push('/register')
            return
        }

        setLoading(tierName)

        try {
            // Check if user is authenticated
            const authResponse = await fetch('/api/auth/check')
            const authData = await authResponse.json()

            if (!authData.authenticated) {
                // Redirect to login with return URL
                router.push(`/login?returnUrl=${encodeURIComponent('/#pricing')}`)
                setLoading(null)
                return
            }

            // User is authenticated, proceed with checkout
            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    priceId,
                }),
            })

            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            } else {
                console.error('No checkout URL returned')
                setLoading(null)
            }
        } catch (error) {
            console.error('Subscription error:', error)
            setLoading(null)
        }
    }

    return (
        <div className="w-full max-w-6xl mx-auto px-4">
            <div className="text-center space-y-4 mb-12">
                <div className="inline-block">
                    <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                        {tag}
                    </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white">
                    {title}
                </h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                    {description}
                </p>
            </div>

            <div className="mb-8">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 shadow-2xl">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="w-8 h-8 text-white" />
                            <h3 className="text-3xl font-bold text-white">Start Your Free Trial</h3>
                        </div>
                        <div className="bg-zinc-900 rounded-2xl p-6 mb-6">
                            <p className="text-5xl font-bold text-white mb-2">30 Days Free</p>
                            <p className="text-xl text-emerald-50">Test all features with no credit card required</p>
                        </div>
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-white">
                                <Check className="w-5 h-5 shrink-0" />
                                <span className="text-lg">Full platform access for clients and transporters</span>
                            </div>
                            <div className="flex items-center gap-3 text-white">
                                <Check className="w-5 h-5 shrink-0" />
                                <span className="text-lg">Real-time chat and digital documents</span>
                            </div>
                            <div className="flex items-center gap-3 text-white">
                                <Check className="w-5 h-5 shrink-0" />
                                <span className="text-lg">Cancel anytime, no questions asked</span>
                            </div>
                        </div>
                        <Button
                            onClick={() => router.push('/register')}
                            className="w-full h-14 text-lg font-bold bg-white text-emerald-600 hover:bg-emerald-50 shadow-xl hover:shadow-2xl transition-all duration-300"
                        >
                            Start Free Trial Now
                        </Button>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                </div>
            </div>

            <div className={cn("grid grid-cols-1 gap-6", tiers.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3")}>
                {tiers.map((tier, index) => (
                    <div
                        key={tier.name}
                        className={cn(
                            "relative group h-full",
                            "transition-all duration-300"
                        )}
                    >
                        <div
                            className={cn(
                                "relative h-full bg-white dark:bg-zinc-900",
                                "border border-zinc-200 dark:border-zinc-800",
                                "rounded-2xl",
                                "transition-all duration-300",
                                "hover:shadow-xl hover:shadow-emerald-500/10",
                                "hover:border-emerald-500/50",
                                "hover:-translate-y-1",
                                tier.popular && "border-emerald-500 shadow-lg shadow-emerald-500/20"
                            )}
                        >
                            {tier.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                        <div className="p-6">

                            <div className="mb-6">
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-xl mb-4",
                                        "flex items-center justify-center",
                                        "bg-gradient-to-br from-emerald-500 to-emerald-600"
                                    )}
                                >
                                    <div className="text-white">
                                        {tier.icon}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                                    {tier.name}
                                </h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    {tier.description}
                                </p>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-zinc-900 dark:text-white">
                                        €{tier.price}
                                    </span>
                                    <span className="text-zinc-500 dark:text-zinc-400 text-sm">
                                        /month
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                {tier.features.map((feature) => (
                                    <div
                                        key={feature}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mt-0.5">
                                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={() => handleSubscribe(tier.priceId, tier.name)}
                                disabled={loading === tier.name}
                                className={cn(
                                    "w-full h-11 font-semibold text-sm relative",
                                    "transition-all duration-300",
                                    "disabled:opacity-50 disabled:cursor-not-allowed",
                                    tier.popular
                                        ? [
                                              "bg-gradient-to-r from-emerald-500 to-emerald-600",
                                              "text-white",
                                              "hover:from-emerald-600 hover:to-emerald-700",
                                              "shadow-lg shadow-emerald-500/30",
                                              "hover:shadow-xl hover:shadow-emerald-500/40",
                                          ]
                                        : [
                                              "bg-zinc-100 dark:bg-zinc-800",
                                              "text-zinc-900 dark:text-white",
                                              "hover:bg-zinc-200 dark:hover:bg-zinc-700",
                                              "border border-zinc-200 dark:border-zinc-700",
                                          ]
                                )}
                            >
                                {loading === tier.name ? 'Loading...' : 'Get Started'}
                            </Button>
                        </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


export { CreativePricing }
export type { PricingTier }