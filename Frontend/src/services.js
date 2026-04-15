const BASE_URL = "http://127.0.0.1:8000";

const apiFetch = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        if (!response.ok) throw new Error(`Backend error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Fetch failed for ${endpoint}:`, error);
        return null;
    }
};

export const fetchLayers = () => apiFetch("/N/");

export const fetchEmbeddingByWord = (searchWord, lang) => 
    apiFetch(`/embedding/by-word/?word=${searchWord}&lang=${lang}`);

export const fetchEmbeddingByID = (token_id, lang) => 
    apiFetch(`/embedding/by-id/?token_id=${token_id}&lang=${lang}`);

export const fetchEmbeddingPageWise = async (page, page_size, lang) => {
    const data = await apiFetch(`/embedding/gallery/?page=${page}&page_size=${page_size}&lang=${lang}`);
    return data || [];
};

export const translate = (text) => apiFetch(`/translate/?text=${text}`);

export const lastInput = () => apiFetch("/lastInput/");

export const fetchNorm = (type, id, num, token, step) => 
    apiFetch(`/norm/?type_l=${type}&id_l=${id}&num=${num}&token=${token}&step=${step}`);

export const fetchNormLen = () => apiFetch("/normlen/");

export const fetchPositionalGradient = () => apiFetch("/positional/matrix");

export const fetchProjectionData = () => apiFetch("/projection/");

export const fetchFeedForwardData = (layerId, type) => 
    apiFetch(`/feedForward/?id_l=${layerId}&type_l=${type}`);

export const fetchSoftmaxSteps = async () => {
    const data = await apiFetch("/softmax/");
    return data || [];
};