document.addEventListener('DOMContentLoaded', () => {
    const senderUiDiv = document.getElementById('sender-ui');
    const receiverUiDiv = document.getElementById('receiver-ui');
    const uploadContainer = document.getElementById('upload-container');
    const sharingContainer = document.getElementById('sharing-container');
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const shareBtn = document.getElementById('share-btn');
    const fileInfoDiv = document.getElementById('file-info');
    const sharingFileInfoDiv = document.getElementById('sharing-file-info');
    const linkInput = document.getElementById('link-input');
    const copyBtn = document.getElementById('copy-btn');
    const copyBtnText = document.getElementById('copy-btn-text');
    const copyBtnIcon = document.getElementById('copy-btn-icon');
    const receivingFileInfoDiv = document.getElementById('receiving-file-info');
    const acceptBtn = document.getElementById('accept-btn');
    const transferStatsDiv = document.getElementById('transfer-stats');
    const downloadAreaDiv = document.getElementById('download-area');
    const downloadLink = document.getElementById('download-link');
    const downloadProgressBar = document.getElementById('download-progress-bar');
    const downloadProgressFill = document.getElementById('download-progress-fill');
    const errorMessageDiv = document.getElementById('error-message');

    const CHUNK_SIZE = 256 * 1024;
    let selectedFile = null, peer = null, selfPeerId = null, currentId = null;
    let isSender = true, isSharing = false, copyTimeout = null;
    
    let receiverData = {};

    const socket = io();
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('id');

    if (idFromUrl) {
        isSender = false;
        currentId = idFromUrl;
        senderUiDiv.classList.add('hidden');
        receiverUiDiv.classList.remove('hidden');
        setTimeout(() => receiverUiDiv.classList.remove('opacity-0'), 10);
    } else {
        setTimeout(() => uploadContainer.classList.remove('opacity-0'), 10);
    }
    initializePeerJS();

    function initializePeerJS() {
        try {
            peer = new Peer();
            peer.on('open', (id) => {
                selfPeerId = id;
                if (isSender) {
                    shareBtn.disabled = false;
                } else {
                    socket.emit('join-id', currentId);
                }
            });

            if (isSender) {
                peer.on('connection', setupSenderConnectionForReceiver);
            }
            peer.on('error', (err) => console.error(`PeerJS error: ${err.message}`));
        } catch (e) {
            console.error("Failed to initialize PeerJS.", e);
        }
    }

    function setupSenderConnectionForReceiver(conn) {
        conn.on('open', () => {
            if (selectedFile) {
                conn.send({ type: 'file-info', fileName: selectedFile.name, fileSize: selectedFile.size });
            }
        });
        conn.on('data', (data) => {
            if (data.type === 'start-transfer') {
                sendFileToReceiver(conn);
            }
        });
    }

    async function sendFileToReceiver(conn) {
        let offset = 0;
        const file = selectedFile;
        while (offset < file.size) {
            if (conn.bufferedAmount > CHUNK_SIZE * 4) {
                await new Promise(r => setTimeout(r, 50));
                continue;
            }
            const chunk = file.slice(offset, offset + CHUNK_SIZE);
            try {
                const buffer = await chunk.arrayBuffer();
                conn.send(buffer);
                offset += buffer.byteLength;
            } catch (e) {
                console.error("Error reading file chunk:", e);
                return;
            }
        }
    }

    function setupReceiverConnection(conn) {
        receiverData = {
            conn: conn,
            receivedBuffer: [],
            receivedSize: 0,
            totalFileSize: 0,
            receivedFileName: '',
            speedInterval: null,
            lastReceivedSize: 0
        };

        conn.on('data', (data) => onReceiverData(data));
        conn.on('close', () => showError("Transfer interrupted."));
    }

    function onReceiverData(data) {
        if (data.type === 'file-info') {
            receiverData.totalFileSize = data.fileSize;
            receiverData.receivedFileName = data.fileName;
            receivingFileInfoDiv.innerHTML = `<p class="font-semibold">${data.fileName}</p><p class="text-sm text-zinc-600">${formatFileSize(data.fileSize)}</p>`;
            acceptBtn.classList.remove('hidden');
        } else {
            receiverData.receivedBuffer.push(data);
            receiverData.receivedSize += data.byteLength;
            if (receiverData.receivedSize >= receiverData.totalFileSize) {
                assembleAndDownloadFile();
            }
        }
    }

    function assembleAndDownloadFile() {
        updateSpeedAndPercentage();
        clearInterval(receiverData.speedInterval);
        transferStatsDiv.textContent = 'Transfer complete!';
        const blob = new Blob(receiverData.receivedBuffer);
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = receiverData.receivedFileName;
        downloadAreaDiv.classList.remove('hidden');
        receiverData.receivedBuffer = [];
        receiverData.receivedSize = 0;
    }

    socket.on('id-created', (id) => {
        uploadContainer.classList.add('hidden');
        sharingContainer.classList.remove('hidden');
        setTimeout(() => sharingContainer.classList.remove('opacity-0'), 10);
        sharingFileInfoDiv.innerHTML = `<p class="font-semibold">${selectedFile.name}</p><p class="text-sm text-zinc-600">${formatFileSize(selectedFile.size)}</p>`;
        linkInput.value = `${window.location.origin}/?id=${id}`;
        isSharing = true;
    });

    socket.on('id-not-found', () => showError("Share ID not found. Check the link."));
    
    socket.on('sender-info', (data) => {
        if (!isSender && peer) {
            const conn = peer.connect(data.peerId, { reliable: true });
            setupReceiverConnection(conn);
        }
    });

    socket.on('peer-disconnected', (data) => {
        showError(data.message);
        acceptBtn.classList.add('hidden');
        downloadProgressBar.classList.add('hidden');
        if (receiverData.speedInterval) clearInterval(receiverData.speedInterval);
    });

    function updateSpeedAndPercentage() {
        const percent = receiverData.totalFileSize > 0 ? (receiverData.receivedSize / receiverData.totalFileSize) * 100 : 0;
        downloadProgressFill.style.width = `${percent}%`;
        const bytesSinceLast = receiverData.receivedSize - receiverData.lastReceivedSize;
        receiverData.lastReceivedSize = receiverData.receivedSize;
        const speed = formatFileSize(bytesSinceLast);
        transferStatsDiv.innerHTML = `<span>${Math.round(percent)}%</span><span class="mx-2 text-zinc-400">|</span><span>${speed}/s</span>`;
    }

    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('border-zinc-700'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('border-zinc-700'));
    uploadArea.addEventListener('drop', (e) => { e.preventDefault(); uploadArea.classList.remove('border-zinc-700'); if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]); });
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => fileInput.files.length && handleFile(fileInput.files[0]));
    shareBtn.addEventListener('click', () => { if (selectedFile && selfPeerId) socket.emit('create-id', { id: generateId(), peerId: selfPeerId }); });
    
    copyBtn.addEventListener('click', () => {
        if (copyTimeout) clearTimeout(copyTimeout);
        linkInput.select();
        navigator.clipboard.writeText(linkInput.value).then(() => {
            copyBtnText.textContent = "Copied!";
            copyBtnIcon.classList.remove('hidden');
            copyTimeout = setTimeout(() => {
                copyBtnText.textContent = "Copy";
                copyBtnIcon.classList.add('hidden');
            }, 2000);
        });
    });

    acceptBtn.addEventListener('click', () => {
        acceptBtn.classList.add('hidden');
        downloadProgressBar.classList.remove('hidden');
        receiverData.conn.send({ type: 'start-transfer' });
        receiverData.speedInterval = setInterval(updateSpeedAndPercentage, 1000);
    });

    window.addEventListener('beforeunload', (event) => {
        if (isSharing) {
            event.preventDefault();
            event.returnValue = '';
        }
    });

    function handleFile(file) { selectedFile = file; fileInfoDiv.innerHTML = `<p>${file.name} (${formatFileSize(file.size)})</p>`; }
    function showError(message) { if (errorMessageDiv) errorMessageDiv.textContent = message; }
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024; const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    }
    function generateId(length = 6) { return Math.random().toString(36).substring(2, 2 + length); }
});