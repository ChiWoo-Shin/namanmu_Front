import React, { useEffect } from "react";

const OpenViduVideoComponent = ({ streamManager }) => {
  const videoRef = React.createRef();

  useEffect(() => {
    streamManager.addVideoElement(videoRef.current);
  }, [streamManager, videoRef]);

  return (
    <div>
      <video autoPlay ref={videoRef} />
    </div>
  );
};

export default OpenViduVideoComponent;
