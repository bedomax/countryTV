let player;
let playlist = [];
let currentIndex = 0;
let idleTimer;

// Load YouTube IFrame Player API
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Called when YouTube API is ready
function onYouTubeIframeAPIReady() {
    loadPlaylist();
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
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            autoplay: 1,
            controls: 0,  // Hide YouTube controls for minimal look
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            fs: 1,
            playsinline: 1,
            iv_load_policy: 3  // Hide annotations
        },
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange
        }
    });
}

// Player ready
function onPlayerReady(event) {
    event.target.playVideo();
}

// Player state change
function onPlayerStateChange(event) {
    // When video ends, play next
    if (event.data === YT.PlayerState.ENDED) {
        playNext();
    }
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
            player.loadVideoById(song.youtubeId);
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

    // Mouse idle detection
    resetIdleTimer();
    document.addEventListener('mousemove', resetIdleTimer);
    document.addEventListener('mousedown', resetIdleTimer);
    document.addEventListener('keypress', resetIdleTimer);
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

// Idle timer for hiding UI
function resetIdleTimer() {
    document.body.classList.remove('idle');
    clearTimeout(idleTimer);

    // Hide UI after 3 seconds of inactivity
    idleTimer = setTimeout(() => {
        document.body.classList.add('idle');
    }, 3000);
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') {
        playNext();
        resetIdleTimer();
    } else if (e.key === 'ArrowLeft' || e.key === 'b' || e.key === 'B') {
        playPrev();
        resetIdleTimer();
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
        resetIdleTimer();
    } else if (e.key === 'p' || e.key === 'P') {
        togglePlaylist();
        resetIdleTimer();
    } else if (e.key === 'Escape') {
        closePlaylist();
        resetIdleTimer();
    }
});
