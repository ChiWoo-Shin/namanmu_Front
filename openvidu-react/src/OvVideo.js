// import React, { Component } from 'react';

// export default class OpenViduVideoComponent extends Component {

//     constructor(props) {
//         super(props);
//         this.videoRef = React.createRef();
//     }

//     componentDidUpdate(props) {
//         if (props && !!this.videoRef) {
//             this.props.streamManager.addVideoElement(this.videoRef.current);
//         }
//     }

//     componentDidMount() {
//         if (this.props && !!this.videoRef) {
//             this.props.streamManager.addVideoElement(this.videoRef.current);
//         }
//     }

//     render() {
//         return (
//             <div>
//                 <video autoPlay={true} ref={this.videoRef} />
//             </div>
//         )


//     }

// }

import React, { useEffect } from 'react';

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


// -------------------------------------- blur -----------------
// import React, { useEffect } from 'react';

// const OpenViduVideoComponent = ({ streamManager }) => {
//   const videoRef = React.createRef();
//   const canvasRef = React.createRef();

//   useEffect(() => {
//     streamManager.addVideoElement(videoRef.current);
//     // Add a function to be called every time the video is played
//     videoRef.current.addEventListener('play', () => {
//       // Set the canvas dimensions to match the video
//       canvasRef.current.width = videoRef.current.clientWidth+100;
//       canvasRef.current.height = videoRef.current.clientHeight+100;
//       // Draw the video frame-by-frame onto the canvas
//       function drawFrame() {
//         // Check if the video has ended
//         if (!videoRef.current.paused && !videoRef.current.ended) {
//           // Draw the video frame to the canvas
//           const ctx = canvasRef.current.getContext('2d');
//           // Call this function again to draw the next frame
//           ctx.translate(canvasRef.current.width, 0);
//           ctx.scale(-1,1);
//           ctx.filter = 'blur(12px)';
//           ctx.drawImage(videoRef.current, 0, 0);
//           ctx.setTransform(1, 0, 0, 1, 0, 0);
//           ctx.filter = 'none';
          
//           setTimeout(drawFrame, 20);
//         }
//       }
//       drawFrame();
//     });
//   }, [streamManager, videoRef]);

//   return (
//     <div>
//       <video autoPlay ref={videoRef} />
//       <canvas ref={canvasRef} />
//     </div>
//   );
// };

// export default OpenViduVideoComponent;

// ----------------------------------------------좌좌 복사 -------------------------------------------
// import React, { useEffect } from 'react';

// const OpenViduVideoComponent = ({ streamManager }) => {
//   const videoRef = React.createRef();
//   const canvasRef = React.createRef();
//   const canvasRef_2 = React.createRef();

//   useEffect(() => {
//     streamManager.addVideoElement(videoRef.current);
//     // Add a function to be called every time the video is played
//     videoRef.current.addEventListener('play', () => {
//       // Set the canvas dimensions to match the video
//       canvasRef.current.width = videoRef.current.clientWidth+100;
//       canvasRef.current.height = videoRef.current.clientHeight+100;
//       // Draw the video frame-by-frame onto the canvas
//       function drawFrame() {
//         // Check if the video has ended
//         if (!videoRef.current.paused && !videoRef.current.ended) {
//           // Draw the video frame to the canvas
//           const ctx = canvasRef.current.getContext('2d');
//           // Call this function again to draw the next frame
//           ctx.translate(canvasRef.current.width, 0);
//           ctx.scale(-1,1);
//         //   ctx.filter = 'blur(12px)';
//         //   ctx.drawImage(videoRef.current, 0, 0, videoRef.current.clientWidth / 2, videoRef.current.clientHeight, 0, 0, videoRef.current.clientWidth / 2, videoRef.current.clientHeight);
//           ctx.drawImage(videoRef.current, videoRef.current.clientWidth / 2, 0, videoRef.current.clientWidth / 2, videoRef.current.clientHeight, videoRef.current.clientWidth / 2, 0, videoRef.current.clientWidth / 2, videoRef.current.clientHeight);
//         //   ctx.drawImage(videoRef.current, videoRef.current.clientWidth / 2, 0, videoRef.current.clientWidth / 2, videoRef.current.clientHeight, videoRef.current.clientWidth / 2, 0, videoRef.current.clientWidth / 2, videoRef.current.clientHeight);
//           ctx.setTransform(1, 0, 0, 1, 0, 0);
//         //   ctx.filter = 'none';
//           // Draw the right half of the video image on top of it
//           setTimeout(drawFrame, 20);
//         }
//         if (!videoRef.current.paused && !videoRef.current.ended) {
//             // Draw the video frame to the canvas
//             const ctx = canvasRef.current.getContext('2d');
//             // Call this function again to draw the next frame
//             // console.log("크기" + canvasRef.current.width)
//             ctx.translate(0, 0);
//             ctx.scale(1,1);
//             // ctx.rotate((Math.PI / 180) * 45);
//           //   ctx.filter = 'blur(12px)';
//           //   ctx.drawImage(videoRef.current, 0, 0, videoRef.current.clientWidth / 2, videoRef.current.clientHeight, 0, 0, videoRef.current.clientWidth / 2, videoRef.current.clientHeight);
//             ctx.drawImage(videoRef.current, videoRef.current.clientWidth / 2, 0, videoRef.current.clientWidth / 2, videoRef.current.clientHeight, videoRef.current.clientWidth / 2, 0, videoRef.current.clientWidth / 2, videoRef.current.clientHeight);
//           //   ctx.drawImage(videoRef.current, videoRef.current.clientWidth / 2, 0, videoRef.current.clientWidth / 2, videoRef.current.clientHeight, videoRef.current.clientWidth / 2, 0, videoRef.current.clientWidth / 2, videoRef.current.clientHeight);
//             ctx.setTransform(1, 0, 0, 1, 0, 0);
//           //   ctx.filter = 'none';
//             // Draw the right half of the video image on top of it
//             setTimeout(drawFrame, 100);
//           }
//       }
//       drawFrame();
//     });
//   }, [streamManager, videoRef]);

//   return (
//     <div>
//       <video autoPlay ref={videoRef} />
//       <canvas ref={canvasRef} />
//     </div>
//   );
// };

// export default OpenViduVideoComponent;

