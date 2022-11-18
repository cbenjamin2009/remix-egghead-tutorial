import {prisma} from '~/db.server'
import type { Post } from '@prisma/client'

export type { Post };

// to avoid over-fetching, only pulling exactly what we need, we will create a new function to select only what we want. 
// select takes fields from the query and you set them to true to only pull what you want. 
export async function getPostListings(){
    return prisma.post.findMany({
        select: {
            slug: true,
            title: true,
        }
    });

}

export async function getPost(slug: string){
    return prisma.post.findUnique({where: {slug}})
}

// only used on server using .server convention to remix and developers that the code never will appear in client bundler
export async function getPosts() {

  
//   since we will be pulling from DB using prisma, we will remove this array
    // const posts = [
    //     {
    //         slug: 'my-first-post',
    //         title: 'My First Post',
    //     }, 
    //     {
    //         slug: 'my-second-post',
    //         title: 'My Second Post',
    //     }
        
    // ]

    return prisma.post.findMany();
}

export async function createPost(post: Pick<Post, 'slug' | 'title' | 'markdown'>){

    return prisma.post.create({data: post})

}
export async function updatePost(slug: string, post: Pick<Post, 'slug' | 'title' | 'markdown'>){

    return prisma.post.update({data: post, where: {slug}})

}
export async function deletePost(slug: string){

    return prisma.post.delete({where: {slug}})

}