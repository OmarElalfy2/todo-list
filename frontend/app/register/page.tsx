"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/services/auth.service";

export default function RegisterPage() {
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            await registerUser({
                firstName,
                lastName,
                email,
                password,
            });

            router.push("/login");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h1 className="text-3xl font-bold">
                    Create account
                </h1>

                <p className="mt-2 text-slate-500">
                    Start organizing your tasks.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 space-y-4"
                >
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            value={firstName}
                            onChange={(e) =>
                                setFirstName(e.target.value)
                            }
                            placeholder="First name"
                            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                        />

                        <input
                            value={lastName}
                            onChange={(e) =>
                                setLastName(e.target.value)
                            }
                            placeholder="Last name"
                            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                        />
                    </div>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        placeholder="Email"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        placeholder="Password"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                    />

                    {error && (
                        <p className="text-sm text-red-500">
                            {error}
                        </p>
                    )}

                    <button
                        disabled={loading}
                        className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white"
                    >
                        {loading
                            ? "Creating..."
                            : "Create Account"}
                    </button>
                </form>
            </div>
        </main>
    );
}