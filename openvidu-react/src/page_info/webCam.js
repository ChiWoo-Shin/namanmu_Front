import React, { useEffect, useState, useRef } from "react";
import { Button } from "react-bootstrap";

const getWebcam = (callBack) => {
  try {
    const constraints = {
      video: true,
      audio: false,
    };
    navigator.mediaDevices.getUserMedia(constraints).then(callBack);
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

const Styles = {
  Video: {
    width: "100%",
    height: "100%",
    background: "rgba(245, 240, 215, 0.5)",
    border: "1px solid black",
  },
  Canvas: {
    width: "100%",
    height: "100%",
    background: "rgba(245, 240, 215, 0.5)",
    border: "1px solid green",
  },
  None: {
    display: "none",
  },
};

function TestOverlay() {
  const [playing, setPlaying] = useState(undefined);

  const [timer, set_Curtimer] = useState(undefined);
  const [timer_2, set_Curtimer_2] = useState(undefined);
  const [timer_3, set_Curtimer_3] = useState(undefined);

  const videoRef = useRef(null); // 좌우 반전

  const canvasRef = useRef(null); // 좌우 반전
  const canvasRef_2 = useRef(null); // 상하 반전
  const canvasRef_3 = useRef(null); // 상하 좌우 반전

  useEffect(() => {
    getWebcam((stream) => {
      setPlaying(true);
      videoRef.current.srcObject = stream;
    });
  }, []);

  const drawToCanvas = () => {
    try {
      const ctx = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      if (ctx && ctx !== null) {
        if (videoRef.current) {
          ctx.translate(canvasRef.current.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(
            videoRef.current,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const drawToCanvas_2 = () => {
    try {
      const ctx = canvasRef_2.current.getContext("2d");
      canvasRef_2.current.width = videoRef.current.videoWidth;
      canvasRef_2.current.height = videoRef.current.videoHeight;
      let a = parseInt(canvasRef_2.current.width);
      let b = parseInt(canvasRef_2.current.height);

      if (ctx && ctx !== null) {
        if (videoRef.current) {
          ctx.translate(canvasRef_2.current.width, 0);
          ctx.rotate((Math.PI / 180) * 180);
          ctx.translate(a, -b);
          ctx.scale(-1, 1);
          ctx.drawImage(
            videoRef.current,
            0,
            0,
            canvasRef_2.current.width,
            canvasRef_2.current.height
          );
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const drawToCanvas_3 = () => {
    try {
      const ctx = canvasRef_3.current.getContext("2d");
      canvasRef_3.current.width = videoRef.current.videoWidth;
      canvasRef_3.current.height = videoRef.current.videoHeight;

      if (ctx && ctx !== null) {
        if (videoRef.current) {
          ctx.translate(canvasRef_3.current.width, canvasRef_3.current.height);
          ctx.scale(-1, -1);
          ctx.drawImage(
            videoRef.current,
            0,
            0,
            canvasRef_3.current.width,
            canvasRef_3.current.height
          );
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const startOrStop = () => {
    if (playing) {
      const s = videoRef.current.srcObject;
      s.getTracks().forEach((track) => {
        track.stop();
      });
    } else {
      getWebcam((stream) => {
        setPlaying(true);
        videoRef.current.srcObject = stream;
      });
    }
    setPlaying(!playing);
  };

  const startOrStop_2 = () => {
    if (!timer) {
      const t = setInterval(() => drawToCanvas(), 0);
      set_Curtimer(t);
    } else {
      clearInterval(timer);
      set_Curtimer(undefined);
    }
  };

  const startOrStop_3 = () => {
    if (!timer_2) {
      const t = setInterval(() => drawToCanvas_2(), 0);
      set_Curtimer_2(t);
    } else {
      clearInterval(timer_2);
      set_Curtimer_2(undefined);
    }
  };

  const startOrStop_4 = () => {
    if (!timer_3) {
      const t = setInterval(() => drawToCanvas_3(), 0);
      set_Curtimer_3(t);
    } else {
      clearInterval(timer_3);
      set_Curtimer_3(undefined);
    }
  };

  return (
    <>
      <div>
        <S_words />
        <table>
          <thead>
            <tr>
              <td>Video</td>
              <td>Canvas</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <video ref={videoRef} autoPlay style={Styles.Video} />
              </td>
              <td>
                <canvas ref={canvasRef} style={Styles.Canvas} />
              </td>
            </tr>
            {/* <tr> */}
            {/* <td><canvas ref={canvasRef_2} style={Styles.Canvas} /></td> */}
            {/* <td><video ref={videoRef_2} autoPlay style={{filter: "blur(3px) grayscale(100%)" }} /></td> */}
            {/* <td><canvas ref={canvasRef_3} style={Styles.Canvas} /></td> */}
            {/* </tr> */}
          </tbody>
        </table>
        <div>
          <Button color="warning" onClick={() => startOrStop()}>
            {playing ? "Stop" : "Start"}{" "}
          </Button>
          <Button color="warning" onClick={() => startOrStop_2()}>
            이거는 좌우반전 play 1{" "}
          </Button>
        </div>
        <div>
          <Button color="warning" onClick={() => startOrStop_3()}>
            이거는 상하반전 play 2{" "}
          </Button>
          <Button color="warning" onClick={() => startOrStop_4()}>
            좌우 상하 반전{" "}
          </Button>
        </div>
      </div>
      <hr />
    </>
  );
}

function S_words() {
  let [show, setShow] = useState([
    "제시어1",
    "제시어2",
    "제시어3",
    "제시어4",
    "제시어5",
    "제시어6",
    "제시어7",
    "제시어8",
    "제시어9",
    "제시어10",
  ]);

  let [show_name, setShow_name] = useState("게임을 시작하겠습니다.");
  const [answer, setAnswer] = useState("");
  let [correct, setCorrect] = useState(["정답입니다.", "틀렸습니다."]);

  useEffect(() => {
    let timer;
    timer = set_Curtimeout(() => {
      setShow_name(show[0]);
    }, 2000);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    set_Curtimeout(() => {
      setInputVisible(true);
    }, 2000);
  }, []);

  // Add a state variable to control the visibility of the input and button elements
  const [inputVisible, setInputVisible] = useState(false);
  const [showIndex, setShowIndex] = useState(0);

  const nextShow = () => {
    setShowIndex(showIndex + 1);
    setShow_name(show[showIndex + 1]);
  };

  return (
    <>
      <div>{show_name}</div>
      {inputVisible && (
        <>
          <input
            onChange={(e) => {
              setAnswer(e.target.value);
            }}
          />
          <Button
            type="submit"
            onClick={() => {
              if (show_name === answer) {
                setCorrect(0);
                if (showIndex < show.length - 1) {
                  nextShow();
                }
              } else {
                setCorrect(1);
              }
            }}
          >
            제출
          </Button>
        </>
      )}
      {correct == 0 ? (
        <div> 정답입니다. </div>
      ) : correct == 1 ? (
        <div> 틀렸습니다. </div>
      ) : null}
    </>
  );
}

export default TestOverlay;
