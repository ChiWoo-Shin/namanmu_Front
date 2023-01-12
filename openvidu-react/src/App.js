import React, { Component } from "react";
import "./App.css";
import { Button } from "react-bootstrap";
import axios from "axios";
import S_words from "./page_info/S_word";
import CreateInvitation from "./page_info/CreateInvitation";

// Timer
import Main_timer from "./for_game/main_timer";

//Item list

// webRTC
import { OpenVidu } from "openvidu-browser";
import UserVideoComponent from "./UserVideoComponent";
import Score_board from "./page_info/score_board";
// Zustand
import useStore from "./for_game/store";

const APPLICATION_SERVER_URL = "http://localhost:5000/";
var timer = 1000;

class webCam extends Component {
  constructor(props) {
    super(props);

    // These properties are in the state's component in order to re-render the HTML whenever their values change
    this.state = {
      mySessionId: "SessionA",
      myUserName: "Participant" + Math.floor(Math.random() * 100),
      session: undefined,
      publisher: undefined,
      subscribers: [],
    };

    this.joinSession = this.joinSession.bind(this);
    this.leaveSession = this.leaveSession.bind(this);
    this.handleChangeSessionId = this.handleChangeSessionId.bind(this);
    this.handleChangeUserName = this.handleChangeUserName.bind(this);
    this.onbeforeunload = this.onbeforeunload.bind(this);
  }

  componentDidMount() {
    //초대링크 타고 들어왔을 때 동작하는 part
    window.addEventListener("beforeunload", this.onbeforeunload);
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get("sessionId");
    if (sessionId) {
      this.setState({
        myUserName: "Participant" + Math.floor(Math.random() * 100),
        mySessionId: sessionId,
      });
      this.joinSession();
    } else {
      console.log("Invalid Session Link");
    }
  }

