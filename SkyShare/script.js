const peer = new Peer(); 
let localStream = null;

// --- 1. Startup Logic ---
peer.on('open', (id) => {
    console.log('My unique ID is: ' + id);
});

// Handle errors (like if the ID is taken or connection drops)
peer.on('error', (err) => {
    console.error('PeerJS Error:', err.type);
    alert('Connection error: ' + err.type);
});

// --- 2. Hosting Logic (The Share Screen Button) ---
async function startHost() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert("Screen sharing not supported on this browser.");
        return;
    }

    try {
        // High-quality desktop sharing constraints
        localStream = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: "always", frameRate: 30 },
            audio: true 
        });

        document.getElementById('screenVideo').srcObject = localStream;

        // Display and update the code overlay
        const codeSpan = document.getElementById('myCode');
        codeSpan.innerText = peer.id;
        document.getElementById('codeOverlay').style.display = 'block';

        // Add 'Click to Copy' functionality
        document.getElementById('codeOverlay').onclick = () => {
            navigator.clipboard.writeText(peer.id);
            alert("Code copied to clipboard!");
        };

        // Handle browser "Stop Sharing" button
        localStream.getVideoTracks()[0].onended = () => stopSharing();

        // Listen for the Viewer
        peer.on('call', (call) => {
            call.answer(localStream);
        });

    } catch (err) {
        console.error("Capture failed:", err);
    }
}

// --- 3. Viewer Logic (The Watch Button) ---
function startViewer() {
    const code = document.getElementById('remoteCode').value.trim();
    if (!code) return alert("Enter a code first!");

    const call = peer.call(code, null);

    call.on('stream', (remoteStream) => {
        document.getElementById('screenVideo').srcObject = remoteStream;
    });

    call.on('error', (err) => {
        alert("Connection failed. Check the code.");
    });
}

// --- 4. Cleanup ---
function stopSharing() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    document.getElementById('screenVideo').srcObject = null;
    document.getElementById('codeOverlay').style.display = 'none';
}