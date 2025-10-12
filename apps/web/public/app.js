let player;
let playlist = [];
let currentIndex = 0;
// Removed idle timer functionality

// Load YouTube IFrame Player API
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Called when YouTube API is ready
function onYouTubeIframeAPIReady() {
    loadPlaylist();
    startLiveEffects();
}


// Load playlist from JSON
async function loadPlaylist() {
    try {
        const response = await fetch('playlist.json');
        const data = await response.json();
        const filteredSongs = data.songs.filter(song => song.youtubeId);

        if (filteredSongs.length === 0) {
            document.getElementById('playlist-items').innerHTML =
                '<div class="loading">No videos available. Please run the scraper first.</div>';
            return;
        }

        // Shuffle the playlist randomly using Fisher-Yates algorithm
        playlist = shuffleArray([...filteredSongs]);

        renderPlaylist();
        initPlayer(playlist[0].youtubeId);
        updateNowPlaying(0);
        setupUI();
        setupYeehawButton();
        startViewerCounter();
        
        // Autoplay is handled by YouTube player
    } catch (error) {
        console.error('Error loading playlist:', error);
        document.getElementById('playlist-items').innerHTML =
            '<div class="loading">Error loading playlist. Run: npx tsx scraper-with-youtube.ts</div>';
    }
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}


// Initialize YouTube player
function initPlayer(videoId) {
    console.log('🎵 Initializing YouTube player with video:', videoId);
    
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            autoplay: 1,        // Always autoplay
            mute: 1,           // Start muted (required for autoplay to work)
            controls: 0,       // Hide YouTube controls for minimal look
            modestbranding: 1,
            rel: 0,            // Don't show related videos
            showinfo: 0,       // Hide video info
            fs: 1,             // Allow fullscreen
            playsinline: 1,    // Play inline on mobile
            iv_load_policy: 3, // Hide annotations
            cc_load_policy: 0, // Hide closed captions
            disablekb: 1,      // Disable keyboard controls (we handle them)
            start: 0           // Start from beginning
        },
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange
        }
    });
}

// Player ready
function onPlayerReady(event) {
    console.log('🎵 YouTube player ready - starting autoplay...');
    
    // Simple approach: play muted first (this usually works)
    event.target.playVideo();
}

