import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://10.92.11.22:5000";

export async function apiFetch(endpoint, options = {}) {
    const token = await AsyncStorage.getItem(
        "@psicodaily_token"
    );

    const headers = {
        ...(options.headers || {}),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,
            headers,
        }
    );

    const texto = await response.text();

    let data = {};

    try {
        data = texto ? JSON.parse(texto) : {};
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.error ||
            data.message ||
            `Erro ${response.status} ao comunicar com o servidor.`
        );
    }

    return data;
}