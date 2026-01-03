import { Link } from "react-router-dom";

export default function ProjectCard({ project }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
      <h3 className="text-lg font-semibold text-slate-800 mb-2">
        {project.title}
      </h3>

      <p className="text-slate-500 text-sm mb-4">
        {project.description || "No description"}
      </p>

      <Link
        to={`/projects/${project._id}`}
        className="text-blue-600 text-sm font-medium hover:underline"
      >
        View details →
      </Link>
    </div>
  );
}
