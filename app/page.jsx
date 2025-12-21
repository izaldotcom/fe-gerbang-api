import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100">
      {/* === NAVBAR === */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-500/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                  />
                </svg>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-gray-900">
                Gerbang API
              </span>
            </div>

            {/* Menu Kanan */}
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors hidden sm:block"
              >
                Masuk
              </Link>
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
              >
                Mulai Sekarang
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* === HERO SECTION === */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Blobs (Dekorasi) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Platform Integrasi Terdepan
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            Satu Gerbang, <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
              Sejuta Koneksi.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700">
            Kelola produk digital, supplier, dan transaksi Anda dalam satu
            dashboard yang aman, cepat, dan mudah digunakan. Tingkatkan
            efisiensi bisnis Anda hari ini.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-600 text-white font-bold text-lg shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1 transition-all"
            >
              Login Dashboard
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border border-gray-200 text-gray-700 font-bold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Pelajari Fitur
            </a>
          </div>
        </div>
      </section>

      {/* === FEATURES GRID === */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Kenapa Memilih Gerbang API?
            </h2>
            <p className="text-gray-500 mt-4">
              Solusi lengkap untuk kebutuhan integrasi bisnis digital Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 text-2xl">
                🚀
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Performence Tinggi
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Diproses dengan teknologi terbaru untuk memastikan setiap
                transaksi berjalan hitungan milidetik.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 text-2xl">
                🛡️
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Keamanan Terjamin
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Data Anda dilindungi dengan enkripsi tingkat lanjut dan
                manajemen token yang aman.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-6 text-2xl">
                📊
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Monitoring Realtime
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Pantau semua transaksi, stok, dan performa supplier melalui
                dashboard yang intuitif.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6 opacity-70">
            <div className="bg-gray-200 p-1.5 rounded text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                />
              </svg>
            </div>
            <span className="font-bold text-lg text-gray-800">Gerbang API</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2025 PT Gerbang Teknologi Indonesia. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
