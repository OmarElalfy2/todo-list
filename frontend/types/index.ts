export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

export interface Category {
    id: number;
    name: string;
    user_id: number;
    created_at: string;
}

export interface Task {
    id: number;
    title: string;
    description: string | null;
    due_date: string | null;
    is_completed: boolean;
    user_id: number;
    category_id: number | null;
    created_at: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    token: string;
    data: User;
}

export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface CreateTaskData {
    title: string;
    description?: string;
    deadline?: string;
    categoryId?: number | null;
}

export interface UpdateTaskData {
    title?: string;
    description?: string;
    deadline?: string | null;
    categoryId?: number | null;
    isCompleted?: boolean;
}