"use client";

import App from "./main";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col font-sans p-0 m-0 overflow-x-hidden">
      <main className="w-full flex-1 flex flex-col items-center">
        <App />
      </main>
    </div>
  );
}
