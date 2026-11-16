import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://api.psicodaily.tech/api/";

export async function apiFetch(endpoint, options = {}) {
    const token = await AsyncStorage.getItem("@psicodaily_token");

    const headers = {
        ...(options.headers || {}),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

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