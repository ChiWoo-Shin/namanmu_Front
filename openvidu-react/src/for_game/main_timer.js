import React, { useEffect, useState, useRef } from "react";

function Main_timer() {
  // const [min, setMin] = useState(3);
  const [sec, setSec] = useState(6000);
  const [msec, setMsec] = useState(0);
  const time = useRef(6000);
  const timer = useRef(null);
  const videoBoxes = useRef(null);
  const currentIndex = useRef(0);
  const [currentRound, setCurrentRound] = useState(0);

  const totalRounds = 5

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

  // useEffect(() => {
  //   if (videoBoxes.current) {
  //     if (currentRound < totalRounds) {
  //       videoBoxes.current[currentIndex.current].style.border = 'none';
  //       currentIndex.current = (currentIndex.current + 1) % videoBoxes.current.length;
  //       videoBoxes.current[currentIndex.current].style.border = '5px solid red';
  //       setCurrentRound(currentRound+1)
  //       console.log(currentRound)
        
  //     } else {
  //       clearInterval(timer.current);
  //     }
      
  //   }
  // }, [sec]);

  const transitionTimer = useRef(null);
  
  useEffect(() => {
    transitionTimer.current = setInterval(() => {
      if(currentIndex.current === 5){
        console.log("currentIndex.current"+(currentIndex.current))
        clearInterval(transitionTimer.current)
        setSec(0);
        setMsec("0" + (time.current % 60).toString());
        clearInterval(timer.current)
        return;
      }
        if (videoBoxes.current && (currentIndex.current > 2 && currentIndex.current < 5 )) {
        console.log("currentIndex.current"+(currentIndex.current))
        videoBoxes.current[currentIndex.current].style.border = 'none';
        currentIndex.current = (currentIndex.current - 2) % videoBoxes.current.length;
        videoBoxes.current[currentIndex.current].style.border = '5px solid red';       
      }
      else if (videoBoxes.current && currentIndex.current < 3){
        console.log("currentIndex.current"+(currentIndex.current))
        videoBoxes.current[currentIndex.current].style.border = 'none';
        currentIndex.current = (currentIndex.current + 3) % videoBoxes.current.length;
        videoBoxes.current[currentIndex.current].style.border = '5px solid red';
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
