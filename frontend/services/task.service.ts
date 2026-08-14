import {
    CreateTaskData,
    Task,
    UpdateTaskData,
} from "@/types";
import { apiRequest } from "./api";

interface TasksResponse {
    success: boolean;
    message: string;
    data: Task[];
}

interface TaskResponse {
    success: boolean;
    message: string;
    data: Task;
}

export interface TaskFilters {
    search?: string;
    date?: string;
    completed?: boolean;
    categoryId?: number;
}

export function getTasks(filters: TaskFilters = {}) {
    const params = new URLSearchParams();

    if (filters.search) {
        params.set("search", filters.search);
    } else if (filters.completed !== undefined) {
        params.set("completed", String(filters.completed));
    } else if (filters.categoryId !== undefined) {
        params.set("categoryId", String(filters.categoryId));
    } else if (filters.date) {
        params.set("date", filters.date);
    }

    const query = params.toString();

    return apiRequest<TasksResponse>(
        `/tasks${query ? `?${query}` : ""}`
    );
}

export function createTask(data: CreateTaskData) {
    return apiRequest<TaskResponse>("/tasks", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function updateTask(
    taskId: number,
    data: UpdateTaskData
) {
    return apiRequest<TaskResponse>(`/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export function deleteTask(taskId: number) {
    return apiRequest<{
        success: boolean;
        message: string;
    }>(`/tasks/${taskId}`, {
        method: "DELETE",
    });
}
