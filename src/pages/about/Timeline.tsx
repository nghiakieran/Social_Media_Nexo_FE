import Title from './Title'

const timelineItems = [
  {
    year: '2024 Q1',
    title: 'Khởi tạo dự án',
    description: 'Bắt đầu với ý tưởng tạo ra một nền tảng mạng xã hội hiện đại, tập trung vào trải nghiệm người dùng và tính năng chia sẻ đa dạng.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=338&fit=crop'
  },
  {
    year: '2024 Q2',
    title: 'Phát triển Backend',
    description: 'Xây dựng hệ thống backend với Node.js, thiết kế database và API để hỗ trợ các tính năng cốt lõi của mạng xã hội.',
    img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=338&fit=crop'
  },
  {
    year: '2024 Q3',
    title: 'Phát triển Frontend',
    description: 'Tạo giao diện người dùng với React và TypeScript, tập trung vào responsive design và trải nghiệm người dùng mượt mà.',
    img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=338&fit=crop'
  },
  {
    year: '2024 Q4',
    title: 'Hoàn thiện và Launch',
    description: 'Tích hợp các tính năng, tối ưu hóa hiệu suất và chuẩn bị cho việc ra mắt chính thức của Social Media Nexo.',
    img: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=338&fit=crop'
  }
]

const Timeline = () => {
  return (
    <div className='relative'>
      {/* Timeline Line */}
      <div className='absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary/10'></div>

      {/* Timeline Items */}
      <div className='space-y-24'>
        {timelineItems.map((item, index) => (
          <div key={index} className='relative'>
            {/* Timeline Dot */}
            <div className='absolute left-1/2 transform -translate-x-1/2 -mt-4 w-8 h-8 rounded-full bg-primary border-4 border-background z-10'></div>

            <div className={`flex flex-col ${index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'} gap-8`}>
              <div className={`sm:w-1/2 p-6 ${index % 2 === 0 ? 'pl-0 ' : 'pr-0'}`}>
                <div className={`${index % 2 === 0 ? 'sm:text-right' : 'sm:text-left'}`}>
                  <Title title={item.year} className={'text-3xl sm:text-4xl mb-4'} />
                  <h3 className='text-2xl font-bold mb-4 text-foreground'>{item.title}</h3>
                  <p className='text-justify text-muted-foreground'>{item.description}</p>
                </div>
              </div>
              <div className={`sm:w-1/2 p-6 ${index % 2 === 0 ? 'pr-0 ' : 'pl-0'}`}>
                <div className='rounded-xl overflow-hidden shadow-sm transform transition-transform'>
                  <div className='aspect-video'>
                    <img
                      src={item.img}
                      alt={item.title}
                      className='object-cover w-full h-full'
                      width='600'
                      height='338'
                      loading='lazy'
                      />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Timeline
