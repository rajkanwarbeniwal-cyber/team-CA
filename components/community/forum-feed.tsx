"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { MessageSquare, ThumbsUp, Eye, Pin } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { ForumPost } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export function ForumFeed() {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadPosts() {
      const { data } = await supabase
        .from("forum_posts")
        .select("*")
        .eq("status", "published")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20)

      if (data) setPosts(data)
      setLoading(false)
    }

    loadPosts()
  }, [supabase])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass h-32 animate-pulse rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {posts.length === 0 ? (
        <Card className="glass border-0 p-8 text-center">
          <p className="text-muted-foreground">No discussions yet. Be the first to start one!</p>
        </Card>
      ) : (
        posts.map((post) => (
          <motion.div key={post.id} variants={itemVariants}>
            <Link href={`/community/${post.id}`}>
              <Card className="glass group relative overflow-hidden border-0 p-6 transition-all hover:shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10">
                  {/* Header */}
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      {post.is_pinned && (
                        <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-orange-500/20 px-2 py-1">
                          <Pin className="h-3 w-3 text-orange-500" />
                          <span className="text-xs font-semibold text-orange-600">Pinned</span>
                        </div>
                      )}
                      <h3 className="text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content preview */}
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {post.content}
                  </p>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Footer stats */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.replies_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{post.likes_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.view_count}</span>
                      </div>
                    </div>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))
      )}
    </motion.div>
  )
}
