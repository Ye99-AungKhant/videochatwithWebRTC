const websocket = new WebSocket("ws://127.0.0.1:3000")

websocket.onmessage = (event) =>{
    handleSignallingData(JSON.parse(event.data))
}

function handleSignallingData(data){
    switch (data.type){
        case "offer": peerConnection.setRemoteDescription(data.offer)
        createAndSendAnswer()
                break
        case "candidate": peerConnection.addIceCandidate(data.candidate)
    }
}


function createAndSendAnswer(){
    peerConnection.createAnswer((answer) => {
        peerConnection.setLocalDescription(answer)
        sendData({
            type: "send_answer",
            answer: answer
        })
    }, error => {
        console.log(error);
    })
}

function sendData(data) {
    data.username = username
    websocket.send(JSON.stringify(data))
}

let localStream
let peerConnection
let username

function joinCall(){
    username = document.getElementById('username-input').value
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
                type:"send_candidate",
                candidate:e.candidate
            })
        })

        sendData({
            type: "join_call"
        })
      
    }, (error) => {
        console.log(error)
    })
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