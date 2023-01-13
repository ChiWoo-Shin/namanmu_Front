import React, { useEffect, useState, useRef } from "react";
import { Button } from "react-bootstrap";
import useStore from "../for_game/store";

import useSound from "use-sound";

import good_sound from "../audio/good.mp3";
import bad_sound from "../audio/bad.mp3";

function S_words() {
  let [show, setShow] = useState([]);

  const { cnt_answer, set_CntAns, cur_session, cur_turn_states } = useStore();
  const {
    is_my_turn,
    cur_who_turn,
    my_index,
    setPublishAudio,
    myUserID,
    gamers,
  } = useStore();
  const { gamerWords, fetchGamerWords } = useStore();
  //ZUSTAND

  const [good] = useSound(good_sound);
  const [bad] = useSound(bad_sound);
  //USE Sound

  let [show_name, setShow_name] = useState("--------");
  const [answer, setAnswer] = useState("");

  let [number, setNumber] = useState(cnt_answer);

  const [showIndex, setShowIndex] = useState(0);
  const [my_team_turn, set_my_team_turn] = useState(false);

  useEffect(async ()=>{
    if (cur_round !==0){
      setShow([]);
      await fetchGamerWords();
    }
    
  },[cur_round]);

  useEffect(() => {
    setShow(show.concat(gamerWords.map(a => a.name)));
    console.log("show time")
    console.log(show[showIndex])
  }, [gamerWords])
  
  useEffect(()=>{
    setShow_name(show[showIndex]);
  },[show])

  // useEffect(() => {
  //   if (cur_turn_states === "game") {
  //     setShow_name(show[0]);
  //   }
  // }, [cur_turn_states]);

  useEffect(() => {
    setNumber(cnt_answer);
  }, [cnt_answer]);
  useEffect(() => {
    if (number !== 0) {
      sendScore();
      if (showIndex < show.length - 1) {
        nextShow();
        good();
      }
    }
  }, [number]);

  useEffect(() => {
    if (cur_who_turn === "red" && my_index % 2 === 0) {
      set_my_team_turn(true);
    } else if (cur_who_turn === "blue" && my_index % 2 === 1) {
      set_my_team_turn(true);
    } else {
      set_my_team_turn(false);
    }
  }, [cur_who_turn]);
  useEffect(() => {}, [is_my_turn]);
  const nextShow = () => {
    setShowIndex(showIndex + 1);
    setShow_name(show[showIndex + 1]);
  };

  const sendScore = () => {
    const message = {
      score: number,
    };
    cur_session.signal({
      type: "score",
      data: JSON.stringify(message),
    });
  };

  const check_Score = (e) => {
    if (show_name === answer) {
      set_CntAns(cnt_answer + 1);
      setAnswer("");
    } else {
      bad();
      setAnswer("");
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      check_Score(e);
    }
  };
  return (
    <>
      {cur_turn_states === "room" && <div> 대기방입니다 </div>}
      {(is_my_turn || !my_team_turn) && <div>{show_name}</div>}
      {/* 내 턴이거나 내 팀 턴이 아닐경우에만 문제를 띄움 */}
      {!is_my_turn && my_team_turn && (
        // 내 턴이 아니고 우리팀 턴일 경우(이야기꾼을 제외한 나머지)
        <>
          <input
            id="Answer_input"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
            }}
            onKeyDown={(e) => {
              handleKeyPress(e);
            }}
          />
          <Button
            type="submit"
            onClick={() => {
              check_Score();
            }}
          >
            제출
          </Button>
        </>
      )}
    </>
  );
}

export default S_words;
