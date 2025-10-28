// SignupPage.tsx (Refactored)
"use client";
import { Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import {
    Card, CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/features/core/components/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/features/core/components/form";
import { Button } from "@/features/core/components/button";
import { useSignup } from "../hooks/useSignup";
import { FormInput } from "@/features/core/components/FormInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/features/core/components/select";

export default function SignupPage() {
    const { loading, onSubmit, form } = useSignup();

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl backdrop-blur-sm">
                <CardHeader className="space-y-1 pb-6">
                    <CardTitle className="text-2xl font-bold text-center">
                        Create Account
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your details below to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormInput
                                control={form.control}
                                name="username"
                                label="Username"
                                placeholder="Enter your username"
                                icon={<User className="text-muted-foreground" size={18} />}
                            />

                            <FormInput
                                control={form.control}
                                name="email"
                                label="Email"
                                placeholder="Enter your email address"
                                type="email"
                                icon={<Mail className="text-muted-foreground" size={18} />}
                            />

                            <FormInput
                                control={form.control}
                                type="password"
                                name="password"
                                label="Password"
                                placeholder="Create a secure password"
                                icon={<Lock className="text-muted-foreground" size={18} />}

                            />
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormLabel>
                                            Role
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select how you want to signup as" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="w-full">
                                                <SelectItem value="OWNER">Vehicle Owner</SelectItem>
                                                <SelectItem value="USER">Renter</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className="w-full h-11 font-medium"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                                        Creating account...
                                    </div>
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                        </form>
                    </Form>

                    <div className="text-center">
                        <p className="text-sm">
                            Already have an account?{" "}
                            <Link
                                href="/auth/login"
                                className="font-medium hover:underline text-primary"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}