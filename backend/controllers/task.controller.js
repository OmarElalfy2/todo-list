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

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Title is required",
            });
        }

        let parsedCategoryId = null;

        if (categoryId !== undefined && categoryId !== null) {
            parsedCategoryId = Number(categoryId);

            if (
                !Number.isInteger(parsedCategoryId) ||
                parsedCategoryId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid category id",
                });
            }

            const category = await prisma.categories.findFirst({
                where: {
                    id: parsedCategoryId,
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

        let dueDate = null;

        if (deadline) {
            dueDate = new Date(deadline);

            if (Number.isNaN(dueDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid deadline",
                });
            }
        }

        const task = await prisma.tasks.create({
            data: {
                title: title.trim(),
                description: description?.trim() || null,
                due_date: dueDate,
                user_id: userId,
                category_id: parsedCategoryId,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: task,
        });
    } catch (error) {
        console.error("Create task error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const getTasks = async (req, res) => {
    try {
        const userId = req.user.userId;

        const {
            search,
            date,
            completed,
            categoryId,
        } = req.query;

        const where = {
            user_id: userId,
        }

        if (search) {
            where.OR = [
                {
                    title: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                {
                    description: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        else if (completed !== undefined) {
            where.is_completed = completed;
        }
        else if (categoryId !== undefined) {
            where.category_id = Number(categoryId);
        }
        else if (date !== undefined) {
            const startDate = new Date(
                `${date}T00:00:00.000Z`
            );
            const nextDate = new Date(startDate);

            nextDate.setUTCDate(
                nextDate.getUTCDate() + 1
            );

            where.due_date = {
                gte: startDate,
                lt: nextDate,
            };

        }

        const tasks = await prisma.tasks.findMany({
            where,
            orderBy: {
                created_at: "desc",
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

const updateTask = async (req, res) => {
    try {
        const taskId = Number(req.params.id);
        const userId = req.user.userId;

        const {
            title,
            description,
            deadline,
            categoryId,
            isCompleted,
        } = req.body;

        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid task id",
            });
        }

        const task = await prisma.tasks.findFirst({
            where: {
                id: taskId,
                user_id: userId,
            },
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        if (
            title === undefined &&
            description === undefined &&
            deadline === undefined &&
            categoryId === undefined &&
            isCompleted === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "No fields provided for update",
            });
        }

        const updateData = {};

        if (title !== undefined) {
            if (!title || !title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Title cannot be empty",
                });
            }

            updateData.title = title.trim();
        }

        if (description !== undefined) {
            updateData.description =
                description?.trim() || null;
        }

        if (deadline !== undefined) {
            if (!deadline) {
                updateData.due_date = null;
            } else {
                const dueDate = new Date(deadline);

                if (Number.isNaN(dueDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid deadline",
                    });
                }

                updateData.due_date = dueDate;
            }
        }

        if (categoryId !== undefined) {
            if (categoryId === null || categoryId === "") {
                updateData.category_id = null;
            } else {
                const parsedCategoryId = Number(categoryId);

                if (
                    !Number.isInteger(parsedCategoryId) ||
                    parsedCategoryId <= 0
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid category id",
                    });
                }

                const category =
                    await prisma.categories.findFirst({
                        where: {
                            id: parsedCategoryId,
                            user_id: userId,
                        },
                    });

                if (!category) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid category",
                    });
                }

                updateData.category_id = parsedCategoryId;
            }
        }

        if (isCompleted !== undefined) {
            if (typeof isCompleted !== "boolean") {
                return res.status(400).json({
                    success: false,
                    message: "isCompleted must be boolean",
                });
            }

            updateData.is_completed = isCompleted;
        }

        const updatedTask = await prisma.tasks.update({
            where: {
                id: taskId,
            },
            data: updateData,
        });

        return res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: updatedTask,
        });
    } catch (error) {
        console.error("Update task error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

const deleteTask = async (req, res) => {
    try {
        const taskId = Number(req.params.id);
        const userId = req.user.userId;

        if (!Number.isInteger(taskId) || taskId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid task id",
            });
        }

        const task = await prisma.tasks.findFirst({
            where: {
                id: taskId,
                user_id: userId,
            },
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        await prisma.tasks.delete({
            where: {
                id: taskId,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Task deleted successfully",
        });
    } catch (error) {
        console.error("Delete task error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
};