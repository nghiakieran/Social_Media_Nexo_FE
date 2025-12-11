import { useCallback } from 'react'
import { Button } from '@/components/ui/button'

const navigationItems = [
  { id: 'vision', icon: '🔭', label: 'Tầm nhìn' },
  { id: 'story', icon: '📚', label: 'Câu chuyện' },
  { id: 'values', icon: '💎', label: 'Giá trị cốt lõi' },
  { id: 'team', icon: '👥', label: 'Đội ngũ' },
]

const SideNavigation = ({ activeSection, setActiveSection }: { activeSection: string; setActiveSection: (section: string) => void }) => {

  const handleNavClick = useCallback((id: string) => {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }, [setActiveSection])

  return (
    <div className='hidden sm:block fixed left-8 top-1/2 transform -translate-y-1/2 z-30'>
      <div className='bg-background/80 backdrop-blur-sm rounded-full py-6 px-3 shadow-sm border'>
        <nav className='flex flex-col items-center space-y-8' aria-label='Điều hướng chính'>
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              variant='ghost'
              size='icon'
              className={`group relative !rounded-full ${
                  activeSection === item.id ? 'bg-primary/70' : 'hover:bg-primary/70'
              }`}
              aria-label={item.label}
            >
              <span className='text-xl' aria-hidden='true'>{item.icon}</span>
              <span className='absolute left-full ml-4 px-2 py-1 rounded bg-primary text-primary-foreground text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity'>
                {item.label}
              </span>
            </Button>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default SideNavigation
