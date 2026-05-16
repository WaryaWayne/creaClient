import { cn } from '#/lib/utils'
import logoSvg from '#/assets/logo.svg?raw'

export function AppLogo({
  className,
  imageClassName,
}: {
  readonly className?: string
  readonly imageClassName?: string
}) {
  return (
    <span
      className={cn('inline-flex min-w-0 items-center', className)}
      aria-label="CreaClient"
      role="img"
    >
      <span
        aria-hidden="true"
        className={cn(
          'block h-8 w-auto text-foreground [&>svg]:block [&>svg]:h-full [&>svg]:w-auto',
          imageClassName,
        )}
        dangerouslySetInnerHTML={{ __html: logoSvg }}
      />
    </span>
  )
}
