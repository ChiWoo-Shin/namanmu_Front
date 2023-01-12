import React, { useState, useEffect, useRef } from "react";
import useStore from "../for_game/store.js";

const Score_board = (props) => {
  const { curRed_cnt, curBlue_cnt, curRed_total, curBlue_total } = useStore();
  const [score, Setscore] = useState(0);

  useEffect(() => {
    if (props.score === "cur_red") {
      Setscore(curRed_cnt);
    } else if (props.score === "cur_blue") {
      Setscore(curBlue_cnt);
    } else if (props.score === "total_red") {
      Setscore(curRed_total);
    } else if (props.score === "total_blue") {
      Setscore(curBlue_total);
    }
  }, [curRed_cnt, curBlue_cnt, curBlue_total, curRed_total]);

  return <>{score}</>;
};
export default Score_board;
