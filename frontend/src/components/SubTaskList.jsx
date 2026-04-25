import { useEffect, useState, useCallback } from "react";
import axios from "../api/axios";
import SubTaskItem from "./SubTaskItem";

export default function SubTaskList({ taskId }) {
  const [subtasks, setSubtasks] = useState([]);
  const [title, setTitle] = useState("");

  const loadSubtasks = useCallback(async () => {
    const res = await axios.get(`/tasks/${taskId}/subtasks`);
    setSubtasks(res.data);
  }, [taskId]);

  useEffect(() => {
    loadSubtasks();
  }, [loadSubtasks]);

  const createSubtask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    await axios.post(`/tasks/${taskId}/subtasks`, { title });
    setTitle("");
    loadSubtasks();
  };

  return (
    <div className="mt-3 space-y-2">
      <form onSubmit={createSubtask} className="flex gap-2">
        <input
          className="border p-1 flex-1 text-sm"
          placeholder="New subtask"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="text-xs px-2 py-1 bg-gray-200 rounded">
          Add
        </button>
      </form>

      {subtasks.map((st) => (
        <SubTaskItem key={st._id} subtask={st} onRefresh={loadSubtasks} />
      ))}
    </div>
  );
}