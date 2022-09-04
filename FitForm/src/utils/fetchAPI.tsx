

const get = (url: string) => {
    return fetch(url).then((res) => res.json());
};

const post = (url: string, data: object) => {
    return fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then((res) => res.json());
};

export { get, post };