const prisma = require("../config/prisma");

const formatCategoryName = (name) => {
    return name
        .trim()
        .split(/\s+/)
        .map(
            (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1).toLowerCase()
        )
        .join(" ");
};

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.userId;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }

        const formattedName = formatCategoryName(name);

        const existingCategory = await prisma.categories.findFirst({
            where: {
                name: formattedName,
                user_id: userId,
            },
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category already exists",
            });
        }

        const category = await prisma.categories.create({
            data: {
                name: formattedName,
                user_id: userId,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
        });
    } catch (error) {
        console.error("Create category error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const getCategories = async (req, res) => {
    try {
        const userId = req.user.userId;

        const categories = await prisma.categories.findMany({
            where: {
                user_id: userId,
            },
            orderBy: {
                created_at: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            data: categories,
        });
    } catch (error) {
        console.error("Get categories error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const categoryId = Number(req.params.id);
        const { name } = req.body;
        const userId = req.user.userId;

        if (!Number.isInteger(categoryId) || categoryId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid category id",
            });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }

        const formattedName = formatCategoryName(name);

        const existingCategory = await prisma.categories.findFirst({
            where: {
                id: categoryId,
                user_id: userId,
            },
        });

        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        const duplicateCategory = await prisma.categories.findFirst({
            where: {
                name: formattedName,
                user_id: userId,
                id: {
                    not: categoryId,
                },
            },
        });

        if (duplicateCategory) {
            return res.status(409).json({
                success: false,
                message: "Category already exists",
            });
        }

        const updatedCategory = await prisma.categories.update({
            where: {
                id: categoryId,
            },
            data: {
                name: formattedName,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: updatedCategory,
        });
    } catch (error) {
        console.error("Update category error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const categoryId = Number(req.params.id);
        const userId = req.user.userId;

        if (!Number.isInteger(categoryId) || categoryId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid category id",
            });
        }

        const category = await prisma.categories.findFirst({
            where: {
                id: categoryId,
                user_id: userId,
            },
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        await prisma.categories.delete({
            where: {
                id: categoryId,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error) {
        console.error("Delete category error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
};