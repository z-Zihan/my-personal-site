function Footer() {
  return (
    <footer className="glass mt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-gray-400">
          <p className="mb-2">Designed & Built with ❤️</p>
          <p className="text-sm">
            © {new Date().getFullYear()} My Personal Blog. Powered by React + Vite + Supabase
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
