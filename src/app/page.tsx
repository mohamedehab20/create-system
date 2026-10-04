import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { listCompanyIds } from "@/lib/queries";
import { Logo } from "@/components/ui";

const ROLES = [
  {
    title: "زائر",
    href: "/visit",
    copy: "استكشف الخدمات المتاحة وتواصل مع فريقك بطريقة آمنة وموثوقة.",
    image: "/images/reception.jpg",
    alt: "استقبال خشبي دافئ",
    featured: false,
    icon: "person",
  },
  {
    title: "موظف",
    href: "/login",
    copy: "نظّم مهامك ومواعيدك وتواصل مع مديرك بسهولة وفعالية.",
    image: "/images/team.jpg",
    alt: "فريق يعمل حول طاولة",
    featured: true,
    icon: "person",
  },
  {
    title: "صاحب العمل",
    href: "/register",
    copy: "أدر مؤسستك بكفاءة، وتابع أداء موظفيك، وتواصل مع فريقك فوراً.",
    image: "/images/boardroom.jpg",
    alt: "غرفة اجتماعات زجاجية",
    featured: false,
    icon: "case",
  },
];

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.5c1.4-3 3.6-4.5 6.5-4.5s5.1 1.5 6.5 4.5" strokeLinecap="round" />
    </svg>
  );
}

function CaseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
    </svg>
  );
}

export default async function HomePage() {
  const user = await getSessionUser();
  const inside = user ? listCompanyIds(user.id).length > 0 : false;
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#e7ecfa_0%,_#f7f8fb_42%,_#f5f6f8_100%)] text-[#191c1d]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          {inside ? (
            <Link href="/home" className="rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-bold text-white">
              ادخل المقر
            </Link>
          ) : (
            <>
              <Link href="/register" className="rounded-xl bg-white px-4 py-2 text-sm font-bold ring-1 ring-[#e5e7eb]">
                إنشاء حساب
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-bold text-white">
                <PersonIcon />
                تسجيل الدخول
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-5 pb-6 pt-8 text-center md:pt-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold shadow-sm ring-1 ring-black/5">
          <span className="text-amber-400" aria-hidden>
            ✦
          </span>
          أنت الآن داخل المقر الرقمي
        </div>
        <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">هنا يبدأ كل شيء</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-[#5c6573] md:text-lg">
          منصة رقمية متكاملة تهدف إلى تعزيز تجربة العمل والتواصل بين موظفيك وأنت.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={inside ? "/home" : "/register"}
            className="rounded-xl bg-[#2563eb] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)]"
          >
            جرب الآن
          </Link>
          <a href="#how" className="rounded-xl bg-white px-6 py-3 text-sm font-bold ring-1 ring-[#e6e8ee]">
            ابدأ رحلتك
          </a>
        </div>
      </section>

      <section id="roles" className="mx-auto grid max-w-6xl items-stretch gap-5 px-5 pb-8 pt-8 md:grid-cols-3 md:pt-12">
        {ROLES.map((role) => (
          <Link
            key={role.title}
            href={role.href}
            className={`flex flex-col overflow-hidden rounded-[28px] text-center shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 ${
              role.featured
                ? "bg-[#2563eb] text-white shadow-[0_24px_50px_rgba(37,99,235,0.32)] md:-translate-y-6"
                : "bg-white text-[#191c1d]"
            }`}
          >
            <div className="flex flex-1 flex-col items-center px-6 pb-2 pt-8">
              <span
                className={`grid h-14 w-14 place-items-center rounded-full ${
                  role.featured ? "bg-white text-[#2563eb]" : "bg-[#d4feeb] text-emerald-600"
                }`}
              >
                {role.icon === "case" ? <CaseIcon /> : <PersonIcon />}
              </span>
              <h2 className="mt-5 text-2xl font-extrabold">{role.title}</h2>
              <p className={`mt-3 text-sm leading-7 ${role.featured ? "text-white/85" : "text-[#5c6573]"}`}>{role.copy}</p>
            </div>
            <img src={role.image} alt={role.alt} className="mt-6 h-44 w-full object-cover" />
          </Link>
        ))}
      </section>

      <section id="how" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center text-3xl font-extrabold">أربع خطوات ويصير للشركة مقر</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ["1", "أنشئ حسابك", "اسمك وبريدك، ثم تدخل التأسيس."],
            ["2", "أسّس شركتك", "النشاط، الفريق، والعملة. القالب يبني الأقسام."],
            ["3", "ادعُ فريقك", "كل شخص في قسمه ودوره داخل المقر."],
            ["4", "ابدأ العمل", "مشروع، مهمة، وحضور. والمدير يرى العمليات."],
          ].map(([step, title, copy]) => (
            <article key={step} className="rounded-3xl bg-white p-5 ring-1 ring-[#e7e9ef]">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#2563eb] text-sm font-extrabold text-white">{step}</span>
              <h3 className="mt-4 font-extrabold">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-[#5c6573]">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-16 md:grid-cols-2">
        <article className="rounded-[28px] bg-white p-6 ring-1 ring-[#e7e9ef]">
          <h2 className="text-xl font-extrabold">قبل المقر</h2>
          <p className="mt-3 text-sm leading-8 text-[#5c6573]">
            واتساب، إكسل، درايف، بريد، نوتشن، CRM، محاسبة، وأدوات ذكاء. العمل موجود، لكن لا أحد يرى ماذا يحدث داخل الشركة الآن.
          </p>
        </article>
        <article className="rounded-[28px] bg-[#0e1628] p-6 text-white">
          <h2 className="text-xl font-extrabold">بعد المقر</h2>
          <p className="mt-3 text-sm leading-8 text-white/75">
            مكان واحد تبدأ منه الشركة: أشخاص، عمل، وعمليات. المقر لا يعد بحل كل مشاكل الشركة. يمنحها مكانًا واحدًا تبدأ منه إدارة عملها.
          </p>
        </article>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="rounded-[32px] bg-[#2563eb] px-6 py-10 text-center text-white">
          <h2 className="text-3xl font-extrabold">كل شركة تحتاج مقرًا.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/85">للفرق الصغيرة والشركات الناشئة، من 5 إلى 30 شخصًا.</p>
          <Link href="/register" className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-[#2563eb]">
            أسّس شركتك
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#e7e9ef] px-5 py-6 text-center text-xs leading-6 text-[#8b93a1]">
        المقر — لا نبني أداة للشركة؛ نبني مكانًا تعيش وتعمل من خلاله.
        <span className="mt-1 block">صور الواجهة من Unsplash.</span>
      </footer>
    </div>
  );
}
