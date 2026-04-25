import { useEffect, useState, useCallback } from "react";
import axios from "../api/axios";
import CommentItem from "./CommentItem";

export default function CommentList({ taskId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");

  const loadComments = useCallback(async () => {
    const res = await axios.get(`/tasks/${taskId}/comments`);
    setComments(res.data);
  }, [taskId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const addComment = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    await axios.post(`/tasks/${taskId}/comments`, { content });
    setContent("");
    loadComments();
  };

  return (
    <div className="mt-3 space-y-2">
      <form onSubmit={addComment} className="flex gap-2">
        <input
          className="border p-1 flex-1 text-sm"
          placeholder="Add a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button className="text-xs px-3 py-1 bg-blue-500 text-white rounded">
          Send
        </button>
      </form>

      {comments.map((comment) => (
        <CommentItem key={comment._id} comment={comment} />
      ))}
    </div>
  );
}