  componentDidUpdate() {
    //타이머 동기화
    this.state.session.on("signal:timer", (event) => {
      let message = JSON.parse(event.data);
      useStore.getState().settime(message.timer);
      useStore.getState().set_time_change("change");
      useStore.getState().set_cur_round(1);
    });
    //점수 동기화
    this.state.session.on("signal:score", (event) => {
      let message = JSON.parse(event.data);
      console.log("시그널 확인(score) : " + message.score);
      useStore.getState().cnt_plus(message.score);
      if (useStore.getState().cur_who_turn === "red") {
        useStore.getState().set_CurRed_cnt(message.score);
      }
      if (useStore.getState().cur_who_turn === "blue") {
        useStore.getState().set_CurBlue_cnt(message.score);
      }
    });
  }
  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.onbeforeunload);
  }

  onbeforeunload(event) {
    this.leaveSession();
  }

  handleChangeSessionId(e) {
    this.setState({
      mySessionId: e.target.value,
    });
  }

  handleChangeUserName(e) {
    this.setState({
      myUserName: e.target.value,
    });
  }

  joinSession() {
    this.OV = new OpenVidu();
    this.setState(
      {
        session: this.OV.initSession(),
      },
      () => {
        var mySession = this.state.session;
        useStore.getState().set_session_change(this.state.session);
        //zustand에 session값 저장
        mySession.on("streamCreated", (event) => {
          var subscriber = mySession.subscribe(event.stream, undefined); // 현재 내 정보를 subscribe하고
          var subscribers = this.state.subscribers; // 현재 state.subscribers에 있는 것을 subscribers에 넣고

          const addSubscriber = (subscriber, subscribers) => {
            subscribers.push(subscriber); // subscribers에 subscriber(나) 를 집어 넣음
            useStore.getState().setGamers({
              name: JSON.parse(event.stream.connection.data).clientData,
              streamManager: subscriber,
            });
            return subscribers;
          };

          this.setState({
            subscribers: addSubscriber(subscriber, subscribers),
          });
        });
        mySession.on("streamDestroyed", (event) => {
          var subscribers = this.state.subscribers;
          const deleteSubscriber = (streamManager, subscribers) => {
            let index = subscribers.indexOf(streamManager, 0);
            useStore
              .getState()
              .deleteGamer(JSON.parse(event.stream.connection.data).clientData);
            if (index > -1) {
              subscribers.splice(index, 1);
              return subscribers;
            }
          };

          this.setState({
            subscribers: deleteSubscriber(
              event.stream.streamManager,
              this.state.subscribers
            ),
          });
        });
        mySession.on("exception", (exception) => {
          console.warn(exception);
        });
        this.getToken().then((token) => {
          mySession
            .connect(token, { clientData: this.state.myUserName })
            .then(async () => {
              console.log("여기가 getToken");

              let publisher = await this.OV.initPublisherAsync(undefined, {
                audioSource: undefined, // The source of audio. If undefined default microphone
                videoSource: undefined, // The source of video. If undefined default webcam
                publishAudio: false, // Whether you want to start publishing with your audio unmuted or not
                publishVideo: true, // Whether you want to start publishing with your video enabled or not
                resolution: "640x480", // The resolution of your video
                frameRate: 30, // The frame rate of your video
                insertMode: "APPEND", // How the video is inserted in the target element 'video-container'
                mirror: true, // Whether to mirror your local video or not
              });
              mySession.publish(publisher);

              useStore.getState().setGamers({
                name: this.state.myUserName,
                streamManager: publisher,
              });
              useStore.getState().set_myUserID(this.state.myUserName);
              console.log("publisher setGamers : after");
              console.log(useStore.getState().gamers);
              console.log(useStore.getState().gamers[0].name);
              console.log(useStore.getState().gamers[0].streamManager);
              console.log("id is :  " + useStore.getState().myUserID);
              this.setState({
                publisher: publisher,
              });
            })
            .catch((error) => {
              console.log(
                "There was an error connecting to the session:",
                error.code,
                error.message
              );
            });
        });
      }
    );
  }

  leaveSession() {
    const mySession = this.state.session;
    if (mySession) {
      mySession.disconnect();
    }

    useStore.getState().clearGamer();
    console.log("leaveSession : ");
    console.log(useStore.getState().gamers);
    this.OV = null;
    this.setState({
      session: undefined,
      subscribers: [],
      mySessionId: "SessionA",
      myUserName: "Participant" + Math.floor(Math.random() * 100),
      publisher: undefined,
    });
  }

  sendTimer() {
    console.log(timer);
    const message = {
      timer: timer,
    };

    this.state.session.signal({
      type: "timer",
      data: JSON.stringify(message),
    });
  }
  render() {
    const mySessionId = this.state.mySessionId;
    const myUserName = this.state.myUserName;

    return (
      <div className="maing_bg">
        <div className="container">
          {this.state.session === undefined ? (
            <div id="join">
              {/* <div id="img-div">
            
            </div> */}
              {/* <div id="join-dialog" className="jumbotron vertical-center"> */}
              {/* <h1> Join a video session </h1> */}

              <form className="form-group" onSubmit={this.joinSession}>
                <p>
                  <label>Participant: </label>
                  <input
                    className="form-control"
                    type="text"
                    id="userName"
                    value={myUserName}
                    onChange={this.handleChangeUserName}
                    required
                  />
                </p>
                <p>
                  <label> Session: </label>
                  <input
                    className="form-control"
                    type="text"
                    id="sessionId"
                    value={mySessionId}
                    onChange={this.handleChangeSessionId}
                    required
                  />
                </p>
                <p className="text-center">
                  <input
                    className="btn btn-lg btn-success"
                    name="commit"
                    type="submit"
                    value="JOIN"
                  />
                </p>
              </form>
              {/* </div> */}
            </div>
          ) : null}

          {this.state.session !== undefined ? (
            <div id="session">
              <div id="session-header">
                <CreateInvitation mySessionId={mySessionId} />
                <h1 id="session-title">{mySessionId}</h1>
                <input
                  className="btn btn-large btn-danger"
                  type="button"
                  id="buttonLeaveSession"
                  onClick={this.leaveSession}
                  value="방 나가기"
                />
              </div>

              <div className="wide-frame">
                {/* A팀 프레임 */}
                <div className="a-screen">
                  <div className="score_box">
                    <div className="box">
                      <div className="Score" id="A_currentScore">
                        Current : <Score_board score={"cur_red"} />
                      </div>
                    </div>
                    <div className="box">
                      <div className="Score" id="A_totalScore">
                        Total : <Score_board score={"total_red"} />
                      </div>
                    </div>
                  </div>
                  <div className="video_box">
                    <div id={0} className="video_frame">
                      {/* {this.state.gamers[0] && <div className="video_frame"> <UserVideoComponent streamManager={this.state.gamers[0].streamManager} /></div>} */}
                      {useStore.getState().gamers[0] && (
                        <div className="video_frame">
                          {" "}
                          <UserVideoComponent
                            streamManager={
                              useStore.getState().gamers[0].streamManager
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="video_box">
                    <div id={1} className="video_frame">
                      {/* {this.state.gamers[1] && <div className="video_frame"> <UserVideoComponent streamManager={this.state.gamers[1].streamManager} /></div>} */}
                      {useStore.getState().gamers[1] && (
                        <div className="video_frame">
                          {" "}
                          <UserVideoComponent
                            streamManager={
                              useStore.getState().gamers[1].streamManager
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="video_box">
                    <div id={2} className="video_frame">
                      {/* {this.state.gamers[2] && <div className="video_frame"> <UserVideoComponent streamManager={this.state.gamers[2].streamManager} /></div>} */}
                      {useStore.getState().gamers[2] && (
                        <div className="video_frame">
                          {" "}
                          <UserVideoComponent
                            streamManager={
                              useStore.getState().gamers[2].streamManager
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 중앙 freame */}
                <div className="mid-screen">
                  {(useStore.getState().gamers[0] ||
                    useStore.getState().gamers[1] ||
                    useStore.getState().gamers[2] ||
                    useStore.getState().gamers[3] ||
                    useStore.getState().gamers[4] ||
                    useStore.getState().gamers[5]) && <Main_timer />}

                  <div>
                    <div className="team_box">
                      <div className="team_turn">
                        {/* <Button onClick={renderCam4}>원본</Button>
												<Button onClick={renderCam}>blur</Button>
												<Button onClick={renderCam2}>좌좌우우</Button>
												<Button onClick={renderCam3}>퍼즐(4)</Button> */}
                      </div>
                    </div>

                    <div>
                      <S_words />
                    </div>
                    <Button onClick={() => this.sendTimer()}>Send Timer</Button>
                  </div>
                </div>
                {/* B팀 프레임 */}
                <div className="b-screen">
                  <div className="box">
                    <div className="Score" id="B_totalScore">
                      Total :
                      <Score_board score={"total_blue"} />
                    </div>
                  </div>
                  <div className="box">
                    <div className="Score" id="B_currentScore">
                      Current :
                      <Score_board score={"cur_blue"} />
                    </div>
                  </div>
                  <div className="video_box">
                    <div id={3} className="video_frame">
                      {useStore.getState().gamers[3] && (
                        <div className="video_frame">
                          {" "}
                          <UserVideoComponent
                            streamManager={
                              useStore.getState().gamers[3].streamManager
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="video_box">
                    <div id={4} className="video_frame">
                      {/* {this.state.gamers[4] && (
                      <div className="video_frame">
                        <UserVideoComponent streamManager={this.state.gamers[4].streamManager} />
                      </div>
                    )} */}
                      {useStore.getState().gamers[4] && (
                        <div className="video_frame">
                          {" "}
                          <UserVideoComponent
                            streamManager={
                              useStore.getState().gamers[4].streamManager
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="video_box">
                    <div id={5} className="video_frame">
                      {useStore.getState().gamers[5] && (
                        <div className="video_frame">
                          {" "}
                          <UserVideoComponent
                            streamManager={
                              useStore.getState().gamers[5].streamManager
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
  async getToken() {
    const sessionId = await this.createSession(this.state.mySessionId);
    return await this.createToken(sessionId);
  }

  async createSession(sessionId) {
    const response = await axios.post(
      APPLICATION_SERVER_URL + "api/sessions",
      { customSessionId: sessionId },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data; // The sessionId
  }

  async createToken(sessionId) {
    const response = await axios.post(
      APPLICATION_SERVER_URL + "api/sessions/" + sessionId + "/connections",
      {},
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data; // The token
  }
}

export default webCam;
