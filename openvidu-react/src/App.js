import React, { Component, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import ReactDOM from "react-dom";
import { render } from 'react-dom-lite'
import { Button } from "react-bootstrap";
import Main_timer from "./for_game/main_timer"; // Timer

//Item list
import ItemOneBlur from "./item_info/Item_1_blur";
import ItemTwoDecal from "./item_info/Item_2_decalco";
import ItemThreeCut from "./item_info/Item_3_4cut";

import { OpenVidu } from 'openvidu-browser';

import axios from 'axios';
import UserVideoComponent from './UserVideoComponent';
import S_words from './page_info/S_word';



const APPLICATION_SERVER_URL = "http://localhost:5000/";

class webCam extends Component {
    constructor(props) {
        super(props);

        // These properties are in the state's component in order to re-render the HTML whenever their values change
        this.state = {
            mySessionId: 'SessionA',
            myUserName: 'Participant' + Math.floor(Math.random() * 100),
            session: undefined,
            mainStreamManager: undefined,  // Main video of the page. Will be the 'publisher' or one of the 'subscribers'
            publisher: undefined,
            subscribers: [],
            gamers: [],
        };


        this.joinSession = this.joinSession.bind(this);
        this.leaveSession = this.leaveSession.bind(this);
        this.handleChangeSessionId = this.handleChangeSessionId.bind(this);
        this.handleChangeUserName = this.handleChangeUserName.bind(this);
        this.handleMainVideoStream = this.handleMainVideoStream.bind(this);
        this.onbeforeunload = this.onbeforeunload.bind(this);
    }

    componentDidMount() {
        window.addEventListener('beforeunload', this.onbeforeunload);
        const url = new URL(window.location.href);
        const sessionId = url.searchParams.get("sessionId");
        if (sessionId) {
            this.setState({
                myUserName: 'Participant' + Math.floor(Math.random() * 100),
                mySessionId : sessionId,
            })
            this.joinSession();
        } else {
            console.log("Invalid Session Link")
        }
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.onbeforeunload);
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

    handleMainVideoStream(stream) {
        if (this.state.mainStreamManager !== stream) {

            this.setState({
                mainStreamManager: stream
            });
        }
    }

    deleteSubscriber(streamManager) {
        let subscribers = this.state.subscribers;
        let index = subscribers.indexOf(streamManager, 0);
        if (index > -1) {
            subscribers.splice(index, 1);
            this.setState({
                subscribers: subscribers,
            });
        }
    }

    deleteGamer(event) {
        console.log("delete gamers 진입함")
        let gamers = this.state.gamers;
        let index = -1;
        index = gamers.findIndex((a) => {
            if (a.name == JSON.parse(event.stream.connection.data).clientData) {
                return a
            }
        })

        if (index > -1) {
            console.log("delete gamers 동작함")
            gamers.splice(index, 1);
            this.setState({
                gamers: gamers,
            });
        }
    }


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
                mySession.on('streamCreated', (event) => {
                    // Subscribe to the Stream to receive it. Second parameter is undefined
                    // so OpenVidu doesn't create an HTML video by its own
                    var subscriber = mySession.subscribe(event.stream, undefined); // 현재 내 정보를 subscribe하고
                    var subscribers = this.state.subscribers; // 현재 state.subscribers에 있는 것을 subscribers에 넣고
                    subscribers.push(subscriber); // subscribers에 subscriber(나) 를 집어 넣음

                    var gamers = this.state.gamers; // gamers 리스트를 받아옴
                    gamers.push({ name: JSON.parse(event.stream.connection.data).clientData, streamManager: subscriber }); // gamers에 현재 나를 넣음
                    console.log("여기는 created" + JSON.parse(event.stream.connection.data).clientData + " " + subscriber)

                    gamers.map((a, i) => {
                        console.log("name11111111 : " + a.name + " " + gamers.length + " " + i)
                        console.log(a.streamManager)
                    })

                    this.setState({
                        subscribers: subscribers,
                        gamers: gamers
                    });

                });
                // On every Stream destroyed...
                mySession.on('streamDestroyed', (event) => {
                    // Remove the stream from 'subscribers' array
                    this.deleteSubscriber(event.stream.streamManager);
                    this.deleteGamer(event);
                });

                // On every asynchronous exception...
                mySession.on('exception', (exception) => {
                    console.warn(exception);
                });

                // --- 4) Connect to the session with a valid user token ---
                // Get a token from the OpenVidu deployment
                this.getToken().then((token) => {
                    // First param is the token got from the OpenVidu deployment. Second param can be retrieved by every user on event
                    // 'streamCreated' (property Stream.connection.data), and will be appended to DOM as the user's nickname
                    mySession.connect(token, { clientData: this.state.myUserName })
                        .then(async () => {
                            console.log("여기가 getToken")
                            // --- 5) Get your own camera stream ---
                            // Init a publisher passing undefined as targetElement (we don't want OpenVidu to insert a video
                            // element: we will manage it on our own) and with the desired properties
                            let publisher = await this.OV.initPublisherAsync(undefined, {
                                audioSource: undefined, // The source of audio. If undefined default microphone
                                videoSource: undefined, // The source of video. If undefined default webcam
                                publishAudio: true, // Whether you want to start publishing with your audio unmuted or not
                                publishVideo: true, // Whether you want to start publishing with your video enabled or not
                                resolution: '640x480', // The resolution of your video
                                frameRate: 30, // The frame rate of your video
                                insertMode: 'APPEND', // How the video is inserted in the target element 'video-container'
                                mirror: true, // Whether to mirror your local video or not
                            });
                            // --- 6) Publish your stream ---
                            mySession.publish(publisher);

                            var gamers = this.state.gamers;
                            gamers.push({ name: this.state.myUserName, streamManager: publisher });
                            console.log("여기는 getToken" + this.state.myUserName + " " + publisher)


                            /* 현재 동작하지 않음 나중에 A, B팀 정해지면 그때 사용가능 할 듯*/
                            // let copy = [...gamers];
                            // copy.sort(function (a, b) {
                            //     if (a.name < b.name) {
                            //         return -1
                            //     } else if (a.name > b.name) {
                            //         return 1
                            //     } else {
                            //         return 0
                            //     }

                            // });

                            // copy.map((a, i) => {
                            //     console.log("name22222222 : " + a.name + " " + gamers.length + " " + i)
                            // })
                            /* -----------------------------------------------*/

                            this.setState({
                                mainStreamManager: publisher,
                                publisher: publisher,
                                gamers: gamers,
                            });

                        })
                        .catch((error) => {
                            console.log('There was an error connecting to the session:', error.code, error.message);
                        });
                });
            },
        );
    };



    leaveSession() {
        // --- 7) Leave the session by calling 'disconnect' method over the Session object ---

        const mySession = this.state.session;
        if (mySession) {
            mySession.disconnect();
        }
        // Empty all properties...
        this.OV = null;
        this.setState({
            session: undefined,
            subscribers: [],
            mySessionId: 'SessionA',
            myUserName: 'Participant' + Math.floor(Math.random() * 100),
            mainStreamManager: undefined,
            publisher: undefined,
            gamers: []
        });
    }

    createInvitation() {
        let sessionId = this.state.mySessionId;
        let invitationLink = "http://localhost:3000/join?sessionId=" + sessionId;
        console.log("Invitation link: " + invitationLink);
        // You can also send this link to the user via email or display it on the page

        navigator.clipboard.writeText(invitationLink).then(() => {
            alert("Invitation link copied to clipboard");
        }).catch(() => {
            console.log("Failed to copy to clipboard.");
        });
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
                            <button onClick={() => this.createInvitation()}>Create Invitation</button>
                            <h1 id="session-title">{mySessionId}</h1>
                            <input
                                className="btn btn-large btn-danger"
                                type="button"
                                id="buttonLeaveSession"
                                onClick={this.leaveSession}
                                value="Leave session"
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
                                        {this.state.gamers[0] && <div className="video_frame"> <UserVideoComponent streamManager={this.state.gamers[0].streamManager} /></div>}
                                    </div>
                                </div>
                                <div className="video_box">
                                    <div id={1} className="video_frame">
                                        {this.state.gamers[1] && <div className="video_frame"> <UserVideoComponent streamManager={this.state.gamers[1].streamManager} /></div>}
                                    </div>
                                </div>
                                <div className="video_box">
                                    <div id={2} className="video_frame">
                                        {this.state.gamers[2] && <div className="video_frame"> <UserVideoComponent streamManager={this.state.gamers[2].streamManager} /></div>}
                                    </div>
                                </div>
                            </div>

                            {/* 중앙 freame */}
                            <div className="mid-screen">
                                <div className="team_box">
                                    <div className="team_turn">
                                        <h1>
                                            {/* <center>  */}
                                            <Main_timer />
                                            {/* </center> */}
                                        </h1>
                                    </div>
                                </div>
                                <div className="main_video_box">
                                    <div className="main_video_frame" id="main_screen">
                                        {this.state.gamers[3] && <div className="video_frame"> <UserVideoComponent streamManager={this.state.gamers[3].streamManager} /></div>}
                                        {/* <canvas ref={canvasRef} autoPlay className="Video_myturn" /> */}
                                        {/* <UserVideoComponent streamManager={this.state.mainStreamManager} className="Video_myturn" /> */}
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
                                        {this.state.gamers[3] && <div className="video_frame"> <UserVideoComponent streamManager={this.state.gamers[3].streamManager} /></div>}
                                    </div>
                                </div>
                                <div className="video_box">
                                    <div id={4} className="video_frame">
                                        {this.state.gamers[4] && <div className="video_frame"> <UserVideoComponent streamManager={this.state.gamers[4].streamManager} /></div>}
                                    </div>
                                </div>
                                <div className="video_box">
                                    <div id={5} className="video_frame">
                                        {this.state.gamers[5] && <div className="video_frame"> <UserVideoComponent streamManager={this.state.gamers[5].streamManager} /></div>}
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
        const response = await axios.post(APPLICATION_SERVER_URL + 'api/sessions', { customSessionId: sessionId }, {
            headers: { 'Content-Type': 'application/json', },
        });
        return response.data; // The sessionId
    }

    async createToken(sessionId) {
        const response = await axios.post(APPLICATION_SERVER_URL + 'api/sessions/' + sessionId + '/connections', {}, {
            headers: { 'Content-Type': 'application/json', },
        });
        return response.data; // The token
    }
}

export default webCam;
