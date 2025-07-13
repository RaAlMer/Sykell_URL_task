import { useEffect, useState } from "react";
import type { UrlItem } from "../types/url";
import { fetchUrls } from "../services/urlService";
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

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">URL Dashboard</h1>
      <AddUrlForm onSuccess={loadUrls} />

      <UrlTable urls={urls} onSelectChange={setSelectedIds} />
    </div>
  );
}
