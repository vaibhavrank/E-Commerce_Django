//create a comman instance of axios for api call
//a simple function which have variable url data headrs,method type, options etc and all that
//get all neccesory items from props 
//use them to make a call to the api
//return the response
export default function useApiCall({ url, data, headers, method, options }) {
    const apiCall = async () =>
    {
        try {
            const response = await axios({
                method: method,
                url: url,
                data: data,
                headers: headers,
                ...options
                });
                return response;
        } catch (error) {
            console.error(error);
            return error;
        }
    }
    return apiCall;
}
