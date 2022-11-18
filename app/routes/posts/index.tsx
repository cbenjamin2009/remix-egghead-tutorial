import { Link, useLoaderData } from "@remix-run/react"
import {json} from '@remix-run/node'
import type {LoaderFunction } from '@remix-run/node'
import { getPostListings } from "~/models/post.server";
import { useOptionalAdminUser } from "~/utils";

// we want to set a type for the posts for TypeScript
// We are going to create a type for the posts to be the type of the getPostListings
// but we want it to be the return type of the getPostListings
// And we want it wait for getPostListings to run so that we know what the retur types are
// so we will use Awaited and the return type is the type of the getPostListings (slug and title)
type LoaderData = {
    posts: Awaited<ReturnType<typeof getPostListings>>
}

// set the loader to be a LoaderFunction 
export const loader: LoaderFunction = async () => {

    const posts = await getPostListings();

    // json needs to return LoaderData object 
    return json<LoaderData>({posts})

    // The below code is only needed if you do not use 'import {json} from '@remix-run/node' '
    // return new Response(postsString, {
    //     headers: {
    //         'Content-Type': 'application/json'
    //     }
    // })
}

export default function PostsRoute() {
// we will use as LoaderData  by type casting 
    const {posts} = useLoaderData() as LoaderData;
    const adminUser = useOptionalAdminUser()

    // this is no longer needed since we created a hook for useOptionalAdminUser in utils file so we know if the user is admin already 
    // const isAdmin = user?.email === ENV.ADMIN_EMAIL;


// The returned link will use PreFetch which will begin to fetch the posts 
// when the user hovers over the link. Since the user will hover over the link for about 500 ms before clicking. 
// if user hovers or focuses, it will prefetch when set to 'intent' the default is 'none'
    return (
        <main>
            <h1>Posts</h1>
            {adminUser ? (
                <Link to="admin" className="text-red-600 underline">Admin</Link>
            ): null}
           
            <ul>
                {posts.map((post) => (
                    <li key={post.slug}>
                        <Link to={post.slug} prefetch="intent" className="text-blue-600 underline">{post.title}</Link>
                    </li>
                ))}
            </ul>
        </main>
    )
}