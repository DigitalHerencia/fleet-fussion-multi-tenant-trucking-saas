// app/not-found.tsx
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="mb-8">
        <Image
          src="/white.png" // Assuming white.png is in the public folder
          alt="FleetFusion Logo"
          width={200} // Adjust as needed
          height={100} // Adjust as needed
          priority
        />
      </div>
      <h1 className="mb-4 text-6xl font-bold text-blue-500">404</h1>
      <h2 className="mb-4 text-3xl font-semibold">Page Not Found</h2>
      <p className="mb-8 max-w-md text-center text-lg text-gray-300">
        Oops! The page you are looking for does not exist. It might have been
        moved or deleted.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-blue-600 px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Go back to Homepage
      </Link>
    </div>
  );
}
