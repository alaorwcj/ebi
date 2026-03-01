const getBaseURL = () => {
    const { protocol, hostname } = window.location;
    const envUrl = import.meta.env.VITE_API_URL;

    // If VITE_API_URL is set and NOT localhost, use it.
    // If it IS localhost, only use it if we are actually on localhost.
    if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
        return envUrl;
    }

    // If we are on a public IP or custom domain, use that for the API too
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
        return `${protocol}//${hostname}:8000/api/v1`;
    }

    return envUrl || "http://localhost:8000/api/v1";
};

export const API_URL = getBaseURL();
