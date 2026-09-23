import { useState } from "react";

export default function TaskItem({
  task,
  onToggle,
  onDelete,
  onUpdateTitle,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState(task.priority || "medium");
  const [editCategory, setEditCategory] = useState(task.category || "General");
  const [editError, setEditError] = useState("");

  const taskId = task.id || task._id;
  const isCompleted = task.status === "completed";

  const handleStartEdit = () => {
    setEditTitle(task.title);
    setEditPriority(task.priority || "medium");
    setEditCategory(task.category || "General");
    setIsEditing(true);
    setEditError("");
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const trimmed = editTitle.trim();

    if (!trimmed) {
      setEditError("Task title cannot be empty");
      return;
    }

    if (trimmed.length > 150) {
      setEditError("Task title cannot exceed 150 characters");
      return;
    }

    if (onUpdateTitle) {
      // Pass updated title, priority, category
      onUpdateTitle(taskId, trimmed, {
        priority: editPriority,
        category: editCategory,
      });
    }

    setIsEditing(false);
    setEditError("");
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditPriority(task.priority || "medium");
    setEditCategory(task.category || "General");
    setIsEditing(false);
    setEditError("");
  };

  const formatTaskDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    } catch {
      return "";
    }
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    try {
      const due = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDateZero = new Date(dateString);
      dueDateZero.setHours(0, 0, 0, 0);

      const isOverdue = !isCompleted && dueDateZero < today;
      const formatted = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(due);

      return { formatted, isOverdue };
    } catch {
      return null;
    }
  };

  const priorityStyles = {
    low: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    high: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
  };

  const dueInfo = formatDueDate(task.dueDate);

  return (
    <li
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-all duration-200 ${
        isCompleted
          ? "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800 text-slate-400 dark:text-slate-500"
          : "bg-white dark:bg-slate-800/90 border-slate-200/90 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-sm hover:shadow"
      }`}
    >
      {isEditing ? (
        <form
          onSubmit={handleSaveEdit}
          className="flex flex-col gap-2.5 w-full animate-fadeIn"
        >
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={editTitle}
              maxLength={150}
              onChange={(e) => {
                setEditTitle(e.target.value);
                if (editError) setEditError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") handleCancelEdit();
              }}
              className="w-full text-sm font-medium px-3.5 py-2 rounded-xl border border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            />
            <span className="absolute right-3 top-2 text-[11px] font-medium text-slate-400">
              {editTitle.length}/150
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Priority in edit */}
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>

              {/* Category in edit */}
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="General">General</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Study">Study</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 self-end">
              <button
                type="submit"
                className="px-3.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>

          {editError && (
            <span className="text-xs text-rose-500 font-medium">
              {editError}
            </span>
          )}
        </form>
      ) : (
        <>
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Custom Checkbox */}
            <button
              type="button"
              role="checkbox"
              aria-checked={isCompleted}
              onClick={() => onToggle(taskId, task.status)}
              className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                isCompleted
                  ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                  : "border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-800"
              }`}
              title={isCompleted ? "Mark as pending" : "Mark as completed"}
            >
              {isCompleted && (
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p
                onClick={() => onToggle(taskId, task.status)}
                className={`text-sm font-medium select-none cursor-pointer break-words transition-all ${
                  isCompleted
                    ? "line-through text-slate-400 dark:text-slate-500"
                    : "text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400"
                }`}
              >
                {task.title}
              </p>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {/* Status Badge */}
                <span
                  className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isCompleted
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                  }`}
                >
                  {isCompleted ? "Completed" : "Pending"}
                </span>

                {/* Priority Badge */}
                {task.priority && (
                  <span
                    className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${
                      priorityStyles[task.priority] || priorityStyles.medium
                    }`}
                  >
                    {task.priority}
                  </span>
                )}

                {/* Category Badge */}
                {task.category && task.category !== "General" && (
                  <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                    {task.category}
                  </span>
                )}

                {/* Due Date Badge */}
                {dueInfo && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      dueInfo.isOverdue
                        ? "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                        : "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800"
                    }`}
                  >
                    <svg
                      className="w-2.5 h-2.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>
                      {dueInfo.isOverdue ? `Overdue: ${dueInfo.formatted}` : `Due: ${dueInfo.formatted}`}
                    </span>
                  </span>
                )}

                {/* Created Timestamp */}
                {task.createdAt && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {formatTaskDate(task.createdAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
            {/* Edit Button */}
            {!isCompleted && (
              <button
                type="button"
                onClick={handleStartEdit}
                className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
                title="Edit task"
                aria-label="Edit task"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            )}

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => onDelete(taskId)}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Delete task"
              aria-label="Delete task"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </>
      )}
    </li>
  );
}
