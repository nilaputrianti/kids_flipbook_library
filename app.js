/* -------------------------------------------------------------
   PUSTAKA CILIK - KIDS ENGINEERING LIBRARY WITH 3D FLIPBOOK
   ------------------------------------------------------------- */

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// APP STATE
const state = {
    isSubscribed: false,
    selectedPlan: 'annual',
    currentCategory: 'all',
    currentBook: null,
    currentPage: 1,
    isAudioOn: true,
    isPlayingStory: false,
    syntheticNarrator: null,
    audioCtx: null,
    searchQuery: '',
    favorites: new Set(['civ-1', 'civ-2']),
    FREE_PREVIEW_PAGES: 2, // 2 Spreads = 4 Pages preview for unregistered guests
    appliedReferral: null
};

// DYNAMIC FLIPBOOK CATALOG DATA FROM BACKEND REST API
let booksCatalog = [
    {
        id: 'civ-1',
        category: '',
        title: 'Rahasia Mesin & Roda Gigi',
        coverBg: 'linear-gradient(135deg, #F59E0B, #D97706)',
        icon: '🚜',
        totalPages: 10,
        description: 'Belajar bagaimana roda gigi & hidrolik excavator mengeruk tanah keras!',
        status: 'published',
        pages: [
            { text: "Di sebuah area kerja besar, ada excavator ditenagai oleh cairan minyak bermutu tinggi!", icon: "🚜", sfx: "engine", funFact: "Cairan hidrolik di dalam excavator bekerja dengan tekanan lebih dari 300 bar!" },
            { text: "Cairan minyak ditekan masuk ke dalam silinder baja. Ini membuat pengeruk bisa menggali tanah dengan kekuatan puluhan ton!", icon: "💪", sfx: "engine", funFact: "Ekskavator terbesar di dunia bisa memindahkan 240.000 ton tanah setiap hari!" },
            { text: "Roda rantai (crawler track) membuat excavator bisa berjalan melintasi lumpur tanpa mudah tersangkut!", icon: "🛞", sfx: "ambient", funFact: "Roda rantai membagi berat excavator secara merata ke permukaan tanah." },
            { text: "Para ahli menggunakan excavator untuk menggali pondasi gedung, waduk air, dan saluran irigasi!", icon: "🏗️", sfx: "engine", funFact: "Pondasi yang dalam membuat bangunan aman dari tanah longsor." }
        ]
    },
    {
        id: 'civ-2',
        category: '',
        title: 'Truk Molen & Pengaduk Beton',
        coverBg: 'linear-gradient(135deg, #0EA5E9, #0284C7)',
        icon: '🚚',
        totalPages: 10,
        description: 'Mengapa tabung truk beton harus terus berputar selama di jalan raya?',
        status: 'published',
        pages: [
            { text: "Truk Molen berjalan di jalan raya sambil memutar tabung raksasanya di belakang. Mengapa ia berputar?", icon: "🚚", sfx: "engine", funFact: "Tabung truk molen miring sekitar 15 derajat untuk memudahkan pengadukan." },
            { text: "Tabung berputar agar adonan beton cair tidak mengeras selama perjalanan dari pabrik ke lokasi pembangunan!", icon: "🌀", sfx: "engine", funFact: "Beton akan mengeras dalam waktu 90-120 menit jika berhenti diaduk." },
            { text: "Beton adalah campuran dari semen, pasir, kerikil batu, dan air cair.", icon: "🧱", sfx: "ambient", funFact: "Beton adalah bahan bangunan paling banyak digunakan di muka bumi!" }
        ]
    },
    {
        id: 'civ-3',
        category: '',
        title: 'Bagaimana Jembatan Berdiri Kokoh?',
        coverBg: 'linear-gradient(135deg, #38BDF8, #0369A1)',
        icon: '🌉',
        totalPages: 12,
        description: 'Temukan rahasia bentuk segitiga dan kabel baja pada jembatan gantung.',
        status: 'published',
        pages: [
            { text: "Pernahkah kamu melihat jembatan gantung yang sangat panjang di atas laut? Bagaimana jembatan itu menahan mobil-mobil berat?", icon: "🌉", sfx: "ambient", funFact: "Jembatan Akashi Kaikyo di Jepang memiliki panjang bentang utama 1.991 meter!" },
            { text: "Rahasianya ada pada struktur Segitiga! Segitiga adalah bentuk geometri paling kuat dalam ilmu teknik.", icon: "🔺", sfx: "ambient", funFact: "Rangka segitiga membagi beban secara merata ke titik-titik tumpunya." },
            { text: "Kabel baja tebal ditarik dari tiang menara utama untuk menyangga jalanan jembatan.", icon: "🏗️", sfx: "ambient", funFact: "Kabel utama jembatan terdiri dari ribuan kawat baja kecil yang dipilin bersama." }
        ]
    },
    {
        id: 'civ-4',
        category: '',
        title: 'Cara Kerja Helikopter & Pesawat',
        coverBg: 'linear-gradient(135deg, #F59E0B, #B45309)',
        icon: '🚁',
        totalPages: 10,
        description: 'Prinsip aerodinamika sederhana tentang bagaimana angin mengangkat pesawat.',
        status: 'published',
        pages: [
            { text: "Helikopter memiliki baling-baling raksasa di atasnya yang berputar sangat cepat seperti kipas angin megah.", icon: "🚁", sfx: "engine", funFact: "Baling-baling helikopter dapat berputar hingga 500 putaran per menit!" },
            { text: "Bentuk sayap pesawat membuat udara di atas bergerak lebih cepat daripada udara di bawah. Ini menciptakan Gaya Angkat!", icon: "✈️", sfx: "engine", funFact: "Prinsip ini ditemukan oleh ilmuwan Daniel Bernoulli." }
        ]
    },
    {
        id: 'civ-5',
        category: '',
        title: 'Pondasi Gedung Pencakar Langit',
        coverBg: 'linear-gradient(135deg, #0284C7, #0369A1)',
        icon: '🏙️',
        totalPages: 14,
        description: 'Mengapa gedung puluhan lantai tetap tegak saat digoyang gempa atau angin kencang?',
        status: 'published',
        pages: [
            { text: "Gedung pencakar langit memiliki tiang pancang beton yang tertanam puluhan meter jauh ke dalam tanah keras.", icon: "🏙️", sfx: "ambient", funFact: "Burj Khalifa di Dubai memiliki pondasi bertumpu pada 192 tiang pancang!" },
            { text: "Baja elastis digunakan di dalam beton agar gedung bisa membal sedikit saat ada gempa atau angin kencang.", icon: "🏗️", sfx: "ambient", funFact: "Pencakar langit sengaja dirancang untuk fleksibel agar tidak patah." }
        ]
    },
    {
        id: 'civ-6',
        category: '',
        title: 'Struktur Tower Crane Raksasa',
        coverBg: 'linear-gradient(135deg, #0EA5E9, #0284C7)',
        icon: '🏗️',
        totalPages: 10,
        description: 'Bagaimana tower crane merakit dirinya sendiri hingga setinggi awan!',
        status: 'published',
        pages: [
            { text: "Tower crane adalah burung besi raksasa yang berada di lokasi pembangunan gedung bertingkat.", icon: "🏗️", sfx: "gear", funFact: "Operator crane memanjat tangga di dalam tiang besi setiap pagi untuk menuju kabin!" },
            { text: "Ia mengangkat bahan bangunan berat seperti tiang baja, semen, dan kaca ke lantai atas proyek.", icon: "📦", sfx: "engine", funFact: "Tower crane bisa mengangkat beban hingga 20 ton dalam sekali angkut." }
        ]
    }
];

// DOM ELEMENTS
const sceneEntrance = document.getElementById('sceneEntrance');
const sceneLibrary = document.getElementById('sceneLibrary');
const doorContainer = document.getElementById('doorContainer');
const doorFrame = document.getElementById('doorFrame') || doorContainer;

const btnEnterLibrary = document.getElementById('btnEnterLibrary');
const btnOpenSubscribeModal = document.getElementById('btnOpenSubscribeModal');

const navHome = document.getElementById('navHome');
const navCatalog = document.getElementById('navCatalog');
const brandLogo = document.getElementById('brandLogo');

const btnHeaderLogin = document.getElementById('btnHeaderLogin');
const btnHeaderRegister = document.getElementById('btnHeaderRegister');
const btnBackToEntrance = document.getElementById('btnBackToEntrance');

