import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar'
import { Button } from '@workspace/ui/components/button'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { authClient } from '#/lib/auth-client'

export default function BetterAuthHeader() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return <Skeleton className="size-8 rounded-full" />
  }

  if (session?.user) {
    const fallback = session.user.name.charAt(0).toUpperCase() || 'U'

    return (
      <div className="flex items-center gap-2">
        <Avatar className="size-8">
          {session.user.image ? (
            <AvatarImage src={session.user.image} alt="" />
          ) : null}
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void authClient.signOut()
          }}
        >
          Sign out
        </Button>
      </div>
    )
  }

  return null
}
