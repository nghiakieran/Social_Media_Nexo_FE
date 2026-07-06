import LOGO_NEXO_MAIN from '@/assets/images/logos/LOGO_NEXO_MAIN.png'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12',
  xl: 'w-14 h-14'
}

export const Logo = ({ size = 'md', showText = true, className = '' }: LogoProps) => {
  return (
    <div className={`flex justify-center items-center gap-3 mr-2 ${className}`}>
      <img 
        src={LOGO_NEXO_MAIN} 
        alt="NEXO Logo" 
        className={`${sizeClasses[size]} object-contain`}
      />
      {showText && (
        <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          NEXO
        </span>
      )}
    </div>
  )
}
