import { authClient } from '#/lib/auth-client'

export default function BetterAuthHeader() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="h-8 w-8 bg-background dark:bg-background animate-pulse" />
    )
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image ? (
          <img src={session.user.image} alt="" className="h-8 w-8" />
        ) : (
          <div className="h-8 w-8 bg-background dark:bg-background flex items-center justify-center">
            <span className="text-xs font-medium text-foreground dark:text-foreground">
              {session.user.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <button
          onClick={() => {
            void authClient.signOut()
          }}
          className="flex-1 h-9 px-4 text-sm font-medium bg-background dark:bg-background text-foreground dark:text-foreground border border-border dark:border-border hover:bg-background dark:hover:bg-background transition-colors"
        >
          Sign out
        </button>
      </div>
    )
  }

  return null
}
