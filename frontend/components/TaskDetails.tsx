"use client";

import { Category, Task, UpdateTaskData } from "@/types";
import { useMemo, useState } from "react";

interface TaskDetailsProps {
    task: Task;
    categories: Category[];
    onSave: (taskId: number, data: UpdateTaskData) => Promise<void>;
    onDelete: (taskId: number) => Promise<void>;
    onClose: () => void;
}

export default function TaskDetails({ task, categories, onSave, onDelete, onClose }: TaskDetailsProps) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || "");
    const [deadline, setDeadline] = useState(task.due_date?.slice(0, 10) || "");
    const [categoryId, setCategoryId] = useState<number | null>(task.category_id);
    const [isCompleted, setIsCompleted] = useState(task.is_completed);
    const [titleError, setTitleError] = useState("");
    const [requestError, setRequestError] = useState("");
    const [busy, setBusy] = useState<"save" | "delete" | null>(null);

    const updates = useMemo<UpdateTaskData>(() => {
        const data: UpdateTaskData = {};
        const cleanTitle = title.trim();
        const cleanDescription = description.trim();

        if (cleanTitle !== task.title) data.title = cleanTitle;
        if (cleanDescription !== (task.description || "")) data.description = cleanDescription;
        if (deadline !== (task.due_date?.slice(0, 10) || "")) data.deadline = deadline || null;
        if (categoryId !== task.category_id) data.categoryId = categoryId;
        if (isCompleted !== task.is_completed) data.isCompleted = isCompleted;

        return data;
    }, [task, title, description, deadline, categoryId, isCompleted]);

    const hasUpdates = Object.keys(updates).length > 0;

    async function saveTask() {
        const cleanTitle = title.trim();

        if (!cleanTitle) {
            setTitleError("Task title is required.");
            return;
        }

        if (cleanTitle.length > 100) {
            setTitleError("Task title cannot exceed 100 characters.");
            return;
        }

        if (!hasUpdates || busy) return;

        try {
            setBusy("save");
            setRequestError("");
            await onSave(task.id, updates);
        } catch (error) {
            setRequestError(error instanceof Error ? error.message : "Could not save the task.");
        } finally {
            setBusy(null);
        }
    }

    async function deleteTask() {
        if (busy || !window.confirm(`Delete “${task.title}”?`)) return;

        try {
            setBusy("delete");
            setRequestError("");
            await onDelete(task.id);
        } catch (error) {
            setRequestError(error instanceof Error ? error.message : "Could not delete the task.");
            setBusy(null);
        }
    }

    return (
        <aside className="flex h-screen w-96 shrink-0 flex-col border-l border-slate-200 bg-white p-7 shadow-xl">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Task Details</h2>
                <button
                    type="button"
                    onClick={onClose}
                    disabled={busy !== null}
                    aria-label="Close task details"
                    title="Close task details"
                    className="rounded-lg p-2 text-2xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                >
                    ×
                </button>
            </div>

            <div className="mt-8 flex-1 space-y-6 overflow-y-auto pr-1">
                <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-500">Title</span>
                    <input
                        value={title}
                        maxLength={101}
                        onChange={(event) => {
                            setTitle(event.target.value);
                            setTitleError("");
                        }}
                        aria-invalid={Boolean(titleError)}
                        className={`w-full border-b pb-2 text-xl font-semibold outline-none ${titleError ? "border-red-400" : "border-slate-200 focus:border-blue-500"}`}
                    />
                    <div className="mt-1 flex justify-between gap-3 text-xs">
                        <span className="text-red-500">{titleError}</span>
                        <span className={title.trim().length > 100 ? "text-red-500" : "text-slate-400"}>{title.trim().length}/100</span>
                    </div>
                </label>

                <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-500">Description</span>
                    <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={5}
                        placeholder="Add description..."
                        className="w-full resize-none rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                    />
                </label>

                <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-500">Category</span>
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
                    <span className="mb-2 block text-sm font-medium text-slate-500">Due Date</span>
                    <input
                        type="date"
                        value={deadline}
                        onChange={(event) => setDeadline(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                    />
                </label>

                <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={(event) => setIsCompleted(event.target.checked)}
                        className="h-4 w-4"
                    />
                    Completed
                </label>

                {requestError && (
                    <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{requestError}</p>
                )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={deleteTask}
                    disabled={busy !== null}
                    className="rounded-xl border border-red-200 py-3 font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50"
                >
                    {busy === "delete" ? "Deleting..." : "Delete Task"}
                </button>
                <button
                    type="button"
                    onClick={saveTask}
                    disabled={busy !== null || !hasUpdates}
                    className="rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {busy === "save" ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </aside>
    );
}
