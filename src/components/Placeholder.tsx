// Reserved space for a photo that has not arrived yet (see TAREFAS.md, placeholder rule).
// Same proportion as the final image, visible description of what goes there and an "ilustrativo" tag.
// Replacing it with a real photo is done in the data file (field "foto"), never here.

type Props = {
  description: string // e.g. "Foto do quarto: cama de casal, vista da varanda"
  aspect?: string // CSS aspect-ratio of the final photo, e.g. "4 / 5"
  className?: string
}

export default function Placeholder({ description, aspect = '4 / 3', className = '' }: Props) {
  return (
    <div
      role="img"
      aria-label={`Espaço reservado para foto: ${description}`}
      style={{ aspectRatio: aspect }}
      className={`relative flex items-center justify-center bg-sage-200 p-6 text-center text-forest-900 ${className}`}
    >
      <p aria-hidden="true" className="max-w-[24ch] text-sm font-medium">
        {description}
      </p>
      <span
        aria-hidden="true"
        className="absolute top-3 right-3 rounded-full bg-forest-900/10 px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase"
      >
        ilustrativo
      </span>
    </div>
  )
}
