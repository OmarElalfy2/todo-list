import { Category, Task } from "@/types";
import TaskItem from "./TaskItem";

interface TaskListProps {
    tasks: Task[];
    categories: Category[];
    selectedTask: Task | null;
    onSelect: (task: Task) => void;
    onToggle: (task: Task) => void;
}

export default function TaskList({
    tasks,
    categories,
    selectedTask,
    onSelect,
    onToggle,
}: TaskListProps) {
    if (tasks.length === 0) {
        return (
            <div className="mt-10 text-center text-slate-400">
                No tasks yet.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    categories={categories}
                    selected={
                        selectedTask?.id === task.id
                    }
                    onSelect={onSelect}
                    onToggle={onToggle}
                />
            ))}
        </div>
    );
}