const scannerDiv = document.querySelector(".scanner");

const camera = scannerDiv.querySelector("h1 .fa-camera");
const stopCam = scannerDiv.querySelector("h1 .fa-circle-stop");

const form = scannerDiv.querySelector(".scanner-form");
const fileInput = form.querySelector("input");
const p = form.querySelector("p");
const img = form.querySelector("img");
const video = form.querySelector("video");
const content = form.querySelector(".content");

const textarea = scannerDiv.querySelector(".scanner-details textarea");
const copyBtn = scannerDiv.querySelector(".scanner-details .copy");
const closeBtn = scannerDiv.querySelector(".scanner-details .close");


//Input File
form.addEventListener("click", () => fileInput.click());

// Scan QR Code Image
fileInput.addEventListener("change", e => {
    let file = e.target.files[0];
    if(!file) return;
    fetchRequest(file);
})

function fetchRequest(file){
    let formData = new FormData();
    formData.append("file", file);

    p.innerText = "Scanning QR Code...";

    fetch('http://api.qrserver.com/v1/read-qr-code/', {
        method: "POST", body: formData
    }).then(res => res.json()).then(result => {
        let text = result[0].symbol[0].data;

        if(!text)
            return p.innerText = "Couldn't Scan QR Code"
    
        scannerDiv.classList.add("active");
        form.classList.add("active-img");

        img.src = URL.createObjectURL(file);
        textarea.innerText = text;
    })
}

// Scan QR Code Camera
let scanner;

camera.addEventListener("click", () => {
  camera.style.display = "none";
  p.innerText = "Scanning QR Code...";
  form.classList.add("active-video"); // ✅ ใช้ form แทน scannerDiv

  scanner = new Instascan.Scanner({ video: video });

  scanner.addListener("scan", content => {
    console.log("QR Code:", content);
    textarea.innerText = content;
    form.classList.remove("active-video"); // ✅ ซ่อนกล้องหลังสแกนสำเร็จ
  });

  Instascan.Camera.getCameras()
    .then(cameras => {
      if (cameras.length > 0) {
        scanner.start(cameras[0]);
      } else {
        console.error("No cameras found.");
      }
    })
    .catch(e => console.error(e));
});


// Copy
copyBtn.addEventListener("click", () => {
    let text = textarea.textContent;
    navigator.clipboard.writeText(text);
})

// เมื่อกดปุ่ม Close
closeBtn.addEventListener("click", () => stopScan());

// ฟังก์ชันสำหรับหยุดการสแกนและกลับหน้าเดิม
function stopScan() {
  p.innerText = "Upload QR Code to Scan";
  scannerDiv.classList.remove("active");
  form.classList.remove("active-img");
  form.classList.remove("active-video"); // ✅ ต้องลบ class นี้ด้วย

  // หยุดกล้อง
  if (scanner) {
    scanner.stop().then(() => {
      camera.style.display = "inline-block";
    });
  }
}