export default function LoadingSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse"
        >
          <div className="h-64 bg-gray-300"></div>
          <div className="p-6">
            <div className="h-4 bg-gray-300 rounded mb-4"></div>
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-300 rounded mt-4 w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

