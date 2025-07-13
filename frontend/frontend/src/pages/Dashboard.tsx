import { useEffect, useState } from "react";
import type { UrlItem } from "../types/url";
import { fetchUrls, deleteUrl, rerunUrl } from "../services/urlService";
import AddUrlForm from "../components/AddUrlForm";
import UrlTable from "../components/UrlTable";

export default function Dashboard() {
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const loadUrls = () => {
    setLoading(true);
    fetchUrls()
      .then((data) => setUrls(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUrls();
  }, []);

  const handleDeleteSelected = async () => {
    if (!confirm("Are you sure you want to delete the selected URLs?")) return;
    try {
      await Promise.all(selectedIds.map((id) => deleteUrl(id)));
      setSelectedIds([]);
      loadUrls();
    } catch (err) {
      console.error("Failed to delete some URLs:", err);
    }
  };

  const handleRerunSelected = async () => {
    try {
      await Promise.all(selectedIds.map((id) => rerunUrl(id)));
      setSelectedIds([]);
      loadUrls();
    } catch (err) {
      console.error("Failed to rerun some URLs:", err);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">URL Dashboard</h1>
      <AddUrlForm onSuccess={loadUrls} />
      <UrlTable urls={urls} onSelectChange={setSelectedIds} />
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between mb-4 p-2 bg-gray-100 border rounded">
            <div className="text-sm text-gray-700">
            {selectedIds.length} selected
            </div>
            <div className="space-x-2">
            <button
                onClick={handleDeleteSelected}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
                Delete
            </button>
            <button
                onClick={handleRerunSelected}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
                Rerun
            </button>
            </div>
        </div>
      )}
    </div>
  );
}
