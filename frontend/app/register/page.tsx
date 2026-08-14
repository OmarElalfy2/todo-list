"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/services/auth.service";

interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    submit?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
    const router = useRouter();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    function clearFieldError(field: keyof FormErrors) {
        setErrors((current) => ({
            ...current,
            [field]: undefined,
            submit: undefined,
        }));
    }

    function validateForm() {
        const nextErrors: FormErrors = {};
        const cleanFirstName = firstName.trim();
        const cleanLastName = lastName.trim();
        const cleanEmail = email.trim();

        if (!cleanFirstName) {
            nextErrors.firstName = "First name is required.";
        } else if (cleanFirstName.length > 20) {
            nextErrors.firstName = "First name cannot exceed 20 characters.";
        }

        if (!cleanLastName) {
            nextErrors.lastName = "Last name is required.";
        } else if (cleanLastName.length > 20) {
            nextErrors.lastName = "Last name cannot exceed 20 characters.";
        }

        if (!cleanEmail) {
            nextErrors.email = "Email address is required.";
        } else if (!EMAIL_PATTERN.test(cleanEmail)) {
            nextErrors.email = "Enter a valid email, such as name@example.com.";
        }

        if (!password) {
            nextErrors.password = "Password is required.";
        } else if (password.length < 8) {
            nextErrors.password = "Password must be at least 8 characters.";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);
            setErrors({});

            await registerUser({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim().toLowerCase(),
                password,
            });

            router.push("/login");
        } catch (error) {
            setErrors({
                submit: error instanceof Error
                    ? error.message
                    : "Registration failed. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h1 className="text-3xl font-bold">Create account</h1>
                <p className="mt-2 text-slate-500">Start organizing your tasks.</p>

                <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-slate-700">
                                First name <span className="text-red-500">*</span>
                            </span>
                            <input
                                value={firstName}
                                maxLength={21}
                                autoComplete="given-name"
                                onChange={(event) => {
                                    setFirstName(event.target.value);
                                    clearFieldError("firstName");
                                }}
                                aria-invalid={Boolean(errors.firstName)}
                                aria-describedby={errors.firstName ? "first-name-error" : undefined}
                                placeholder="First name"
                                className={`w-full rounded-xl border px-4 py-3 outline-none ${errors.firstName ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"}`}
                            />
                            {errors.firstName && (
                                <span id="first-name-error" className="mt-1 block text-xs text-red-500">
                                    {errors.firstName}
                                </span>
                            )}
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-slate-700">
                                Last name <span className="text-red-500">*</span>
                            </span>
                            <input
                                value={lastName}
                                maxLength={21}
                                autoComplete="family-name"
                                onChange={(event) => {
                                    setLastName(event.target.value);
                                    clearFieldError("lastName");
                                }}
                                aria-invalid={Boolean(errors.lastName)}
                                aria-describedby={errors.lastName ? "last-name-error" : undefined}
                                placeholder="Last name"
                                className={`w-full rounded-xl border px-4 py-3 outline-none ${errors.lastName ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"}`}
                            />
                            {errors.lastName && (
                                <span id="last-name-error" className="mt-1 block text-xs text-red-500">
                                    {errors.lastName}
                                </span>
                            )}
                        </label>
                    </div>

                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">
                            Email <span className="text-red-500">*</span>
                        </span>
                        <input
                            type="email"
                            value={email}
                            autoComplete="email"
                            inputMode="email"
                            onChange={(event) => {
                                setEmail(event.target.value);
                                clearFieldError("email");
                            }}
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? "email-error" : undefined}
                            placeholder="name@example.com"
                            className={`w-full rounded-xl border px-4 py-3 outline-none ${errors.email ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"}`}
                        />
                        {errors.email && (
                            <span id="email-error" className="mt-1 block text-xs text-red-500">
                                {errors.email}
                            </span>
                        )}
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">
                            Password <span className="text-red-500">*</span>
                        </span>
                        <input
                            type="password"
                            value={password}
                            autoComplete="new-password"
                            onChange={(event) => {
                                setPassword(event.target.value);
                                clearFieldError("password");
                            }}
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={errors.password ? "password-error" : "password-help"}
                            placeholder="At least 8 characters"
                            className={`w-full rounded-xl border px-4 py-3 outline-none ${errors.password ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"}`}
                        />
                        {errors.password ? (
                            <span id="password-error" className="mt-1 block text-xs text-red-500">
                                {errors.password}
                            </span>
                        ) : (
                            <span id="password-help" className="mt-1 block text-xs text-slate-400">
                                Must contain at least 8 characters.
                            </span>
                        )}
                    </label>

                    {errors.submit && (
                        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                            {errors.submit}
                        </p>
                    )}

                    <button
                        disabled={loading}
                        className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? "Creating..." : "Create Account"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </main>
    );
}
