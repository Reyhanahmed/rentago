import { toast } from "react-toastify";

export const showError = (errorMessage: string) => {
  toast.error(errorMessage);
};

export const showSuccess = (successMessage: string) => {
  toast.success(successMessage);
};
