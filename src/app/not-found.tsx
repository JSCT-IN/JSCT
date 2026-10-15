import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="text-5xl font-black font-editorial text-terracotta">404</div>
        <h1 className="text-xl font-bold text-charcoal">पृष्ठ उपलब्ध नहीं है (Page Not Found)</h1>
        <p className="text-xs text-driftwood leading-relaxed">
          आप जिस पृष्ठ की तलाश कर रहे हैं वह स्थानांतरित हो चुका है या मौजूद नहीं है।
        </p>
        <div>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-terracotta text-white font-bold text-xs shadow-warm hover:bg-terracotta-hover transition-all"
          >
            मुख्य पृष्ठ पर लौटें (Return Home)
          </Link>
        </div>
      </div>
    </div>
  );
}
