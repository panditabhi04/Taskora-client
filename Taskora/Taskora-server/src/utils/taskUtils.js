export const isTaskOverdue = (task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    return (
        today > dueDate &&
        !["Completed", "Cancelled"].includes(task.status)
    );
};