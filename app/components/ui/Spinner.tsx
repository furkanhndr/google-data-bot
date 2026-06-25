interface SpinnerProps {
  size?: number
  color?: string
}

const sizeClasses: Record<number, string> = {
  20: 'w-5 h-5',
  32: 'w-8 h-8',
}

const colorClasses: Record<string, string> = {
  '#2563EB': 'border-blue-200 border-t-primary',
  '#16A34A': 'border-green-200 border-t-success',
  '#DC2626': 'border-red-200 border-t-danger',
}

export function Spinner({ size = 20, color = '#2563EB' }: SpinnerProps) {
  return (
    <span className={`inline-block rounded-full flex-shrink-0 animate-spin border-2 ${sizeClasses[size] ?? 'w-5 h-5'} ${colorClasses[color] ?? 'border-blue-200 border-t-primary'}`} />
  )
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-200">
      <Spinner size={32} />
    </div>
  )
}
