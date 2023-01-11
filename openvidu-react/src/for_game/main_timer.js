import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import useStore from "./store";
import UserVideoComponent from "../UserVideoComponent";

function Main_timer() {
  const { cur_time, settime, time_state, set_time_change } = useStore();
  const { cur_turn_states, set_turn_state_change } = useStore();
  const [sec, setSec] = useState(0);
  const [msec, setMsec] = useState(0);
  const time = useRef(0);
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
      game_loop();

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
      set_turn_state_change("first_ready");
      console.log("동기화");
    }
  }, [time_state]);

  useEffect;

  const game_loop = () => {
    if (cur_turn_states === "ready") {
      time.current = 1500;
      setSec(15);
      setMsec(0);
      set_turn_state_change("game");
    } else if (cur_turn_states === "select_theme") {
      time.current = 500;
      setSec(5);
      setMsec(0);
      set_turn_state_change("ready");
    } else if (cur_turn_states === "game") {
      time.current = 1000;
      setSec(10);
      setMsec(0);
      set_turn_state_change("select_theme");
      currentIndex.current += 1;
      if (currentIndex.current > { gamers }.gamers.length) {
        return () => clearInterval(timer.current);
      }
    } else if (cur_turn_states === "first_ready") {
      time.current = 1000;
      setSec(10);
      setMsec(0);
      set_turn_state_change("select_theme");
    }
  };

  return (
    <>
      <div className="team_box">
        <div className="team_turn">
          <center>
            <h3>
              상태 : {cur_turn_states} Timer : {sec}.{msec}{" "}
              {currentIndex.current}
            </h3>
          </center>
        </div>
      </div>
      <div className="main_video_box">
        <div id="main_screen" className="main_video_frame">
          {{ gamers }.gamers[currentIndex.current] && (
            <UserVideoComponent
              streamManager={
                { gamers }.gamers[currentIndex.current].streamManager
              }
            />
          )}
        </div>
      </div>
    </>
  );
}

export default Main_timer;
