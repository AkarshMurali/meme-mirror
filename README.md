# 🎭 Meme Mirror

> Make a face. Get a meme.

An AI-powered web app that detects your facial expressions and hand gestures in real-time, then displays a matching meme. Built with vanilla JavaScript and Google's MediaPipe.

## ✨ Features

- 🎥 **Real-time webcam detection** at 60 FPS
- 😄 **7 facial expressions** — happy, sad, angry, surprised, fearful, disgusted, neutral
- 🤚 **8 hand gestures** — thumbs up, peace, wave, fist, point, OK, rock on, call me
- 🎨 **Smooth UI** with glowing neon aesthetic
- 🖼️ **Animated GIFs** for hand gestures, static memes for expressions
- 👻 **Vanish animation** when no face is detected

## 🛠️ Tech Stack

- HTML5 / CSS3 / Vanilla JavaScript
- MediaPipe Tasks Vision (https://developers.google.com/mediapipe) — for face & hand detection
- Google Fonts (Bungee, Poppins)

## 🚀 Quick Start

1. Clone this repo: `git clone https://github.com/AkarshMurali/meme-mirror.git`
2. Open `index.html` with Live Server (or any local server)
3. Camera requires HTTPS or localhost — direct file access won't work
4. Allow camera permissions when prompted
5. Make faces and gestures!

## 🎭 Supported Gestures

| Gesture | Trigger |
| --- | --- |
| 👍 Thumbs Up | Thumb extended, fingers curled |
| 👊 Fist | All fingers curled |
| ✌️ Peace | Index + middle extended |
| 👋 Wave | All fingers extended |
| 👉 Point | Only index extended |
| 👌 OK | Thumb + index circle, others extended |
| 🤘 Rock On | Index + pinky extended |
| 🤙 Call Me | Thumb + pinky extended |

## 🎨 Customization

Want different memes? Replace any file in the `memes/` folder — keep the same filename.

Want to tweak detection sensitivity? Edit the threshold values in `classifyExpression()` and `classifyHandGesture()` in `script.js`.

## 📝 License

MIT License — see LICENSE for details.

## 🙏 Credits

- Built with ❤️ as a fun project by **Akarsh Murali B**
- Face & hand detection powered by Google MediaPipe
- All memes are property of their respective creators!