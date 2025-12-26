import { baseURL } from "./urls";

export const apiCall = async (
	endpoint: string,
	method: string,
	token: string | null,
	body: string | null,
	onSuccess: any,
	onFailure: any
) => {
	// normalize baseURL and endpoint to avoid duplicate slashes
	const normalizedBase = (baseURL || "").replace(/\/$/, "");
	const normalizedEndpoint = (endpoint || "").replace(/^\//, "");
	const url = normalizedBase
		? `${normalizedBase}/${normalizedEndpoint}`
		: `/${normalizedEndpoint}`;
	console.log("API URL:", url);
	let headers;
	if (token) {
		headers = {
			"Content-type": "application/json",
			"ngrok-skip-browser-warning": "69420",
			Authorization: "Bearer " + token,
		};
	} else {
		headers = {
			"Content-type": "application/json",
			"ngrok-skip-browser-warning": "69420",
		};
	}
	let reqInf;
	if (body) {
		reqInf = {
			method: method,
			headers: headers,
			body: body,
		};
	} else {
		reqInf = {
			method: method,
			headers: headers,
		};
	}
	try {
		const response = await fetch(url, reqInf);

		// Nếu bị 401 thì chuyển về trang login FE
		if (response.status === 401) {
			console.error("🔴 401 Unauthorized:", {
				url,
				method,
				token: token ? "Token exists" : "No token",
				responseStatus: response.status,
			});
			alert("Session expired! Please login again.");
			window.location.href = "/login";
			return;
		}

		// Try to parse JSON, but handle non-JSON responses gracefully
		let data: any = null;
		try {
			data = await response.json();
		} catch (parseErr) {
			console.error("Failed to parse JSON response", parseErr);
			if (response.ok) {
				// Successful status but empty/non-JSON body — call success with null
				onSuccess(null);
				return;
			} else {
				onFailure({
					message: "Invalid response from server",
					status: response.status,
				});
				return;
			}
		}

		if (response.ok) {
			console.log(data);
			onSuccess(data);
		} else {
			onFailure(data);
		}
	} catch (err: any) {
		console.error("Network or API error", err);
		onFailure({ message: err?.message || "Network error" });
	}
};