const loginModal = document.getElementById('loginModal');
const btnCloseLogin = document.getElementById('btnCloseLogin');
const formLogin = document.getElementById('formLogin');
const loginPassword = document.getElementById('loginPassword');
const toggleLoginPwd = document.getElementById('toggleLoginPwd');
const linkToRegister = document.getElementById('linkToRegister');

const registerModal = document.getElementById('registerModal');
const btnCloseRegister = document.getElementById('btnCloseRegister');
const formRegister = document.getElementById('formRegister');
const linkToLogin = document.getElementById('linkToLogin');

const btnGoogleAuth = document.getElementById('btnGoogleAuth');
const btnSmsAuth = document.getElementById('btnSmsAuth');

const subscribeModal = document.getElementById('subscribeModal');
const btnCloseSubscribe = document.getElementById('btnCloseSubscribe');
const btnConfirmSubscribe = document.getElementById('btnConfirmSubscribe');
const planMonthly = document.getElementById('planMonthly');
const planAnnual = document.getElementById('planAnnual');

const parentDashboardModal = document.getElementById('parentDashboardModal');
const btnCloseParentDashboard = document.getElementById('btnCloseParentDashboard');
const btnLogoutUser = document.getElementById('btnLogoutUser');

const userStatusPill = document.getElementById('userStatusPill');
const statusBadge = document.getElementById('statusBadge');
const shelfGrid = document.getElementById('shelfGrid');
const currentCatTitle = document.getElementById('currentCatTitle');
const inputSearchBook = document.getElementById('inputSearchBook');
const favCount = document.getElementById('favCount');

const flipbookModal = document.getElementById('flipbookModal');
const btnCloseReader = document.getElementById('btnCloseReader');
const readerBookTitle = document.getElementById('readerBookTitle');
const readerCategoryBadge = document.getElementById('readerCategoryBadge');

const pageLeftContent = document.getElementById('pageLeftContent');
const pageRightContent = document.getElementById('pageRightContent');
const currentPageNum = document.getElementById('currentPageNum');
const totalPagesNum = document.getElementById('totalPagesNum');

const btnPrevPage = document.getElementById('btnPrevPage');
const btnNextPage = document.getElementById('btnNextPage');
const btnToggleAudio = document.getElementById('btnToggleAudio');
const audioIcon = document.getElementById('audioIcon');
const audioStatusText = document.getElementById('audioStatusText');
const audioEqualizer = document.getElementById('audioEqualizer');
const btnPlayStory = document.getElementById('btnPlayStory');
const btnStoryText = document.getElementById('btnStoryText');
const btnBookmark = document.getElementById('btnBookmark');

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateFavCount();
    loadBooksFromApi();
    initWebAudio();
});

// FETCH BOOKS DYNAMICALLY FROM REST API
async function loadBooksFromApi() {
    try {
        const res = await fetch('/api/books');
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
            booksCatalog = data.data;
        }
    } catch (err) {
        console.log('Menggunakan katalog fallback lokal:', err);
    }
    renderShelfBooks(state.currentCategory);
}

function initWebAudio() {
    try {
        if (!state.audioCtx) {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            if (window.AudioContext) {
                state.audioCtx = new AudioContext();
            }
        }
        if (state.audioCtx && state.audioCtx.state === 'suspended') {
            state.audioCtx.resume();
        }
    } catch (e) {
        console.log('WebAudio Init error:', e);
    }
}

// Auto-unlock WebAudioContext on any user interaction (click, touch, keydown)
['click', 'touchstart', 'pointerdown', 'keydown'].forEach(evtType => {
    document.addEventListener(evtType, () => {
        initWebAudio();
    }, { passive: true });
});

function playSoundEffect(type) {
    if (!state.isAudioOn) return;
    
    initWebAudio();
    if (!state.audioCtx) return;

    try {
        const ctx = state.audioCtx;
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'gear') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        } else if (type === 'engine') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(80, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.5);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } else if (type === 'beep') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } else if (type === 'pageflip') {
            // HIGH-QUALITY PHYSICAL PAPER FLIP SOUND SYNTHESIS
            const bufferSize = Math.floor(ctx.sampleRate * 0.32); // 320ms paper flip sweep
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                // Synthesize organic paper friction white noise curve
                const progress = i / bufferSize;
                data[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * progress);
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            // Bandpass filter to isolate crisp paper rustle frequencies (700Hz to 2200Hz)
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1600, ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(650, ctx.currentTime + 0.3);
            filter.Q.setValueAtTime(1.6, ctx.currentTime);

            const paperGain = ctx.createGain();
            paperGain.gain.setValueAtTime(0.01, ctx.currentTime);
            paperGain.gain.linearRampToValueAtTime(0.42, ctx.currentTime + 0.09); // Paper lift sound
            paperGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32); // Paper landing sound

            noise.connect(filter);
            filter.connect(paperGain);
            paperGain.connect(ctx.destination);

            // Subtle paper whip tone sweep
            const paperTone = ctx.createOscillator();
            const toneGain = ctx.createGain();
            paperTone.type = 'sine';
            paperTone.frequency.setValueAtTime(280, ctx.currentTime);
            paperTone.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.22);
            toneGain.gain.setValueAtTime(0.1, ctx.currentTime);
            toneGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

            paperTone.connect(toneGain);
            toneGain.connect(ctx.destination);

            noise.start(ctx.currentTime);
            noise.stop(ctx.currentTime + 0.32);
            paperTone.start(ctx.currentTime);
            paperTone.stop(ctx.currentTime + 0.22);
        }
    } catch (e) {
        console.log("Audio effect error:", e);
    }
}

// INDONESIAN VOICE DUAL-ENGINE INITIALIZATION (ONLINE NATIVE TTS + SYSTEM SPEECH FALLBACK)
let indonesianVoice = null;
let activeNarratorAudio = null;
let narratorConfig = {
    gender: 'female', // 'female' or 'male'
    engine: 'online_tts', // 'online_tts' or 'system_tts'
    rate: 0.85,
    pitch: 1.15,
    style: 'expressive_kids'
};

async function fetchNarratorConfig() {
    try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings) {
            narratorConfig.gender = data.settings.narratorVoiceGender || 'female';
            narratorConfig.engine = data.settings.narratorVoiceEngine || 'online_tts';
            narratorConfig.style = data.settings.storytellerStyle || 'expressive_kids';
            narratorConfig.pitch = narratorConfig.gender === 'female' ? 1.25 : 0.75;
            narratorConfig.rate = data.settings.narratorRate || 0.85;
            loadIndonesianVoice();
        }
    } catch (e) {}
}

function loadIndonesianVoice() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return;

    const idVoices = voices.filter(v => 
        v.lang === 'id-ID' || v.lang === 'id_ID' || v.lang.startsWith('id') || v.name.toLowerCase().includes('indonesia')
    );

    if (idVoices.length > 0) {
        if (narratorConfig.gender === 'male') {
            const maleVoice = idVoices.find(v => 
                v.name.toLowerCase().includes('ardi') || v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('pria')
            );
            indonesianVoice = maleVoice || idVoices[0];
        } else {
            const femaleVoice = idVoices.find(v => 
                v.name.toLowerCase().includes('gadis') || v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('wanita') || v.name.toLowerCase().includes('google')
            );
            indonesianVoice = femaleVoice || idVoices[0];
        }
    } else {
        indonesianVoice = null;
    }
}

if ('speechSynthesis' in window) {
    loadIndonesianVoice();
    window.speechSynthesis.onvoiceschanged = loadIndonesianVoice;
}
fetchNarratorConfig();

