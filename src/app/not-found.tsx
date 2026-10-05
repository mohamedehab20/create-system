import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f8fafc] px-6 text-center">
      <div>
        <h1 className="text-3xl font-extrabold">الصفحة غير موجودة</h1>
        <Link href="/" className="mt-4 inline-flex rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-bold text-white">
          العودة للمقر
        </Link>
      </div>
    </div>
  );
}
