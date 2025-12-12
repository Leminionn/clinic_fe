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
	const url = `${normalizedBase}/${normalizedEndpoint}`;
	console.log("API URL:", url);
	let headers;
	if (token) {
		headers = {
			"Content-type": "application/json",
			Authorization: "Bearer " + token,
		};
	} else {
		headers = {
			"Content-type": "application/json",
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
	const response = await fetch(url, reqInf);
	// Nếu bị 401 thì chuyển về trang login FE
	if (response.status === 401) {
		window.location.href = "/login";
		return;
	}
	const data = await response.json();
	if (response.ok) {
		console.log(data);
		onSuccess(data);
	} else {
		onFailure(data);
	}
};
