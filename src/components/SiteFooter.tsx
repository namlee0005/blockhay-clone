import Link from "next/link";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <p className="font-bold text-orange-500 text-lg">Blockhay</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Tin tức crypto & blockchain hàng đầu Việt Nam.
          </p>
        </div>
        <div>
          <p className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-3">
            Chủ đề
          </p>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            {[
              ["Tin tức", "/tin-tuc"],
              ["Phân tích", "/phan-tich"],
              ["Đầu tư", "/dau-tu"],
              ["Kiến thức", "/kien-thuc-101"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="hover:text-orange-500 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-3">
            Công cụ
          </p>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            {[
              ["Bảng giá", "/bang-gia"],
              ["Tìm kiếm", "/tim-kiem"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="hover:text-orange-500 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-3">
            Pháp lý
          </p>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li>
              <Link href="/chinh-sach-bao-mat" className="hover:text-orange-500 transition-colors">
                Chính sách bảo mật
              </Link>
            </li>
            <li>
              <Link href="/dieu-khoan" className="hover:text-orange-500 transition-colors">
                Điều khoản sử dụng
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-4 text-center text-xs text-slate-400">
        © {year} Blockhay. Nội dung chỉ mang tính tham khảo, không phải lời khuyên đầu tư.
      </div>
    </footer>
  );
}
