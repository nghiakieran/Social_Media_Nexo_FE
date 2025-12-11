import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    content: 'contact@socialmedianexo.com'
  },
  {
    icon: Phone,
    title: 'Điện thoại',
    content: '+84 123 456 789'
  },
  {
    icon: MapPin,
    title: 'Địa chỉ',
    content: 'Tp.Hồ Chí Minh, Việt Nam'
  },
  {
    icon: MessageSquare,
    title: 'Hỗ trợ',
    content: 'support@socialmedianexo.com'
  }
]

const socialLinks = [
  {
    icon: () => <Mail size={20} />,
    url: 'mailto:contact@socialmedianexo.com',
    label: 'Email'
  },
  {
    icon: () => <MessageSquare size={20} />,
    url: '/messages',
    label: 'Tin nhắn'
  }
]

const ContactInfo = () => {
  return (     
    <div className='flex flex-col items-center justify-center'>
      <div className='flex flex-col space-y-6 max-w-md'>
        {contactInfo.map((item, index) => {
          const Icon = item.icon
          return (
            <div key={index} className='flex space-x-6 items-center'>
              <div className='flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
                <Icon className='text-primary' />
              </div>
              <div>
                <h3 className='text-xl font-bold mb-1 text-foreground'>{item.title}</h3>
                <p className='text-muted-foreground'>{item.content}</p>
              </div>
            </div>
          )
        })}  
      </div>
      <div className='flex space-x-4 items-center justify-center mt-8'>
        {socialLinks.map((link, index) => {
          const Icon = link.icon
          return (
            <Link
              key={index}
              to={link.url}
              className='w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors'
              aria-label={link.label}
              target={link.url.startsWith('mailto:') ? '_blank' : undefined}
              rel={link.url.startsWith('mailto:') ? 'noopener noreferrer' : undefined}
            >
              <Icon />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default ContactInfo
