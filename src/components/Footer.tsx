import { Heart } from 'lucide-react'
import { useLanguage } from '../utils/useLanguage'

function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="glass mt-10">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-gray-400">
          <p className="mb-2 flex items-center justify-center gap-1">
            {t('footerBuiltWith')} <Heart className="w-4 h-4 fill-red-500 text-red-500" />
          </p>
          <p className="text-sm">
            © {new Date().getFullYear()} My Personal Blog. {t('footerNiceDay')}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
