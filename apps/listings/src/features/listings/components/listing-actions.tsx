import { Heart, NotebookPen, Trash2 } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { cn } from '#/lib/utils'

export function ListingActions({
  listingKey,
  compact = false,
}: {
  readonly listingKey: string
  readonly compact?: boolean
}) {
  const action = (name: 'favorite' | 'trash' | 'note') => {
    // TODO(auth): verify the Better Auth session before persisting user actions.
    console.log('done', { action: name, listingKey })
  }

  return (
    <div className={cn('flex items-center gap-1', compact && 'gap-0.5')}>
      <Button
        aria-label="Favorite listing"
        title="Favorite listing"
        type="button"
        variant="ghost"
        size={compact ? 'icon-sm' : 'icon'}
        onClick={() => action('favorite')}
      >
        <Heart />
      </Button>
      <Button
        aria-label="Add note"
        title="Add note"
        type="button"
        variant="ghost"
        size={compact ? 'icon-sm' : 'icon'}
        onClick={() => action('note')}
      >
        <NotebookPen />
      </Button>
      <Button
        aria-label="Trash listing"
        title="Trash listing"
        type="button"
        variant="ghost"
        size={compact ? 'icon-sm' : 'icon'}
        onClick={() => action('trash')}
      >
        <Trash2 />
      </Button>
    </div>
  )
}
