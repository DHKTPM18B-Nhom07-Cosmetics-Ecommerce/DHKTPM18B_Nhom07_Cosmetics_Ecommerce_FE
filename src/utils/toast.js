import { toast } from "react-toastify";

export const notifySuccess = (msg) =>
  toast.success(msg, {
    style: { fontSize: "14px" },
  });

export const notifyError = (msg) =>
  toast.error(msg, {
    style: { fontSize: "14px" },
  });
