import { Category, Task } from "@/types";

interface TaskItemProps {
    task: Task;
    categories: Category[];
    selected: boolean;
    onSelect: (task: Task) => void;
    onToggle: (task: Task) => void;
}

export default function TaskItem({
    task,
    categories,
    selected,
    onSelect,
    onToggle,
}: TaskItemProps) {
    const category = categories.find(
        (item) => item.id === task.category_id
    );

    return (
        <div
            onClick={() => onSelect(task)}
            className={`group flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${selected
                    ? "border-blue-200 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
        >
            <input
                type="checkbox"
                checked={task.is_completed}
                onChange={() => onToggle(task)}
                onClick={(event) => event.stopPropagation()}
                className="h-5 w-5"
            />

            <div className="min-w-0 flex-1">
                <h3
                    className={`font-semibold ${task.is_completed
                            ? "text-slate-400 line-through"
                            : "text-slate-800"
                        }`}
                >
                    {task.title}
                </h3>

                <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
                    {category && (
                        <span>{category.name}</span>
                    )}

                    {task.due_date && (
                        <span>
                            {new Date(
                                task.due_date
                            ).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>

            <span className="text-xl text-slate-400">
                ›
            </span>
        </div>
    );
}