import React, { useEffect, useRef, useState } from "react";

function Home() {
  const [myfeed, setmyfeed] = useState();
  const [userfeed, setuserfeed] = useState();
  const videoRef = useRef(null);
  const userVideoRef = useRef(null);

  const createOffer = async ()=>{
    const peerConnection = new RTCPeerConnection();

    let mediaStream =  new MediaStream();
    setuserfeed(mediaStream)

    let offer = await peerConnection
  }

  useEffect(() => {
    const init = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setmyfeed(mediaStream);
      } catch (error) {
        console.error("Error accessing camera and/or microphone:", error);
      }
    };

    init();
  }, []);

  useEffect(() => {
    // After myfeed is updated, set the srcObject for the video element
    if (videoRef.current && myfeed) {
      videoRef.current.srcObject = myfeed;
    }
  }, [myfeed]);

  useEffect(() => {
    // After myfeed is updated, set the srcObject for the video element
    if (userVideoRef.current && userfeed) {
      userVideoRef.current.srcObject = userfeed;
    }
  }, [userfeed]);

  return (
    <div>
      <div className="App-header flex items-center">
        <video
          className="w-1/2 h-1/2 bg-black m-5"
          ref={(ref) => (videoRef.current = ref)}
          autoPlay
          playsInline
          muted
        ></video>
        <video
          className="w-1/2 h-1/2 bg-black m-5"
          autoPlay
          playsInline
          muted
        ></video>
      </div>
    </div>
  );
}

export default Home;
