"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
    loginUser,
    saveAuth,
} from "@/services/auth.service";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            const response = await loginUser({
                email,
                password,
            });

            saveAuth(response.token, response.data);

            router.push("/dashboard");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Login failed"
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Welcome back
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Sign in to manage your tasks.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="omar@example.com"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">
                            {error}
                        </p>
                    )}

                    <button
                        disabled={loading}
                        className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Login"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Don't have an account?{" "}
                    <button
                        onClick={() => router.push("/register")}
                        className="font-semibold text-blue-600"
                    >
                        Register
                    </button>
                </p>
            </div>
        </main>
    );
}