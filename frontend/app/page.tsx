import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 text-gray-800">
      <div className="bg-white shadow-lg rounded-2xl p-10 text-center max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4">Welcome to the Quiz App</h1>
        <p className="text-gray-600 mb-8">
          Test your knowledge and compete with others!
        </p>
        <div className="flex gap-5 justify-center">
          <Link
            href="/auth/student/login"
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 shadow-md mt-4"
          >
            I am a Student
          </Link>
          <Link
            href=""
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-300 shadow-md mt-4"
          >
            I am a School
          </Link>
        </div>
      </div>
    </div>
  );
}
