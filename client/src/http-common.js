import axios from "axios";
import { toast } from 'material-react-toastify';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

let httpInstance = axios.create({
    baseURL: "http://localhost:8000/",
    headers: {
        "Content-type": "application/json"
    }
});

httpInstance.interceptors.request.use(
    (req) => {
        const userCookies = cookies.get('user');
        if (userCookies != null) {
            req.headers['Authorization'] = userCookies['access_token'];
        }
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
       return Promise.reject(err);
    }
);

export default httpInstance;