import { baseURL } from "./urls"

export const apiCall = async (endpoint:string, method:string,token:string|null, body:string|null, onSuccess:any, onFailure:any)=> {
    const url = baseURL+endpoint;
    console.log(baseURL);
    let headers;
    if(token) {
        headers = {
            "Content-type":"application/json",
            "Authorization":"Bearer "+token
        }
    }
    else {
        headers= {
            "Content-type":"application/json"
        }
    }
    let reqInf;
    if(body) {
        reqInf = {
            method:method,
            headers:headers,
            body:body
        }
    }
    else {
        reqInf= {
            method:method,
            headers:headers
        }
    }
    const response = await fetch(url,reqInf);
    const data = await response.json();
    if(response.ok) {
        console.log(data);
        onSuccess(data);
    }
    else {
        onFailure(data);
    }

}