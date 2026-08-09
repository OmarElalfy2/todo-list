import { Category } from "@/types";
import { apiRequest } from "./api";

interface CategoriesResponse {
    success: boolean;
    message: string;
    data: Category[];
}

interface CategoryResponse {
    success: boolean;
    message: string;
    data: Category;
}

export function getCategories() {
    return apiRequest<CategoriesResponse>("/categories");
}

export function createCategory(name: string) {
    return apiRequest<CategoryResponse>("/categories", {
        method: "POST",
        body: JSON.stringify({ name }),
    });
}

export function updateCategory(
    categoryId: number,
    name: string
) {
    return apiRequest<CategoryResponse>(
        `/categories/${categoryId}`,
        {
            method: "PUT",
            body: JSON.stringify({ name }),
        }
    );
}

export function deleteCategory(categoryId: number) {
    return apiRequest<{
        success: boolean;
        message: string;
    }>(`/categories/${categoryId}`, {
        method: "DELETE",
    });
}