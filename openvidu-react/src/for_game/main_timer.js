import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
// import { useDispatch, useSelector } from 'react-redux';
import useStore from "./store";
import UserVideoComponent from "../UserVideoComponent";

function Main_timer() {
  // const [min, setMin] = useState(3);
  const [sec, setSec] = useState(6000);
  const [msec, setMsec] = useState(0);
  const time = useRef(6000);
  const timer = useRef(null);
  const videoBoxes = useRef(null);
  const currentIndex = useRef(0);
  const {gamers, setGamers, deleteGamer, clearGamer} = useStore(state => state);

  //치우형 안녕 우리 팀장을 잘부탁해 부롱부부롱부롱  
  // const [currentRound, setCurrentRound] = useState(0);
  // const totalRounds = 5

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

    return () => clearInterval(timer.current);
  }, []);

  useEffect(() => {
    if (time.current < 0) {
      console.log(" Time over ");
      clearInterval(timer.current);
    }
  }, [msec]);

  useEffect(() => {
    videoBoxes.current = document.getElementsByClassName('video_box');
  }, []);

  useEffect(() => {
    if (videoBoxes.current) {
      videoBoxes.current[currentIndex.current].style.border = '5px solid red';
      
      
    }
  }, [currentIndex.current]);

  useEffect(()=>{
    if({gamers}.length>0){
      console.log("gamers : ")
      console.log({gamers})
      
      ReactDOM.render(
        <UserVideoComponent streamManager={{gamers}[currentIndex.current].streamManager} />,
        document.getElementById('main_screen')
      )
    }
  }, [{gamers}])


  const transitionTimer = useRef(null);
  
  useEffect(() => {
    transitionTimer.current = setInterval(() => {
      if(currentIndex.current === 5){
        console.log("currentIndex.current"+(currentIndex.current))
        setSec(0);
        setMsec("0" + (time.current % 60).toString());
        clearInterval(transitionTimer.current)
        clearInterval(timer.current)
        return;
      }
        if (videoBoxes.current && (currentIndex.current > 2 && currentIndex.current < 5 )) {
        console.log("currentIndex.current"+(currentIndex.current))
        videoBoxes.current[currentIndex.current].style.border = 'none';
        currentIndex.current = (currentIndex.current - 2) % videoBoxes.current.length;
        videoBoxes.current[currentIndex.current].style.border = '5px solid red';
        
        // ReactDOM.render(
        //   <UserVideoComponent streamManager={gamers[currentIndex.current].streamManager} />,
        //   document.getElementById('main_screen')
        // )
      }
      else if (videoBoxes.current && currentIndex.current < 3){
        console.log("currentIndex.current"+(currentIndex.current))
        videoBoxes.current[currentIndex.current].style.border = 'none';
        currentIndex.current = (currentIndex.current + 3) % videoBoxes.current.length;
        videoBoxes.current[currentIndex.current].style.border = '5px solid red';

        // ReactDOM.render(
        //   <UserVideoComponent streamManager={gamers[currentIndex.current].streamManager} />,
        //   document.getElementById('main_screen')
        // )
      }
      // Reset main timer
      time.current = 6000;
      setSec(6000);
      
    }, 60000);
  
  }, []);



  return (
    <center>
      Timer : {sec}.{msec}
    </center>
  );
}

export default Main_timer;
