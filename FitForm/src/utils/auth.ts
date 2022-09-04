// Manage state of current user

import { BASEURL } from "./constants";
import { get, post } from "./fetchAPI"
import { storeToken, getToken, clearToken } from "../redux/api/apiSlice"

// The interface for the functions to be given, take no arguments and returns nothing
interface OnLogoutProps {
    (): void;
};
interface OnLoginProps {
    (): void;
};


export class AuthManager {
    onLogout: OnLogoutProps[];
    onLogin: OnLoginProps[];

    constructor() {
        this.onLogout = [];
        this.onLogin = [];
    }

    listenLogout(fn: OnLogoutProps) {
        this.onLogout.push(fn);
    }

    listenLogin(fn: OnLoginProps) {
        this.onLogin.push(fn);
    }

    async login(email, password) {
        // Perform login, update tokens access and fresh tokens
        const res = await post(`${BASEURL}token/`, { username: email, password });
        console.log("Login res: ", res)
        if (res.refresh && res.access) {


            if (await storeToken(res.access) && await storeToken(res.refresh, false)) {
                this.onLogin.forEach(fn => fn());
            }
        }
        // Only call this on successful login.
    }

    async logout() {
        console.log("Loggin out")
        if (await clearToken()) {
            this.onLogout.forEach(fn => fn());
        }
    }

    async refreshToken(): Promise<boolean> {
        // Get refresh token and refresh the access token
        const res = await fetch(`${BASEURL}token/refresh/`);
        console.log("Refresh res", res)
        return true
    }

}


const auth = new AuthManager();
export default auth;