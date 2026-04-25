export default function DocumentItem({ document }) {
  const downloadUrl = `http://localhost:5000/uploads/${document.filename}`;

  return (
    <div className="border p-3 rounded flex justify-between items-center">
      <div>
        <p className="font-medium">{document.name}</p>
        <p className="text-xs text-gray-500">
          Uploaded by {document.uploadedBy?.email}
        </p>
      </div>

      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-600 underline"
      >
        Download
      </a>
    </div>
  );
}