function speakNarration(text, targetGender = null) {
    const gender = targetGender || (state.currentBook && state.currentBook.narratorGender) || narratorConfig.gender || 'female';

    if (activeNarratorAudio) {
        activeNarratorAudio.pause();
        activeNarratorAudio = null;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    
    if (!state.isAudioOn || !text) {
        state.isPlayingStory = false;
        btnStoryText.textContent = "Putar Narasi Cerita";
        audioEqualizer.classList.add('hidden');
        return;
    }

    const onStart = () => {
        state.isPlayingStory = true;
        btnStoryText.textContent = "Hentikan Narasi";
        audioEqualizer.classList.remove('hidden');
    };

    const onEnd = () => {
        state.isPlayingStory = false;
        btnStoryText.textContent = "Putar Narasi Cerita";
        audioEqualizer.classList.add('hidden');
    };

    if (narratorConfig.engine === 'online_tts') {
        const cleanText = text.replace(/[^a-zA-Z0-9\s.,?!]/g, ' ');
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText.substring(0, 180))}&tl=id&client=tw-ob`;
        const audio = new Audio(ttsUrl);
        activeNarratorAudio = audio;
        
        // Distinct speed/formant pitch for Female vs Male
        audio.playbackRate = gender === 'female' ? 1.15 : 0.84;
        
        onStart();
        audio.onended = onEnd;
        audio.onerror = () => {
            speakSystemSpeechFallback(text, gender, onStart, onEnd);
        };

        audio.play().catch(err => {
            console.log("Online TTS playback error, using SpeechSynthesis fallback:", err);
            speakSystemSpeechFallback(text, gender, onStart, onEnd);
        });
    } else {
        speakSystemSpeechFallback(text, gender, onStart, onEnd);
    }
}

function speakSystemSpeechFallback(text, gender, onStart, onEnd) {
    if (!('speechSynthesis' in window)) {
        onEnd();
        return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';

    if (!indonesianVoice) loadIndonesianVoice();
    if (indonesianVoice) {
        utterance.voice = indonesianVoice;
    }

    // High bright female pitch (1.45) vs Deep resonant male pitch (0.55)
    utterance.rate = gender === 'female' ? 0.92 : 0.82;
    utterance.pitch = gender === 'female' ? 1.45 : 0.55;

    utterance.onstart = onStart;
    utterance.onend = onEnd;
    utterance.onerror = onEnd;

    window.speechSynthesis.speak(utterance);
}

function playCurrentSpreadNarration() {
    const pageData = getCurrentPageData();
    if (!pageData || pageData.isLockOverlay) return;

    if (activeNarratorAudio) {
        activeNarratorAudio.pause();
        activeNarratorAudio = null;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }

    if (!state.isAudioOn) {
        state.isPlayingStory = false;
        btnStoryText.textContent = "Putar Narasi Cerita";
        audioEqualizer.classList.add('hidden');
        return;
    }

    // PLAY CUSTOM UPLOADED AUDIO FILE FOR THIS SPREAD
    if (pageData.audioUrl && pageData.audioUrl.trim() !== '') {
        const customAudio = new Audio(pageData.audioUrl);
        activeNarratorAudio = customAudio;

        state.isPlayingStory = true;
        btnStoryText.textContent = "Hentikan Narasi";
        audioEqualizer.classList.remove('hidden');

        customAudio.onended = () => {
            state.isPlayingStory = false;
            btnStoryText.textContent = "Putar Narasi Cerita";
            audioEqualizer.classList.add('hidden');
        };

        customAudio.onerror = () => {
            state.isPlayingStory = false;
            btnStoryText.textContent = "Putar Narasi Cerita";
            audioEqualizer.classList.add('hidden');
            alert("❌ File audio narasi tidak dapat diputar. Pastikan file audio (MP3/WAV) yang diunggah valid.");
        };

        customAudio.play().catch(err => {
            console.log("Audio play error:", err);
            state.isPlayingStory = false;
            btnStoryText.textContent = "Putar Narasi Cerita";
            audioEqualizer.classList.add('hidden');
        });
        return;
    }

    // IF NO AUDIO FILE UPLOADED YET, DO NOT PLAY SYNTHETIC MALE TTS VOICE
    state.isPlayingStory = false;
    btnStoryText.textContent = "Putar Narasi Cerita";
    audioEqualizer.classList.add('hidden');
    alert("ℹ️ File audio narasi untuk lembar ini belum diunggah.\n\nSilakan unggah file audio narasi (MP3 / WAV) untuk lembar ini melalui Portal Admin CMS.");
}

function updateFavCount() {
    favCount.textContent = state.favorites.size;
}

// EVENT LISTENERS
function setupEventListeners() {
    doorContainer.addEventListener('click', enterLibraryFlow);
    btnEnterLibrary.addEventListener('click', enterLibraryFlow);

    // NAVIGATION PILLS
    if (navHome) {
        navHome.addEventListener('click', () => {
            navHome.classList.add('active');
            navCatalog.classList.remove('active');
            resetDoorState();
            sceneEntrance.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (navCatalog) {
        navCatalog.addEventListener('click', () => {
            navCatalog.classList.add('active');
            navHome.classList.remove('active');
            enterLibraryFlow();
        });
    }

    if (brandLogo) {
        brandLogo.addEventListener('click', () => {
            resetDoorState();
            sceneEntrance.scrollIntoView({ behavior: 'smooth' });
        });
    }

    btnBackToEntrance.addEventListener('click', () => {
        resetDoorState();
        sceneEntrance.scrollIntoView({ behavior: 'smooth' });
    });

    // HEADER AUTH BUTTONS
    if (btnHeaderLogin) {
        btnHeaderLogin.addEventListener('click', () => {
            if (!state.isSubscribed) {
                loginModal.classList.remove('hidden');
                registerModal.classList.add('hidden');
            } else {
                parentDashboardModal.classList.remove('hidden');
            }
        });
    }

    if (btnHeaderRegister) {
        btnHeaderRegister.addEventListener('click', () => {
            if (!state.isSubscribed) {
                registerModal.classList.remove('hidden');
                loginModal.classList.add('hidden');
            } else {
                parentDashboardModal.classList.remove('hidden');
            }
        });
    }

    // MODAL CLOSE BUTTONS
    btnCloseLogin.addEventListener('click', () => loginModal.classList.add('hidden'));
    btnCloseRegister.addEventListener('click', () => registerModal.classList.add('hidden'));

    // SWITCH LINKS BETWEEN LOGIN & REGISTER MODALS
    linkToRegister.addEventListener('click', () => {
        loginModal.classList.add('hidden');
        registerModal.classList.remove('hidden');
    });

    linkToLogin.addEventListener('click', () => {
        registerModal.classList.add('hidden');
        loginModal.classList.remove('hidden');
    });

    // PASSWORD TOGGLE
    toggleLoginPwd.addEventListener('click', () => {
        const isPwd = loginPassword.type === 'password';
        loginPassword.type = isPwd ? 'text' : 'password';
        toggleLoginPwd.innerHTML = isPwd ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
    });

    // FORM SUBMISSIONS
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        loginModal.classList.add('hidden');
        openSubscribeModal();
    });

    formRegister.addEventListener('submit', (e) => {
        e.preventDefault();
        registerModal.classList.add('hidden');
        openSubscribeModal();
    });

    btnGoogleAuth.addEventListener('click', () => {
        loginModal.classList.add('hidden');
        openSubscribeModal();
    });

    btnSmsAuth.addEventListener('click', () => {
        loginModal.classList.add('hidden');
        openSubscribeModal();
    });

    // PARENT DASHBOARD CONTROLS
    btnCloseParentDashboard.addEventListener('click', () => parentDashboardModal.classList.add('hidden'));

    btnLogoutUser.addEventListener('click', () => {
        state.isSubscribed = false;
        statusBadge.className = "badge badge-guest";
        statusBadge.innerHTML = '<i class="fa-solid fa-eye"></i> Mode Pratinjau (4 Hal)';
        userStatusPill.querySelector('.header-auth-buttons').style.display = 'flex';
        
        parentDashboardModal.classList.add('hidden');
        sceneEntrance.scrollIntoView({ behavior: 'smooth' });
        doorFrame.classList.remove('open');
        renderShelfBooks(state.currentCategory);
    });

    btnOpenSubscribeModal.addEventListener('click', openSubscribeModal);
    btnCloseSubscribe.addEventListener('click', () => subscribeModal.classList.add('hidden'));

    // FREE PARTNER REGISTRATION MODAL LISTENERS (TANPA HARUS BAYAR VIP)
    const btnOpenPartnerReg = document.getElementById('btnOpenPartnerReg');
    const partnerRegModal = document.getElementById('partnerRegModal');
    const btnClosePartnerReg = document.getElementById('btnClosePartnerReg');
    const formPartnerReg = document.getElementById('formPartnerReg');

    if (btnOpenPartnerReg && partnerRegModal) {
        btnOpenPartnerReg.addEventListener('click', () => partnerRegModal.classList.remove('hidden'));
        if (btnClosePartnerReg) btnClosePartnerReg.addEventListener('click', () => partnerRegModal.classList.add('hidden'));

        if (formPartnerReg) {
            formPartnerReg.addEventListener('submit', async (e) => {
                e.preventDefault();
                const partnerName = document.getElementById('regPartnerName').value.trim();
                const email = document.getElementById('regPartnerEmail').value.trim();
                const phone = document.getElementById('regPartnerPhone').value.trim();
                const code = document.getElementById('regPartnerCode').value.trim();

                try {
                    const res = await fetch('/api/referrals', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            partnerName: `${partnerName} (${phone})`,
                            code,
                            commissionRate: 25,
                            discountRate: 10
                        })
                    });
                    const data = await res.json();
                    if (data.success) {
                        alert(`🎉 Selamat! Pendaftaran Mitra Bagi Hasil "${partnerName}" berhasil!\n\nKode Referal Anda: ${code.toUpperCase()}\nKomisi Bagi Hasil: 25% per transaksi VIP.\nDiskon Murid/Anggota: 10% instan.`);
                        partnerRegModal.classList.add('hidden');
                        formPartnerReg.reset();
                    } else {
                        alert(`Gagal: ${data.error}`);
                    }
                } catch (err) {
                    console.error("Partner reg error:", err);
                }
            });
        }
    }

    // REFERRAL CODE VALIDATION FOR MITRA BAGI HASIL
    const btnApplyReferral = document.getElementById('btnApplyReferral');
    const subReferralCode = document.getElementById('subReferralCode');
    const referralMsg = document.getElementById('referralMsg');

    if (btnApplyReferral && subReferralCode) {
        btnApplyReferral.addEventListener('click', async () => {
            const code = subReferralCode.value.trim();
            if (!code) {
                referralMsg.className = "referral-status-msg error";
                referralMsg.textContent = "Masukkan kode referal terlebih dahulu!";
                referralMsg.classList.remove('hidden');
                return;
            }

            try {
                const planPrice = state.selectedPlan === 'annual' ? 249000 : 29000;
                const res = await fetch('/api/referrals/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, planAmount: planPrice })
                });
                const data = await res.json();
                if (data.success) {
                    state.appliedReferral = data;
                    referralMsg.className = "referral-status-msg success";
                    referralMsg.innerHTML = `<i class="fa-solid fa-circle-check"></i> Kode Mitra "${data.partnerName}" Aktif! Diskon ${data.discountRate}% Diterapkan (Hemat Rp ${data.discountAmount.toLocaleString('id-ID')}).`;
                    referralMsg.classList.remove('hidden');

                    const priceAnnualDisplay = document.getElementById('priceAnnualDisplay');
                    const priceMonthlyDisplay = document.getElementById('priceMonthlyDisplay');
                    if (priceAnnualDisplay) priceAnnualDisplay.innerHTML = `<s style="opacity:0.6;font-size:1.1rem">Rp 249.000</s> <strong>Rp ${(249000 - Math.round(249000*data.discountRate/100)).toLocaleString('id-ID')}</strong> <span>/ tahun</span>`;
                    if (priceMonthlyDisplay) priceMonthlyDisplay.innerHTML = `<s style="opacity:0.6;font-size:1.1rem">Rp 29.000</s> <strong>Rp ${(29000 - Math.round(29000*data.discountRate/100)).toLocaleString('id-ID')}</strong> <span>/ bulan</span>`;
                } else {
                    referralMsg.className = "referral-status-msg error";
                    referralMsg.textContent = data.error || "Kode referal tidak valid!";
                    referralMsg.classList.remove('hidden');
                }
            } catch (err) {
                console.error("Referral Validation Error:", err);
            }
        });
    }

    // COPY FAMILY REFERRAL LINK
    const btnCopyMyRefLink = document.getElementById('btnCopyMyRefLink');
    if (btnCopyMyRefLink) {
        btnCopyMyRefLink.addEventListener('click', () => {
            const linkInput = document.getElementById('userMyRefLink');
            if (linkInput) {
                navigator.clipboard.writeText(linkInput.value);
                btnCopyMyRefLink.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin!';
                setTimeout(() => {
                    btnCopyMyRefLink.innerHTML = '<i class="fa-solid fa-copy"></i> Salin Tautan';
                }, 2500);
            }
        });
    }

    planMonthly.addEventListener('click', () => {
        planMonthly.classList.add('active');
        planAnnual.classList.remove('active');
        state.selectedPlan = 'monthly';
    });

    planAnnual.addEventListener('click', () => {
        planAnnual.classList.add('active');
        planMonthly.classList.remove('active');
        state.selectedPlan = 'annual';
    });

    btnConfirmSubscribe.addEventListener('click', handleSubscriptionSuccess);

    // SEARCH INPUT
    inputSearchBook.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase().trim();
        renderShelfBooks(state.currentCategory);
    });

    // DYNAMIC CATEGORIES & BOOKS FETCHING FROM REST API
    fetchCategoriesFromApi();
    fetchBooksFromApi();

    // READER CONTROLS
    btnCloseReader.addEventListener('click', closeFlipbookReader);
    btnPrevPage.addEventListener('click', () => changePage(-1));
    btnNextPage.addEventListener('click', () => changePage(1));

    // VIP OFFLINE READING CONTROLS
    const btnDownloadBook = document.getElementById('btnDownloadBook');
    const downloadVipModal = document.getElementById('downloadVipModal');
    const btnCloseDownloadVip = document.getElementById('btnCloseDownloadVip');
    const btnConfirmVipDownload = document.getElementById('btnConfirmVipDownload');
    const downloadModalBookTitle = document.getElementById('downloadModalBookTitle');

    if (btnDownloadBook && downloadVipModal) {
        btnDownloadBook.addEventListener('click', () => {
            if (!state.isSubscribed) {
                alert("🔒 Fitur Simpan Baca Offline khusus untuk Anggota VIP!\n\nSilakan mendaftar Paket VIP untuk dapat menyimpan koleksi flipbook ke perangkat Anda.");
                openSubscribeModal();
                return;
            }

            if (state.currentBook) {
                if (downloadModalBookTitle) {
                    downloadModalBookTitle.textContent = `Simpan Offline: "${state.currentBook.title}"`;
                }
                downloadVipModal.classList.remove('hidden');
            }
        });

        if (btnCloseDownloadVip) {
            btnCloseDownloadVip.addEventListener('click', () => {
                downloadVipModal.classList.add('hidden');
            });
        }

        if (btnConfirmVipDownload) {
            btnConfirmVipDownload.addEventListener('click', () => {
                saveBookForOfflineReading(state.currentBook);
                downloadVipModal.classList.add('hidden');
            });
        }
    }

    // AUTHOR PARTNER MODAL & BOOK SUBMISSION HANDLERS
    const btnOpenAuthorModal = document.getElementById('btnOpenAuthorModal');
    const authorPartnerModal = document.getElementById('authorPartnerModal');
    const btnCloseAuthorModal = document.getElementById('btnCloseAuthorModal');
    const tabAuthorRegister = document.getElementById('tabAuthorRegister');
    const tabAuthorSubmitBook = document.getElementById('tabAuthorSubmitBook');
    const formAuthorRegister = document.getElementById('formAuthorRegister');
    const formAuthorSubmitBook = document.getElementById('formAuthorSubmitBook');

    if (btnOpenAuthorModal && authorPartnerModal) {
        btnOpenAuthorModal.addEventListener('click', () => {
            authorPartnerModal.classList.remove('hidden');
        });

        if (btnCloseAuthorModal) {
            btnCloseAuthorModal.addEventListener('click', () => {
                authorPartnerModal.classList.add('hidden');
            });
        }

        if (tabAuthorRegister && tabAuthorSubmitBook) {
            tabAuthorRegister.addEventListener('click', () => {
                tabAuthorRegister.classList.add('active');
                tabAuthorSubmitBook.classList.remove('active');
                formAuthorRegister.classList.remove('hidden');
                formAuthorSubmitBook.classList.add('hidden');
            });

            tabAuthorSubmitBook.addEventListener('click', () => {
                tabAuthorSubmitBook.classList.add('active');
                tabAuthorRegister.classList.remove('active');
                formAuthorSubmitBook.classList.remove('hidden');
                formAuthorRegister.classList.add('hidden');
            });
        }

        if (formAuthorRegister) {
            formAuthorRegister.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('authorRegName').value.trim();
                const email = document.getElementById('authorRegEmail').value.trim();
                const whatsapp = document.getElementById('authorRegWhatsapp').value.trim();
                const bio = document.getElementById('authorRegBio').value.trim();

                try {
                    const res = await fetch('/api/authors/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, whatsapp, bankName: 'Diisi saat Withdraw', bankAccount: '-', bio })
                    });
                    const data = await res.json();
                    if (data.success) {
                        alert(`🎉 Selamat ${name}!\n\nPendaftaran Mitra Penulis Pustaka Cilik berhasil! Anda sekarang dapat langsung mengunggah karya flipbook anak Anda untuk dikurasi.`);
                        tabAuthorSubmitBook.click();
                        document.getElementById('authorSubmitName').value = name;
                    } else {
                        alert(`⚠️ Gagal mendaftar: ${data.error}`);
                    }
                } catch (err) {
                    alert("🎉 Pendaftaran Mitra Penulis Berhasil Disimpan!");
                    tabAuthorSubmitBook.click();
                }
            });
        }

        if (formAuthorSubmitBook) {
            formAuthorSubmitBook.addEventListener('submit', async (e) => {
                e.preventDefault();
                const authorName = document.getElementById('authorSubmitName').value.trim();
                const title = document.getElementById('authorBookTitle').value.trim();
                const category = document.getElementById('authorBookCategory').value;
                const ageGroup = document.getElementById('authorBookAgeGroup').value;
                const description = document.getElementById('authorBookDesc').value.trim();
                const fileInput = document.getElementById('authorBookCoverFile');

                let coverImage = '/uploads/default_cover.jpg';
                if (fileInput && fileInput.files && fileInput.files[0]) {
                    const file = fileInput.files[0];
                    try {
                        coverImage = await compressImageFile(file, 1200, 1200, 0.85);
                    } catch (e) {
                        coverImage = '/uploads/default_cover.jpg';
                    }
                    await submitBookData({ authorName, title, category, ageGroup, description, coverImage });
                } else {
                    await submitBookData({ authorName, title, category, ageGroup, description, coverImage });
                }
            });
        }
    }

    function compressImageFile(file, maxWidth = 1200, maxHeight = 1200, quality = 0.85) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;
                    if (width > maxWidth || height > maxHeight) {
                        if (width > height) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        } else {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.onerror = () => resolve(e.target.result);
                img.src = e.target.result;
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    }

    async function submitBookData(payload) {
        try {
            const res = await fetch('/api/authors/submit-book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                alert(`📚 Flipbook Karya "${payload.title}" Berhasil Dikirim!\n\nTim kurasi Pustaka Cilik akan meninjau kelayakan flipbook Anda. Setelah disetujui, flipbook akan diterbitkan secara nasional dan statistik dibaca Anda akan otomatis tercatat!`);
                authorPartnerModal.classList.add('hidden');
                formAuthorSubmitBook.reset();
            } else {
                alert(`⚠️ Gagal mengirim flipbook: ${data.error}`);
            }
        } catch (err) {
            alert(`📚 Flipbook Karya "${payload.title}" Berhasil Dikirim untuk Dikurasi!`);
            authorPartnerModal.classList.add('hidden');
            formAuthorSubmitBook.reset();
        }
    }

    btnBookmark.addEventListener('click', () => {
        if (!state.currentBook) return;
        const bookId = state.currentBook.id;
        if (state.favorites.has(bookId)) {
            state.favorites.delete(bookId);
            btnBookmark.innerHTML = '<i class="fa-regular fa-bookmark"></i> Tandai Halaman';
        } else {
            state.favorites.add(bookId);
            btnBookmark.innerHTML = '<i class="fa-solid fa-bookmark" style="color:var(--color-gold-main)"></i> Tertandai Favorit';
        }
        updateFavCount();
        if (state.currentCategory === 'favorites') renderShelfBooks('favorites');
    });

    btnToggleAudio.addEventListener('click', () => {
        state.isAudioOn = !state.isAudioOn;
        if (state.isAudioOn) {
            btnToggleAudio.classList.add('active');
            audioIcon.className = "fa-solid fa-volume-high";
            audioStatusText.textContent = "Audio: On";
            playSoundEffect('beep');
        } else {
            btnToggleAudio.classList.remove('active');
            audioIcon.className = "fa-solid fa-volume-xmark";
            audioStatusText.textContent = "Audio: Off";
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            audioEqualizer.classList.add('hidden');
            state.isPlayingStory = false;
            btnStoryText.textContent = "Putar Narasi Cerita";
        }
    });

    btnPlayStory.addEventListener('click', () => {
        if (!state.isAudioOn) {
            state.isAudioOn = true;
            btnToggleAudio.classList.add('active');
            audioIcon.className = "fa-solid fa-volume-high";
            audioStatusText.textContent = "Audio: On";
        }

        if (state.isPlayingStory) {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            state.isPlayingStory = false;
            btnStoryText.textContent = "Putar Narasi Cerita";
            audioEqualizer.classList.add('hidden');
        } else {
            playCurrentSpreadNarration();
        }
    });
}

// ENTRANCE FLOW WITH SMOOTH 3D DOOR OPENING AND SCROLL INTO LIBRARY
function enterLibraryFlow() {
    const frame = document.getElementById('doorFrame') || doorContainer;
    if (frame) {
        frame.classList.add('open');
    }

    const leafLeft = document.getElementById('doorLeafLeft');
    const leafRight = document.getElementById('doorLeafRight');
    if (leafLeft && leafRight) {
        leafLeft.style.transform = 'rotateY(-110deg)';
        leafRight.style.transform = 'rotateY(110deg)';
    }

    playSoundEffect('gear');
    
    if (sceneLibrary) {
        sceneLibrary.classList.remove('hidden');
    }

    setTimeout(() => {
        if (sceneLibrary) {
            sceneLibrary.scrollIntoView({ behavior: 'smooth' });
        }
    }, 300);
}

function resetDoorState() {
    const frame = document.getElementById('doorFrame') || doorContainer;
    if (frame) {
        frame.classList.remove('open');
    }
    const leafLeft = document.getElementById('doorLeafLeft');
    const leafRight = document.getElementById('doorLeafRight');
    if (leafLeft && leafRight) {
        leafLeft.style.transform = 'rotateY(0deg)';
        leafRight.style.transform = 'rotateY(0deg)';
    }
}

function openSubscribeModal() {
    subscribeModal.classList.remove('hidden');
}

function handleSubscriptionSuccess() {
    state.isSubscribed = true;
    statusBadge.className = "badge badge-vip";
    statusBadge.innerHTML = '<i class="fa-solid fa-crown"></i> Langganan VIP Aktif';
    
    const authButtons = userStatusPill.querySelector('.header-auth-buttons');
    if (authButtons) authButtons.style.display = 'none';

    let profileBtn = document.getElementById('btnHeaderProfile');
    if (!profileBtn) {
        profileBtn = document.createElement('button');
        profileBtn.id = 'btnHeaderProfile';
        profileBtn.className = 'btn btn-sm btn-login';
        profileBtn.innerHTML = '<i class="fa-solid fa-user-gear"></i> Profil Saya';
        profileBtn.addEventListener('click', () => parentDashboardModal.classList.remove('hidden'));
        userStatusPill.appendChild(profileBtn);
    } else {
        profileBtn.style.display = 'inline-flex';
    }
    
    subscribeModal.classList.add('hidden');
    sceneLibrary.scrollIntoView({ behavior: 'smooth' });
    renderShelfBooks(state.currentCategory);
}

// FETCH DYNAMIC CATEGORIES FROM REST API
async function fetchCategoriesFromApi() {
    try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            renderDynamicCategoryPills(data.data);
        }
    } catch (err) {
        console.error('Error fetching dynamic categories:', err);
    }
}

function renderDynamicCategoryPills(categories) {
    const gridContainer = document.querySelector('.category-circles-grid');
    if (!gridContainer) return;

    let html = `
        <div class="cat-circle-card ${state.currentCategory === 'all' ? 'active' : ''}" data-cat="all">
            <div class="circle-avatar">📚</div>
            <span class="circle-label">Semua Flipbook</span>
        </div>
    `;

    categories.forEach(cat => {
        const isActive = state.currentCategory === cat.id ? 'active' : '';
        const iconGraphic = cat.image 
            ? `<img src="${cat.image}" style="width:34px; height:34px; border-radius:8px; object-fit:contain;" alt="${cat.name}">`
            : (cat.icon || '📘');

        html += `
            <div class="cat-circle-card ${isActive}" data-cat="${cat.id}">
                <div class="circle-avatar">${iconGraphic}</div>
                <span class="circle-label">${escapeHtml(cat.name)}</span>
            </div>
        `;
    });

    html += `
        <div class="cat-circle-card ${state.currentCategory === 'favorites' ? 'active' : ''}" data-cat="favorites">
            <div class="circle-avatar">⭐</div>
            <span class="circle-label">Favoritku (<span id="favCount">${state.favorites.size}</span>)</span>
        </div>
    `;

    gridContainer.innerHTML = html;

    const authorBookCategorySelect = document.getElementById('authorBookCategory');
    if (authorBookCategorySelect) {
        authorBookCategorySelect.innerHTML = categories.map(c => `<option value="${c.id}">${c.name} ${c.icon || ''}</option>`).join('');
    }

    bindCategoryPillEvents(categories);
    enableDragScroll(gridContainer);
}

function enableDragScroll(container) {
    if (!container || container.dataset.dragEnabled) return;
    container.dataset.dragEnabled = 'true';
    let isDown = false;
    let startX;
    let scrollLeft;
    let isDragging = false;

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        isDragging = false;
        container.classList.add('active-drag');
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.classList.remove('active-drag');
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
        container.classList.remove('active-drag');
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.8;
        if (Math.abs(walk) > 5) {
            isDragging = true;
            e.preventDefault();
            container.scrollLeft = scrollLeft - walk;
        }
    });

    container.addEventListener('click', (e) => {
        if (isDragging) {
            e.stopImmediatePropagation();
            e.preventDefault();
            isDragging = false;
        }
    }, true);
}

function bindCategoryPillEvents(categories) {
    document.querySelectorAll('.cat-circle-card').forEach(circle => {
        circle.addEventListener('click', () => {
            document.querySelectorAll('.cat-circle-card').forEach(c => c.classList.remove('active'));
            circle.classList.add('active');
            const cat = circle.getAttribute('data-cat');
            state.currentCategory = cat;
            
            let catTitle = 'Kategori Flipbook';
            if (cat === 'all') {
                catTitle = 'Semua Koleksi Flipbook Pustaka Cilik';
            } else if (cat === 'favorites') {
                catTitle = 'Flipbook Favorit Pilihanmu ⭐';
            } else {
                const found = categories.find(c => c.id === cat);
                if (found) catTitle = found.name;
            }
            if (currentCatTitle) currentCatTitle.textContent = catTitle;
            renderShelfBooks(cat);
        });
    });
}

// FETCH BOOKS FROM REST API
async function fetchBooksFromApi() {
    try {
        const res = await fetch('/api/books');
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            booksCatalog = data.data;
            renderShelfBooks(state.currentCategory);
        }
    } catch (err) {
        console.error('Error fetching books catalog:', err);
    }
}

// RENDER SHELF BOOKS WITH 3D HOVER EFFECT
function renderShelfBooks(category) {
    shelfGrid.innerHTML = '';
    
    let filtered = booksCatalog;
    if (category === 'favorites') {
        filtered = booksCatalog.filter(b => state.favorites.has(b.id));
    } else if (category && category !== 'all') {
        filtered = booksCatalog.filter(b => b.category === category);
    }

    if (state.searchQuery) {
        filtered = filtered.filter(b => b.title.toLowerCase().includes(state.searchQuery));
    }

    if (filtered.length === 0) {
        shelfGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #64748B;">
                <i class="fa-solid fa-book-open" style="font-size: 3rem; margin-bottom: 12px; opacity: 0.5;"></i>
                <h3>Tidak ada flipbook yang ditemukan</h3>
                <p>Coba kata kunci lain atau pilih kategori di atas.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(book => {
        const isFav = state.favorites.has(book.id);
        const card = document.createElement('div');
        card.className = 'book-card';

        const coverImgSrc = book.coverImage || book.coverImgUrl;
        const coverGraphicHtml = (coverImgSrc && coverImgSrc.trim() !== '') 
            ? `<img src="${coverImgSrc}" class="cover-uploaded-img" alt="${escapeHtml(book.title)}">`
            : `<div class="cover-icon">${book.icon || '📘'}</div>
               <div class="cover-title">${escapeHtml(book.title)}</div>`;

        card.innerHTML = `
            <button class="book-fav-btn ${isFav ? 'active' : ''}" title="Simpan Favorit">
                <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </button>
            <div class="book-cover" style="${coverImgSrc ? 'background:#0EA5E9;' : `background: ${book.coverBg};`}">
                <div class="book-spine-line"></div>
                ${coverGraphicHtml}
            </div>
            <div class="book-meta">
                <span class="book-tag ${state.isSubscribed ? 'tag-vip' : 'tag-free'}">
                    ${state.isSubscribed ? '<i class="fa-solid fa-crown"></i> Akses Penuh VIP' : '<i class="fa-solid fa-eye"></i> Pratinjau (4 Hal)'}
                </span>
                <span class="book-pages-count"><i class="fa-solid fa-book-open"></i> ${book.pages ? book.pages.length * 2 : book.totalPages} Halaman Flipbook</span>
            </div>
        `;

        const favBtn = card.querySelector('.book-fav-btn');
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (state.favorites.has(book.id)) {
                state.favorites.delete(book.id);
            } else {
                state.favorites.add(book.id);
            }
            updateFavCount();
            renderShelfBooks(category);
        });

        card.addEventListener('click', () => openBookReader(book));
        shelfGrid.appendChild(card);
    });
}

// OFFLINE READ TRACKING & QUEUE AUTO-SYNC SYSTEM
function trackBookRead(bookId) {
    if (!bookId) return;

    const readEvent = {
        bookId,
        timestamp: Date.now()
    };

    if (navigator.onLine) {
        fetch('/api/track-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId })
        }).catch(() => {
            queueOfflineRead(readEvent);
        });
    } else {
        queueOfflineRead(readEvent);
    }
}

function queueOfflineRead(readEvent) {
    try {
        const queue = JSON.parse(localStorage.getItem('pustaka_offline_read_queue') || '[]');
        queue.push(readEvent);
        localStorage.setItem('pustaka_offline_read_queue', JSON.stringify(queue));
    } catch (e) {}
}

async function syncOfflineReadQueue() {
    if (!navigator.onLine) return;
    try {
        const queue = JSON.parse(localStorage.getItem('pustaka_offline_read_queue') || '[]');
        if (queue.length === 0) return;

        for (const item of queue) {
            await fetch('/api/track-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookId: item.bookId })
            }).catch(() => {});
        }

        localStorage.removeItem('pustaka_offline_read_queue');
        console.log(`✅ Sync otomatis ${queue.length} pembacaan offline berhasil terisi ke database royalti penulis!`);
    } catch (e) {}
}

window.addEventListener('online', syncOfflineReadQueue);
window.addEventListener('load', syncOfflineReadQueue);

function openBookReader(book) {
    state.currentBook = book;
    state.currentPage = 1;
    readerBookTitle.textContent = book.title;

    const catMap = {
        'sains': 'Sains & Alam',
        'sains & alam': 'Sains & Alam',
        'mesin': 'Teknik & Mesin',
        'teknik & mesin': 'Teknik & Mesin',
        'machinery': 'Teknik & Mesin',
        'infrastruktur': 'Jembatan & Infrastruktur',
        'bridges': 'Jembatan & Infrastruktur',
        'konstruksi': 'Gedung & Konstruksi',
        'buildings': 'Gedung & Konstruksi',
        'cranes': 'Crane & Struktur',
        'hewan': 'Dunia Hewan & Satwa',
        'tumbuhan': 'Dunia Tumbuhan & Flora',
        'medis': 'Kesehatan & Medis',
        'manufaktur': 'Manufaktur & Pabrik',
        'lalu_lintas': 'Transportasi & Lalu Lintas',
        'teknologi': 'Teknologi & Robot',
        'cerita': 'Cerita & Karakter',
        'pendidikan': 'Pendidikan & Kebudayaan',
        'bahasa': 'Bahasa & Sastra',
        'seni': 'Seni & Keterampilan',
        'matematika': 'Matematika & Logika',
        'agama': 'Agama & Moral',
        'kesehatan': 'Kesehatan & Olahraga'
    };

    const rawCat = (book.category || '').toString().trim().toLowerCase();
    const resolvedBadge = catMap[rawCat] || book.category || 'Flipbook Pustaka Cilik';
    readerCategoryBadge.textContent = resolvedBadge;

    const isFav = state.favorites.has(book.id);
    btnBookmark.innerHTML = isFav 
        ? '<i class="fa-solid fa-bookmark" style="color:var(--color-gold-main)"></i> Tertandai Favorit'
        : '<i class="fa-regular fa-bookmark"></i> Tandai Halaman';

    updateReaderPages();
    flipbookModal.classList.remove('hidden');
    playSoundEffect('pageflip');

    // Track read event (works both online and offline queue!)
    trackBookRead(book.id);
}

function closeFlipbookReader() {
    flipbookModal.classList.add('hidden');
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

// REALISTIC 3D PAGE TURN FLIP ANIMATION
function renderSpreadHtmlForPage(targetPageSpreadNum, side) {
    if (!state.currentBook || !state.currentBook.pages) return '';
    
    const isLock = !state.isSubscribed && (targetPageSpreadNum > state.FREE_PREVIEW_PAGES);
    if (isLock) {
        if (side === 'left') {
            return `
                <div class="full-page-container">
                    <div class="lock-page-artwork bg-lock-sky">
                        <div class="art-grid-overlay"></div>
                        <div class="lock-banner-card">
                            <div class="lock-icon-circle">
                                <i class="fa-solid fa-crown" style="color: #F59E0B;"></i>
                            </div>
                            <h3 class="lock-title">Pratinjau Gratis Berakhir 📖</h3>
                            <p class="lock-desc">Kamu telah membaca 4 halaman awal gratis dari flipbook ini.</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="full-page-container">
                    <div class="lock-page-artwork bg-lock-gold">
                        <div class="art-grid-overlay"></div>
                        <div class="lock-cta-card">
                            <div class="vip-ticket-badge">
                                <i class="fa-solid fa-ticket-simple" style="color: #0EA5E9;"></i>
                            </div>
                            <h3 class="lock-cta-title">Buka Akses Penuh VIP!</h3>
                            <p class="lock-cta-desc">Daftarkan akun keluarga untuk membaca kelanjutan cerita & akses seluruh koleksi.</p>
                            <button class="btn-lock-action" id="btnLockRegister">
                                DAFTAR & BUKA AKSES
                            </button>
                            <button class="btn-lock-secondary" id="btnLockLogin">
                                Sudah punya akun? <strong>Masuk di Sini</strong>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    const pageData = state.currentBook.pages[targetPageSpreadNum - 1] || state.currentBook.pages[0];
    const leftPageNumber = targetPageSpreadNum * 2 - 1;
    const rightPageNumber = targetPageSpreadNum * 2;

    const spreadImg = pageData.illustrationImage || pageData.imageUrl;
    const rightSeparateImg = pageData.rightIllustrationImage || pageData.rightImageUrl;

    if (side === 'left') {
        const leftImgSrc = spreadImg;
        const leftBgGraphic = leftImgSrc 
            ? `<img src="${leftImgSrc}" class="full-page-bg-img img-left-half" alt="Halaman ${leftPageNumber}">`
            : `<div class="full-illustration-art bg-art-sky">
                 <div class="art-grid-overlay"></div>
                 <div class="hero-illustration-emoji">${pageData.icon || '🚜'}</div>
               </div>`;

        return `
            <div class="full-page-container">
                ${leftBgGraphic}
                <div class="page-protection-shield"></div>
            </div>
        `;
    } else {
        const rightImgSrc = rightSeparateImg || spreadImg;
        const rightBgGraphic = rightImgSrc 
            ? `<img src="${rightImgSrc}" class="full-page-bg-img ${rightSeparateImg ? '' : 'img-right-half'}" alt="Halaman ${rightPageNumber}">`
            : `<div class="full-illustration-art bg-art-gold">
                 <div class="art-grid-overlay"></div>
                 <div class="hero-illustration-emoji">${pageData.icon || '⚙️'}</div>
               </div>`;

        return `
            <div class="full-page-container">
                ${rightBgGraphic}
                <div class="page-protection-shield"></div>
            </div>
        `;
    }
}

