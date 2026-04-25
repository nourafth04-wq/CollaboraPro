import axios from "../api/axios";

export default function SubTaskItem({ subtask, onRefresh }) {
  const toggleStatus = async () => {
    const newStatus = subtask.status === "todo" ? "done" : "todo";
    await axios.put(`/subtasks/${subtask._id}`, { status: newStatus });
    onRefresh();
  };

  const deleteSubtask = async () => {
    await axios.delete(`/subtasks/${subtask._id}`);
    onRefresh();
  };

  return (
    <div className="flex items-center justify-between border p-2 rounded">
      <span
        className={`text-sm ${
          subtask.status === "done" ? "line-through text-gray-500" : ""
        }`}
      >
        {subtask.title}
      </span>

      <div className="space-x-2">
        <button
          onClick={toggleStatus}
          className="text-xs px-2 py-1 border rounded"
        >
          {subtask.status === "todo" ? "Done" : "Undo"}
        </button>

        <button
          onClick={deleteSubtask}
          className="text-xs px-2 py-1 border rounded text-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}