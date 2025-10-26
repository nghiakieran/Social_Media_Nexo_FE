interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

const SectionHeader = ({ eyebrow, title, description }: SectionHeaderProps) => {
  return (
    <div className='text-center mb-16'>
      <div className='inline-block px-4 py-2 bg-primary/10 text-primary rounded-full font-medium mb-4'>
        {eyebrow}
      </div>
      <h2 className='text-3xl sm:text-4xl font-bold mb-4 text-foreground'>{title}</h2>
      <p className='text-lg text-muted-foreground max-w-3xl mx-auto'>{description}</p>
    </div>
  )
}

export default SectionHeader
