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

export function getTasks() {
    return apiRequest<TasksResponse>("/tasks");
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