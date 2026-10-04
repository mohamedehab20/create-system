import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f4f7fb] px-6 text-center">
      <div>
        <p className="text-sm font-bold text-[#2563eb]">404</p>
        <h1 className="mt-2 text-3xl font-extrabold">هذه الغرفة ليست في المقر</h1>
        <Link href="/" className="mt-6 inline-flex rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-bold text-white">
          العودة إلى البداية
        </Link>
      </div>
    </div>
  );
}
