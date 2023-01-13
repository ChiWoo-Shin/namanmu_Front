import React, { useState } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function CreateInvitation({ mySessionId }) {
  const [invLink, setInvLink] = useState(false);
  const [open, setOpen] = useState(false);

  function createLink_and_copy() {
    let sessionId = mySessionId;
    let invitationLink = "http://localhost:3000/join?sessionId=" + sessionId;
    navigator.clipboard
      .writeText(invitationLink)
      .then(() => {
        console.log("Invitation link copied to clipboard");
        setInvLink(true);
        setOpen(true);
      })
      .catch(() => {
        console.log("Failed to copy to clipboard.");
      });
  }

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          color="success"
          onClick={createLink_and_copy}
        >
          초대링크
        </Button>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert
            onClose={handleClose}
            severity="success"
            sx={{ width: "100%" }}
          >
            초대링크 복사에 성공했습니다.
          </Alert>
        </Snackbar>
      </Stack>
    </>
  );
}

export default CreateInvitation;
