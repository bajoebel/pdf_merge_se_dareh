const axios = require('axios');

function getApiBaseUrl() {
    const baseUrl = process.env.API_BASE_URL;

    if (!baseUrl) {
        throw new Error(
            'API_BASE_URL belum dikonfigurasi'
        );
    }

    return baseUrl.replace(/\/+$/, '');
}

function getAuthToken(req) {
    if (!req.session || !req.session.authenticated) {
        throw new Error('Session login tidak tersedia');
    }

    if (!req.session.authToken) {
        throw new Error(
            'X-AUTH-TOKEN tidak tersedia di session'
        );
    }

    return req.session.authToken;
}

async function apiGet(
    req,
    endpoint,
    params = {}
) {
    const token = getAuthToken(req);

    const url =
        `${getApiBaseUrl()}/` +
        endpoint.replace(/^\/+/, '');

    console.log('API GET:', url);

    const response = await axios.get(url, {
        params,
        headers: {
            'X-AUTH-TOKEN': token,
            'Accept': 'application/json'
        },
        timeout: 60000
    });

    return response.data;
}

module.exports = {
    apiGet
};