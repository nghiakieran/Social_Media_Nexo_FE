interface TitleProps {
  title: string;
  className?: string;
}

const Title = ({ title, className = '' }: TitleProps) => {
  return (
    <h2 className={`font-bold text-foreground ${className}`}>
      {title}
    </h2>
  )
}

export default Title
