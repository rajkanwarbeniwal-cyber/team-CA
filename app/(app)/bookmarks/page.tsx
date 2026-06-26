import { BookmarksView } from '@/components/bookmarks/bookmarks-view'

export const metadata = {
  title: 'Bookmarked Questions',
  description: 'Review your bookmarked questions from mock tests',
}

export default function BookmarksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Bookmarked Questions</h1>
        <p className="mt-2 text-muted-foreground">Review questions you saved during your exam attempts</p>
      </div>
      <BookmarksView />
    </div>
  )
}
