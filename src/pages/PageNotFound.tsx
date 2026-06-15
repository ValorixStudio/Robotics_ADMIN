export default function PageNotFound() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">Page not found</h1>
        <p className="mt-2 text-sm text-gray-500 max-w-2xl">The route you visited does not exist. Use the sidebar to navigate to a valid section.</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <p className="text-sm text-gray-600">If you expected to see a dashboard page, go back to the home page or click any menu item.</p>
      </div>
    </div>
  );
}
