import type { LinksFunction, LoaderArgs, LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./session.server";
import { getEnv } from "./env.server";

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>
  ENV: ReturnType<typeof getEnv>
}

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Remix Notes",
  viewport: "width=device-width,initial-scale=1",
});

export const loader: LoaderFunction = async ({ request }) => {
 
  return json({
    user: await getUser(request),
    ENV: getEnv(),
  });
}

export default function App() {
  const data = useLoaderData() as LoaderData;
  // this loader is pulling in the environmental variables 
  // we are then using a script that is setting the HTML content to pull in the data.ENV variable for admin email user 
  //
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <script dangerouslySetInnerHTML={{__html: `window.ENV = ${JSON.stringify(data.ENV)}`}}/>
        <LiveReload />
      </body>
    </html>
  );
}
