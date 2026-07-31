const prisma = require("../config/prisma");
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            deadline,
            categoryId,
        } = req.body;

        const userId = req.user.userId;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Title is required",
            });
        }
        if (categoryId) {
            const category = await prisma.categories.findFirst({
                where: {
                    id: categoryId,
                    user_id: userId,
                },
            });

            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category",
                });
            }
        }
        const task = await prisma.tasks.create({
            data: {
                title,
                description: description || null,
                due_date: deadline ? new Date(deadline) : null,
                user_id: userId,
                category_id: categoryId || null,
            },
        });
        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: task,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
const getTasks = async (req, res) => {
    try {
        const userId = req.user.userId;

        const tasks = await prisma.tasks.findMany({
            where: {
                user_id: userId,
            },
            include: {
                category: true,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Tasks fetched successfully",
            data: tasks,
        });

    } catch (error) {
        console.error("Get tasks error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


module.exports = {
    createTask,
    getTasks,
};