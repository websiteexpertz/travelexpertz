export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-600 border-r-blue-600 animate-spin"></div>
      </div>
      <span className="ml-3 text-sm font-medium text-gray-600">Loading...</span>
    </div>
  );
}
