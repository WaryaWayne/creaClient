import { cn } from '#/lib/utils'

export const appLogoSrc = '/media/icons/logo-dark-512w.png'

export function AppLogo({
  className,
  imageClassName,
}: {
  readonly className?: string
  readonly imageClassName?: string
}) {
  return (
    <span className={cn('inline-flex min-w-0 items-center', className)}>
      <img
        src={appLogoSrc}
        alt="CreaClient"
        className={cn('block h-8 w-auto object-contain', imageClassName)}
      />
    </span>
  )
}
