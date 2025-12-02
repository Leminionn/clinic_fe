import { useState } from "react";
import ReactDOM from "react-dom";
import { Snackbar, Alert } from "@mui/material";

type AlertSeverity = "success" | "error" | "warning" | "info";

let showMessageFn: (msg: string, type?: AlertSeverity) => void;

export function showMessage(message: string, type: AlertSeverity = "success") {
  if (showMessageFn) showMessageFn(message, type);
  else console.warn("GlobalMessage component chưa được mount.");
}

export default function ActionResultMessage() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertSeverity>("success");

  showMessageFn = (msg: string, type: AlertSeverity = "success") => {
    setMessage(msg);
    setSeverity(type);
    setOpen(true);
    setTimeout(() => setOpen(false), 2000);
  };

  return ReactDOM.createPortal(
    <Snackbar open={open} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
      <Alert severity={severity} sx={{ width: "100%", borderRadius: "10px" }}>
        {message}
      </Alert>
    </Snackbar>,
    document.body
  );
}