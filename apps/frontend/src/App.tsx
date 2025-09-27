import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="md:flex">
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
              Agentic Orchestration
            </div>
            <h1 className="block mt-1 text-lg leading-tight font-medium text-black">
              Frontend is Running! 🎉
            </h1>
            <p className="mt-2 text-slate-500">
              Your modern monorepo is set up and ready for development.
            </p>
            <div className="mt-4">
              <a
                href="http://localhost:3000/api/docs"
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                View API Docs
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;