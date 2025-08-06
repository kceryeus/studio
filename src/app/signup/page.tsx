
"use client"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/logo"
import { useLanguage } from "@/context/language-context"
import { LanguageToggle } from "@/components/language-toggle"

const signupSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  accountType: z.enum(["client", "provider"], {
    required_error: "You need to select an account type.",
  }),
})

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Update user profile
      await updateProfile(user, { displayName: values.fullName });

      // Save user info to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: values.fullName,
        email: values.email,
        accountType: values.accountType
      });

      toast({
        title: t('account_created'),
        description: t('redirecting_to_login'),
      })
      router.push("/login")
    } catch (error: any) {
        let errorMessage = "An unknown error occurred.";
        if (error.code === "auth/email-already-in-use") {
            errorMessage = "This email address is already in use.";
        } else if (error.code === 'permission-denied') {
            errorMessage = "Database permission denied. Please check Firestore rules."
        }
        toast({
            variant: "destructive",
            title: "Signup Failed",
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
          <CardTitle className="text-2xl">{t('create_account')}</CardTitle>
          <CardDescription>
            {t('join_recolixo')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('full_name')}</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={form.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>{t('i_am_a')}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="client" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {t('client_radio')}
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="provider" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {t('provider_radio')}
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t('creating_account') : t('sign_up')}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            {t('already_have_account')}{" "}
            <Link href="/login" className="underline">
              {t('login')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