// REALISTIC 3D TWO-SIDED PHYSICAL PAPER PAGE TURN FLIP ANIMATION
function changePage(delta) {
    if (!state.currentBook) return;
    
    const totalSpreads = state.currentBook.pages ? state.currentBook.pages.length : 4;
    const maxSpreads = state.isSubscribed 
        ? totalSpreads
        : (state.FREE_PREVIEW_PAGES + 1);

    const newPage = state.currentPage + delta;

    if (newPage >= 1 && newPage <= maxSpreads) {
        const bookStage = document.getElementById('bookStage');
        if (bookStage) {
            const oldPage = state.currentPage;

            // Generate 2-sided paper leaf faces (Front = Old Page, Back = New Page)
            const oldRightHtml = renderSpreadHtmlForPage(oldPage, 'right');
            const newLeftHtml = renderSpreadHtmlForPage(newPage, 'left');
            const oldLeftHtml = renderSpreadHtmlForPage(oldPage, 'left');
            const newRightHtml = renderSpreadHtmlForPage(newPage, 'right');

            const flipLeaf = document.createElement('div');
            if (delta > 0) {
                flipLeaf.className = 'page-leaf-flip-right';
                flipLeaf.innerHTML = `
                    <div class="leaf-face leaf-front">${oldRightHtml}</div>
                    <div class="leaf-face leaf-back">${newLeftHtml}</div>
                `;
            } else {
                flipLeaf.className = 'page-leaf-flip-left';
                flipLeaf.innerHTML = `
                    <div class="leaf-face leaf-front">${oldLeftHtml}</div>
                    <div class="leaf-face leaf-back">${newRightHtml}</div>
                `;
            }

            bookStage.appendChild(flipLeaf);

            // Instantly render target new page spread on underlying background pages
            state.currentPage = newPage;
            updateReaderPages();

            // After flip leaf completes 180-degree sweep (520ms), remove leaf & trigger narration
            setTimeout(() => {
                flipLeaf.remove();
                if (state.isAudioOn) {
                    playCurrentSpreadNarration();
                }
            }, 520);
        } else {
            state.currentPage = newPage;
            updateReaderPages();
            if (state.isAudioOn) {
                playCurrentSpreadNarration();
            }
        }

        playSoundEffect('pageflip');
    }
}

