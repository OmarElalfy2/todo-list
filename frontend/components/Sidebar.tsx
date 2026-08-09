"use client";

import { Category, User } from "@/types";
import { useState, useRef } from "react";

type Filter =
    | "all"
    | "today"
    | "completed"
    | "pending";

interface SidebarProps {
    user: User | null;
    categories: Category[];
    currentFilter: Filter;
    selectedCategoryId: number | null;

    onFilterChange: (filter: Filter) => void;
    onCategorySelect: (
        categoryId: number | null
    ) => void;

    onCreateCategory: (
        name: string
    ) => Promise<void>;

    onUpdateCategory: (
        categoryId: number,
        name: string
    ) => Promise<void>;

    onDeleteCategory: (
        categoryId: number
    ) => Promise<void>;

    onLogout: () => void;
}

export default function Sidebar({
    user,
    categories,
    currentFilter,
    selectedCategoryId,
    onFilterChange,
    onCategorySelect,
    onCreateCategory,
    onUpdateCategory,
    onDeleteCategory,
    onLogout,
}: SidebarProps) {
    const [showCategoryInput, setShowCategoryInput] =
        useState(false);

    const [categoryName, setCategoryName] =
        useState("");

    // Which category is currently being renamed
    const [editingId, setEditingId] =
        useState<number | null>(null);

    const [editingName, setEditingName] =
        useState("");

    const [busyId, setBusyId] =
        useState<number | null>(null);

    const editInputRef = useRef<HTMLInputElement>(null);

    async function handleCreateCategory() {
        const name = categoryName.trim();

        if (!name) {
            return;
        }

        await onCreateCategory(name);

        setCategoryName("");
        setShowCategoryInput(false);
    }

    function startEditing(category: Category) {
        setEditingId(category.id);
        setEditingName(category.name);
        // Focus will happen via autoFocus on the input
    }

    function cancelEditing() {
        setEditingId(null);
        setEditingName("");
    }

    async function commitEditing(categoryId: number) {
        const name = editingName.trim();

        if (!name || busyId !== null) return;

        // No change → just cancel
        const original = categories.find(
            (c) => c.id === categoryId
        );
        if (original?.name === name) {
            cancelEditing();
            return;
        }

        setBusyId(categoryId);
        try {
            await onUpdateCategory(categoryId, name);
        } finally {
            setBusyId(null);
        }
        cancelEditing();
    }

    async function handleDelete(
        e: React.MouseEvent,
        categoryId: number
    ) {
        e.stopPropagation();
        if (busyId !== null) return;

        setBusyId(categoryId);
        try {
            await onDeleteCategory(categoryId);
        } finally {
            setBusyId(null);
        }
    }

    return (
        <aside className="flex h-screen w-72 flex-col border-r border-slate-200 bg-white p-6">
            <h1 className="mb-8 text-2xl font-bold">
                <span className="text-blue-600">✓</span>{" "}
                TodoList
            </h1>

            {user && (
                <div className="mb-8 rounded-2xl border border-slate-200 p-4">
                    <p className="font-semibold">
                        {user.firstName} {user.lastName}
                    </p>

                    <p className="mt-1 truncate text-sm text-slate-500">
                        {user.email}
                    </p>
                </div>
            )}

            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                Tasks
            </p>

            <nav className="space-y-1">
                {[
                    ["all", "All Tasks"],
                    ["today", "Today"],
                    ["completed", "Completed"],
                    ["pending", "Pending"],
                ].map(([value, label]) => (
                    <button
                        key={value}
                        onClick={() => {
                            onCategorySelect(null);
                            onFilterChange(value as Filter);
                        }}
                        className={`w-full rounded-xl px-4 py-3 text-left ${currentFilter === value &&
                                selectedCategoryId === null
                                ? "bg-blue-50 font-semibold text-blue-600"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </nav>

            <div className="my-6 border-t border-slate-100" />

            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                Categories
            </p>

            <div className="space-y-1">
                {categories.map((category) =>
                    editingId === category.id ? (
                        /* ── Inline edit row ── */
                        <div
                            key={category.id}
                            className="flex items-center gap-1 rounded-xl px-2 py-1"
                        >
                            <input
                                autoFocus
                                ref={editInputRef}
                                value={editingName}
                                onChange={(e) =>
                                    setEditingName(
                                        e.target.value
                                    )
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        commitEditing(
                                            category.id
                                        );
                                    } else if (
                                        e.key === "Escape"
                                    ) {
                                        cancelEditing();
                                    }
                                }}
                                onBlur={() =>
                                    commitEditing(
                                        category.id
                                    )
                                }
                                disabled={
                                    busyId === category.id
                                }
                                className="min-w-0 flex-1 rounded-lg border border-blue-400 bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
                            />

                            {/* Cancel button */}
                            <button
                                onMouseDown={(e) => {
                                    // prevent blur from firing first
                                    e.preventDefault();
                                    cancelEditing();
                                }}
                                className="shrink-0 rounded p-1 text-slate-400 hover:text-slate-600"
                                title="Cancel"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        /* ── Normal category row ── */
                        <div
                            key={category.id}
                            className={`group flex items-center rounded-xl transition-colors ${selectedCategoryId === category.id
                                    ? "bg-blue-50"
                                    : "hover:bg-slate-50"
                                }`}
                        >
                            {/* Category name – click to filter */}
                            <button
                                onClick={() =>
                                    onCategorySelect(
                                        category.id
                                    )
                                }
                                className={`min-w-0 flex-1 truncate px-4 py-3 text-left text-sm ${selectedCategoryId ===
                                        category.id
                                        ? "font-semibold text-blue-600"
                                        : "text-slate-600"
                                    }`}
                            >
                                {category.name}
                            </button>

                            {/* Action buttons – visible on hover */}
                            <div className="flex shrink-0 items-center gap-0.5 pr-2 opacity-0 transition-opacity group-hover:opacity-100">
                                {/* Edit / rename */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        startEditing(category);
                                    }}
                                    disabled={
                                        busyId === category.id
                                    }
                                    title="Rename category"
                                    className="rounded p-1 text-slate-400 hover:text-blue-500 disabled:opacity-40"
                                >
                                    {/* pencil icon */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3.5 w-3.5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </button>

                                {/* Delete */}
                                <button
                                    onClick={(e) =>
                                        handleDelete(
                                            e,
                                            category.id
                                        )
                                    }
                                    disabled={
                                        busyId === category.id
                                    }
                                    title="Delete category"
                                    className="rounded p-1 text-slate-400 hover:text-red-500 disabled:opacity-40"
                                >
                                    {busyId === category.id ? (
                                        <svg
                                            className="h-3.5 w-3.5 animate-spin"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v8H4z"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-3.5 w-3.5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    )
                )}
            </div>

            {showCategoryInput ? (
                <div className="mt-3 space-y-2">
                    <input
                        value={categoryName}
                        onChange={(e) =>
                            setCategoryName(e.target.value)
                        }
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleCreateCategory();
                            }
                        }}
                        autoFocus
                        placeholder="Category name"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
                    />

                    <button
                        onClick={handleCreateCategory}
                        className="text-sm font-medium text-blue-600"
                    >
                        Save Category
                    </button>
                </div>
            ) : (
                <button
                    onClick={() =>
                        setShowCategoryInput(true)
                    }
                    className="mt-3 text-sm font-medium text-blue-600"
                >
                    + Add Category
                </button>
            )}

            <div className="mt-auto">
                <button
                    onClick={onLogout}
                    className="w-full rounded-xl px-4 py-3 text-left text-red-500 hover:bg-red-50"
                >
                    Log out
                </button>
            </div>
        </aside>
    );
}