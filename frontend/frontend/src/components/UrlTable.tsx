import { useState, useMemo, useRef, useEffect } from "react";
import type { ChangeEvent } from "react";
import type { UrlItem } from "../types/url";
import { useNavigate } from "react-router-dom";

type Props = {
  urls: UrlItem[];
  onSelectChange?: (selected: number[]) => void;
  renderStatusIndicator: (status: string) => React.ReactNode;
};

const rangeOptions = [
  { label: "All", value: "" },
  { label: "0 - 10", value: "0-10" },
  { label: "11 - 50", value: "11-50" },
  { label: "51 - 100", value: "51-100" },
  { label: "100+", value: "100+" },
];

function inRange(value: number | undefined, range: string): boolean {
  if (value === undefined) return false;
  switch (range) {
    case "0-10":
      return value >= 0 && value <= 10;
    case "11-50":
      return value >= 11 && value <= 50;
    case "51-100":
      return value >= 51 && value <= 100;
    case "100+":
      return value > 100;
    case "":
    default:
      return true;
  }
}

export default function UrlTable({ urls, onSelectChange, renderStatusIndicator }: Props) {
  const navigate = useNavigate();
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [sortKey, setSortKey] = useState<keyof UrlItem | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [internalRange, setInternalRange] = useState("");
  const [externalRange, setExternalRange] = useState("");
  const [brokenRange, setBrokenRange] = useState("");

  const itemsPerPage = 5;

  const toggleSort = (key: keyof UrlItem) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const filtered = useMemo(() => {
    return urls.filter((url) => {
      const searchLower = search.toLowerCase();
      const matchesSearch = !search ||
        url.address?.toLowerCase().includes(searchLower) ||
        (url.title ?? "").toLowerCase().includes(searchLower);
      const matchesTitle = !titleFilter ||
        (url.title ?? "").toLowerCase().includes(titleFilter.toLowerCase());
      const matchesStatus = !statusFilter || url.status === statusFilter;
      const matchesInternal = inRange(url.internal_links ?? 0, internalRange);
      const matchesExternal = inRange(url.external_links ?? 0, externalRange);
      const matchesBroken = inRange(url.broken_links ?? 0, brokenRange);

      return (
        matchesSearch &&
        (titleFilter ? matchesTitle : true) &&
        matchesStatus &&
        matchesInternal &&
        matchesExternal &&
        matchesBroken
      );
    });
  }, [urls, search, titleFilter, statusFilter, internalRange, externalRange, brokenRange]);

  // Sorting
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

  // Pagination
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage]);

  // Selection handlers
  const toggleSelect = (id: number) => {
    const updated = selected.includes(id)
      ? selected.filter((i) => i !== id)
      : [...selected, id];
    setSelected(updated);
    onSelectChange?.(updated);
  };

  const toggleSelectAll = (checked: boolean) => {
    const allIds = checked ? paginated.map((u) => u.id) : [];
    setSelected(allIds);
    onSelectChange?.(allIds);
  };

  useEffect(() => {
    if (!selectAllRef.current) return;
    const isIndeterminate =
        selected.length > 0 && !paginated.every((u) => selected.includes(u.id));
    selectAllRef.current.indeterminate = isIndeterminate;
  }, [selected, paginated]);

  useEffect(() => setCurrentPage(1), [search, titleFilter, statusFilter, internalRange, externalRange, brokenRange]);

  return (
    <div>
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search address/title..."
          className="border rounded px-2 py-1 text-sm flex-grow min-w-[200px]"
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
                ref={selectAllRef}
                onChange={(e: ChangeEvent<HTMLInputElement>) => toggleSelectAll(e.target.checked)}
                checked={paginated.length > 0 && paginated.every((u) => selected.includes(u.id))}
              />
            </th>
            {[
              { key: "title", label: "Title" },
              { key: "status", label: "Status" },
              { key: "html_version", label: "HTML Version" },
              { key: "internal_links", label: "Internal Links" },
              { key: "external_links", label: "External Links" },
              { key: "broken_links", label: "Broken Links" },
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
          <tr>
            <th></th>
            <th className="p-1 border">
              <input
                type="text"
                placeholder="Filter title..."
                className="w-full border rounded px-1 py-0.5 text-xs"
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
              />
            </th>
            <th className="p-1 border">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border rounded px-1 py-0.5 text-xs"
              >
                <option value="">All</option>
                <option value="queued">Queued</option>
                <option value="running">Running</option>
                <option value="done">Done</option>
                <option value="error">Error</option>
              </select>
            </th>
            <th className="p-1 border text-xs text-gray-400">—</th>
            <th className="p-1 border">
            <select
              value={internalRange}
              onChange={(e) => setInternalRange(e.target.value)}
              className="w-full border rounded px-1 py-0.5 text-xs"
            >
              {rangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            </th>
            <th className="p-1 border">
            <select
              value={externalRange}
              onChange={(e) => setExternalRange(e.target.value)}
              className="w-full border rounded px-1 py-0.5 text-xs"
            >
              {rangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            </th>
            <th className="p-1 border">
            <select
              value={brokenRange}
              onChange={(e) => setBrokenRange(e.target.value)}
              className="w-full border rounded px-1 py-0.5 text-xs"
            >
              {rangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            </th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-4 text-center text-gray-500">
                No results found.
              </td>
            </tr>
          ) : (
            paginated.map((url) => (
              <tr
                key={url.id}
                className="border-t hover:bg-gray-100 cursor-pointer"
                onClick={() => navigate(`/urls/${url.id}`)}
              >
                <td
                  className="p-2 border"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(url.id)}
                    onChange={() => toggleSelect(url.id)}
                  />
                </td>
                <td>
                  {url.title || (
                    <>
                      <span className="text-muted italic">(No title)</span>
                      <br />
                      <span className="text-sm text-gray-500">{url.address}</span>
                    </>
                  )}
                </td>
                <td className="p-2 border capitalize space-x-2">
                  {renderStatusIndicator ? (
                    <>
                      {renderStatusIndicator(url.status)}
                      <span>{url.status}</span>
                      {url.status === "error" && (
                        <span className="ml-2 text-red-600 font-semibold">(Error)</span>
                      )}
                    </>
                  ) : (
                    url.status
                  )}
                </td>
                <td className="p-2 border">{url.html_version || "-"}</td>
                <td className="p-2 border">{url.internal_links ?? "-"}</td>
                <td className="p-2 border">{url.external_links ?? "-"}</td>
                <td className="p-2 border">{url.broken_links ?? "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Pagination */}
      <div className="mt-2 flex items-center justify-between text-sm">
        <div>
          Page {currentPage} of {Math.ceil(sorted.length / itemsPerPage) || 1}
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
  )}
