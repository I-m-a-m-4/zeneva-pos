
"use client";

import * as React from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { getPostBySlug, blogPosts } from '@/lib/data';
import type { BlogPost, Comment as CommentType } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { ArrowRight, Heart, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';


export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const post = getPostBySlug(slug);
  const { toast } = useToast();

  const [likes, setLikes] = React.useState(post?.likes || 0);
  const [hasLiked, setHasLiked] = React.useState(false);
  const [comments, setComments] = React.useState<CommentType[]>(post?.comments || []);
  const [newComment, setNewComment] = React.useState({ author: '', content: ''});


  if (!post) {
    notFound();
  }

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
      toast({ title: "Thanks for the love!" });
    } else {
      setLikes(likes - 1);
      setHasLiked(false);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.author.trim() || !newComment.content.trim()) {
      toast({ variant: 'destructive', title: "Missing fields", description: "Please enter your name and a comment." });
      return;
    }
    
    const submittedComment: CommentType = {
      id: `comment-${Date.now()}`,
      author: newComment.author,
      content: newComment.content,
      date: new Date().toISOString(),
      avatarUrl: `https://i.pravatar.cc/40?u=${newComment.author.replace(/\s+/g, '')}`,
    };
    
    setComments(prev => [submittedComment, ...prev]);
    setNewComment({ author: '', content: '' });
    toast({ title: "Comment Submitted!", description: "Your comment has been added (simulated)."});
  };

  const otherPosts = blogPosts.filter(p => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="container max-w-5xl mx-auto py-12 px-4">
      <article className="prose prose-lg dark:prose-invert max-w-full mx-auto">
        <div className="mb-8">
            <Badge variant="secondary" className="mb-2">{post.category}</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gradient-primary-accent sm:text-5xl mb-4">
                {post.title}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                         <AvatarImage src={`https://i.pravatar.cc/40?u=${post.author.replace(/\s+/g, '')}`} alt={post.author} />
                        <AvatarFallback>{post.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span>{post.author}</span>
                </div>
                <span>&bull;</span>
                <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
            </div>
        </div>

        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-8 shadow-lg">
          <Image
            src={post.imageUrl}
            alt={`Featured image for ${post.title}`}
            layout="fill"
            objectFit="cover"
            priority
            data-ai-hint={post.dataAiHint}
          />
        </div>

        <div dangerouslySetInnerHTML={{ __html: post.content }} className="prose-p:text-muted-foreground prose-headings:text-foreground" />
      </article>

      <div className="mt-8 pt-6 border-t flex items-center gap-4">
          <Button variant={hasLiked ? "default" : "outline"} onClick={handleLike} className="transition-all duration-200">
            <Heart className={`mr-2 h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />
            <span>{likes.toLocaleString()}</span>
          </Button>
      </div>

       <Separator className="my-12" />

      {/* --- Comments Section --- */}
      <section className="space-y-8">
          <h2 className="text-2xl font-bold">{comments.length} Comment{comments.length !== 1 ? 's' : ''}</h2>
          
          {/* Comment Submission Form */}
          <Card className="bg-muted/40 p-6">
             <form onSubmit={handleCommentSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold">Leave a Comment</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="author">Your Name</Label>
                    <Input id="author" value={newComment.author} onChange={e => setNewComment(p => ({...p, author: e.target.value}))} placeholder="e.g., Ada Eze" />
                  </div>
                </div>
                 <div className="space-y-1.5">
                    <Label htmlFor="comment">Your Comment</Label>
                    <Textarea id="comment" value={newComment.content} onChange={e => setNewComment(p => ({...p, content: e.target.value}))} placeholder="Share your thoughts..." rows={4} />
                  </div>
                  <Button type="submit">Submit Comment</Button>
             </form>
          </Card>

          {/* Comments List */}
          <div className="space-y-6">
              {comments.map(comment => (
                <div key={comment.id} className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={comment.avatarUrl} alt={comment.author} />
                    <AvatarFallback>{comment.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                      <div className="flex items-center justify-between">
                          <p className="font-semibold">{comment.author}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(comment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
          </div>
      </section>

      <div className="mt-16 pt-12 border-t">
        <h2 className="text-2xl font-bold text-center mb-8">More Articles</h2>
        <div className="grid md:grid-cols-2 gap-8">
            {otherPosts.map(p => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group block">
                     <div className="relative h-56 w-full rounded-lg overflow-hidden mb-4 shadow-md transition-shadow group-hover:shadow-xl">
                        <Image
                        src={p.imageUrl}
                        alt={`Image for ${p.title}`}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint={p.dataAiHint}
                        />
                    </div>
                    <Badge variant="outline">{p.category}</Badge>
                    <h3 className="text-xl font-semibold mt-2 group-hover:text-primary transition-colors">{p.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                </Link>
            ))}
        </div>
         <div className="text-center mt-12">
            <Button asChild>
                <Link href="/blog">View All Posts <ArrowRight className="ml-2 h-4 w-4"/></Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
