
"use client"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/logo"
import { useLanguage } from "@/context/language-context"
import { LanguageToggle } from "@/components/language-toggle"

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
})

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;

        // Get user role from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            toast({
                title: t('login_successful'),
                description: t('redirecting_to_dashboard'),
            });
            if (userData.accountType === 'provider') {
                router.push("/provider/dashboard");
            } else {
                router.push("/client/dashboard");
            }
        } else {
            // This case should ideally not happen if signup is done correctly
            throw new Error("User data not found in database.");
        }
    } catch (error: any) {
        let errorMessage = "An unknown error occurred.";
        if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
            errorMessage = "Invalid email or password. Please try again.";
        }
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: errorMessage,
        })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Logo className="mx-auto h-12 w-12 mb-4" />
          <CardTitle className="text-2xl">{t('login_to_recolixo')}</CardTitle>
          <CardDescription>
            {t('enter_credentials')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('password')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t('logging_in') : t('login')}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            {t('dont_have_account')}{" "}
            <Link href="/signup" className="underline">
              {t('sign_up')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
