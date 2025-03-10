import React from 'react'
import PostDetails from './PostDetails'

interface PostDetailsPageProps {
    params: Promise<{ id: string }>
}
export default async function PostDetailsPage({params}: PostDetailsPageProps) {
    const {id} = await params
  return (
    <div className='h-[90vh] w-full'>
        <PostDetails postId={id} />
    </div>
  )
}
