// this will be the dynamic page for all posts

import { LoaderFunction, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react";
import { getPost } from "~/models/post.server";
// marked is not typed for typescript, so we will install npm package `npm i -D @types/marked' as dev dependencies
import {marked} from 'marked'

// we will use a library called invariant to ensure our slug is of correct type 

import invariant from "tiny-invariant";

// setup type for the LoaderData so it knows what types we are loading
type LoaderData = {
    title: string
    html: string
}

export const loader: LoaderFunction = async({params}) => {
    const {slug} = params
    invariant(slug, 'slug is required') // throw error if slug is undefined
    const post = await getPost(slug)
    invariant(post, `post not found: ${slug}`)
    const html = marked(post.markdown)

    // this over sends more info in the post, we really just want to send the post title as post since that's all we need
    // return (json({post, html}))

    return json<LoaderData>({title: post.title, html})
}


export default function PostRoute() {

    // const {post, html} = useLoaderData();
    const {title, html} = useLoaderData() as LoaderData;

    return (
        <main className="mx-auto max-w-4xl">
            <h1 className="my-6 border-b-2 text-center text-3xl">{title}</h1>
            <div dangerouslySetInnerHTML={{__html: html}}>
                {/* here we will render the markdown of the post, but we need to convert it to HTML from markdown. We will use: 'marked' `npm i marked`  */}
            </div>
        </main>
    )
}