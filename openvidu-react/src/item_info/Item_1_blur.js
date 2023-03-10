// blur 처리하기
import React, { useEffect, useState, useRef } from "react";
import "./Item.css";

const ItemOneBlur = ({ videoRef }) => {
  const [videoSrc, setVideoSrc] = useState();
  const canvasRef = useRef(null);
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("Error accessing webcam:", error);
      });
  }, []);

  useEffect(() => {
    // Add a function to be called every time the video is played
    videoRef.current.addEventListener("play", () => {
      // Set the canvas dimensions to match the video
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      // Draw the video frame-by-frame onto the canvas
      function drawFrame() {
        // Check if the video has ended
        if (!videoRef.current.paused && !videoRef.current.ended) {
          // Draw the video frame to the canvas
          const ctx = canvasRef.current.getContext("2d");
          // Call this function again to draw the next frame
          ctx.translate(canvasRef.current.width, 0);
          ctx.scale(-1, 1);
          ctx.filter = "blur(20px)";
          ctx.drawImage(videoRef.current, 0, 0);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.filter = "none";
          set_Curtimeout(drawFrame, 50);
        }
      }
      drawFrame();
    });
    if (videoRef.current.style.display === "none") {
      videoRef.current.play();
    }
  }, [videoRef]);

  return (
    <div>
      <canvas
        style={{ display: "block" }}
        ref={canvasRef}
        className="Video_myturn"
      />
    </div>
  );
};

export default ItemOneBlur;
