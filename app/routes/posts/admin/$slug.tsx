import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useParams,
  useTransition,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createPost, deletePost, getPost, updatePost } from "~/models/post.server";
import type {Post} from "~/models/post.server"
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { requireAdminUser } from "~/session.server";

type ActionData =
  | {
      title: null | string;
      slug: null | string;
      markdown: null | string;
    }
  | undefined;

  type LoaderData = {
    post?: Post
  } 

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

// adding loader to ensure user is an admin user to protect the route from manually loading
export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUser(request);
  invariant(params.slug, 'slug is required');
  if (params.slug === "new") {
    return json<LoaderData>({});
  }

  const post = await getPost(params.slug);
  
  if (!post) {
    throw new Response('Not Found', {status: 404})
  }

  return json<LoaderData>({ post });
};

// we are defining an action to handle the form POST request
// this will throw a new Response with status 302 and set the headers location to /posts/admin
export const action: ActionFunction = async ({ request, params }) => {
  // require admin user
  await requireAdminUser(request);

  // we will await the request from the submit button. Then turn that into a variable so we can extract
  // the title, slug, and markdown
  // then we will create the new blog post and redirect the user.
  const formData = await request.formData();

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");
  invariant(params.slug, 'slug is required');
  // lets check the intent to see if we are adding, updating, or deleting
  const intent = formData.get("intent");
  if (intent === 'delete') {
    await deletePost(params.slug)
    return redirect('/posts/admin')

  }
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
  invariant(typeof title === "string", "title must be a string");
  invariant(typeof slug === "string", "slug must be a string");
  invariant(typeof markdown === "string", "markdown must be a string");

  if (params.slug === "new") {
    await createPost({ title, slug, markdown });
  } else {
    await updatePost(params.slug, { title, slug, markdown });
  }
  // this action is running in the server so the output is on the VS code terminal and now in browser console
  // this finally clicked... output in browser console is client level, out put terminal is server level
  return redirect("/posts/admin");

  //   The below code is used if we are not using the 'redirect' from remix.
  // return new Response(null, {
  //     status: 302
  //     headers: {
  //         Location: "/posts/admin",

  //     }
  // })
};

export default function NewPostRoute() {
  // we will use this same route for editing data or adding new data
  // we will pull in the loader data and then assign a key={} to the Form element
  // which will cause it to render different Form elements for each post.
  // if the key is null we will assume it's a new post.
  // edit functionality will work using input form 'default value' equal to the slug.
  const data = useLoaderData() as LoaderData;

  // we can pull in information from action data by using useActionData();
  // after the actino (submit) has been ran, if there are errors, then this value wil be
  // populated with the errors so we can provide server side validation to the user.
  const errors = useActionData() as ActionData;

  // PENDING UI
  // If a user has slow network time, we want to hook into Remix transition state
  // so we can let the user know there is progress happening.

  const transition = useTransition();
  // we can assume that if a transition is happening, it's because of this form. We will use a state

  // const isCreating = Boolean(transition.submission)

  // is updating to check if we are updating an existing post. we are checking the 'intent' in the form data 
  const isUpdating = transition.submission?.formData.get("intent") === "update";
  const isCreating = transition.submission?.formData.get("intent") === "update";
  const isDeleting = transition.submission?.formData.get("intent") === "delete";
  // we want to update the button to reflect it's updating, instead of creating.
  //if the data from the loader doesn't contain a post then we know we have a new post
  const isNewPost = !data.post;

  return (
    <Form method="post" key={data.post?.slug ?? "new"}>
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
            defaultValue={data.post?.title}
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
            defaultValue={data.post?.slug}
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
          defaultValue={data.post?.markdown}
          className={`${inputClassName} font-mono`}
        />
      </p>
      <div className="flex justify-end gap-4">
        {/* if this isn't a new post, we are updating, we want to be able to delete the post. Setup new button, with delete intent */}
        {isNewPost ? null : (
          <button
            type="submit"
            name="intent"
            value="delete"
            className="rounded bg-red-500 py-2 px-4 text-white hover:bg-red-900"
            disabled={isDeleting}
          >
            {/* we want to disable the button if isCreating is true, and we want to change the button text.  */}
            {isDeleting ? "Deleting.." : "Delete"}
          </button>
        )}

        <button
          type="submit"
          name="intent"
          value={isNewPost ? "create" : "update"}
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-900"
          disabled={isCreating || isUpdating}
        >
          {/* we want to disable the button if isCreating is true, and we want to change the button text.  */}
          {isNewPost ? (isCreating ? "Creating.." : "Create Post") : null}
          {isNewPost ? null : isUpdating ? "Updating.." : "Update"}
        </button>
      </div>
    </Form>
  );
}

//This will catch known errors that are thrown, it does not unknown unhandled errors. 
export function CatchBoundary() {
  // catches any thrown Responses 
  const caught = useCatch();
  // we can use remix to pull in any params 
  const params = useParams();
  if (caught.status === 404){
  
  return (
    <div>
      <h1>Caught</h1>
      <p>Status: {caught.status}</p>
      <p>Error: The post with slug {params.slug} does not exist!</p>
      <pre>
        <code>{JSON.stringify(caught.data, null, 2)}</code>
      </pre>
    </div>
  );
  }
  throw new Error(`Unsupported thrown reponse status code ${caught.status}`)

}

