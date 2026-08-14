"use client";

import { Category, CreateTaskData } from "@/types";
import { FormEvent, useEffect, useState } from "react";

interface AddTaskProps {
    categories: Category[];
    onAdd: (data: CreateTaskData) => Promise<void>;
}

interface FormErrors {
    title?: string;
    deadline?: string;
    submit?: string;
}

export default function AddTask({ categories, onAdd }: AddTaskProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === "Escape" && !submitting) {
                setOpen(false);
            }
        }

        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [open, submitting]);

    function validate() {
        const nextErrors: FormErrors = {};
        const cleanTitle = title.trim();

        if (!cleanTitle) {
            nextErrors.title = "Task title is required.";
        } else if (cleanTitle.length > 100) {
            nextErrors.title = "Task title cannot exceed 100 characters.";
        }

        if (deadline && Number.isNaN(new Date(`${deadline}T00:00:00`).getTime())) {
            nextErrors.deadline = "Choose a valid due date.";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

    function resetForm() {
        setTitle("");
        setDescription("");
        setDeadline("");
        setCategoryId(null);
        setErrors({});
    }

    function resetAndClose() {
        if (submitting) return;
        setOpen(false);
        resetForm();
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!validate()) return;

        try {
            setSubmitting(true);
            setErrors({});
            await onAdd({
                title: title.trim(),
                description: description.trim(),
                deadline: deadline || undefined,
                categoryId,
            });
            setOpen(false);
            resetForm();
        } catch (error) {
            setErrors({
                submit: error instanceof Error ? error.message : "Could not create the task.",
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
                + Add Task
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) resetAndClose();
                    }}
                >
                    <form
                        onSubmit={handleSubmit}
                        noValidate
                        aria-label="Add task"
                        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Add Task</h2>
                            <button
                                type="button"
                                onClick={resetAndClose}
                                disabled={submitting}
                                aria-label="Close add task form"
                                className="rounded-lg p-2 text-2xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                            >
                                ×
                            </button>
                        </div>

                        <div className="mt-6 space-y-5">
                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-slate-700">
                                    Title <span className="text-red-500">*</span>
                                </span>
                                <input
                                    autoFocus
                                    value={title}
                                    maxLength={101}
                                    onChange={(event) => {
                                        setTitle(event.target.value);
                                        if (errors.title) setErrors((current) => ({ ...current, title: undefined }));
                                    }}
                                    aria-invalid={Boolean(errors.title)}
                                    aria-describedby={errors.title ? "new-task-title-error" : undefined}
                                    placeholder="What needs to be done?"
                                    className={`w-full rounded-xl border p-3 outline-none ${errors.title ? "border-red-400" : "border-slate-200 focus:border-blue-500"}`}
                                />
                                <div className="mt-1 flex justify-between gap-3 text-xs">
                                    {errors.title ? (
                                        <span id="new-task-title-error" className="text-red-500">{errors.title}</span>
                                    ) : <span />}
                                    <span className={title.trim().length > 100 ? "text-red-500" : "text-slate-400"}>
                                        {title.trim().length}/100
                                    </span>
                                </div>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
                                <textarea
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    rows={4}
                                    placeholder="Add task details..."
                                    className="w-full resize-none rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                                />
                            </label>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-slate-700">Category</span>
                                    <select
                                        value={categoryId ?? ""}
                                        onChange={(event) => setCategoryId(event.target.value ? Number(event.target.value) : null)}
                                        className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                                    >
                                        <option value="">No Category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-slate-700">Due Date</span>
                                    <input
                                        type="date"
                                        value={deadline}
                                        onChange={(event) => {
                                            setDeadline(event.target.value);
                                            if (errors.deadline) setErrors((current) => ({ ...current, deadline: undefined }));
                                        }}
                                        aria-invalid={Boolean(errors.deadline)}
                                        className={`w-full rounded-xl border p-3 outline-none ${errors.deadline ? "border-red-400" : "border-slate-200 focus:border-blue-500"}`}
                                    />
                                    {errors.deadline && <span className="mt-1 block text-xs text-red-500">{errors.deadline}</span>}
                                </label>
                            </div>

                            {errors.submit && (
                                <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                                    {errors.submit}
                                </p>
                            )}
                        </div>

                        <div className="mt-7 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={resetAndClose}
                                disabled={submitting}
                                className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={submitting}
                                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting ? "Creating..." : "Create Task"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}
