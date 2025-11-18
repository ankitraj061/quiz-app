import { config } from "@/lib/utils";
import { handleApiError } from "./apiError";
import { ApiSuccessReponse } from "@/types/apiTypes";

export async function loginAdmin(email: string, password: string) {
    const res = await fetch(`${config.backendUrl}/api/v1/admin/auth/login`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
        await handleApiError(res, "Failed to login.")
    }
    const response: ApiSuccessReponse<unknown> = await res.json();
    return response;
}
export async function createAdmin(name: string, email: string,phone: string, password: string) {
    const res = await fetch(`${config.backendUrl}/api/v1/admin`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({ name, email, phone, password })
    });
    if (!res.ok) {
        await handleApiError(res, "Failed to create admin.")
    }
    const response: ApiSuccessReponse<unknown> = await res.json();
    return response;
}
