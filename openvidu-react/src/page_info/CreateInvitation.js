import React from "react";
import { Button } from "react-bootstrap";

function CreateInvitation({mySessionId}) {
    
    function createLink_and_copy() {
        let sessionId = mySessionId;
          let invitationLink = "http://localhost:3000/join?sessionId=" + sessionId;
        navigator.clipboard.writeText(invitationLink)
        .then(() => {
            alert("Invitation link copied to clipboard");
        }).catch(() => {
            console.log("Failed to copy to clipboard.");
        });
    }

    return (
        <Button onClick={createLink_and_copy}>
            초대링크
        </Button>
    );
}

export default CreateInvitation;