// Show unmute button
function showUnmuteButton() {
    // Only show if video is playing but muted
    if (player && player.getPlayerState() === YT.PlayerState.PLAYING && player.isMuted()) {
        const unmuteBtn = document.createElement('div');
        unmuteBtn.id = 'unmute-button';
        unmuteBtn.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                background: rgba(255, 0, 0, 0.8);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                cursor: pointer;
                font-weight: bold;
                font-size: 14px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
                opacity: 0.9;
            " onclick="unmuteAndPlay()" onmouseover="this.style.background='rgba(255, 50, 50, 0.9)'; this.style.opacity='1'" onmouseout="this.style.background='rgba(255, 0, 0, 0.8)'; this.style.opacity='0.9'">
                🔊 Unmute
            </div>
        `;
        document.body.appendChild(unmuteBtn);
        
        // Auto-hide after 8 seconds
        setTimeout(() => {
            const btn = document.getElementById('unmute-button');
            if (btn) {
                btn.style.opacity = '0';
                setTimeout(() => btn.remove(), 300);
            }
        }, 8000);
    }
}

// Unmute function
function unmuteAndPlay() {
    if (player) {
        console.log('🔊 Unmuting video...');
        player.unMute();
        const btn = document.getElementById('unmute-button');
        if (btn) {
            btn.style.opacity = '0';
            setTimeout(() => btn.remove(), 300);
        }
        console.log('🔊 Video unmuted!');
    }
}

// Player state change
function onPlayerStateChange(event) {
    console.log('🎵 Player state changed:', event.data);
    
    // When video ends, play next
    if (event.data === YT.PlayerState.ENDED) {
        console.log('🎵 Video ended, playing next...');
        playNext();
    }
    
    // Video is playing
    if (event.data === YT.PlayerState.PLAYING) {
        console.log('🎵 Video is now playing');
        hideAutoplayMessage();
        
        // Hide yeehaw button if not muted
        if (!event.target.isMuted()) {
            const yeehawButton = document.getElementById('yeehaw-button');
            if (yeehawButton && !yeehawButton.classList.contains('hidden')) {
                yeehawButton.classList.add('hidden');
                setTimeout(() => {
                    yeehawButton.style.display = 'none';
                }, 300);
            }
        }
    }
    
    // Video is paused
    if (event.data === YT.PlayerState.PAUSED) {
        console.log('🎵 Video is paused');
    }
    
    // Video is buffering
    if (event.data === YT.PlayerState.BUFFERING) {
        console.log('🎵 Video is buffering...');
    }
}

// Show autoplay message
function showAutoplayMessage() {
    const message = document.createElement('div');
    message.id = 'autoplay-message';
    message.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            z-index: 1000;
            border: 2px solid rgba(255, 0, 0, 0.5);
            backdrop-filter: blur(10px);
        ">
            <h3 style="margin-bottom: 15px; color: #ff0000;">🎵 Click to Start Music</h3>
            <p style="margin-bottom: 20px; opacity: 0.8;">Browser autoplay restrictions detected</p>
            <button onclick="startPlayback()" style="
                background: linear-gradient(45deg, #ff0000, #ff4444);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                ▶️ Start Playing
            </button>
        </div>
    `;
    document.body.appendChild(message);
}

// Hide autoplay message
function hideAutoplayMessage() {
    const message = document.getElementById('autoplay-message');
    if (message) {
        message.remove();
    }
}

// Start playback function (called by button)
function startPlayback() {
    if (player && player.playVideo) {
        player.unMute();
        player.playVideo();
    }
    hideAutoplayMessage();
}

// Render playlist
function renderPlaylist() {
    const playlistContainer = document.getElementById('playlist-items');
    playlistContainer.innerHTML = '';

    playlist.forEach((song, index) => {
        const item = document.createElement('div');
        item.className = `playlist-item ${index === currentIndex ? 'active' : ''}`;
        item.onclick = () => {
            playSong(index);
            closePlaylist();
        };

        item.innerHTML = `
            <div class="song-info-item">
                <div class="song-number">#${song.position}</div>
                <div class="song-details">
                    <h4>${song.title}</h4>
                    <p>${song.artist}</p>
                </div>
            </div>
        `;

        playlistContainer.appendChild(item);
    });
}

// Play specific song
function playSong(index) {
    if (index >= 0 && index < playlist.length) {
        currentIndex = index;
        const song = playlist[index];

        if (player && player.loadVideoById) {
            console.log(`🎵 Loading song: ${song.title} - ${song.artist}`);
            player.loadVideoById(song.youtubeId);
            
            // Ensure autoplay after loading new video
            setTimeout(() => {
                if (player && player.playVideo) {
                    player.playVideo();
                }
            }, 500);
        }

        updateNowPlaying(index);
        renderPlaylist();
    }
}

// Play next song
function playNext() {
    currentIndex = (currentIndex + 1) % playlist.length;
    playSong(currentIndex);
}

// Play previous song
function playPrev() {
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playSong(currentIndex);
}

// Update now playing info
function updateNowPlaying(index) {
    const song = playlist[index];
    document.getElementById('song-title').textContent = song.title;
    document.getElementById('artist-name').textContent = song.artist;
    document.getElementById('position').textContent = `#${song.position}`;
}

// Setup UI controls
function setupUI() {
    // Previous button
    document.getElementById('prev-btn').addEventListener('click', playPrev);

    // Next button
    document.getElementById('next-btn').addEventListener('click', playNext);

    // Playlist button
    document.getElementById('playlist-btn').addEventListener('click', togglePlaylist);

    // Close playlist button
    document.getElementById('close-playlist').addEventListener('click', closePlaylist);

    // Click anywhere to start/unmute
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    // No idle timer - keep everything always visible
}

// Setup Yeehaw button
function setupYeehawButton() {
    const yeehawButton = document.getElementById('yeehaw-button');
    if (yeehawButton) {
        yeehawButton.addEventListener('click', handleYeehawClick);
    }
}

// Handle Yeehaw button click
function handleYeehawClick() {
    console.log('🤠 Yeehaw! Unmuting...');
    
    if (player) {
        player.unMute();
        
        // Hide the button with animation
        const yeehawButton = document.getElementById('yeehaw-button');
        if (yeehawButton) {
            yeehawButton.classList.add('hidden');
            setTimeout(() => {
                yeehawButton.style.display = 'none';
            }, 300);
        }
    }
}

// Handle user interaction (click/touch)
function handleUserInteraction(event) {
    // Don't interfere with control button clicks or yeehaw button
    if (event.target.closest('.control-btn') || event.target.closest('#yeehaw-button')) {
        return;
    }
    
    if (player && player.isMuted()) {
        console.log('🔊 User interaction - unmuting...');
        player.unMute();
        
        // Hide yeehaw button
        const yeehawButton = document.getElementById('yeehaw-button');
        if (yeehawButton && !yeehawButton.classList.contains('hidden')) {
            yeehawButton.classList.add('hidden');
            setTimeout(() => {
                yeehawButton.style.display = 'none';
            }, 300);
        }
        
        // Hide autoplay message
        hideAutoplayMessage();
    }
}

// Toggle playlist
function togglePlaylist() {
    const sidebar = document.getElementById('playlist-sidebar');
    sidebar.classList.toggle('open');
}

// Close playlist
function closePlaylist() {
    const sidebar = document.getElementById('playlist-sidebar');
    sidebar.classList.remove('open');
}

// Idle timer functionality removed - keep everything always visible

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') {
        playNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'b' || e.key === 'B') {
        playPrev();
    } else if (e.key === ' ') {
        e.preventDefault();
        if (player && player.getPlayerState) {
            const state = player.getPlayerState();
            if (state === YT.PlayerState.PLAYING) {
                player.pauseVideo();
            } else {
                player.playVideo();
            }
        }
    } else if (e.key === 'p' || e.key === 'P') {
        togglePlaylist();
    } else if (e.key === 'Escape') {
        closePlaylist();
    }
});

