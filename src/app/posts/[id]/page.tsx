import React from 'react'
import PostDetails from './PostDetails'

interface PostDetailsPageProps {
    params: Promise<{ id: string }>
}
export default async function PostDetailsPage({params}: PostDetailsPageProps) {
    const {id} = await params
  return (
    <div>
        <PostDetails postId={id} />
    </div>
  )
}
