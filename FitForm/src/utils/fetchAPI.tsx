import { getToken } from "../redux/api/apiSlice";


const get = (url: string) => {
    return fetch(url).then((res) => res.json());
};

const post = async (url: string, data: object) => {
    return fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
};

const authPost = async (url: string, data: string, contentType = 'application/json') => {
    const token = await getToken()


    return fetch(url, {
        method: 'POST',
        headers: {
            // Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': contentType,
        },
        body: data
    })
};
const authDelete = async (url: string, data: string, contentType = 'application/json') => {
    const token = await getToken()

    return fetch(url, {
        method: 'DELETE',
        headers: {
            // Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': contentType,
        },
        body: data
    })
};
const authGet = async (url: string) => {
    const token = await getToken()


    return fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    })
};

const refreshAccessToken = async (url: string) => {
    const token = await getToken(false)

    return fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            refresh: token
        })
    })
};



export { post, authPost, refreshAccessToken, authGet, authDelete };