import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchUrlById } from "../services/urlService";
import type { UrlItem } from "../types/url";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#4ade80", "#60a5fa"];

export default function UrlDetail() {
  const { id } = useParams<{ id: string }>();
  const [url, setUrl] = useState<UrlItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchUrlById(Number(id))
      .then((data) => setUrl(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!url) return <div className="p-4">URL not found</div>;

  const chartData = [
    { name: "Internal", value: url.internal_links || 0 },
    { name: "External", value: url.external_links || 0 },
  ];

  return (
    <div className="p-4 space-y-4">
      <Link to="/" className="text-blue-600 underline">
        ← Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold">Details for: {url.title || url.address}</h1>
      {/* Pie Chart of Internal vs. External links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Link Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* URL General Details */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Basic Info</h2>
          <ul className="space-y-1 text-sm">
            <li><strong>Status:</strong> {url.status}</li>
            <li><strong>HTML Version:</strong> {url.html_version || "Unknown"}</li>
            <li><strong>Headings:</strong> H1: {url.h1_count}, H2: {url.h2_count}</li>
            <li><strong>Has Login Form:</strong> {url.has_login_form ? "Yes" : "No"}</li>
            <li><strong>Broken Links:</strong> {url.broken_links}</li>
          </ul>
        </div>
      </div>
      {/* List of Broken Links with Status Code */}
      {url.broken_links_details && url.broken_links_details.length > 0 && (
        <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold mb-2">Broken Links</h2>
            <ul className="space-y-1 text-sm max-h-64 overflow-y-auto">
                {url.broken_links_details.map((link) => (
                <li key={link.id} className="flex justify-between">
                    <span className="truncate max-w-[75%]">{link.url}</span>
                    <span className="text-red-500 font-mono">{link.status_code}</span>
                </li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
}
