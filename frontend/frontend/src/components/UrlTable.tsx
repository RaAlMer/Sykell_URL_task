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
      const matchesTitle = !titleFilter ||
        (url.title ?? "").toLowerCase().includes(titleFilter.toLowerCase());
      const matchesStatus = !statusFilter || url.status === statusFilter;
      const matchesInternal = inRange(url.internal_links ?? 0, internalRange);
      const matchesExternal = inRange(url.external_links ?? 0, externalRange);
      const matchesBroken = inRange(url.broken_links ?? 0, brokenRange);

      return (
        matchesTitle &&
        matchesStatus &&
        matchesInternal &&
        matchesExternal &&
        matchesBroken
      );
    });
  }, [urls, titleFilter, statusFilter, internalRange, externalRange, brokenRange]);

  // Sorting
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      // Numeric fields
      if (['internal_links', 'external_links', 'broken_links'].includes(sortKey)) {
        const numA = aVal === undefined || aVal === '-' ? -Infinity : Number(aVal);
        const numB = bVal === undefined || bVal === '-' ? -Infinity : Number(bVal);
        return sortAsc ? numA - numB : numB - numA;
      }
      
      // String fields
      const strA = aVal === undefined || aVal === '-' ? '' : String(aVal);
      const strB = bVal === undefined || bVal === '-' ? '' : String(bVal);
      
      return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
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

  useEffect(() => setCurrentPage(1), [titleFilter, statusFilter, internalRange, externalRange, brokenRange]);

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <input
                  type="checkbox"
                  ref={selectAllRef}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => toggleSelectAll(e.target.checked)}
                  checked={paginated.length > 0 && paginated.every((u) => selected.includes(u.id))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:checked:bg-blue-600"
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
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => toggleSort(col.key as keyof UrlItem)}
                >
                  <div className="flex items-center justify-between">
                    {col.label}
                    {sortKey === col.key ? (
                      sortAsc ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )
                    ) : (
                      <span className="w-4 h-4"></span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
            <tr>
              <th className="px-6 py-2"></th>
              <th className="px-6 py-2">
                <input
                  type="text"
                  placeholder="Filter title..."
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700"
                  value={titleFilter}
                  onChange={(e) => setTitleFilter(e.target.value)}
                />
              </th>
              <th className="px-6 py-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700"
                >
                  <option value="">All</option>
                  <option value="queued">Queued</option>
                  <option value="running">Running</option>
                  <option value="done">Done</option>
                  <option value="error">Error</option>
                </select>
              </th>
              <th className="px-6 py-2"></th>
              <th className="px-6 py-2">
                <select
                  value={internalRange}
                  onChange={(e) => setInternalRange(e.target.value)}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700"
                >
                  {rangeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </th>
              <th className="px-6 py-2">
                <select
                  value={externalRange}
                  onChange={(e) => setExternalRange(e.target.value)}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700"
                >
                  {rangeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </th>
              <th className="px-6 py-2">
                <select
                  value={brokenRange}
                  onChange={(e) => setBrokenRange(e.target.value)}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700"
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
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No results found.
                </td>
              </tr>
            ) : (
              paginated.map((url) => (
                <tr
                  key={url.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => navigate(`/urls/${url.id}`)}
                >
                  <td
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(url.id)}
                      onChange={() => toggleSelect(url.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:checked:bg-blue-600"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {url.title || <span className="italic text-gray-500">(No title)</span>}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {url.address}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {renderStatusIndicator(url.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {url.html_version || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {url.internal_links ?? "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {url.external_links ?? "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {url.broken_links ?? "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            disabled={currentPage === Math.ceil(sorted.length / itemsPerPage)}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, Math.ceil(sorted.length / itemsPerPage)))}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, sorted.length)}
              </span>{' '}
              of <span className="font-medium">{sorted.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              {Array.from({ length: Math.min(5, Math.ceil(sorted.length / itemsPerPage)) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === pageNum
                        ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-300'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                disabled={currentPage === Math.ceil(sorted.length / itemsPerPage)}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, Math.ceil(sorted.length / itemsPerPage)))}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