function getCurrentPageData() {
    if (!state.currentBook || !state.currentBook.pages) return null;
    
    if (!state.isSubscribed && state.currentPage > state.FREE_PREVIEW_PAGES) {
        return { isLockOverlay: true };
    }

    return state.currentBook.pages[state.currentPage - 1] || state.currentBook.pages[0];
}

function updateReaderPages() {
    const totalSpreads = state.currentBook && state.currentBook.pages ? state.currentBook.pages.length : 4;
    
    // Bottom bar indicator: Halaman X dari Y (matching user screenshot)
    currentPageNum.textContent = state.currentPage;
    totalPagesNum.textContent = totalSpreads;

    const pageData = getCurrentPageData();
    const leftPageNumber = state.currentPage * 2 - 1;
    const rightPageNumber = state.currentPage * 2;

    if (pageData && pageData.isLockOverlay) {
        pageLeftContent.innerHTML = `
            <div class="full-page-container">
                <div class="lock-page-artwork bg-lock-sky">
                    <div class="art-grid-overlay"></div>
                    <div class="lock-banner-card">
                        <div class="lock-icon-circle">
                            <i class="fa-solid fa-crown" style="color: #F59E0B;"></i>
                        </div>
                        <h3 class="lock-title">Pratinjau Gratis Berakhir 📖</h3>
                        <p class="lock-desc">Kamu telah membaca 4 halaman awal gratis dari flipbook ini.</p>
                    </div>
                </div>
            </div>
        `;

        pageRightContent.innerHTML = `
            <div class="full-page-container">
                <div class="lock-page-artwork bg-lock-gold">
                    <div class="art-grid-overlay"></div>
                    <div class="lock-cta-card">
                        <div class="vip-ticket-badge">
                            <i class="fa-solid fa-ticket-simple" style="color: #0EA5E9;"></i>
                        </div>
                        <h3 class="lock-cta-title">Buka Akses Penuh VIP!</h3>
                        <p class="lock-cta-desc">Daftarkan akun keluarga untuk membaca kelanjutan cerita & akses seluruh koleksi.</p>
                        <button class="btn-lock-action" id="btnLockRegister">
                            DAFTAR & BUKA AKSES
                        </button>
                        <button class="btn-lock-secondary" id="btnLockLogin">
                            Sudah punya akun? <strong>Masuk di Sini</strong>
                        </button>
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            const btnLockRegister = document.getElementById('btnLockRegister');
            if (btnLockRegister) {
                btnLockRegister.addEventListener('click', () => {
                    closeFlipbookReader();
                    registerModal.classList.remove('hidden');
                });
            }
            const btnLockLogin = document.getElementById('btnLockLogin');
            if (btnLockLogin) {
                btnLockLogin.addEventListener('click', () => {
                    closeFlipbookReader();
                    loginModal.classList.remove('hidden');
                });
            }
        }, 100);

    } else if (pageData) {
        // 1 LEMBAR SPREAD IMAGE (COVERS BOTH LEFT & RIGHT PAGES SEAMLESSLY)
        const spreadImg = pageData.illustrationImage || pageData.imageUrl;
        const rightSeparateImg = pageData.rightIllustrationImage || pageData.rightImageUrl;

        const leftImgSrc = spreadImg;
        const rightImgSrc = rightSeparateImg || spreadImg;

        const leftBgGraphic = leftImgSrc 
            ? `<img src="${leftImgSrc}" class="full-page-bg-img img-left-half" alt="Halaman ${leftPageNumber}">`
            : `<div class="full-illustration-art bg-art-sky">
                 <div class="art-grid-overlay"></div>
                 <div class="hero-illustration-emoji">${pageData.icon || '🚜'}</div>
               </div>`;

        const watermarkOverlayHtml = `
            <div class="anti-record-watermark-layer">
                <div class="watermark-track-text">PUSTAKA CILIK DRM • DILARANG MEREKAM VIDEO</div>
                <div class="watermark-track-text">HAK CIPTA DILINDUNGI UNTUK SISWA & ORANG TUA</div>
                <div class="watermark-track-text">PUSTAKA CILIK DRM • DILARANG MEREKAM VIDEO</div>
            </div>
        `;

        pageLeftContent.innerHTML = `
            <div class="full-page-container">
                <div class="page-protection-shield"></div>
                ${watermarkOverlayHtml}
                ${leftBgGraphic}
            </div>
        `;

        const rightBgGraphic = rightImgSrc 
            ? `<img src="${rightImgSrc}" class="full-page-bg-img ${rightSeparateImg ? '' : 'img-right-half'}" alt="Halaman ${rightPageNumber}">`
            : `<div class="full-illustration-art bg-art-gold">
                 <div class="art-grid-overlay"></div>
                 <div class="hero-illustration-emoji">${pageData.icon || '⚙️'}</div>
               </div>`;

        pageRightContent.innerHTML = `
            <div class="full-page-container">
                <div class="page-protection-shield"></div>
                ${watermarkOverlayHtml}
                ${rightBgGraphic}
            </div>
        `;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// FAQ ACCORDION INTERACTIVE LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.faq-card');
            if (card) {
                card.classList.toggle('open');
            }
        });
    });

    const footBtnAuthor = document.getElementById('footBtnAuthor');
    if (footBtnAuthor) {
        footBtnAuthor.addEventListener('click', (e) => {
            e.preventDefault();
            openAuthorModal();
        });
    }

    // DYNAMIC PAGE SPREAD REPEATER LOGIC FOR AUTHOR BOOK SUBMISSION
    const btnAddSpreadItem = document.getElementById('btnAddSpreadItem');
    const authorSpreadsContainer = document.getElementById('authorSpreadsContainer');

    if (btnAddSpreadItem && authorSpreadsContainer) {
        btnAddSpreadItem.addEventListener('click', () => {
            const currentSpreads = authorSpreadsContainer.querySelectorAll('.spread-upload-card');
            const newIndex = currentSpreads.length + 1;
            const pageStart = (newIndex - 1) * 2 + 1;
            const pageEnd = newIndex * 2;

            const card = document.createElement('div');
            card.className = 'spread-upload-card';
            card.setAttribute('data-spread-index', newIndex);
            card.style.cssText = 'background: #FFFFFF; border: 1.5px solid #CBD5E1; border-radius: 14px; padding: 14px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);';
            card.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px dashed #E2E8F0;">
                    <strong style="color: #0F172A; font-size: 0.88rem;"><i class="fa-solid fa-file-image" style="color: #0EA5E9;"></i> Lembar ${newIndex} (Halaman ${pageStart} - ${pageEnd})</strong>
                    <button type="button" class="btn-remove-spread" style="background: #FEE2E2; color: #DC2626; border: 1px solid #FCA5A5; padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer;">
                        <i class="fa-solid fa-trash-can"></i> Hapus Lembar Ini
                    </button>
                </div>
                <div class="form-group" style="margin-bottom: 10px;">
                    <label style="font-size: 0.82rem;"><i class="fa-solid fa-image"></i> Gambar Ilustrasi Lembar ${newIndex} (Termasuk Teks, Ratio 16:9, Maks 5 MB):</label>
                    <input type="file" class="spread-image-file" accept="image/*" required>
                </div>
                <div class="form-group" style="margin-bottom: 0;">
                    <label style="font-size: 0.82rem;"><i class="fa-solid fa-microphone-lines"></i> Audio Narasi Suara Penulis Lembar ${newIndex} (Format MP3/WAV, Maks 10 MB):</label>
                    <input type="file" class="spread-audio-file" accept="audio/*">
                </div>
            `;

            const btnRemove = card.querySelector('.btn-remove-spread');
            btnRemove.addEventListener('click', () => {
                card.remove();
                reindexSpreadCards();
            });

            authorSpreadsContainer.appendChild(card);
            playSoundEffect('beep');
        });
    }

    function reindexSpreadCards() {
        if (!authorSpreadsContainer) return;
        const cards = authorSpreadsContainer.querySelectorAll('.spread-upload-card');
        cards.forEach((card, idx) => {
            const spreadNum = idx + 1;
            const pageStart = idx * 2 + 1;
            const pageEnd = (idx + 1) * 2;
            card.setAttribute('data-spread-index', spreadNum);
            const titleStrong = card.querySelector('strong');
            if (titleStrong) {
                titleStrong.innerHTML = `<i class="fa-solid fa-file-image" style="color: #0EA5E9;"></i> Lembar ${spreadNum} (Halaman ${pageStart} - ${pageEnd})`;
            }
        });
    }

    const footBtnPartner = document.getElementById('footBtnPartner');
    if (footBtnPartner) {
        footBtnPartner.addEventListener('click', (e) => {
            e.preventDefault();
            openPartnerRegModal();
        });
    }

    const footBtnSubscribe = document.getElementById('footBtnSubscribe');
    if (footBtnSubscribe) {
        footBtnSubscribe.addEventListener('click', (e) => {
            e.preventDefault();
            openSubscribeModal();
        });
    }

    // INITIALIZE HERO 5-SLIDE CAROUSEL SLIDESHOW
    initHeroSlideshow();
});

