import axios from "axios";

export async function fetchWithRetry(url: string, params: any = {}, retries = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await axios.get(url, { params });
            return res.data;
        } catch (err) {
            console.warn(`Retry ${i + 1}/${retries} failed for ${url}`);
            if (i === retries - 1) throw err;
            await new Promise(r => setTimeout(r, 500)); // чекаємо півсекунди
        }
    }
}
