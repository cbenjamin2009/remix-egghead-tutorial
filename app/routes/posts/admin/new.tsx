import { Form, useActionData, useTransition } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node"
import { createPost } from "~/models/post.server";
import { json } from "@remix-run/node"
import invariant from "tiny-invariant";

type ActionData = {
    title: null | string
    slug: null | string
    markdown: null | string
} | undefined

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`



// we are defining an action to handle the form POST request
// this will throw a new Response with status 302 and set the headers location to /posts/admin 
export const action: ActionFunction = async ({request}) => {

    // we will await the request from the submit button. Then turn that into a variable so we can extract
    // the title, slug, and markdown
    // then we will create the new blog post and redirect the user. 
        const formData = await request.formData();

        const title = formData.get('title');
        const slug = formData.get('slug');
        const markdown = formData.get('markdown');

// validation - Must be done in client and server side. We will setup server side validation   
        const errors: ActionData = {
          title: title ? null : "Title is required",
          slug: slug ? null : "Slug is required",
          markdown: markdown ? null : "Markdown is required",
        };
        const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
        if (hasErrors) {
          return json<ActionData>(errors);
        }
        // since forms can accept files and strings, we need to make sure we are only getting strings. 
        invariant(typeof title === "string", "title must be a string")
        invariant(typeof slug === "string", "slug must be a string")
        invariant(typeof markdown === "string", "markdown must be a string")
        await createPost({title, slug, markdown})
    // this action is running in the server so the output is on the VS code terminal and now in browser console
    // this finally clicked... output in browser console is client level, out put terminal is server level
        return redirect('/posts/admin')
  
//   The below code is used if we are not using the 'redirect' from remix. 
    // return new Response(null, {
    //     status: 302
    //     headers: {
    //         Location: "/posts/admin",

    //     }
    // })
}

export default function NewPostRoute(){

// we can pull in information from action data by using useActionData();
// after the actino (submit) has been ran, if there are errors, then this value wil be
// populated with the errors so we can provide server side validation to the user. 
const errors = useActionData() as ActionData;

// PENDING UI 
// If a user has slow network time, we want to hook into Remix transition state 
// so we can let the user know there is progress happening. 

const transition = useTransition()
// we can assume that if a transition is happening, it's because of this form. We will use a state

const isCreating = Boolean(transition.submission)


    return (
        <Form method="post">
                 <p>
        <label>
          Post Title:{" "}
          {errors?.title ? (
            <em className="text-red-600">{errors.title}</em>
          ) : null}
          <input
            type="text"
            name="title"
            className={inputClassName}
          />
        </label>
      </p>
      <p>
        <label>
          Post Slug:{" "}
          {errors?.slug ? (
            <em className="text-red-600">{errors.slug}</em>
          ) : null}
          <input
            type="text"
            name="slug"
            className={inputClassName}
          />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">
          Markdown:{" "}
          {errors?.markdown ? (
            <em className="text-red-600">{errors.markdown}</em>
          ) : null}
        </label>
        <textarea
          id="markdown"
          rows={20}
          name="markdown"
          className={`${inputClassName} font-mono`}
        />
      </p>
            <p className="text-right">
                <button type="submit" className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-900" disabled={isCreating}>
                    {/* we want to disable the button if isCreating is true, and we want to change the button text.  */}
                    {isCreating ? 'Creating...' : 'Create Post'}
                    
                </button>
            </p>
        </Form>
    )
}