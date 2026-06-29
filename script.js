import { 
  FaceLandmarker, 
  HandLandmarker, 
  FilesetResolver 
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

const video = document.getElementById('video');
const expressionLabel = document.getElementById('expression-label');
const memeImg = document.getElementById('meme');

let faceLandmarker;
let handLandmarker;
let currentExpression = "";

const EMOJI = {
  happy: "😄",
  sad: "😢",
  angry: "😠",
  surprised: "😲",
  fearful: "😨",
  disgusted: "🤢",
  neutral: "😐",
  thumbsup: "👍",
  peace: "✌️",
  wave: "👋",
  fist: "👊",
  point: "👉",
  ok: "👌",
  rockon: "🤘",
  callme: "🤙"
};

// Smooth meme transition
function changeMeme(src) {
  memeImg.style.opacity = 0;
  setTimeout(() => {
    memeImg.src = src;
    memeImg.style.opacity = 1;
  }, 150);
}

// Step 1: Load BOTH MediaPipe models
async function init() {
  expressionLabel.textContent = "Loading AI...";

  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "GPU"
      },
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
      numFaces: 1
    });

    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 2
    });

    console.log("✅ Face + Hand models loaded");
    startCamera();
  } catch (err) {
    console.error("❌ Loading failed:", err);
    expressionLabel.textContent = "Failed to load AI";
  }
}

// Step 2: Start webcam
function startCamera() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      video.addEventListener('loadeddata', detectLoop);
      console.log("✅ Camera started");
      expressionLabel.textContent = "Detecting...";
    })
    .catch(err => {
      console.error("❌ Camera error:", err);
      alert("Couldn't access camera.");
    });
}

// Step 3: Detection loop
async function detectLoop() {
  if (!faceLandmarker || !handLandmarker) return;

  const now = performance.now();

  // Detect hands first
  const handResults = handLandmarker.detectForVideo(video, now);
  const handGesture = classifyHandGesture(handResults);

  if (handGesture) {
    expressionLabel.textContent = `${EMOJI[handGesture] || ""} ${handGesture}`;
    if (handGesture !== currentExpression) {
      changeMeme(`memes/${handGesture}.gif`);
      currentExpression = handGesture;
    }
  } else {
    // No hand → check face
    const faceResults = faceLandmarker.detectForVideo(video, now + 1);

    if (faceResults.faceBlendshapes && faceResults.faceBlendshapes.length > 0) {
      const blendshapes = faceResults.faceBlendshapes[0].categories;
      const expression = classifyExpression(blendshapes);

      expressionLabel.textContent = `${EMOJI[expression] || ""} ${expression}`;
      if (expression !== currentExpression) {
        changeMeme(`memes/${expression}.jpg`);
        currentExpression = expression;
      }
    } else {
      expressionLabel.textContent = "👻 Where did you go?";
      if (currentExpression !== "missing") {
        changeMeme("memes/missing-.gif");
        currentExpression = "missing";
      }
    }
  }

  requestAnimationFrame(detectLoop);
}

// Step 4: Classify hand gesture
function classifyHandGesture(handResults) {
  if (!handResults.landmarks || handResults.landmarks.length === 0) {
    return null;
  }

  const landmarks = handResults.landmarks[0];
  const wrist = landmarks[0];

  const dist = (a, b) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Finger extension (rotation-independent)
  const indexExt = dist(landmarks[8], wrist) > dist(landmarks[6], wrist);
  const middleExt = dist(landmarks[12], wrist) > dist(landmarks[10], wrist);
  const ringExt = dist(landmarks[16], wrist) > dist(landmarks[14], wrist);
  const pinkyExt = dist(landmarks[20], wrist) > dist(landmarks[18], wrist);
  const thumbExt = dist(landmarks[4], landmarks[5]) > dist(landmarks[3], landmarks[5]);

  const fingersExt = [indexExt, middleExt, ringExt, pinkyExt].filter(Boolean).length;

  // 👌 OK SIGN — thumb tip touching index tip, other fingers extended
  const thumbIndexDist = dist(landmarks[4], landmarks[8]);
  if (thumbIndexDist < 0.05 && middleExt && ringExt && pinkyExt) {
    return "ok";
  }

  // 🤘 ROCK ON — index + pinky extended, middle + ring curled
  if (indexExt && !middleExt && !ringExt && pinkyExt) {
    return "rockon";
  }

  // 🤙 CALL ME — thumb + pinky extended, middle 3 curled
  if (thumbExt && !indexExt && !middleExt && !ringExt && pinkyExt) {
    return "callme";
  }

  // 👍 THUMBS UP
  if (thumbExt && fingersExt === 0) return "thumbsup";

  // 👊 FIST
  if (!thumbExt && fingersExt === 0) return "fist";

  // ✌️ PEACE
  if (indexExt && middleExt && !ringExt && !pinkyExt) return "peace";

  // 👋 WAVE
  if (fingersExt === 4) return "wave";

  // 👉 POINT
  if (indexExt && !middleExt && !ringExt && !pinkyExt) return "point";

  return null;
}
// Step 5: Classify facial expression
function classifyExpression(blendshapes) {
  const scores = {};
  blendshapes.forEach(b => scores[b.categoryName] = b.score);

  if (scores.jawOpen > 0.4 && (scores.browInnerUp > 0.2 || scores.eyeWideLeft > 0.3)) {
    return "surprised";
  }
  if (scores.noseSneerLeft > 0.15 || scores.noseSneerRight > 0.15 || 
      scores.mouthUpperUpLeft > 0.3 || scores.mouthUpperUpRight > 0.3) {
    return "disgusted";
  }
  if ((scores.eyeWideLeft > 0.4 || scores.eyeWideRight > 0.4) && 
      scores.mouthSmileLeft < 0.2 && scores.mouthSmileRight < 0.2) {
    return "fearful";
  }
  if ((scores.browDownLeft > 0.3 || scores.browDownRight > 0.3) && 
      scores.mouthSmileLeft < 0.2) {
    return "angry";
  }
  if (scores.mouthFrownLeft > 0.2 || scores.mouthFrownRight > 0.2 ||
      scores.mouthPucker > 0.4) {
    return "sad";
  }
  if (scores.mouthSmileLeft > 0.3 || scores.mouthSmileRight > 0.3) {
    return "happy";
  }
  return "neutral";
}

init();