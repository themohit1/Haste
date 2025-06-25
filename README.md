
# Haste

**Haste** is a minimal and secure peer-to-peer file sharing application built using **Node.js**, **Socket.IO**, **PeerJS**, and **Express**. Files are shared directly between peers without uploading them to a server, ensuring privacy and efficiency.

---

## 🚀 Features

- **Transferring**: Files are transferred peer-to-peer using WebRTC.
- **Real-Time Communication**: Socket.IO handles signaling and real-time updates.
- **Modern UI**: Clean, responsive design with TailwindCSS.
- **Unique Session IDs**: Each session is protected by a generated ID, preventing unauthorized access.
- **One-Time Share**: Sessions are automatically removed once the sender disconnects.

---

## 🧪 Live

> **https://haste-fmzh.onrender.com**

---

## 🛠️ Installation

Clone the repository:

```bash
git clone https://github.com/themohit1/Haste.git
cd Haste
```

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

Then open your browser and navigate to:  
📍 `http://localhost:3000`

---

## 🧱 Project Structure

```
Haste/
├── public/
│   ├── index.html         # Main frontend UI
│   └── script.js          # Frontend logic (must be created or edited)
├── server.js              # Express + Socket.IO server
├── package.json           # Project metadata & dependencies
```

---

## 📦 Dependencies

- [Express](https://expressjs.com/)
- [Socket.IO](https://socket.io/)
- [PeerJS](https://peerjs.com/)
- [TailwindCSS](https://tailwindcss.com/) (via CDN)

---

## 📸 Screenshots

*screenshots*

---

## 🧩 How It Works

1. **Sender** uploads a file and receives a shareable link with a unique ID.
2. **Receiver** uses the link to connect and receive file.
3. Upon acceptance, a direct connection via PeerJS/WebRTC is established for file transfer.
4. The session is deleted once the sender disconnects.

---

## 🔐 Security Notes

- No file data is stored or routed through the backend server.
- Socket.IO is used **only for signaling and session management**.
- Disconnecting from a session destroys it immediately.