// Live TV Effects
function startLiveEffects() {
    // Random signal glitch effect
    setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance every interval
            triggerSignalGlitch();
        }
    }, 3000);

    // Random brightness flicker
    setInterval(() => {
        if (Math.random() < 0.05) { // 5% chance every interval
            triggerBrightnessFlicker();
        }
    }, 5000);
}

function triggerSignalGlitch() {
    const player = document.getElementById('player');
    const liveEffects = document.querySelector('.live-effects');
    
    // Add glitch class
    player.classList.add('signal-glitch');
    liveEffects.classList.add('signal-glitch');
    
    // Remove after short duration
    setTimeout(() => {
        player.classList.remove('signal-glitch');
        liveEffects.classList.remove('signal-glitch');
    }, 200);
}

function triggerBrightnessFlicker() {
    const player = document.getElementById('player');
    
    // Add brightness flicker
    player.classList.add('brightness-flicker');
    
    // Remove after short duration
    setTimeout(() => {
        player.classList.remove('brightness-flicker');
    }, 150);
}

// Real-time Viewer Counter (WebSockets locally, API on Vercel)
function startViewerCounter() {
    const viewerCountElement = document.getElementById('viewer-count');
    if (!viewerCountElement) return;
    
    // Check if Socket.IO is available (local development)
    if (typeof io !== 'undefined') {
        console.log('🔗 Using WebSockets for real-time viewer count');
        
        // Connect to Socket.IO server
        const socket = io();
        
        // Listen for viewer count updates from server
        socket.on('viewerCount', (count) => {
            console.log('📊 Viewer count updated:', count);
            updateViewerCount(count);
        });
        
        // Handle connection events
        socket.on('connect', () => {
            console.log('🔗 Connected to server');
        });
        
        socket.on('disconnect', () => {
            console.log('❌ Disconnected from server');
        });
    } else {
        console.log('📡 Using API polling for viewer count (Vercel mode)');
        
        // Fallback to API polling for Vercel
        const pollViewerCount = async () => {
            try {
                const response = await fetch('/api/viewer-count', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // Add timeout
                    signal: AbortSignal.timeout(5000)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('📊 API viewer count received:', data.count);
                updateViewerCount(data.count);
            } catch (error) {
                console.log('⚠️ Failed to fetch viewer count:', error);
                // Fallback to a default number if API fails
                updateViewerCount(1250);
            }
        };
        
        // Poll every 5 seconds
        pollViewerCount(); // Initial fetch
        setInterval(pollViewerCount, 5000);
    }
}

// Helper function to update viewer count display
function updateViewerCount(count) {
    const viewerCountElement = document.getElementById('viewer-count');
    if (!viewerCountElement) return;
    
    // Format number with commas
    const formattedCount = count.toLocaleString();
    viewerCountElement.textContent = formattedCount;
    
    // Add a subtle pulse effect when number changes
    viewerCountElement.style.transform = 'scale(1.1)';
    setTimeout(() => {
        viewerCountElement.style.transform = 'scale(1)';
    }, 200);
}
