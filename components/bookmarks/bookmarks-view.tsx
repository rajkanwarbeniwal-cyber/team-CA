'use client'

import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Bookmark, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { QuestionCard } from '@/components/exam/question-card'
import { toast } from 'sonner'
import type { ExamQuestion } from '@/lib/types'

interface BookmarkedQuestion {
  id: string
  question_id: string
  bookmarked_at: string
  question: ExamQuestion & { mock_tests: { title: string } }
}

export function BookmarksView() {
  const supabase = useMemo(() => createClient(), [])
  const [removing, setRemoving] = useState<string | null>(null)

  const { data: bookmarks, isLoading, refetch } = useQuery({
    queryKey: ['bookmarked-questions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('attempt_answers')
        .select(`
          id,
          question_id,
          bookmarked_at,
          questions(
            *,
            mock_tests(title)
          )
        `)
        .eq('user_id', user.id)
        .eq('is_bookmarked', true)
        .order('bookmarked_at', { ascending: false })

      if (error) {
        console.error('[v0] Error fetching bookmarks:', error)
        throw error
      }

      return (data || []) as unknown as BookmarkedQuestion[]
    },
  })

  const handleRemoveBookmark = useCallback(async (answerId: string) => {
    setRemoving(answerId)
    try {
      const { error } = await supabase
        .from('attempt_answers')
        .update({ is_bookmarked: false })
        .eq('id', answerId)

      if (error) throw error
      toast.success('Bookmark removed')
      refetch()
    } catch (err) {
      console.error('[v0] Error removing bookmark:', err)
      toast.error('Failed to remove bookmark')
    } finally {
      setRemoving(null)
    }
  }, [supabase, refetch])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    )
  }

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardContent className="flex min-h-96 flex-col items-center justify-center gap-3 pt-12">
            <div className="rounded-full bg-muted p-3">
              <Bookmark className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground">No bookmarked questions yet</p>
            <p className="text-sm text-muted-foreground">Questions you bookmark during exams will appear here for later review</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Bookmarked Questions</h1>
          <p className="mt-1 text-sm text-muted-foreground">{bookmarks.length} question{bookmarks.length !== 1 ? 's' : ''} saved for review</p>
        </div>
        <Badge variant="outline" className="text-lg">
          <Bookmark className="mr-1 h-4 w-4" />
          {bookmarks.length}
        </Badge>
      </div>

      <div className="space-y-4">
        {bookmarks.map((bookmark) => (
          <Card key={bookmark.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  {bookmark.question.mock_tests?.title || 'Unknown test'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Bookmarked {new Date(bookmark.bookmarked_at).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveBookmark(bookmark.id)}
                disabled={removing === bookmark.id}
                className="text-destructive hover:text-destructive"
              >
                {removing === bookmark.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <QuestionCard
                question={bookmark.question as ExamQuestion}
                index={0}
                total={1}
                selected={null}
                bookmarked={true}
                onSelect={() => {}}
                onClear={() => {}}
                onToggleBookmark={() => handleRemoveBookmark(bookmark.id)}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
