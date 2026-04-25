import { useEffect, useState, useCallback } from "react";
import axios from "../api/axios";
import DocumentItem from "./DocumentItem";

export default function DocumentList({ projectId }) {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);

  const loadDocuments = useCallback(async () => {
    const res = await axios.get(`/projects/${projectId}/documents`);
    setDocuments(res.data);
  }, [projectId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const uploadDocument = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    await axios.post(`/projects/${projectId}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    setFile(null);
    loadDocuments();
  };

  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-xl font-semibold">Documents</h2>

      <form onSubmit={uploadDocument} className="flex gap-2">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="border p-1 flex-1"
        />
        <button className="bg-green-600 text-white px-3 rounded">
          Upload
        </button>
      </form>

      <div className="space-y-2">
        {documents.map((doc) => (
          <DocumentItem key={doc._id} document={doc} />
        ))}
      </div>
    </div>
  );
}