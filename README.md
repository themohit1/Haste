# Haste

Haste is a secure, minimal, and efficient peer-to-peer file-sharing application built with **Node.js**, **Socket.IO**, **PeerJS**, and **Express**. Designed for privacy and performance, Haste enables direct file transfers between users without storing data on a server.

## Features

- **Peer-to-Peer File Transfer**: Utilizes WebRTC for secure, direct file sharing.
- **Real-Time Communication**: Leverages Socket.IO for seamless signaling and session management.
- **Modern User Interface**: Responsive and intuitive design styled with TailwindCSS.
- **Secure Session Management**: Unique session IDs ensure protected access to file-sharing sessions.
- **Ephemeral Sessions**: Sessions are automatically terminated when the sender disconnects, ensuring no residual data.

## Live

Explore Haste at:\
https://haste-fmzh.onrender.com

## Installation

Follow these steps to set up Haste locally:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/themohit1/Haste.git
   cd Haste
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Start the Server**:

   ```bash
   npm start
   ```

4. **Access the Application**:\
   Open your browser and navigate to `http://localhost:3000`.

## Project Structure

```
Haste/
├── public/
│   ├── index.html         # Main frontend user interface
│   └── script.js          # Frontend logic for file sharing
├── server.js              # Express and Socket.IO server implementation
├── package.json           # Project metadata and dependencies
```

## Dependencies

- Express - Web framework for Node.js
- Socket.IO - Real-time communication library
- PeerJS - WebRTC peer-to-peer connections
- TailwindCSS - Utility-first CSS framework (via CDN)

## How It Works

1. The **sender** uploads a file and receives a unique, shareable link containing a session ID.
2. The **receiver** accesses the link to join the session.
3. Upon connection, a direct WebRTC-based file transfer is established via PeerJS.
4. The session is automatically terminated when the sender disconnects, ensuring data privacy.

## Security Considerations

- **No Server Storage**: File data is transferred directly between peers, with no storage or routing through the backend.
- **Signaling Only**: Socket.IO is used exclusively for session management and signaling.
- **Session**: Sessions are destroyed immediately upon sender disconnection, preventing unauthorized access.

## Contributing

Contributions are welcome! Please submit issues or pull requests via the GitHub repository.
