import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'

const alertOptions = {
  success: {
    Icon: CircleCheck,
    className: 'bg-[#d9fbe5] text-[#127a3d]',
  },
  error: {
    Icon: CircleAlert,
    className: 'bg-[#ffe0e8] text-[#d01445]',
  },
  info: {
    Icon: Info,
    className: 'bg-[#dfe9ff] text-[#2457b8]',
  },
}

function joinClassNames(...classNames) {
  return classNames.filter(Boolean).join(' ')
}

export default function Alert({ message, type = 'info', onClose, className }) {
  if (!message) {
    return null
  }

  const normalizedType = type === 'sucss' ? 'success' : type
  const option = alertOptions[normalizedType] ?? alertOptions.info
  const Icon = option.Icon

  return (
    <div
      className={joinClassNames(
        'mb-3 flex min-h-[42px] items-center gap-2 border-[3px] border-[#111] px-2.5 py-2 text-[0.76rem] font-bold shadow-[3px_3px_0_#111] max-[560px]:border-[2px] max-[560px]:text-[0.7rem]',
        option.className,
        className,
      )}
      role={normalizedType === 'error' ? 'alert' : 'status'}
      aria-live={normalizedType === 'error' ? 'assertive' : 'polite'}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1 leading-[1.3]">{message}</p>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="grid h-6 w-6 shrink-0 place-items-center border-2 border-[#111] bg-white text-[#111] transition-colors hover:bg-[#111] hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/20"
          aria-label="Dismiss alert"
          title="Dismiss alert"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}
