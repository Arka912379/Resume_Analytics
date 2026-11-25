// Shared outer frame for every box on the Interview Results page:
// thick black border + hard offset shadow (same look as the rest of the app).
export default function ResultCard({ as: Tag = 'section', className = '', children, ...rest }) {
  return (
    <Tag className={`border-2 border-[#111] shadow-[7px_7px_0_#111] ${className}`} {...rest}>
      {children}
    </Tag>
  )
}