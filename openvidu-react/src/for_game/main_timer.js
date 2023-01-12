import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import useStore from "./store";
import UserVideoComponent from "../UserVideoComponent";

function Main_timer() {
  const { cnt_answer, cnt_plus } = useStore();
  const { cur_time, settime, time_state, set_time_change } = useStore();
  const { cur_turn_states, set_turn_state_change, cur_who_turn, set_who_turn } =
    useStore();
  const { cur_round, set_cur_round } = useStore();
  const { curRed_cnt, curBlue_cnt, set_CurRed_cnt, set_CurBlue_cnt } =
    useStore();
  const { curRed_total, set_CurRed_total, curBlue_total, set_CurBlue_total } =
    useStore();
  const { is_my_turn, set_my_turn } = useStore();

  const [sec, setSec] = useState(0);
  const [msec, setMsec] = useState(0);
  const time = useRef(0);
  const timer = useRef(null);
  const videoBoxes = useRef(null);
  const currentIndex = useRef(0);
  const { myUserID, gamers, setGamers, deleteGamer, clearGamer } = useStore(
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
  useEffect(() => {
    if (cur_round > 1) {
      if (curBlue_cnt > curRed_cnt) {
        set_CurBlue_total(curBlue_total + 1);
        console.log("블루가 이겼습니다.");
      } else if (curBlue_cnt < curRed_cnt) {
        set_CurRed_total(curRed_total + 1);
        console.log("레드가 이겼습니다.");
      } else {
        set_CurBlue_total(curBlue_total + 1);
        set_CurRed_total(curRed_total + 1);
        console.log("비겼습니다.");
      }
      set_CurBlue_cnt(0);
      set_CurRed_cnt(0);
    }
  }, [cur_round]);

  useEffect(() => {
    console.log("게이머 :" + { gamers }.gamers[currentIndex.current].name);
    if (myUserID === { gamers }.gamers[currentIndex.current].name) {
      set_my_turn(true);
    } else {
      set_my_turn(false);
    }
  }, [currentIndex.current]);

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
      if (cur_round === 6) {
        return () => clearInterval(timer.current);
      } else if (cur_round !== 6) {
        if (currentIndex.current < 3) {
          currentIndex.current += 3;
          set_who_turn("blue");
          console.log(cur_round);
        } else {
          currentIndex.current -= 2;
          set_cur_round(cur_round + 1);
          set_who_turn("red");
          console.log(cur_round);
        }
      }
      cnt_plus(0);
    } else if (cur_turn_states === "first_ready") {
      time.current = 1000;
      set_who_turn("red");
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
            <h6>
              상태 : {cur_turn_states} Timer : {sec}.{msec}{" "}
              {currentIndex.current}, round : {cur_round} turn : {cur_who_turn}
              is my turn : {is_my_turn}
            </h6>
          </center>
        </div>
      </div>
      <div className="main_video_box">
        <div id="main_screen" className="main_video_frame">
          {cur_round > 0 && { gamers }.gamers[currentIndex.current] && (
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
