import { OpenVidu } from 'openvidu-browser';

import axios from 'axios';
import React, { Component, useEffect, useState, useRef } from 'react';
import './App.css';
import UserVideoComponent from '../UserVideoComponent';

const APPLICATION_SERVER_URL = "http://localhost:5000/";

function webCam() {
    const [mySessionId, setMySessionId] = useState('SessionA')
    const [myUserName, setMyUserName] = useState('Participant' + Math.floor(Math.random() * 100))
    const [session, setSession] = useState(undefined)
    const [mainStreamManager, setMainStreamManager] = useState(undefined)
    const [publisher, setPublisher] = useState(undefined)
    const [subscribers, setSubscribers] = useState([])
    const [currentVideoDevice, setCurrentVideoDevice] = useState('')
    const [OV, setOV] = useState(null);

    useEffect(() => {
        window.addEventListener('beforeunload', onbeforeunload);

        return () => {
            window.removeEventListener('beforeunload', onbeforeunload);
        };
    }, []);

    function onbeforeunload(event) {
        leaveSession();
    }

    function handleChangeSessionId(e) {
        console.log("여기서 세션 아이디가 바뀌어줘야하는데?" + e.target.value)
        setMySessionId(e.target.value);
    }

    function handleChangeUserName(e) {
        setMyUserName(e.target.value);
    }

    function handleMainVideoStream(stream) {
        if (mainStreamManager !== stream) {
            setMainStreamManager(stream);
        }
    }

    function deleteSubscriber(streamManager) {
        let index = subscribers.indexOf(streamManager, 0);
        if (index > -1) {
            const newSubscribers = [...subscribers];
            newSubscribers.splice(index, 1);
            setSubscribers(newSubscribers);
        }
    }

    function joinSession() {
        // const OV = new OpenVidu();

        let copy = OV
        copy = new OpenVidu();
        setOV(copy);
        
     
        
        console.log("나와봐11111" + OV)
        setSession(OV.initSession());
        console.log("나와봐22222" + session)

        session && session.on('streamCreated', (event) => {
            const subscriber = session.subscribe(event.stream, undefined);
            // const subscribers = [...subscribers, subscriber];

            setSubscribers([...subscribers, subscriber]);
        });

        session && session.on('streamDestroyed', (event) => {
            deleteSubscriber(event.stream.streamManager);
        });

        session && session.on('exception', (exception) => {
            console.warn(exception);
        });

        getToken().then((token) => {
            console.log("읽히고 있는가?")
            session.connect(token, { clientData: myUserName })
                .then(async () => {
                    console.log('connected to session');
                    const publisher = await OV.initPublisherAsync(undefined, {
                        audioSource: undefined, // The source of audio. If undefined default microphone
                        videoSource: undefined, // The source of video. If undefined default webcam
                        publishAudio: true, // Whether you want to start publishing with your audio unmuted or not
                        publishVideo: true, // Whether you want to start publishing with your video enabled or not
                        resolution: '640x480', // The resolution of your video
                        frameRate: 30, // The frame rate of your video
                        insertMode: 'APPEND', // How the video is inserted in the target element 'video-container'
                        mirror: false, // Whether to mirror your local video or not
                    });
                    session.publish(publisher);

                    const devices = await OV.getDevices();
                    const videoDevices = devices.filter(device => device.kind === 'videoinput');
                    const currentVideoDeviceId = publisher.stream.getMediaStream().getVideoTracks().deviceID;
                    setCurrentVideoDevice(videoDevices.find(device => device.deviceId === currentVideoDeviceId))

                    setMainStreamManager(publisher.streamManager);
                    setPublisher(publisher);

                })
                .catch((error) => {
                    console.log('There was an error connecting to the session:', error.code, error.message);
                });
        })
    }

    function leaveSession() {
        const mySession = session;

        if (mySession) {
            mySession.disconnect();
        }

        setOV(null);
        setMySessionId('SessionA')
        setMyUserName('Participant' + Math.floor(Math.random() * 100))
        setSession(undefined)
        setMainStreamManager(undefined)
        setPublisher(undefined)
        setSubscribers([])
    }

    const switchCamera = async () => {
        try {
            const devices = await OV.getDevices()
            const videoDevices = devices.filter(device => device.kind === 'videoinput');

            if (videoDevices && videoDevices.length > 1) {
                const newVideoDevice = videoDevices.filter(device => device.deviceId !== currentVideoDevice.deviceId);

                if (newVideoDevice.length > 0) {
                    const newPublisher = OV.initPublisher(undefined, {
                        videoSource: newVideoDevice[0].deviceId,
                        publishAudio: true,
                        publishVideo: true,
                        mirror: true
                    });

                    await session.unpublish(mainStreamManager);
                    await session.publish(newPublisher);

                    setCurrentVideoDevice(newVideoDevice[0]);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    const getToken = async () => {
        const sessionId = await createSession(mySessionId);
        return await createToken(sessionId);
    }

    const createSession = async (sessionId) => {
        const response = await axios.post(APPLICATION_SERVER_URL + 'api/sessions',
            { customSessionId: sessionId }, {
            headers: { 'Content-Type': 'application/json', },
        });
        return response.data; // The sessionId
    }

    const createToken = async (sessionId) => {
        const response = await axios.post(APPLICATION_SERVER_URL + 'api/sessions/' + sessionId + '/connections',
            {}, {
            headers: { 'Content-Type': 'application/json', },
        });
        return response.data; // The token
    }

    return (
        <div className="container">
            {session === undefined ? (
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
                                    value={myUserName}
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
                                    value={mySessionId}
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
            {console.log("여기는 session "+ session)}
            {session !== undefined ? (
                <>

                    <div id="session">
                        <div id="session-header">
                            <h1 id="session-title">{mySessionId}</h1>
                            <input
                                className="btn btn-large btn-danger"
                                type="button"
                                id="buttonLeaveSession"
                                onClick={leaveSession}
                                value="Leave session"
                            />
                        </div>
                        {console.log(mainStreamManager)}
                        {mainStreamManager !== undefined ? (
                            <div id="main-video" className="col-md-6">
                                <div>난 이게 뜨는지 볼꺼야</div>
                                <UserVideoComponent streamManager={mainStreamManager} />
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
                            {publisher !== undefined ? (
                                <div className="stream-container col-md-6 col-xs-6" onClick={() => handleMainVideoStream(publisher)}>
                                    <UserVideoComponent
                                        streamManager={publisher} />
                                </div>
                            ) : null}
                            {subscribers.map((sub, i) => (
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

export default webCam;