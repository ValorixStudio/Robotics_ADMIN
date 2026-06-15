export default function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">{title}</h1>
        <p className="mt-2 text-sm text-gray-500 max-w-2xl">{description}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <p className="text-sm text-gray-600">This page is a placeholder so the React app stays navigable while you build the full feature.</p>
      </div>
    </div>
  );
}