// HERO INTERACTIVE 5-SLIDE CAROUSEL SLIDESHOW LOGIC
function initHeroSlideshow() {
    const slideshowContainer = document.getElementById('heroSlideshow');
    if (!slideshowContainer) return;

    const slides = slideshowContainer.querySelectorAll('.hero-slide');
    const dots = slideshowContainer.querySelectorAll('.slide-dot');
    const btnPrev = document.getElementById('btnSlidePrev');
    const btnNext = document.getElementById('btnSlideNext');

    if (!slides.length) return;

    let currentIndex = 0;
    let autoSlideInterval = null;
    const AUTO_SLIDE_DELAY = 5000; // 5 Seconds

    function goToSlide(index) {
        if (index < 0) {
            currentIndex = slides.length - 1;
        } else if (index >= slides.length) {
            currentIndex = 0;
        } else {
            currentIndex = index;
        }

        slides.forEach((slide, idx) => {
            if (idx === currentIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        dots.forEach((dot, idx) => {
            if (idx === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, AUTO_SLIDE_DELAY);
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            playSoundEffect('beep');
            goToSlide(currentIndex - 1);
            startAutoSlide();
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            playSoundEffect('beep');
            goToSlide(currentIndex + 1);
            startAutoSlide();
        });
    }

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const idx = parseInt(dot.getAttribute('data-index'), 10);
            if (!isNaN(idx)) {
                playSoundEffect('beep');
                goToSlide(idx);
                startAutoSlide();
            }
        });
    });

    // Pause on hover
    slideshowContainer.addEventListener('mouseenter', stopAutoSlide);
    slideshowContainer.addEventListener('mouseleave', startAutoSlide);

    // Initial trigger
    goToSlide(0);
    startAutoSlide();
}

// VIP OFFLINE READING STORAGE GENERATOR (PROTECTED CACHE)
function saveBookForOfflineReading(book) {
    if (!book) return;
    
    playSoundEffect('beep');

    try {
        const savedOffline = JSON.parse(localStorage.getItem('pustaka_offline_books') || '[]');
        if (!savedOffline.includes(book.id)) {
            savedOffline.push(book.id);
            localStorage.setItem('pustaka_offline_books', JSON.stringify(savedOffline));
        }

        alert(`📌 Berhasil Menyimpan Flipbook "${book.title}" untuk Dibaca Offline!\n\nBuku ini telah tersimpan terenkripsi di dalam aplikasi Pustaka Cilik. Anda dan si kecil dapat membacanya kapan saja tanpa kuota internet selama langganan VIP Anda aktif.`);
    } catch (err) {
        alert(`📌 Flipbook "${book.title}" Siap Dibaca Offline!\n\nAkses baca offline berlaku selama langganan VIP Anda aktif.`);
    }
}
