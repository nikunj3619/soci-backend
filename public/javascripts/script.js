(() => {
    const width = 200;
    let height = 0;
    let streaming = false;
    let video = null;
    let canvas = null;
    let photo = null;
    let startbutton = null;
    let fileInput = null;
    let contact = null;
    let name = null;
    let membername = null;
    let nameContent = null;
    let membernameContent = null;
    let contactContent = null;
    let takephotoclicked = 0;

    function startup() {
        video = document.getElementById("video");
        canvas = document.getElementById("canvas");
        photo = document.getElementById("photo");
        startbutton = document.getElementById("startbutton");
        fileInput = document.getElementById("fileInput");

        navigator.mediaDevices
            .getUserMedia({ video: true, audio: false })
            .then((stream) => {
                video.srcObject = stream;
                video.play();
            })
            .catch((err) => {
                console.error(`An error occurred: ${err}`);
            });

        video.addEventListener(
            "canplay",
            () => {
                if (!streaming) {
                    height = video.videoHeight / (video.videoWidth / width);
                    if (isNaN(height)) {
                        height = width / (4 / 3);
                    }
                    video.setAttribute("width", 200);
                    video.setAttribute("height", 200);
                    canvas.setAttribute("width", 200);
                    canvas.setAttribute("height", 200);
                    streaming = true;
                }
            },
            false
        );

        startbutton.addEventListener(
            "click",
            (ev) => {
                takephotoclicked = takephotoclicked + 1;
                console.log(takephotoclicked)
                takepicture();
                ev.preventDefault();
               
            },
            false
        );

        document.getElementById("submitForm").addEventListener("click", submitForm);
    }

    function takepicture() {
        const context = canvas.getContext("2d");
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/png");
            photo.setAttribute("src", dataUrl);
        }
    }

    function submitForm() {
       
        const dataUrl = canvas.toDataURL("image/png");
        const blob = dataURItoBlob(dataUrl);
        console.log(blob)
     
        console.log(name, contact, membername);
        console.log(takephotoclicked)
        if(name == null || contact == null || membername == null || takephotoclicked <= 0){
            alert('all fields are required');
            return;
        }

        const formData = new FormData();
        formData.append("contact", contact);
        formData.append("name", name);
        formData.append("membername", membername);
        formData.append("photo", blob, "photo.png");

        sendDataToServer(formData);
        console.log("sendDataToServer called");
    }

    function sendDataToServer(formData) {
        fetch("/entry", {
            method: "POST",
            body: formData,
        })
        .then((response) => response.text())
        .then((data) => {
            console.log(data);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
    }

    function dataURItoBlob(dataURI) {
        const byteString = atob(dataURI.split(",")[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: "image/png" });
    }

    

    namerecog = () => {
    document.getElementById("name").innerHTML = "Start Speaking";
    var action = document.getElementById('name');
    let recognization = new webkitSpeechRecognition();
    recognization.onstart = () => {
       action.innerHTML = "Listening...";
    }
    recognization.onresult = (e) => {
       var transcript = e.results[0][0].transcript;
       name = transcript;
       console.log(name)
       action.innerHTML = transcript;
    }
    recognization.start();
 }

    membernamerecog = () => {
    document.getElementById("membername").innerHTML = "Start Speaking";
    var action = document.getElementById('membername');
    let recognization = new webkitSpeechRecognition();
    recognization.onstart = () => {
       action.innerHTML = "Listening...";
    }
    recognization.onresult = (e) => {
       var transcript = e.results[0][0].transcript;
       membername = transcript;
       console.log(membername)
       action.innerHTML = transcript;
    }
    recognization.start();
 }

 contactrecog = () => {
    document.getElementById("contact").innerHTML = "Start Speaking";
    var action = document.getElementById('contact');
    let recognization = new webkitSpeechRecognition();
    recognization.onstart = () => {
       action.innerHTML = "Listening...";
    }
    recognization.onresult = (e) => {
       var transcript = e.results[0][0].transcript;
       contact = transcript;
       console.log(contact)
       action.innerHTML = transcript;
    }
    recognization.start();
 }


    window.addEventListener("load", startup, false);
})();

let element = document.querySelector("#done");

function donevisible(){
    element.style.display = 'block';
}

function back() { 
    window.location.href = "http://localhost:3000/pass"; 
} 