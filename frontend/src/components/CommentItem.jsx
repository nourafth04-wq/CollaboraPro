export default function CommentItem({ comment }) {
  return (
    <div className="border rounded p-2 text-sm bg-gray-50">
      <p className="mb-1">{comment.content}</p>
      <span className="text-xs text-gray-500">
        {comment.author?.email}
      </span>
    </div>
  );
}