import Link from "next/link";

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-foreground via-gray-500 to-background text-white">
      <div className="text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-accent">
          Welcome to <span className="text-primary">SmartPOS</span>
        </h1>
        <p className="text-accent text-lg md:text-xl mb-10">
          Simplify your inventory management with smart, powerful tools.
        </p>
        <div className="flex justify-center gap-6">
          <Link
            href="/login"
            className="rounded-full px-8 py-3 bg-primary hover:bg-accent hover:text-white transition text-lg font-semibold shadow-lg text-primary-foreground"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full px-8 py-3 border-2 border-primary text-primary hover:border-accent hover:text-accent transition text-lg font-semibold shadow-lg"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
