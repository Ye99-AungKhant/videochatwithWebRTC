const websocket = new WebSocket("ws://127.0.0.1:3000")

websocket.onmessage = (event) =>{
    handleSignallingData(JSON.parse(event.data))
}

function handleSignallingData(data){
    switch (data.type){
        case "answer": peerConnection.setRemoteDescription(data.answer)
                break
        case "candidate": peerConnection.addIceCandidate(data.candidate)
    }
}

let username
function sendUsername(){

    username = document.getElementById("username-input").value
    sendData({
        type: "store_user",
    })
}

function sendData(data) {
    data.username = username
    websocket.send(JSON.stringify(data))
}

let localStream
let peerConnection
function startCall(){
    document.getElementById("video-call-div").style.display = "inline"

    navigator.getUserMedia({
        video:{
            frameRate: 24,
            width:{
                min:480, ideal:720, max:1280
            },
            aspectRatio: 1.33333
        },
        audio:true
    }, (stream) => {
        localStream = stream
        document.getElementById("local-video").srcObject = localStream

        let configuration = {
            iceServers:[
                {   "urls": ["stun.l.google.com:19302",
                    "stun1.l.google.com:19302",
                    "stun2.l.google.com:19302"]
                }
            ]
        }
        peerConnection = new RTCPeerConnection(configuration)
        peerConnection.addStream(localStream)

        peerConnection.onaddStream = (e)=>{
            document.getElementById('remote-video').srcObject = e.stream
        }

        peerConnection.onicecandidate = ((e)=>{
            if(e.candidate == null)
            return

            sendData({
                type:"store_candidate",
                candidate:e.candidate
            })
        })

        createAndSendOffer()
    }, (error) => {
        console.log(error)
    })
}

function createAndSendOffer(){
    peerConnection.createOffer((offer) =>{
        sendData({
            type:"store_offer",
            offer:offer
        })
        peerConnection.setLocalDescription(offer)
    }, (error)=>{
        console.log(error);
    }
    )
}

let isAudio = true
function muteAudio(){
     isAudio = !isAudio
     localStream.getAudioTracks()[0].enabled = isAudio
}

let isVideo = true
function muteVideo(){
    isVideo = !isVideo
    localStream.getAudioTracks()[0].enabled = isVideo

}