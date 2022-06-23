import axios from "axios";
import { toast } from 'material-react-toastify';

let httpInstance = axios.create({
    baseURL: "http://localhost:8000/",
    headers: {
        "Content-type": "application/json"
    }
});

httpInstance.interceptors.request.use(
    (req) => {
       return req;
    },
    (err) => {
       return Promise.reject(err);
    }
);
 
httpInstance.interceptors.response.use(
    (res) => {
        if (res.data.message) {
            toast(res.data.message, {
                position: "bottom-left",
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
        return res;
    },
    (err) => {
        if (err.response.data.message) {
            let message = err.message + ": " + err.response.data.message;
            toast.error(message, {
                position: "bottom-left",
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
       return Promise.reject(err);
    }
);

export default httpInstance;