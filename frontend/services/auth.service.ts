import { apiRequest } from "./api";
import {
    LoginData,
    LoginResponse,
    RegisterData,
    User,
} from "@/types";

interface RegisterResponse {
    success: boolean;
    message: string;
    data: User;
}

export function registerUser(data: RegisterData) {
    return apiRequest<RegisterResponse>(
        "/users/register",
        {
            method: "POST",
            body: JSON.stringify(data),
        },
        false
    );
}

export function loginUser(data: LoginData) {
    return apiRequest<LoginResponse>(
        "/users/login",
        {
            method: "POST",
            body: JSON.stringify(data),
        },
        false
    );
}

export function saveAuth(token: string, user: User) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
}

export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

export function getCurrentUser(): User | null {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
        return null;
    }

    return JSON.parse(storedUser);
}