import { useEffect, useState } from "react";
import type { UrlItem } from "../types/url";
import { fetchUrls } from "../services/urlService";
import AddUrlForm from "../components/AddUrlForm";

export default function Dashboard() {
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUrls = () => {
    setLoading(true);
    fetchUrls()
      .then((data) => setUrls(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUrls();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">URL Dashboard</h1>
      <AddUrlForm onSuccess={loadUrls} />

      <table className="w-full table-auto border">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">HTML Version</th>
            <th className="p-2 border"># Internal Links</th>
            <th className="p-2 border"># External Links</th>
            <th className="p-2 border">Broken Links</th>
          </tr>
        </thead>
        <tbody>
          {urls.map((url) => (
            <tr key={url.id} className="border-t">
              <td className="p-2 border">{url.title || "(No title)"}</td>
              <td className="p-2 border capitalize">{url.status}</td>
              <td className="p-2 border">{url.html_version}</td>
              <td className="p-2 border">{url.internal_links}</td>
              <td className="p-2 border">{url.external_links}</td>
              <td className="p-2 border">{url.broken_links}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
