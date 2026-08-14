"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AddTask from "@/components/AddTask";
import Sidebar from "@/components/Sidebar";
import TaskDetails from "@/components/TaskDetails";
import TaskList from "@/components/TaskList";
import { getCurrentUser, logout } from "@/services/auth.service";
import { createCategory, deleteCategory, getCategories, updateCategory } from "@/services/category.service";
import { createTask, deleteTask, getTasks, TaskFilters, updateTask } from "@/services/task.service";
import { Category, CreateTaskData, Task, UpdateTaskData, User } from "@/types";

type Filter = "all" | "today" | "completed" | "pending";

function localDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [ready, setReady] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [filter, setFilter] = useState<Filter>("all");
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [date, setDate] = useState("");
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [pageError, setPageError] = useState("");

    useEffect(() => {
        let active = true;

        async function initialize() {
            await Promise.resolve();
            const token = localStorage.getItem("token");

            if (!token) {
                router.replace("/login");
                return;
            }

            if (active) {
                setUser(getCurrentUser());
                setReady(true);
            }
        }

        void initialize();
        return () => {
            active = false;
        };
    }, [router]);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [search]);

    useEffect(() => {
        if (!ready) return;

        let active = true;

        getCategories()
            .then((response) => {
                if (active) setCategories(response.data);
            })
            .catch((error) => {
                if (active) setPageError(error instanceof Error ? error.message : "Could not load categories.");
            });

        return () => {
            active = false;
        };
    }, [ready]);

    useEffect(() => {
        if (!ready) return;

        let active = true;
        const requestFilters: TaskFilters = {};

        if (debouncedSearch) {
            requestFilters.search = debouncedSearch;
        } else if (date) {
            requestFilters.date = date;
        } else if (selectedCategoryId !== null) {
            requestFilters.categoryId = selectedCategoryId;
        }

        queueMicrotask(() => {
            if (active) {
                setLoadingTasks(true);
                setPageError("");
            }
        });

        getTasks(requestFilters)
            .then((response) => {
                if (!active) return;
                setTasks(response.data);
                setSelectedTask((current) =>
                    current
                        ? response.data.find((task) => task.id === current.id) || null
                        : null
                );
            })
            .catch((error) => {
                if (active) setPageError(error instanceof Error ? error.message : "Could not load tasks.");
            })
            .finally(() => {
                if (active) setLoadingTasks(false);
            });

        return () => {
            active = false;
        };
    }, [ready, debouncedSearch, date, selectedCategoryId]);

    async function addTask(data: CreateTaskData) {
        const response = await createTask(data);
        setSearch("");
        setDebouncedSearch("");
        setDate("");
        setFilter("all");
        setSelectedCategoryId(null);
        setTasks((current) => [response.data, ...current]);
        setSelectedTask(response.data);
    }

    async function saveTask(taskId: number, updates: UpdateTaskData) {
        const response = await updateTask(taskId, updates);
        setTasks((current) => current.map((task) => task.id === taskId ? response.data : task));
        setSelectedTask(response.data);
    }

    async function removeTask(taskId: number) {
        await deleteTask(taskId);
        setTasks((current) => current.filter((task) => task.id !== taskId));
        setSelectedTask(null);
    }

    async function toggleTask(task: Task) {
        try {
            const response = await updateTask(task.id, { isCompleted: !task.is_completed });
            setTasks((current) => current.map((item) => item.id === task.id ? response.data : item));
            setSelectedTask((current) => current?.id === task.id ? response.data : current);
        } catch (error) {
            setPageError(error instanceof Error ? error.message : "Could not update the task.");
        }
    }

    async function addCategory(name: string) {
        const response = await createCategory(name);
        setCategories((current) => [response.data, ...current]);
    }

    async function renameCategory(categoryId: number, name: string) {
        const response = await updateCategory(categoryId, name);
        setCategories((current) => current.map((category) => category.id === categoryId ? response.data : category));
    }

    async function removeCategory(categoryId: number) {
        await deleteCategory(categoryId);
        setCategories((current) => current.filter((category) => category.id !== categoryId));
        setTasks((current) => current.filter((task) => task.category_id !== categoryId));
        setSelectedTask((current) => current?.category_id === categoryId ? null : current);
        setSelectedCategoryId((current) => current === categoryId ? null : current);
    }

    function selectFilter(nextFilter: Filter) {
        setFilter(nextFilter);
        setSelectedCategoryId(null);
        setDate(nextFilter === "today" ? localDateString() : "");
    }

    function selectCategory(categoryId: number | null) {
        setSelectedCategoryId(categoryId);
        setFilter("all");
        setDate("");
    }

    function changeDate(nextDate: string) {
        setDate(nextDate);
        setFilter("all");
        setSelectedCategoryId(null);
    }

    function handleLogout() {
        logout();
        router.replace("/login");
    }

    const visibleTasks = useMemo(() => {
        let result = tasks;

        // The backend currently accepts only one filter at a time. Keep search
        // server-side, then preserve any selected UI filter on that result.
        if (selectedCategoryId !== null) {
            result = result.filter((task) => task.category_id === selectedCategoryId);
        }

        if (date) {
            result = result.filter((task) => task.due_date?.slice(0, 10) === date);
        }

        if (filter === "completed") {
            result = result.filter((task) => task.is_completed);
        } else if (filter === "pending") {
            result = result.filter((task) => !task.is_completed);
        }

        return result;
    }, [tasks, filter, selectedCategoryId, date]);

    const heading = selectedCategoryId
        ? categories.find((category) => category.id === selectedCategoryId)?.name || "Category"
        : filter === "today"
            ? "Due Today"
        : filter === "all"
            ? date ? "Tasks by Date" : "All Tasks"
            : filter.charAt(0).toUpperCase() + filter.slice(1);

    if (!ready) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50">
                <p className="text-slate-500">Loading...</p>
            </main>
        );
    }

    return (
        <main className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
            <Sidebar
                user={user}
                categories={categories}
                currentFilter={filter}
                selectedCategoryId={selectedCategoryId}
                onFilterChange={selectFilter}
                onCategorySelect={selectCategory}
                onCreateCategory={addCategory}
                onUpdateCategory={renameCategory}
                onDeleteCategory={removeCategory}
                onLogout={handleLogout}
            />

            <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <header className="border-b border-slate-200 bg-white px-8 py-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">{heading}</h1>
                            <span className="rounded-lg bg-blue-50 px-3 py-1 font-semibold text-blue-600">
                                {visibleTasks.length}
                            </span>
                        </div>
                        <AddTask categories={categories} onAdd={addTask} />
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <label className="relative min-w-64 flex-1">
                            <span className="sr-only">Search tasks</span>
                            <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path d="m20 20-3.5-3.5" />
                            </svg>
                            <input
                                type="search"
                                value={search}
                                maxLength={100}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search title or description..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:bg-white"
                            />
                        </label>

                        <label>
                            <span className="sr-only">Filter tasks by due date</span>
                            <input
                                type="date"
                                value={date}
                                onChange={(event) => changeDate(event.target.value)}
                                title="Filter by due date"
                                className="rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-500 focus:bg-white"
                            />
                        </label>
                    </div>

                    {pageError && (
                        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{pageError}</p>
                    )}
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    {loadingTasks ? (
                        <p className="text-center text-slate-500">Loading tasks...</p>
                    ) : (
                        <TaskList
                            tasks={visibleTasks}
                            categories={categories}
                            selectedTask={selectedTask}
                            onSelect={setSelectedTask}
                            onToggle={toggleTask}
                        />
                    )}
                </div>
            </section>

            {selectedTask && (
                <TaskDetails
                    key={`${selectedTask.id}-${selectedTask.title}-${selectedTask.description}-${selectedTask.due_date}-${selectedTask.category_id}-${selectedTask.is_completed}`}
                    task={selectedTask}
                    categories={categories}
                    onSave={saveTask}
                    onDelete={removeTask}
                    onClose={() => setSelectedTask(null)}
                />
            )}
        </main>
    );
}
