import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto flex items-center justify-between px-4 py-6">
        <h1 className="text-2xl font-bold text-blue-600">Fitness Tracker</h1>
        <div className="space-x-4">
          <Link href="/auth/login" className="px-4 py-2 text-blue-600 hover:text-blue-800">
            Вход
          </Link>
          <Link href="/auth/register" className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
            Регистрация
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20 text-center">
        <h2 className="mb-6 text-5xl font-bold text-gray-900">Следи своя фитнес прогрес</h2>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
          Записвай измервания, следи прогреса си и постигай целите си с лекота
        </p>
        <Link
          href="/auth/register"
          className="inline-block rounded-lg bg-blue-600 px-8 py-4 text-lg text-white transition hover:bg-blue-700"
        >
          Започни сега безплатно
        </Link>

        {/* Features */}
        <div className="mt-20 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 text-4xl">📊</div>
            <h3 className="mb-2 text-xl font-semibold">Следи метрики</h3>
            <p className="text-gray-600">Записвай тегло, размери и прогрес</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 text-4xl">📈</div>
            <h3 className="mb-2 text-xl font-semibold">Виж прогреса</h3>
            <p className="text-gray-600">Визуализирай промените във времето</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 text-4xl">🎯</div>
            <h3 className="mb-2 text-xl font-semibold">Постигай цели</h3>
            <p className="text-gray-600">Поставяй и достигай целите си</p>
          </div>
        </div>
      </main>
    </div>
  );
}
