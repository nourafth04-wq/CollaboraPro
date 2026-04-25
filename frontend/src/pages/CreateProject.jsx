import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import PageLayout from "../components/PageLayout";

export default function CreateProject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    await api.post("/projects", {
      name,
      description
    });

    navigate("/dashboard");
  };

  return (
    <>
      <Navbar />

      <PageLayout title="Créer un projet">
        <form
          onSubmit={handleSubmit}
          className="bg-white border rounded-xl p-6 shadow-sm max-w-xl"
        >
          <div className="mb-5">
            <label className="block text-sm font-medium mb-1">
              Nom du projet
            </label>
            <input
              className="w-full border p-2 rounded-lg"
              placeholder="Nom du projet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              className="w-full border p-2 rounded-lg"
              rows="4"
              placeholder="Description du projet"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
          >
            Créer le projet
          </button>
        </form>
      </PageLayout>
    </>
  );
}