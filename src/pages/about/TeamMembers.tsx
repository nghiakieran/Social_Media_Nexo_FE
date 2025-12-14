import { Facebook, Linkedin, Github } from 'lucide-react'
import { Link } from 'react-router-dom'

const teamMembers = [
  {
    name: 'Nguyễn Thanh Phong',
    role: 'Backend Developer',
    bio: 'Chuyên gia về Java Spring Boot và Database design với 2 năm kinh nghiệm.',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    social: {
      facebook: 'https://facebook.com',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com'
    }
  },
  {
    name: 'Nguyễn Đăng Quang',
    role: 'Backend Developer',
    bio: 'Chuyên gia về API development và microservices architecture.',
    img: 'https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjF8fHBlb3BsZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600',
    social: {
      facebook: 'https://facebook.com',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com'
    }
  },
  {
    name: 'Lê Chí Nghĩa',
    role: 'Frontend Developer',
    bio: 'Kinh nghiệm 1 năm làm việc về React, TypeScript và UI/UX design với đam mê tạo ra trải nghiệm người dùng tuyệt vời.',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    social: {
      facebook: 'https://facebook.com',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com'
    }
  }
]

const TeamMembers = () => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16'>
      {teamMembers.map((member, index) => (
        <div key={index} className='group text-center'>
          <div className='relative mb-6 overflow-hidden rounded-xl aspect-square text-left'>
            <img
              src={member.img}
              alt={member.name}
              className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-110'
              loading='lazy'
              width='300'
              height='300'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6'>
              <div className='text-white'>
                <p className='font-medium'>{member.bio}</p>
                <div className='flex space-x-3 mt-4'>
                  <Link
                    to={member.social.facebook}
                    className='text-white hover:text-primary transition-colors'
                    aria-label={`Facebook của ${member.name}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Facebook size={20} />
                  </Link>
                  <Link
                    to={member.social.linkedin}
                    className='text-white hover:text-primary transition-colors'
                    aria-label={`LinkedIn của ${member.name}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Linkedin size={20} />
                  </Link>
                  <Link
                    to={member.social.github}
                    className='text-white hover:text-primary transition-colors'
                    aria-label={`GitHub của ${member.name}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Github size={20} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <h3 className='text-xl font-bold text-foreground'>{member.name}</h3>
          <p className='text-primary'>{member.role}</p>
        </div>
      ))}
    </div>
  )
}

export default TeamMembers
