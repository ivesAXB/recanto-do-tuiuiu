import { STATUS_LABEL, type Status } from './reservations'

const STATUS_BADGE: Record<Status, string> = {
  interesse: 'bg-gold-400 text-forest-900',
  confirmada: 'bg-[#2F7A52] text-white',
  concluida: 'bg-sand-100/15 text-sand-100',
  cancelada: 'bg-tuiuiu-500/30 text-sand-100',
}

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${STATUS_BADGE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}
