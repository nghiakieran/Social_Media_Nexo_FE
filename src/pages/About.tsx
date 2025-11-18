import { Map, Rocket, Telescope, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Suspense, useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import SideNavigation from './about/SideNavigation'
import Title from './about/Title'
import VisionItem from './about/VisionItem'
import SectionHeader from './about/SectionHeader'
import SectionContainer from './about/SectionContainer'
import Timeline from './about/Timeline'
import CoreValues from './about/CoreValues'
import TeamMembers from './about/TeamMembers'
import ContactInfo from './about/ContactInfo'


const About = () => {
  const [activeSection, setActiveSection] = useState('vision')

  // Handle scroll-based section activation
  const handleScroll = useCallback(() => {
    const sections = ['vision', 'story', 'values', 'team', 'contact']
    
    // Find the section currently in view
    const current = sections.find(section => {
      const element = document.getElementById(section)
      if (!element) return false
      
      const rect = element.getBoundingClientRect()
      return rect.top <= 150 && rect.bottom >= 150
    })
    
    if (current) {
      setActiveSection(current)
    }
  }, [])
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <section>
      <SideNavigation activeSection={activeSection} setActiveSection={setActiveSection} />

      <main className='relative w-full bg-secondary/50'>
        {/* Vision & Mission */}
        <SectionContainer id='vision' className='py-24'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-16 items-center'>
            <div className='z-10 aspect-square rounded-2xl overflow-hidden shadow-sm order-2 sm:order-1'>
              <img
                src='https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070'
                alt='Tầm nhìn và sứ mệnh Social Media Nexo'
                className='object-cover brightness-90 w-full h-full'
                loading='lazy'
                width='600'
                height='600'
              />
            </div>
            <div className='max-w-3xl mx-auto text-justify order-1 sm:order-2'>
              <div className='text-center'>
                <div className='inline-block px-5 py-2 bg-primary text-primary-foreground rounded-full font-medium mb-4'>
                  Tầm nhìn & Sứ mệnh
                </div>
              </div>
              <div className='text-center'>
                <Title title='Kết nối mọi người qua công nghệ' className='text-3xl sm:text-4xl mb-6' />
              </div>
              <p className='text-lg mb-8 leading-relaxed'>
                Social Media Nexo ra đời với sứ mệnh tạo ra một nền tảng mạng xã hội hiện đại, 
                kết nối mọi người trên toàn thế giới thông qua việc chia sẻ những khoảnh khắc đẹp nhất của cuộc sống.
              </p>
              <div className='space-y-6'>
                <VisionItem
                  icon={<Telescope className='text-primary' />}
                  title='Tầm nhìn'
                  description='Trở thành nền tảng mạng xã hội hàng đầu tại Việt Nam, mang đến trải nghiệm chia sẻ và kết nối tuyệt vời cho người dùng thông qua công nghệ hiện đại.'
                />
                <VisionItem
                  icon={<Rocket className='text-primary' />}
                  title='Sứ mệnh'
                  description='Sử dụng công nghệ React, Node.js và các công cụ hiện đại để xây dựng một mạng xã hội an toàn, thân thiện và đầy tính năng sáng tạo.'
                />
              </div>
            </div>
          </div>
        </SectionContainer>

        {/* Our Story - Timeline */}
        <SectionContainer id='story' className='py-24 bg-primary/5'>
          <SectionHeader
            eyebrow='Câu chuyện của chúng tôi'
            title='Hành trình phát triển'
            description='Từ ý tưởng đến hiện thực, hành trình của chúng tôi là minh chứng cho niềm đam mê với công nghệ và sự kết nối.'
          />  
          <Suspense fallback={<div className='h-96 flex items-center justify-center'>Đang tải...</div>}>
            <Timeline />
          </Suspense>
        </SectionContainer>

        {/* Core Values */}
        <SectionContainer id='values' className='py-24'>
          <SectionHeader 
            eyebrow='Giá trị cốt lõi'
            title='Những giá trị chúng tôi theo đuổi'
            description='Những nguyên tắc và giá trị định hướng mọi hoạt động phát triển của chúng tôi.'
          />
          <Suspense fallback={<div className='h-96 flex items-center justify-center'>Đang tải...</div>}>
            <CoreValues />
          </Suspense>
        </SectionContainer>

        {/* Team */}
        <SectionContainer id='team' className='py-24 bg-secondary/50'>
          <SectionHeader 
            eyebrow='Đội ngũ'
            title='Những con người tài năng'
            description='Gặp gỡ những con người đam mê và tài năng đứng sau Social Media Nexo.'
          />
          <Suspense fallback={<div className='h-96 flex items-center justify-center'>Đang tải...</div>}>
            <TeamMembers />
          </Suspense>
        </SectionContainer>

        {/* Call to Action */}
        <section className='py-24 bg-primary text-primary-foreground'>
          <div className='max-w-6xl mx-auto px-4 text-center'>
            <Title title='Tham gia cùng chúng tôi' className='text-3xl sm:text-4xl mb-6 text-primary-foreground' />
            <p className='text-xl mb-8'>Hãy trở thành một phần của cộng đồng Social Media Nexo và chia sẻ những khoảnh khắc tuyệt vời của bạn.</p>
            <div className='flex flex-wrap justify-center gap-4'>
               <Link to='/register'>
                 <Button
                   variant='outline'
                   size='lg'
                   className='w-52 bg-white/10 text-white backdrop-blur-sm border-white hover:bg-white/20 hover:text-white'
                 >
                   <UserPlus className='mr-2' size={20} />
                   Đăng ký ngay
                 </Button>
               </Link>
               <Link to='/explore'>
                 <Button 
                   size='lg'
                   variant='outline'
                   className='bg-white/10 backdrop-blur-sm text-white border-white hover:bg-white/20 w-62'
                 >
                   <Map className='mr-2' size={20} />
                   Khám phá tính năng
                 </Button>
               </Link>
            </div>
          </div>
        </section>

        {/* Contact */}
        <SectionContainer id='contact' className='py-24 bg-secondary/50'>
          <SectionHeader 
            eyebrow='Liên hệ'
            title='Kết nối với chúng tôi'
            description='Chúng tôi luôn sẵn sàng lắng nghe ý kiến đóng góp và giải đáp thắc mắc của bạn. Hãy liên hệ với chúng tôi qua các kênh sau:'
          />
          <Suspense fallback={<div className='h-96 flex items-center justify-center'>Đang tải...</div>}>
            <ContactInfo />
          </Suspense>
        </SectionContainer>
      </main>
    </section>
  )
}

export default About
