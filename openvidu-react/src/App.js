import React, { Component, useEffect, useState, useRef } from "react";
import "./App.css";
import ReactDOM from "react-dom";
import { Button } from "react-bootstrap";

// Timer
import Main_timer from "./for_game/main_timer";

//Item list
import ItemOneBlur from "./item_info/Item_1_blur";
import ItemTwoDecal from "./item_info/Item_2_decalco";
import ItemThreeCut from "./item_info/Item_3_4cut";

// webRTC
import { OpenVidu } from "openvidu-browser";
import UserVideoComponent from "./UserVideoComponent";

import axios from "axios";
import S_words from "./page_info/S_word";

// Zustand
import useStore from "./for_game/store";
import CreateInvitation from "./page_info/CreateInvitation";

const APPLICATION_SERVER_URL = "http://localhost:5000/";
var timer = 10;

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
    window.addEventListener('beforeunload', this.onbeforeunload);
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get("sessionId");
    if (sessionId) {
      this.setState({
        myUserName: 'Participant' + Math.floor(Math.random() * 100),
        mySessionId: sessionId,
      })
      this.joinSession();
    } else {
      console.log("Invalid Session Link")
    }
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

  // deleteSubscriber(streamManager) {
  //   let subscribers = this.state.subscribers;
  //   let index = subscribers.indexOf(streamManager, 0);
  //   if (index > -1) {
  //     subscribers.splice(index, 1);
  //     this.setState({
  //       subscribers: subscribers,
  //     });
  //   }
  // }

  joinSession() {
    // --- 1) Get an OpenVidu object ---

    this.OV = new OpenVidu();

    // --- 2) Init a session ---
    this.setState(
      {
        session: this.OV.initSession(),
      },
      () => {
        var mySession = this.state.session;

        // --- 3) Specify the actions when events take place in the session ---

        // On every new Stream received...
        mySession.on("streamCreated", (event) => {
          // Subscribe to the Stream to receive it. Second parameter is undefined
          // so OpenVidu doesn't create an HTML video by its own
          var subscriber = mySession.subscribe(event.stream, undefined); // 현재 내 정보를 subscribe하고
          var subscribers = this.state.subscribers; // 현재 state.subscribers에 있는 것을 subscribers에 넣고
          
          const addSubscriber = (subscriber, subscribers) =>{
            
            subscribers.push(subscriber); // subscribers에 subscriber(나) 를 집어 넣음
            useStore.getState().setGamers({
              name: JSON.parse(event.stream.connection.data).clientData,
              streamManager: subscriber,
            });
            return subscribers;
          }

          this.setState({
            subscribers: addSubscriber(subscriber,subscribers),
          });

        });
        // On every Stream destroyed...
        mySession.on("streamDestroyed", (event) => {
          var subscribers = this.state.subscribers;
          const deleteSubscriber = (streamManager, subscribers) => {
            let index = subscribers.indexOf(streamManager, 0);
            useStore.getState().deleteGamer(JSON.parse(event.stream.connection.data).clientData)
            if (index > -1) {
              subscribers.splice(index, 1);
              return subscribers;
            }
          }

          this.setState({
            subscribers: deleteSubscriber(event.stream.streamManager, this.state.subscribers)
          });

          // this.deleteSubscriber(event.stream.streamManager);
          // useStore.getState().deleteGamer(JSON.parse(event.stream.connection.data).clientData)
        });

        // On every asynchronous exception...
        mySession.on("exception", (exception) => {
          console.warn(exception);
        });

        // --- 4) Connect to the session with a valid user token ---
        // Get a token from the OpenVidu deployment
        this.getToken().then((token) => {
          // First param is the token got from the OpenVidu deployment. Second param can be retrieved by every user on event
          // 'streamCreated' (property Stream.connection.data), and will be appended to DOM as the user's nickname
          mySession
            .connect(token, { clientData: this.state.myUserName })
            .then(async () => {
              console.log("여기가 getToken");
              // --- 5) Get your own camera stream ---
              // Init a publisher passing undefined as targetElement (we don't want OpenVidu to insert a video
              // element: we will manage it on our own) and with the desired properties
              let publisher = await this.OV.initPublisherAsync(undefined, {
                audioSource: undefined, // The source of audio. If undefined default microphone
                videoSource: undefined, // The source of video. If undefined default webcam
                publishAudio: true, // Whether you want to start publishing with your audio unmuted or not
                publishVideo: true, // Whether you want to start publishing with your video enabled or not
                resolution: "640x480", // The resolution of your video
                frameRate: 30, // The frame rate of your video
                insertMode: "APPEND", // How the video is inserted in the target element 'video-container'
                mirror: true, // Whether to mirror your local video or not
              });
              // --- 6) Publish your stream ---
              mySession.publish(publisher);
              console.log("publisher" + useStore.getState().gamers)

              useStore.getState().setGamers({
                name: this.state.myUserName,
                streamManager: publisher,
              })

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
    // --- 7) Leave the session by calling 'disconnect' method over the Session object ---

    const mySession = this.state.session;
    if (mySession) {
      mySession.disconnect();
    }
    
    useStore.getState().clearGamer()
    // Empty all properties...
    this.OV = null;
    this.setState({
      session: undefined,
      subscribers: [],
      mySessionId: "SessionA",
      myUserName: "Participant" + Math.floor(Math.random() * 100),
      // mainStreamManager: undefined,
      publisher: undefined,
    });
  }

  sendTimer() {
    timer = 30;
    console.log(timer);
    const message = {
      timer: timer,
    };

    this.state.session.signal({
      type: "timer",
      data: JSON.stringify(message),
    });
  }

  DidMount() {
    console.log("되냐?");
    console.log(this.state.session);
    if (this.state.session === undefined) {
      console.log("xxxxxx");
    } else {
      this.state.session.on("signal:timer", (event) => {
        let message = JSON.parse(event.data);
        timer = message.timer;
      });
      console.log(timer);
    }
  }

  render() {
    const mySessionId = this.state.mySessionId;
    const myUserName = this.state.myUserName;

    return (
      <div className="container">
        {this.state.session === undefined ? (
          <div id="join">
            <div id="img-div">
              <img src="resources/images/openvidu_grey_bg_transp_cropped.png" alt="OpenVidu logo" />
            </div>
            <div id="join-dialog" className="jumbotron vertical-center">
              <h1> Join a video session </h1>

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
                  <input className="btn btn-lg btn-success" name="commit" type="submit" value="JOIN" />
                </p>
              </form>
            </div>
          </div>
        ) : null}

        {this.state.session !== undefined ? (
          <div id="session">
            <div id="session-header">
              <CreateInvitation mySessionId={mySessionId}/>
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
                      현재 라운드 점수
                    </div>
                  </div>
                  <div className="box">
                    <div className="Score" id="A_totalScore">
                      총 점수
                    </div>
                  </div>
                </div>
                <div className="video_box">
                  <div id={0} className="video_frame">
                    {/* {this.state.gamers[0] && <div className="video_frame"> <UserVideoComponent streamManager={this.state.gamers[0].streamManager} /></div>} */}
                    {useStore.getState().gamers[0] && <div className="video_frame"> <UserVideoComponent streamManager={useStore.getState().gamers[0].streamManager} /></div>}
                  </div>
                </div>
                <div className="video_box">
                  <div id={1} className="video_frame">
                    {/* {this.state.gamers[1] && <div className="video_frame"> <UserVideoComponent streamManager={this.state.gamers[1].streamManager} /></div>} */}
                    {useStore.getState().gamers[1] && <div className="video_frame"> <UserVideoComponent streamManager={useStore.getState().gamers[1].streamManager} /></div>}
                  </div>
                </div>
                <div className="video_box">
                  <div id={2} className="video_frame">
                    {/* {this.state.gamers[2] && <div className="video_frame"> <UserVideoComponent streamManager={this.state.gamers[2].streamManager} /></div>} */}
                    {useStore.getState().gamers[2] && <div className="video_frame"> <UserVideoComponent streamManager={useStore.getState().gamers[2].streamManager} /></div>}
                  </div>
                </div>
              </div>

              {/* 중앙 freame */}
              <div className="mid-screen">
                <div className="team_box">
                  <div className="team_turn">
                    <h1>
                      {/* <center>  */}
                      {
                      (useStore.getState().gamers[0] || useStore.getState().gamers[1] ||
                      useStore.getState().gamers[2] || useStore.getState().gamers[3] ||
                      useStore.getState().gamers[4] || useStore.getState().gamers[5])
                       && <Main_timer />}
                      {/* </center> */}
                    </h1>
                  </div>
                </div>
                <div className="main_video_box">
                  <div id="main_screen" className="main_video_frame">
                  </div>
                </div>
                <div>
                  <div className="team_box">
                    <div className="team_turn">
                      {/* <Button onClick={renderCam4}>원본</Button>
												<Button onClick={renderCam}>blur</Button>
												<Button onClick={renderCam2}>좌좌우우</Button>
												<Button onClick={renderCam3}>퍼즐(4)</Button> */}
                    </div>
                  </div>
                  {/* {state.S_words_Q[i]} */}
                  <div>
                    <S_words />
                  </div>
                  <Button onClick={() => this.sendTimer()}>Send Timer</Button>
                  <Button onClick={() => this.DidMount()}>동기화</Button>
                  <div>{timer}</div>
                </div>
              </div>
              {/* B팀 프레임 */}
              <div className="b-screen">
                <div className="box">
                  <div className="Score" id="A_currentScore">
                    현재 라운드 점수
                  </div>
                </div>
                <div className="box">
                  <div className="Score" id="A_totalScore">
                    총 점수
                  </div>
                </div>
                <div className="video_box">
                  <div id={3} className="video_frame">
                    {/* {this.state.gamers[3] && (
                      <div className="video_frame">
                        <UserVideoComponent streamManager={this.state.gamers[3].streamManager} />
                      </div>
                    )} */}
                    {useStore.getState().gamers[3] && <div className="video_frame"> <UserVideoComponent streamManager={useStore.getState().gamers[3].streamManager} /></div>}
                  </div>
                </div>
                <div className="video_box">
                  <div id={4} className="video_frame">
                    {/* {this.state.gamers[4] && (
                      <div className="video_frame">
                        <UserVideoComponent streamManager={this.state.gamers[4].streamManager} />
                      </div>
                    )} */}
                    {useStore.getState().gamers[4] && <div className="video_frame"> <UserVideoComponent streamManager={useStore.getState().gamers[4].streamManager} /></div>}
                  </div>
                </div>
                <div className="video_box">
                  <div id={5} className="video_frame">
                    {/* {this.state.gamers[5] && (
                      <div className="video_frame">
                        <UserVideoComponent streamManager={this.state.gamers[5].streamManager} />
                      </div>
                    )} */}
                    {useStore.getState().gamers[5] && <div className="video_frame"> <UserVideoComponent streamManager={useStore.getState().gamers[5].streamManager} /></div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  /**
   * --------------------------------------------
   * GETTING A TOKEN FROM YOUR APPLICATION SERVER
   * --------------------------------------------
   * The methods below request the creation of a Session and a Token to
   * your application server. This keeps your OpenVidu deployment secure.
   *
   * In this sample code, there is no user control at all. Anybody could
   * access your application server endpoints! In a real production
   * environment, your application server must identify the user to allow
   * access to the endpoints.
   *
   * Visit https://docs.openvidu.io/en/stable/application-server to learn
   * more about the integration of OpenVidu in your application server.
   */
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
