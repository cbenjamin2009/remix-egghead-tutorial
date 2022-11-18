// this file is environemnt variables that will be accessed
// from the server. Initial intent will be sure only admins
//  can access the /admin page. 

import invariant from "tiny-invariant"

// this function will get local .env variables and return them so the server can acess. 
// these are exposed to the client so do not use secure variables here 
export function getEnv() {
    invariant(process.env.ADMIN_EMAIL, 'ADMIN_EMAIL is required')
    return {
        ADMIN_EMAIL: process.env.ADMIN_EMAIL 
    }
}

// setting the type based on the returned type value from process.env 
type ENV = ReturnType<typeof getEnv>

// declare teh global variable for the ENV variable, and on the interface since the variable apppears there, we need to declare it's type too. 
declare global {
    var ENV: ENV;
    interface Window {
        ENV: ENV;
    }
}