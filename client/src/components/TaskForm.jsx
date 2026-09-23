import { useState } from "react";

export default function TaskForm({ onAdd, isSubmitting }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("General");
  const [dueDate, setDueDate] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      setError("Task title cannot be empty.");
      return;
    }

    if (trimmed.length > 150) {
      setError("Task title cannot exceed 150 characters.");
      return;
    }

    onAdd({
      title: trimmed,
      priority,
      category,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    });

    setTitle("");
    setDueDate("");
    setError("");
  };

  const priorityColors = {
    low: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    high: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/85 dark:bg-slate-800/85 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-700/80 mb-6 transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor="task-input"
          className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5"
        >
          <span>Create New Task</span>
          <span className="hidden sm:inline text-[10px] text-slate-400 dark:text-slate-500 font-normal">
            (Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono text-[10px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">N</kbd> to focus)
          </span>
        </label>

        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>{showOptions ? "Fewer options" : "More options"}</span>
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${showOptions ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            id="task-input"
            type="text"
            value={title}
            maxLength={150}
            disabled={isSubmitting}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError("");
            }}
            placeholder="What needs to be done today?"
            className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-all outline-none bg-slate-50/70 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
              error
                ? "border-rose-400 dark:border-rose-500 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-950"
                : "border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/60"
            }`}
          />
          {title.length > 0 && (
            <span className="absolute right-3 top-2.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 pointer-events-none">
              {title.length}/150
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.98] text-white font-medium px-5 py-2.5 text-sm transition-all shadow-sm hover:shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 4v16m8-8H4"
              />
            </svg>
          )}
          <span>Add Task</span>
        </button>
      </div>

      {/* Expandable Options: Priority, Category, Due Date */}
      {showOptions && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-slide-down">
          {/* Priority Selection */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Priority
            </span>
            <div className="flex items-center gap-1.5">
              {["low", "medium", "high"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-1 px-2 text-xs font-semibold rounded-lg border capitalize transition-all cursor-pointer ${
                    priority === p
                      ? `${priorityColors[p]} ring-2 ring-indigo-400/30 font-bold`
                      : "bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label
              htmlFor="task-category"
              className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5"
            >
              Category
            </label>
            <select
              id="task-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 cursor-pointer"
            >
              <option value="General">General</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Study">Study</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          {/* Due Date Picker */}
          <div>
            <label
              htmlFor="task-duedate"
              className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5"
            >
              Due Date (Optional)
            </label>
            <input
              id="task-duedate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 cursor-pointer"
            />
          </div>
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400 mt-2.5 font-medium animate-fade-in">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </form>
  );
}
