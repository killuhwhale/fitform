import { getToken } from "../redux/api/apiSlice";


const get = (url: string) => {
    return fetch(url).then((res) => res.json());
};

const post = async (url: string, data: object) => {
    const token = await getToken()


    return fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            // Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
};

export { get, post };