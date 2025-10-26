const SectionContainer = ({ id, className, children }: { id: string; className?: string; children: React.ReactNode }) => {
  return (
    <section id={id} className={className} data-section-id={id}>
      <div className='max-w-6xl mx-auto px-4'>
        {children}
      </div>
    </section>
  )
}

export default SectionContainer
