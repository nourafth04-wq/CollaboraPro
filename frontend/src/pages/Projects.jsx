import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import PageLayout from "../components/PageLayout";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  const loadProjects = async () => {
    const res = await api.get("/projects");
    setProjects(res.data);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <>
      <Navbar />

      <PageLayout title="Projets">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => navigate("/projects/new")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl"
          >
            + Nouveau projet
          </button>
        </div>

        {projects.length === 0 ? (
          <p>Aucun projet disponible.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="bg-white border rounded-xl p-6 shadow-sm cursor-pointer hover:bg-gray-50 transition"
              >
                <h2 className="text-xl font-bold mb-2">{project.name}</h2>
                <p className="text-gray-600">
                  {project.description || "Aucune description"}
                </p>
              </div>
            ))}
          </div>
        )}
      </PageLayout>
    </>
  );
}