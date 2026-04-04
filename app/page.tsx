import ZaloFollowButton from "@/components/ZaloFollowButton";
import App from "./main";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 font-sans p-0 sm:p-6 lg:p-12 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-size-[24px_24px]">
      <main className="w-full max-w-lg flex flex-col items-center justify-center">
        {/* <App /> */}
        <ZaloFollowButton/>
      </main>
    </div>
  );
}
