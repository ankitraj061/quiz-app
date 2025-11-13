import { config } from "@/lib/utils";
import { handleApiError } from "./apiError";
import { ApiSuccessReponse } from "@/types/apiTypes";

export async function loginAdmin(email: string, password: string) {
    let res = await fetch(`${config.backendUrl}/api/v1/admin/auth/login`, {
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
