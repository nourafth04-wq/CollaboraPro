import axios from "../api/axios";
import SubTaskList from "./SubTaskList";
import CommentList from "./CommentList";

export default function TaskItem({ task, onUpdate }) {
  const updateStatus = async (newStatus) => {
    await axios.put(`/tasks/${task._id}`, { status: newStatus });
    onUpdate();
  };

  return (
    <div className="border p-3 rounded space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">{task.title}</h3>
          <p className="text-sm text-gray-500">Status: {task.status}</p>
        </div>

        <div className="space-x-2">
          <button
            onClick={() => updateStatus("todo")}
            className="text-xs px-2 py-1 border rounded"
          >
            Todo
          </button>
          <button
            onClick={() => updateStatus("in_progress")}
            className="text-xs px-2 py-1 border rounded"
          >
            Doing
          </button>
          <button
            onClick={() => updateStatus("done")}
            className="text-xs px-2 py-1 border rounded"
          >
            Done
          </button>
        </div>
      </div>

      {/* ✅ Subtasks */}
      <SubTaskList taskId={task._id} />

      {/* ✅ Comments */}
      <CommentList taskId={task._id} />
    </div>
  );
}