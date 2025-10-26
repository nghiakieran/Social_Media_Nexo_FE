interface VisionItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const VisionItem = ({ icon, title, description }: VisionItemProps) => {
  return (
    <div className='flex items-start space-x-4'>
      <div className='flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
        {icon}
      </div>
      <div>
        <h3 className='text-xl font-bold mb-2 text-foreground'>{title}</h3>
        <p className='text-muted-foreground leading-relaxed'>{description}</p>
      </div>
    </div>
  )
}

export default VisionItem
