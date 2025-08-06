"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Logo } from "./logo";

interface AccessDeniedProps {
    title: string;
    message: string;
    linkHref: string;
    linkText: string;
}

export default function AccessDenied({ title, message, linkHref, linkText }: AccessDeniedProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="mt-4 text-2xl">{title}</CardTitle>
                    <CardDescription>
                        {message}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href={linkHref}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> {linkText}
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
