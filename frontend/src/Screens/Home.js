import React, { useEffect, useRef, useState } from "react";
// import { CopytoClipboard } from "react-copy-to-clipboard";
import io from "socket.io-client";
import Peer from "simple-peer";

const socket = io.connect("http://localhost:5000");

function Home() {
  const [me, setme] = useState("");
  const [stream, setstream] = useState();
  const [userStream, setuserStream] = useState();
  const [recevingCall, setrecevingCall] = useState(false);
  const [caller, setcaller] = useState("");
  const [callerSignal, setcallerSignal] = useState();
  const [callAccepted, setcallAccepted] = useState(false);
  const [idToCall, setidToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setname] = useState("");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const myVdo = useRef();
  const userVdo = useRef();
  // it will be used when we disconnect from the call
  const connectionRef = useRef();

  const handleVideoToggle =()=>{
    setVideoEnabled((prev) => !prev);
  }

  const handleAudioToggle =()=>{
    setAudioEnabled((prev) => !prev);
  }

  useEffect(() => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = videoEnabled;
    }
  }, [stream,videoEnabled]);
  
  useEffect(() => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = audioEnabled;
    }
  }, [stream,audioEnabled]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setstream(stream);
      });

    socket.on("me", (id) => {
      setme(id);
    });

    socket.on("callUser", (data) => {
      setrecevingCall(true);
      setcaller(data.from);
      setname(data.name);
      setcallerSignal(data.signal);
    });

    socket.on('close-remote',()=>{
      setCallEnded(true);
    })
  }, []);

  useEffect(() => {
    if (stream) {
      myVdo.current.srcObject = stream;
    }
  }, [stream]);

  const callUser = (id) => {
    console.log("Call request initiated");
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      console.log("signal called");
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });

    peer.on("stream", (stream) => {
      console.log(stream);
      setuserStream(stream);
    });

    socket.on("callAccepted", (signal) => {
      setcallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setcallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      const signalData = {
        signal: data,
        to: caller,
      };
      console.log(signalData);
      socket.emit("answerCall", signalData);
    });

    peer.on("stream", (stream) => {
      setuserStream(stream);
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    // setCallEnded(true);
    socket.emit('close-connection',connectionRef.current)
  };

  useEffect(() => {
    if (userStream) {
      userVdo.current.srcObject = userStream;
    }
  }, [userStream]);

  return (
    <div className="bg-gray-900 h-screen">
      <div className="flex">
        <div className="w-3/4 flex justify-center items-center h-screen flex-col">
          <div className="w-4/5 flex justify-center">
            {callAccepted && !callEnded && userStream ? (
              <>
                <div className="flex justify-center m-8 ">
                  {stream && (
                    <video
                      playsInline
                      muted
                      ref={myVdo}
                      autoPlay
                      className="border-4 rounded-2xl border-green-400"
                    />
                  )}
                </div>
                <div className="flex justify-center m-8 ">
                  <video
                    playsInline
                    ref={userVdo}
                    autoPlay
                    className="border-4 rounded-2xl border-blue-500"
                  />
                </div>
              </>
            ) : (
              <div className="flex justify-center m-8 ">
                {stream && (
                  <video
                    playsInline
                    muted
                    ref={myVdo}
                    autoPlay
                    className="border-4 rounded-2xl border-green-400"
                  />
                )}
              </div>
            )}
          </div>
          <div>
            <button onClick={handleVideoToggle}>Video Toggle</button>
            <button onClick={handleAudioToggle}>Audio Toggle</button>
          </div>
        </div>
        <div className="w-1/4 flex flex-col justify-center items-center  border-l-2 border-blue-500 h-screen">
          <div>
            {recevingCall && !callAccepted ? (
              <div>
                <p className="text-2xl text-white">{name} is calling !!</p>
                <button
                  className="border-2 border-green-400 m-5 px-8 py-2 rounded-md bg-blue-600 text-white hover:bg-green-400 hover:border-blue-600"
                  onClick={answerCall}
                >
                  Answer
                </button>
              </div>
            ) : (
              <div>
                <p className="block text-white text-xl my-10">
                  Your Call Id: {me}
                </p>
                <label className="block text-white text-xl ">
                  Enter Your Name:
                </label>
                <input
                  value={name}
                  onChange={(e) => setname(e.target.value)}
                  className="border-2 rounded bg-gray-800 border-green-400 text-white p-3"
                />
                
                <div className="flex flex-col items-center">
                  {callAccepted && !callEnded ? (
                    <button
                      className="border-2 border-green-400 m-5 px-8 py-2 rounded-md bg-blue-600 text-white"
                      onClick={leaveCall}
                    >
                      End Call
                    </button>
                  ) : (
                    <>
                    <label className="block text-white text-xl mt-10">
                      Enter Your Friend's Caller Id:
                    </label>
                    <input
                      type="text"
                      value={idToCall}
                      onChange={(e) => setidToCall(e.target.value)}
                      className="border-2 rounded bg-gray-800 border-green-400  text-white p-3"
                    />
                    <button
                      className="border-2 border-green-400 m-5 px-8 py-2 rounded-md bg-blue-600 text-white"
                      onClick={() => callUser(idToCall)}
                    >
                      Call
                    </button>
                    </>
                  )}
                  {/* <p>{idToCall}</p> */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
