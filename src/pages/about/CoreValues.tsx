const coreValues = [
  {
    icon: '🚀',
    title: 'Đổi mới',
    description: 'Chúng tôi luôn tìm kiếm những cách thức mới để cải thiện trải nghiệm người dùng và phát triển các tính năng sáng tạo.'
  },
  {
    icon: '🤝',
    title: 'Kết nối',
    description: 'Mục tiêu của chúng tôi là tạo ra một cộng đồng gắn kết, nơi mọi người có thể chia sẻ và kết nối với nhau một cách ý nghĩa.'
  },
  {
    icon: '🔒',
    title: 'Bảo mật',
    description: 'An toàn và bảo mật thông tin người dùng là ưu tiên hàng đầu trong mọi quyết định phát triển của chúng tôi.'
  },
  {
    icon: '⚡',
    title: 'Hiệu suất',
    description: 'Chúng tôi cam kết mang đến trải nghiệm mượt mà và nhanh chóng cho người dùng trên mọi thiết bị.'
  },
  {
    icon: '🎨',
    title: 'Thẩm mỹ',
    description: 'Giao diện đẹp mắt và trực quan là yếu tố quan trọng để tạo ra trải nghiệm người dùng tuyệt vời.'
  },
  {
    icon: '🌱',
    title: 'Phát triển',
    description: 'Chúng tôi không ngừng học hỏi và phát triển để mang đến những giá trị tốt nhất cho cộng đồng.'
  }
]

const CoreValues = () => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
      {coreValues.map((value, index) => (
        <div key={index} className='bg-card border rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow h-full'>
          <div className='text-4xl mb-4 text-center' aria-hidden='true'>{value.icon}</div>
          <h3 className='text-xl font-bold mb-3 text-center text-foreground'>{value.title}</h3>
          <p className='text-justify text-muted-foreground'>{value.description}</p>
        </div>
      ))}
    </div>
  )
}

export default CoreValues
