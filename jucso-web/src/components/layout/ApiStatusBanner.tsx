import { useApp } from "@/context/AppContext";

export function ApiStatusBanner() {
  const { apiEnabled, apiBaseUrl, dataLoading, dataError } = useApp();

  if (!apiEnabled) {
    return (
      <div className="bg-amber-500 text-amber-950 text-xs text-center py-2 px-4">
        Demo mode — set <code className="font-mono">VITE_API_URL</code> to connect the live API.
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="bg-jucso-navy text-white/90 text-xs text-center py-2 px-4">
        Syncing portal data from API…
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="bg-red-600 text-white text-xs text-center py-2 px-4">
        API sync failed: {dataError} ({apiBaseUrl})
      </div>
    );
  }

  return null;
}
