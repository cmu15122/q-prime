import { toast } from 'material-react-toastify';

export const showErrorToast = (message) => {
    toast.error(message, {
        position: "bottom-left",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
};

export const showToast = (message) => {
    toast(message, {
        position: "bottom-left",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
};
