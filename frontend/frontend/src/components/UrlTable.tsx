import { useState, useMemo } from "react";
import type { UrlItem } from "../types/url";
import { useNavigate } from "react-router-dom";

type Props = {
  urls: UrlItem[];
  onSelectChange?: (selected: number[]) => void;
};

export default function UrlTable({ urls, onSelectChange }: Props) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<keyof UrlItem | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);

  const itemsPerPage = 5;

  const toggleSort = (key: keyof UrlItem) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const filtered = useMemo(() => {
    return urls.filter(
      (url) =>
        url.address?.toLowerCase().includes(search.toLowerCase()) ||
        url.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [urls, search]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string")
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      if (typeof aVal === "number" && typeof bVal === "number")
        return sortAsc ? aVal - bVal : bVal - aVal;
      return 0;
    });
  }, [filtered, sortKey, sortAsc]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage]);

  const toggleSelect = (id: number) => {
    const updated = selected.includes(id)
      ? selected.filter((i) => i !== id)
      : [...selected, id];
    setSelected(updated);
    onSelectChange?.(updated);
  };

  return (
    <div>
      {/* Search input */}
      <div className="mb-2">
        <input
          type="text"
          placeholder="Search URLs..."
          className="border rounded p-1 text-sm w-full md:w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <table className="w-full table-auto border text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2 border">
              <input
                type="checkbox"
                onChange={(e) => {
                  const all = e.target.checked ? paginated.map((u) => u.id) : [];
                  setSelected(all);
                  onSelectChange?.(all);
                }}
                checked={paginated.every((u) => selected.includes(u.id))}
              />
            </th>
            {[
              { key: "title", label: "Title" },
              { key: "status", label: "Status" },
              { key: "html_version", label: "HTML Version" },
              { key: "internal_links", label: "Internal" },
              { key: "external_links", label: "External" },
              { key: "broken_links", label: "Broken" },
            ].map((col) => (
              <th
                key={col.key}
                className="p-2 border cursor-pointer select-none"
                onClick={() => toggleSort(col.key as keyof UrlItem)}
              >
                {col.label}
                {sortKey === col.key ? (sortAsc ? " ▲" : " ▼") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginated.map((url) => (
            <tr
              key={url.id}
              className="border-t hover:bg-gray-100 cursor-pointer"
              onClick={() => navigate(`/urls/${url.id}`)}
            >
              <td className="p-2 border" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selected.includes(url.id)}
                  onChange={() => toggleSelect(url.id)}
                />
              </td>
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

      {/* Pagination */}
      <div className="mt-2 flex items-center justify-between text-sm">
        <div>
          Page {currentPage} of {Math.ceil(sorted.length / itemsPerPage)}
        </div>
        <div className="space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={currentPage === Math.ceil(sorted.length / itemsPerPage)}
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(p + 1, Math.ceil(sorted.length / itemsPerPage))
              )
            }
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
