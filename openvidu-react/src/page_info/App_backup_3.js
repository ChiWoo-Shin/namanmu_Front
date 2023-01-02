import { OpenVidu } from 'openvidu-browser';
import axios from 'axios';
import React, { Component, useEffect, useState, useRef } from 'react';
import './App.css';
import UserVideoComponent from './UserVideoComponent';


const APPLICATION_SERVER_URL = "http://localhost:5000/";

const drawToCanvas = () => {
    try {
        const ctx = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;

        if (ctx && ctx !== null) {
            if (videoRef.current) {
                ctx.translate(canvasRef.current.width, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                ctx.setTransform(1, 0, 0, 1, 0, 0);
            }
        }
    } catch (err) {
        console.log(err);
    }
}

const startOrStop_2 = () => {
    if (!timer) {
        const t = setInterval(() => drawToCanvas(), 0);
        setTimer(t);
    } else {
        clearInterval(timer);
        setTimer(undefined);
    }
}

function App() {
    const [state, setState] = useState({
        mySessionId: 'SessionA',
        myUserName: 'Participant' + Math.floor(Math.random() * 100),
        session: undefined,
        mainStreamManager: undefined,  // Main video of the page. Will be the 'publisher' or one of the 'subscribers'
        publisher: undefined,
        subscribers: [],
        OV : null,
    });

    useEffect(() => {
        window.addEventListener('beforeunload', onbeforeunload);

        return () => {
            window.removeEventListener('beforeunload', onbeforeunload);
        };
    }, []);

    const joinSession = () => {
        // --- 1) Get an OpenVidu object ---
        OV = new OpenVidu();

        // --- 2) Init a session ---
        setState((prevState) => ({
            ...prevState,
            session: OV.initSession(),
        }));

        const mySession = state.session;

        // --- 3) Specify the actions when events take place in the session ---

        // On every new Stream received...
        state.session && mySession.on('streamCreated', (event) => {
            // Subscribe to the Stream to receive it. Second parameter is undefined
            // so OpenVidu doesn't create an HTML video by its own
            const subscriber = mySession.subscribe(event.stream, undefined);
            const subscribers = state.subscribers;
            subscribers.push(subscriber);

            // Update the state with the new subscribers
            setState((prevState) => ({
                ...prevState,
                subscribers: subscribers,
            }));
        });

        // On every Stream destroyed...
        state.session && mySession.on('streamDestroyed', (event) => {
            // Remove the stream from 'subscribers' array
            deleteSubscriber(event.stream.streamManager);
        });

        // On every asynchronous exception...
        state.session && mySession.on('exception', (exception) => {
            console.warn(exception);
        });

        // --- 4) Connect to the session with a valid user token ---
        // Get a token from the OpenVidu deployment
        getToken().then((token) => {
            // First param is the token got from the OpenVidu deployment. Second param can be retrieved by every user on event
            // 'streamCreated' (property Stream.connection.data), and will be appended to DOM as the user's nickname
            state.session && mySession.connect(token, { clientData: state.myUserName })
            console.log("여기는 옴?" + token + "여기는 중간지점" + state.myUserName)
                .then(async () => {
                    console.log('Connected to the session');

                    // --- 5) Get your own camera stream ---

                    // Init a publisher passing undefined as targetElement (we don't want OpenVidu to insert a video
                    // element: we will manage it on our own) and with the desired properties
                    const publisher = OV.initPublisher(
                        undefined,
                        {
                            audio: true, // Whether you want to transmit audio or not
                            video: true, // Whether you want to transmit video or not
                            screen: false, // Whether you want to transmit screen or not
                            frameRate: 30, // Frame rate in frames per second. Possible values are: [5, 10, 15, 20, 25, 30] (default: 20)
                            resolution: '640x480', // '1920x1080' | '1280x720' | '640x480' | '320x240' (default: '640x480')
                        })
                    // Publish your stream
                    mySession.publish(publisher)
                    console.log('Publishing your stream');

                    setState((prevState) => ({
                        ...prevState,
                        publisher: publisher,
                        mainStreamManager: publisher,
                    }));

                })
            console.log("22222222여기는 옴?" + token + "여기는 중간지점" + state.myUserName)
                .catch((error) => {
                    console.log('There was an error connecting to the session:', error.code, error.message);
                });
        }).catch((error) => {
            console.log('아 진짜 왜 안되냐', error.code, error.connect);
        })
    };

    const leaveSession = () => {
        // --- 6) Leave the session by calling 'disconnect' method over the Session object ---
        if (state.session) {
            state.session.disconnect();
        }
        setState({
            mySessionId: 'SessionA',
            myUserName: 'Participant' + Math.floor(Math.random() * 100),
            session: undefined,
            mainStreamManager: undefined,  // Main video of the page. Will be the 'publisher' or one of the 'subscribers'
            publisher: undefined,
            subscribers: [],
            OV : null,
        });
    };

    const switchCamera = () => {
        state.publisher.swapCamera().then(() => {
            console.log('Swapping camera');
        });
    };

    const handleChangeSessionId = (e) => {
        setState((prevState) => ({
            ...prevState,
            mySessionId: e.target.value,
        }));
    };

    const handleChangeUserName = (e) => {
        setState((prevState) => ({
            ...prevState,
            myUserName: e.target.value,
        }));
    };

    const handleMainVideoStream = (stream) => {
        if (state.mainStreamManager !== stream) {
            setState((prevState) => ({
                ...prevState,
                mainStreamManager: stream,
            }));
        }
    };

    const onbeforeunload = (event) => {
        leaveSession();
    };

    const deleteSubscriber = (streamManager) => {
        let subscribers = state.subscribers;
        let index = subscribers.indexOf(streamManager, 0);
        if (index > -1) {
            subscribers.splice(index, 1);
            setState((prevState) => ({
                ...prevState,
                subscribers: subscribers,
            }));
        }
    };

    async function getToken() {
        const sessionId = await createSession(state.mySessionId);
        console.log("여기는 오냐")
        return await createToken(sessionId);
    }

    const createSession = async (sessionId) => {
        const response = await axios.post(
            APPLICATION_SERVER_URL + 'api/sessions',
            { customSessionId: sessionId },
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );
        return response.data; // The sessionId
    };

    const createToken = async (sessionId) => {
        const response = await axios.post(
            APPLICATION_SERVER_URL + 'api/sessions/' + sessionId + '/connections',
            {},
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );
        return response.data; // The token
    };

    return (
        <div className="container">
            {state.session === undefined ? (
                <div id="join">
                    <div id="img-div">
                        <img src="resources/images/openvidu_grey_bg_transp_cropped.png" alt="OpenVidu logo" />
                    </div>
                    <div id="join-dialog" className="jumbotron vertical-center">
                        <h1> Join a video session </h1>
                        <div className="form-group" onClick={joinSession}>
                            <p>
                                <label>Participant: </label>
                                <input
                                    className="form-control"
                                    type="text"
                                    id="userName"
                                    value={state.myUserName}
                                    onChange={handleChangeUserName}
                                    required
                                />
                            </p>
                            <p>
                                <label> Session: </label>
                                <input
                                    className="form-control"
                                    type="text"
                                    id="sessionId"
                                    value={state.mySessionId}
                                    onChange={handleChangeSessionId}
                                    required
                                />
                            </p>
                            <p className="text-center">
                                <button className="btn btn-lg btn-success" onClick={joinSession}>
                                    JOIN
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            ) : null}
            {console.log("여기는 session" + state.session)};
            {state.session !== undefined ? (
                <>

                    <div id="session">
                        <div id="session-header">
                            <h1 id="session-title">{state.mySessionId}</h1>
                            <input
                                className="btn btn-large btn-danger"
                                type="button"
                                id="buttonLeaveSession"
                                onClick={leaveSession}
                                value="Leave session"
                            />
                        </div>
                        {console.log(state.mainStreamManager)}
                        {state.mainStreamManager !== undefined ? (
                            <div id="main-video" className="col-md-6">
                                <div>난 이게 뜨는지 볼꺼야</div>
                                <UserVideoComponent streamManager={state.mainStreamManager} />
                                <input
                                    className="btn btn-large btn-success"
                                    type="button"
                                    id="buttonSwitchCamera"
                                    onClick={switchCamera}
                                    value="Switch Camera"
                                />
                            </div>
                        ) : null}
                        <div id="video-container" className="col-md-6">
                            {state.publisher !== undefined ? (
                                <div className="stream-container col-md-6 col-xs-6" onClick={() => handleMainVideoStream(state.publisher)}>
                                    <UserVideoComponent
                                        streamManager={state.publisher} />
                                </div>
                            ) : null}
                            {state.subscribers.map((sub, i) => (
                                <div key={i} className="stream-container col-md-6 col-xs-6" onClick={() => handleMainVideoStream(sub)}>
                                    <UserVideoComponent streamManager={sub} />
                                </div>
                            ))}
                        </div>
                    </div>
                </>) : null}
        </div>
    );


}

export default App;