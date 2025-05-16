export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="flex h-screen w-full animate-pulse flex-col">
      {/* Header Skeleton */}
      <div className="h-16 w-full bg-gray-200 dark:bg-gray-700"></div>

      <div className="flex flex-1">
        {/* Sidebar Skeleton */}
        <div className="w-64 bg-gray-100 p-4 dark:bg-gray-800">
          <div className="mb-4 h-8 w-3/4 rounded bg-gray-300 dark:bg-gray-600"></div>
          <div className="mb-2 h-6 w-full rounded bg-gray-300 dark:bg-gray-600"></div>
          <div className="mb-2 h-6 w-full rounded bg-gray-300 dark:bg-gray-600"></div>
          <div className="mb-2 h-6 w-5/6 rounded bg-gray-300 dark:bg-gray-600"></div>
          <div className="mt-8 h-8 w-3/4 rounded bg-gray-300 dark:bg-gray-600"></div>
          <div className="mb-2 mt-4 h-6 w-full rounded bg-gray-300 dark:bg-gray-600"></div>
          <div className="mb-2 h-6 w-full rounded bg-gray-300 dark:bg-gray-600"></div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 p-6">
          <div className="mb-6 h-10 w-1/2 rounded bg-gray-300 dark:bg-gray-600"></div>
          <div className="mb-4 h-6 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="mb-4 h-6 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="mb-4 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="h-32 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-32 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-32 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
