import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import useStore from "./store";
import UserVideoComponent from "../UserVideoComponent";

function Main_timer() {
  const { cur_time, settime, time_state, set_time_change } = useStore();
  const [sec, setSec] = useState(6000);
  const [msec, setMsec] = useState(0);
  const time = useRef(6000);
  const timer = useRef(null);
  const videoBoxes = useRef(null);
  const currentIndex = useRef(0);
  const { gamers, setGamers, deleteGamer, clearGamer } = useStore(
    (state) => state
  );

  useEffect(() => {
    timer.current = setInterval(() => {
      setSec(parseInt(time.current / 100));
      if ((time.current % 60).toString().length === 1) {
        setMsec("0" + (time.current % 60).toString());
      } else {
        setMsec(time.current % 60);
      }
      time.current -= 1;
    }, 10);

    if (time.current < 0) {
      console.log("Time's up!");
      clearInterval(timer.current);
      setSec(cur_time % 100);
      setMsec(0);
      time.current = cur_time;
      currentIndex.current += 1;
      if (currentIndex.current > { gamers }.gamers.length) {
        return () => clearInterval(timer.current);
      }

      timer.current = setInterval(() => {
        setSec(parseInt(time.current / 100));
        if ((time.current % 60).toString().length === 1) {
          setMsec("0" + (time.current % 60).toString());
        } else {
          setMsec(time.current % 60);
        }
        time.current -= 1;
      }, 10);
    }

    return () => clearInterval(timer.current);
  }, [msec]);

  useEffect(() => {
    videoBoxes.current = document.getElementsByClassName("video_box");
  }, []);


  useEffect(() => {
    if (time_state === "change") {
      time.current = cur_time;
      setSec(cur_time);
      setMsec(0);
      console.log("동기화");
    }
  }, [time_state]);

  return (
    <>
      <div className="team_box">
        <div className="team_turn">
          <h1>
            <center>
              Timer : {sec}.{msec}
            </center>
          </h1>
        </div>
      </div>
      <div className="main_video_box">
        <div id="main_screen" className="main_video_frame">
        {{ gamers }.gamers[currentIndex.current] && <UserVideoComponent streamManager={{ gamers }.gamers[currentIndex.current].streamManager} />}
        </div>
      </div>
    </>
  );
}

export default Main_timer;
