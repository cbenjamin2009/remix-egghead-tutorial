import { Link } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import {json} from "@remix-run/node"
import { requireAdminUser } from "~/session.server";

// adding a loader function to confirm the user is an admin user, if not handle the logout request
export const loader: LoaderFunction = async ({request}) => {
    await requireAdminUser(request);

  return json({})
    
  }
  

export default function AdminIndexRoute(){
    return (
        <p>
        <Link to="new" className="text-blue-600 underline">Create New Post</Link>
        </p>
    )
}