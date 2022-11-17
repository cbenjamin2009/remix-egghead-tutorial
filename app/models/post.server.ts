import {prisma} from '~/db.server'
import { Post } from '@prisma/client'

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