
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/language-context";

export default function SubscribePage() {
    const { t } = useLanguage();

    const plans = [
        {
            name: "Plano Prático",
            price: "200 MT",
            pricePeriod: t('per_month'),
            description: t('plan_pratico_description'),
            features: [
                t('plan_pratico_feature1'),
                t('plan_pratico_feature2'),
            ],
            cta: t('subscribe_now'),
            link: "https://paysuite.tech/checkout/c3fe5a91-78ea-4ddc-8d92-e9de67dcceb9"
        },
        {
            name: "Plano Gestão",
            price: "300 MT",
            pricePeriod: t('per_month'),
            description: t('plan_gestao_description'),
            features: [
                t('plan_gestao_feature1'),
                t('plan_gestao_feature2'),
                t('plan_gestao_feature3'),
            ],
            cta: t('subscribe_now'),
            link: "https://paysuite.tech/checkout/c3fe5a91-78ea-4ddc-8d92-e9de67dcceb9"
        },
        {
            name: "Plano Total",
            price: "1500 MT",
            pricePeriod: t('per_month'),
            description: t('plan_total_description'),
            features: [
                t('plan_total_feature1'),
                t('plan_total_feature2'),
                t('plan_total_feature3'),
                t('plan_total_feature4'),
            ],
            cta: t('subscribe_now'),
            link: "https://paysuite.tech/checkout/c3fe5a91-78ea-4ddc-8d92-e9de67dcceb9"
        },
    ]

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-headline">{t('subscription_page_title')}</h1>
                <p className="text-muted-foreground mt-2">{t('subscription_page_subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {plans.map((plan) => (
                    <Card key={plan.name} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-2xl">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-6">
                            <div className="flex items-baseline">
                                <span className="text-4xl font-bold">{plan.price}</span>
                                <span className="text-muted-foreground ml-1">{plan.pricePeriod}</span>
                            </div>
                            <ul className="space-y-3">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2">
                                        <Check className="w-5 h-5 text-green-500" />
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href={plan.link} target="_blank">{plan.cta}</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
