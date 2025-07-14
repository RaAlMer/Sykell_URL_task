import { useEffect, useState, useMemo } from "react";
import type { UrlItem } from "../types/url";
import { fetchUrls, deleteUrl, rerunUrl } from "../services/urlService";
import AddUrlForm from "../components/AddUrlForm";
import UrlTable from "../components/UrlTable";
import ConfirmDeletionModal from "../components/ConfirmDeletionModal";

export default function Dashboard() {
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const loadUrls = () => {
    setLoading(true);
    fetchUrls()
      .then((data) => setUrls(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUrls();

    let interval: number | null = null;

    const startPolling = () => {
      if (interval) return;
      interval = window.setInterval(() => {
        fetchUrls().then((data) => {
          setUrls(data);

          // If all URLs are done or error, stop polling
          const stillRunning = data.some(url => url.status === "queued" || url.status === "running");
          if (!stillRunning && interval) {
            clearInterval(interval);
            interval = null;
          }
        });
      }, 3000);
    };

    startPolling();

    // Cleanup
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [reloadTrigger]);

  const handleDeleteSelected = async () => {
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await Promise.all(selectedIds.map((id) => deleteUrl(id)));
      setSelectedIds([]);
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to delete some URLs:", err);
    }
  };

  const handleRerunSelected = async () => {
    try {
      await Promise.all(selectedIds.map((id) => rerunUrl(id)));
      setSelectedIds([]);
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to rerun some URLs:", err);
    }
  };

  const onAddUrlSuccess = () => {
    setReloadTrigger((prev) => prev + 1);
  };

  const renderStatusIndicator = (status: string) => {
    const baseClasses = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case "queued":
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`}>
            <span className="animate-spin mr-1">↻</span> Queued
          </span>
        );
      case "running":
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}>
            <span className="animate-spin mr-1">↻</span> Running
          </span>
        );
      case "done":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>
            ✓ Done
          </span>
        );
      case "error":
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`}>
            ✗ Error
          </span>
        );
      default:
        return <span className={baseClasses}>{status}</span>;
    }
  };

  const filteredUrls = useMemo(() => {
    if (!searchQuery) return urls;
  
    const query = searchQuery.toLowerCase();
    return urls.filter(url => {
      // Convert all relevant fields to strings for searching
      const searchableFields = [
        url.address,
        url.title,
        url.status,
        url.html_version,
        url.internal_links?.toString(),
        url.external_links?.toString(),
        url.broken_links?.toString(),
        url.h1_count?.toString(),
        url.h2_count?.toString(),
        url.has_login_form?.toString()
      ];

      return searchableFields.some(field => 
        field ? field.toLowerCase().includes(query) : false
      );
    });
  }, [urls, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                URL Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monitor and manage crawled URLs</p>
            </div>
            <div className="relative min-w-[250px] flex-1">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </header>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total URLs</h3>
            <p className="text-2xl font-semibold">{urls.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</h3>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
              {urls.filter(u => u.status === 'done').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</h3>
            <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
              {urls.filter(u => u.status === 'running' || u.status === 'queued').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Errors</h3>
            <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
              {urls.filter(u => u.status === 'error').length}
            </p>
          </div>
        </div>
        {/* Add URL Form */}
        <AddUrlForm onSuccess={onAddUrlSuccess} />
        {/* Selection Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              {selectedIds.length} URL{selectedIds.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleRerunSelected}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Rerun Selected
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Selected
              </button>
            </div>
          </div>
        )}
        {/* URL Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <UrlTable 
            urls={filteredUrls} 
            onSelectChange={setSelectedIds} 
            renderStatusIndicator={renderStatusIndicator} 
          />
        </div>
      </div>
      <ConfirmDeletionModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmDelete}
        count={selectedIds.length}
      />
    </div>
  );
}
