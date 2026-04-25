import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import PageLayout from "../components/PageLayout";
import TaskItem from "../components/TaskItem";
import DocumentList from "../components/DocumentList";

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const loadData = useCallback(async () => {
    const projectRes = await api.get(`/projects/${id}`);
    const tasksRes = await api.get(`/projects/${id}/tasks`);
    setProject(projectRes.data);
    setTasks(tasksRes.data);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const createTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    await api.post(`/projects/${id}/tasks`, {
      title: newTaskTitle
    });

    setNewTaskTitle("");
    loadData();
  };

  if (!project) {
    return (
      <>
        <Navbar />
        <PageLayout title="Projet">
          <p>Chargement…</p>
        </PageLayout>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <PageLayout title={project.name}>
        <p className="text-gray-600 mb-6">
          {project.description || "Aucune description"}
        </p>

        {/* ✅ Create task */}
        <form onSubmit={createTask} className="flex gap-2 mb-8">
          <input
            className="border p-2 rounded-lg flex-1"
            placeholder="Nouvelle tâche"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <button className="bg-blue-600 text-white px-4 rounded-xl">
            Ajouter
          </button>
        </form>

        {/* ✅ Task list */}
        <div className="space-y-4 mb-12">
          {tasks.length === 0 ? (
            <p>Aucune tâche pour ce projet.</p>
          ) : (
            tasks.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                onUpdate={loadData}
              />
            ))
          )}
        </div>

        {/* ✅ Documents */}
        <DocumentList projectId={id} />
      </PageLayout>
    </>
  );
}