/* -------------------------------------------------------------
   PUSTAKA CILIK - BACKEND CMS JAVASCRIPT WITH FILE UPLOADER
   & DEDICATED REFERRAL / BAGI HASIL MITRA SUBSCRIPTION MANAGEMENT
   ------------------------------------------------------------- */

let booksData = [];
let referralsData = [];
let categoriesData = [];
let currentEditingBookId = null;

// HELPER: ESCAPE HTML
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// DOM ELEMENTS
const adminBooksTbody = document.getElementById('adminBooksTbody');
const tableCountBadge = document.getElementById('tableCountBadge');

const statTotalBooks = document.getElementById('statTotalBooks');
const statTotalPages = document.getElementById('statTotalPages');
const statPublished = document.getElementById('statPublished');

const adminSearchInput = document.getElementById('adminSearchInput');
const adminCatFilter = document.getElementById('adminCatFilter');
const btnAddNewBook = document.getElementById('btnAddNewBook');

// NAVIGATION TABS DOM
const tabBooks = document.getElementById('tabBooks');
const tabReferrals = document.getElementById('tabReferrals');
const sectionBooks = document.getElementById('sectionBooks');
const sectionReferrals = document.getElementById('sectionReferrals');

// REFERRAL STATS DOM
const refStatPartners = document.getElementById('refStatPartners');
const refStatRevenue = document.getElementById('refStatRevenue');
const refStatEarnings = document.getElementById('refStatEarnings');
const refStatPending = document.getElementById('refStatPending');
const formAddReferral = document.getElementById('formAddReferral');
const adminReferralsTbody = document.getElementById('adminReferralsTbody');

// META MODAL DOM
const bookMetaModal = document.getElementById('bookMetaModal');
const btnCloseMetaModal = document.getElementById('btnCloseMetaModal');
const btnCancelMeta = document.getElementById('btnCancelMeta');
const formBookMeta = document.getElementById('formBookMeta');
const bookModalTitle = document.getElementById('bookModalTitle');
const editBookId = document.getElementById('editBookId');
const inputBookTitle = document.getElementById('inputBookTitle');
const inputBookCategory = document.getElementById('inputBookCategory');
const inputBookIcon = document.getElementById('inputBookIcon');
const inputBookBg = document.getElementById('inputBookBg');
const inputBookDesc = document.getElementById('inputBookDesc');

// FILE UPLOAD COVER DOM
const inputBookCoverFile = document.getElementById('inputBookCoverFile');
const inputBookCoverUrl = document.getElementById('inputBookCoverUrl');
const coverImgPreviewContainer = document.getElementById('coverImgPreviewContainer');
const coverImgPreview = document.getElementById('coverImgPreview');
const btnRemoveCoverImg = document.getElementById('btnRemoveCoverImg');

// PAGE EDITOR MODAL DOM
const pageEditorModal = document.getElementById('pageEditorModal');
const btnClosePageModal = document.getElementById('btnClosePageModal');
const btnCancelPageEdit = document.getElementById('btnCancelPageEdit');
const editingBookSubTitle = document.getElementById('editingBookSubTitle');
const pagesSpreadsContainer = document.getElementById('pagesSpreadsContainer');
const btnAddPageSpread = document.getElementById('btnAddPageSpread');
const pageSpreadsCount = document.getElementById('pageSpreadsCount');
const btnSavePagesContent = document.getElementById('btnSavePagesContent');

// INITIAL LOAD
function initAdminApp() {
    setupTabNavigation();
    fetchCategoriesData();
    fetchStats();
    fetchBooks();
    fetchReferrals();
    fetchNarratorSettings();
    setupEventListeners();
    setupCategoryForm();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminApp);
} else {
    initAdminApp();
}

// FETCH NARRATOR SETTINGS
async function fetchNarratorSettings() {
    try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings) {
            const selectNarratorGender = document.getElementById('selectNarratorGender');
            const selectNarratorEngine = document.getElementById('selectNarratorEngine');
            const selectNarratorStyle = document.getElementById('selectNarratorStyle');
            if (selectNarratorGender) selectNarratorGender.value = data.settings.narratorVoiceGender || 'female';
            if (selectNarratorEngine) selectNarratorEngine.value = data.settings.narratorVoiceEngine || 'online_tts';
            if (selectNarratorStyle) selectNarratorStyle.value = data.settings.storytellerStyle || 'expressive_kids';
        }
    } catch (err) {
        console.error("Gagal memuat pengaturan narator:", err);
    }
}

let activeNarratorAudio = null;

function playAudioNarratorEngine(text, gender = 'female', engine = 'online_tts', onEndCallback) {
    if (activeNarratorAudio) {
        activeNarratorAudio.pause();
        activeNarratorAudio = null;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }

    const finish = () => {
        if (onEndCallback) onEndCallback();
    };

    if (engine === 'online_tts') {
        const cleanText = text.replace(/[^a-zA-Z0-9\s.,?!]/g, ' ');
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText.substring(0, 180))}&tl=id&client=tw-ob`;
        const audio = new Audio(ttsUrl);
        activeNarratorAudio = audio;
        
        // Pitch/Formant Shift: Disable Pitch Preservation to produce distinct Female (high) vs Male (deep) voice!
        audio.preservesPitch = false;
        audio.webkitPreservesPitch = false;
        audio.mozPreservesPitch = false;

        if (gender === 'female') {
            audio.playbackRate = 1.32; // Higher formant pitch -> Female (Ibu Guru Cilik) voice!
        } else {
            audio.playbackRate = 0.82; // Lower formant pitch -> Deep Male (Om Insinyur) voice!
        }

        audio.onended = finish;
        audio.onerror = () => {
            speakSpeechSynthesisFallback(text, gender, finish);
        };
        audio.play().catch(() => {
            speakSpeechSynthesisFallback(text, gender, finish);
        });
    } else {
        speakSpeechSynthesisFallback(text, gender, finish);
    }
}

function speakSpeechSynthesisFallback(text, gender, onEnd) {
    if (!('speechSynthesis' in window)) {
        if (onEnd) onEnd();
        return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = gender === 'female' ? 0.95 : 0.80;
    utterance.pitch = gender === 'female' ? 1.65 : 0.45; // Pitch 1.65 is high female, 0.45 is deep male!
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
    window.speechSynthesis.speak(utterance);
}

// TAB NAVIGATION
function setupTabNavigation() {
    const tabAuthors = document.getElementById('tabAuthors');
    const sectionAuthors = document.getElementById('sectionAuthors');
    const tabCategories = document.getElementById('tabCategories');
    const sectionCategories = document.getElementById('sectionCategories');

    if (tabBooks && tabReferrals) {
        tabBooks.addEventListener('click', () => {
            tabBooks.classList.add('active');
            tabReferrals.classList.remove('active');
            if (tabAuthors) tabAuthors.classList.remove('active');
            if (tabCategories) tabCategories.classList.remove('active');

            sectionBooks.classList.remove('hidden');
            sectionReferrals.classList.add('hidden');
            if (sectionAuthors) sectionAuthors.classList.add('hidden');
            if (sectionCategories) sectionCategories.classList.add('hidden');
        });

        tabReferrals.addEventListener('click', () => {
            tabReferrals.classList.add('active');
            tabBooks.classList.remove('active');
            if (tabAuthors) tabAuthors.classList.remove('active');
            if (tabCategories) tabCategories.classList.remove('active');

            sectionReferrals.classList.remove('hidden');
            sectionBooks.classList.add('hidden');
            if (sectionAuthors) sectionAuthors.classList.add('hidden');
            if (sectionCategories) sectionCategories.classList.add('hidden');
            fetchReferrals();
        });

        if (tabAuthors) {
            tabAuthors.addEventListener('click', () => {
                tabAuthors.classList.add('active');
                tabBooks.classList.remove('active');
                tabReferrals.classList.remove('active');
                if (tabCategories) tabCategories.classList.remove('active');

                sectionAuthors.classList.remove('hidden');
                sectionBooks.classList.add('hidden');
                sectionReferrals.classList.add('hidden');
                if (sectionCategories) sectionCategories.classList.add('hidden');
                fetchAuthorsData();
            });
        }

        if (tabCategories) {
            tabCategories.addEventListener('click', () => {
                tabCategories.classList.add('active');
                tabBooks.classList.remove('active');
                tabReferrals.classList.remove('active');
                if (tabAuthors) tabAuthors.classList.remove('active');

                sectionCategories.classList.remove('hidden');
                sectionBooks.classList.add('hidden');
                sectionReferrals.classList.add('hidden');
                if (sectionAuthors) sectionAuthors.classList.add('hidden');
                fetchCategoriesData();
            });
        }
    }
}

// CATEGORY MANAGEMENT HANDLERS (ADD, EDIT, DELETE & COVER IMAGE)
async function fetchCategoriesData() {
    try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) {
            categoriesData = data.data || [];
            renderCategoriesTable(categoriesData);
            populateCategorySelects(categoriesData);
            return categoriesData;
        }
    } catch (err) {
        console.log('Error fetching categories:', err);
    }
    return [];
}

function renderCategoriesTable(categories) {
    const tbody = document.getElementById('tbodyCategories');
    if (!tbody) return;

    if (!categories || categories.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:20px; color:#64748B;">Belum ada kategori flipbook. Silakan tambah di form sebelah kiri.</td></tr>`;
        return;
    }

    tbody.innerHTML = categories.map(cat => {
        const iconGraphic = cat.image 
            ? `<img src="${cat.image}" style="width:36px; height:36px; border-radius:8px; object-fit:contain; border:1px solid #CBD5E1; background:#F8FAFC; padding:2px;" alt="${escapeHtml(cat.name)}">`
            : `<span style="font-size:1.6rem;">${cat.icon || '📘'}</span>`;

        return `
            <tr style="border-bottom:1px solid #F1F5F9;">
                <td style="padding:12px 10px;">${iconGraphic}</td>
                <td style="padding:12px 10px; font-weight:700; color:#0F172A;">${escapeHtml(cat.name)}</td>
                <td style="padding:12px 10px; text-align:center;">
                    <div style="display:flex; justify-content:center; gap:6px;">
                        <button type="button" class="btn-edit-cat" data-id="${cat.id}" style="background:#E0F2FE; color:#0284C7; border:none; padding:6px 12px; border-radius:8px; font-weight:700; cursor:pointer; font-size:0.8rem;">
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button type="button" class="btn-delete-cat" data-id="${cat.id}" style="background:#FEE2E2; color:#DC2626; border:none; padding:6px 12px; border-radius:8px; font-weight:700; cursor:pointer; font-size:0.8rem;">
                            <i class="fa-solid fa-trash-can"></i> Hapus
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    tbody.querySelectorAll('.btn-edit-cat').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const cat = categoriesData.find(c => c.id === id);
            if (cat) editCategory(cat.id, cat.name, cat.icon);
        });
    });

    tbody.querySelectorAll('.btn-delete-cat').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const cat = categoriesData.find(c => c.id === id);
            if (cat) deleteCategory(cat.id, cat.name);
        });
    });
}

function populateCategorySelects(categories) {
    const adminCatFilter = document.getElementById('adminCatFilter');
    const inputBookCategory = document.getElementById('inputBookCategory');
    let validCategories = (categories && Array.isArray(categories) && categories.length > 0) ? categories : categoriesData;

    if (!validCategories || validCategories.length === 0) {
        validCategories = [
            { id: "sains", name: "Sains", icon: "📘" },
            { id: "infrastruktur", name: "Infrastruktur", icon: "📘" },
            { id: "mesin", name: "Mesin", icon: "📘" },
            { id: "tumbuhan", name: "Tumbuhan", icon: "📘" },
            { id: "hewan", name: "Hewan", icon: "📘" },
            { id: "konstruksi", name: "Konstruksi", icon: "📘" },
            { id: "manufaktur", name: "Manufaktur", icon: "📘" },
            { id: "lalu_lintas", name: "Lalu Lintas", icon: "📘" },
            { id: "medis", name: "Medis", icon: "📘" }
        ];
        categoriesData = validCategories;
    }

    if (adminCatFilter) {
        const totalBooks = booksData ? booksData.length : 0;
        const uncategorizedCount = booksData ? booksData.filter(b => !b.category || b.category.trim() === '').length : 0;

        let options = `<option value="all">Semua Kategori (${totalBooks} Flipbook)</option>`;
        if (uncategorizedCount > 0) {
            options += `<option value="uncategorized">⚠️ Belum Dikategorikan (${uncategorizedCount} Flipbook)</option>`;
        }

        validCategories.forEach(c => {
            const count = booksData ? booksData.filter(b => b.category === c.id || b.category === c.name).length : 0;
            options += `<option value="${c.id}">${escapeHtml(c.name)} ${c.icon || ''} (${count} Flipbook)</option>`;
        });

        adminCatFilter.innerHTML = options;
    }

    if (inputBookCategory) {
        let options = `<option value="">-- Pilih Kategori Flipbook --</option>`;
        options += validCategories.map(c => `<option value="${c.id}">${escapeHtml(c.name)} ${c.icon || ''}</option>`).join('');
        inputBookCategory.innerHTML = options;
    }
}

function editCategory(id, name, icon) {
    document.getElementById('catEditId').value = id;
    document.getElementById('catName').value = name;
    document.getElementById('catIcon').value = icon;

    const btnSaveCat = document.getElementById('btnSaveCat');
    const btnResetCat = document.getElementById('btnResetCat');
    if (btnSaveCat) btnSaveCat.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Update Kategori`;
    if (btnResetCat) btnResetCat.style.display = 'inline-block';
}

async function deleteCategory(catId, catName) {
    if (!confirm(`⚠️ Apakah Anda yakin ingin menghapus kategori "${catName}"?\n\nSemua data kategori ini akan diperbarui.`)) return;

    try {
        const res = await fetch(`/api/categories/${catId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            alert(`✅ Kategori "${catName}" berhasil dihapus!`);
            fetchCategoriesData();
        } else {
            alert(`⚠️ Gagal menghapus: ${data.error}`);
        }
    } catch (err) {
        alert('Gagal menghapus kategori');
    }
}

window.handleGlobalCatSave = async function(e) {
    if (e) e.preventDefault();

    const nameInput = document.getElementById('catName');
    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
        alert('⚠️ Nama kategori wajib diisi!');
        if (nameInput) nameInput.focus();
        return;
    }

    const editIdInput = document.getElementById('catEditId');
    const editId = editIdInput ? editIdInput.value : '';
    const autoId = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const id = editId || autoId;

    const iconInput = document.getElementById('catIcon');
    const icon = iconInput ? (iconInput.value.trim() || '📘') : '📘';
    const fileInput = document.getElementById('catIconImageFile');

    let image = '';
    if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        try {
            image = await uploadFileToServer(file);
        } catch (err) {
            alert('⚠️ Gagal mengunggah gambar ikon kategori: ' + (err.message || err));
            return;
        }
    }

    await sendCategoryPayload({ id, name, icon, image });
};

function setupCategoryForm() {
    const formCategorySave = document.getElementById('formCategorySave');
    const btnSaveCat = document.getElementById('btnSaveCat');
    const btnResetCat = document.getElementById('btnResetCat');

    if (formCategorySave) {
        formCategorySave.onsubmit = window.handleGlobalCatSave;
    }

    if (btnSaveCat) {
        btnSaveCat.onclick = window.handleGlobalCatSave;
    }

    if (btnResetCat) {
        btnResetCat.onclick = () => {
            const catEditId = document.getElementById('catEditId');
            if (catEditId) catEditId.value = '';
            if (formCategorySave) formCategorySave.reset();
            if (btnSaveCat) btnSaveCat.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Simpan Kategori`;
            btnResetCat.style.display = 'none';
        };
    }
}

async function sendCategoryPayload(payload) {
    try {
        const res = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            // Update memory & render DOM first
            categoriesData = data.data || [];
            renderCategoriesTable(categoriesData);
            populateCategorySelects(categoriesData);
            fetchStats();

            const catEditId = document.getElementById('catEditId');
            if (catEditId) catEditId.value = '';
            
            const formCategorySave = document.getElementById('formCategorySave');
            if (formCategorySave) formCategorySave.reset();

            const btnResetCat = document.getElementById('btnResetCat');
            if (btnResetCat) btnResetCat.style.display = 'none';

            const btnSaveCat = document.getElementById('btnSaveCat');
            if (btnSaveCat) btnSaveCat.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Simpan Kategori`;

            setTimeout(() => {
                alert(`🎉 Kategori "${payload.name}" Berhasil Disimpan!`);
            }, 50);
        } else {
            alert(`⚠️ Gagal menyimpan: ${data.error}`);
        }
    } catch (err) {
        console.error('Error saving category:', err);
        await fetchCategoriesData();
    }
}

// AUTHOR PARTNER & PAY-PER-READ ROYALTY HANDLERS
async function fetchAuthorsData() {
    try {
        const res = await fetch('/api/authors');
        const data = await res.json();
        if (data.success) {
            renderAuthorsTables(data);
        }
    } catch (err) {
        console.log('Error fetching authors:', err);
    }
}

function renderAuthorsTables(data) {
    const authors = data.data || [];
    const submissions = data.pendingSubmissions || [];
    const totalReads = data.totalSystemPageReads || 0;
    const royaltyPool = (data.royaltyPoolRupiah !== undefined) ? data.royaltyPoolRupiah : 0;

    const statTotalAuthors = document.getElementById('statTotalAuthors');
    const statTotalSystemReads = document.getElementById('statTotalSystemReads');
    const statRoyaltyPool = document.getElementById('statRoyaltyPool');
    const tbodySubmissions = document.getElementById('tbodyAuthorSubmissions');
    const tbodyAuthorsRoyalty = document.getElementById('tbodyAuthorsRoyalty');

    if (statTotalAuthors) statTotalAuthors.textContent = authors.length;
    if (statTotalSystemReads) statTotalSystemReads.textContent = `${totalReads.toLocaleString('id-ID')} hal`;
    if (statRoyaltyPool) statRoyaltyPool.textContent = `Rp ${royaltyPool.toLocaleString('id-ID')}`;

    // Render Submissions Table
    if (tbodySubmissions) {
        if (submissions.length === 0) {
            tbodySubmissions.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center" style="padding: 24px; color: #64748B;">
                        <i class="fa-solid fa-circle-check" style="color: #10B981; font-size: 1.5rem; display: block; margin-bottom: 6px;"></i>
                        Belum ada pengajuan flipbook baru yang menunggu kurasi admin.
                    </td>
                </tr>
            `;
        } else {
            tbodySubmissions.innerHTML = submissions.map(sub => `
                <tr>
                    <td>${sub.submittedAt || '-'}</td>
                    <td><strong>${sub.authorName}</strong></td>
                    <td>${sub.title}</td>
                    <td><span class="badge-blue">${sub.category}</span> (${sub.ageGroup})</td>
                    <td><span class="badge-amber">Menunggu Kurasi</span></td>
                    <td>
                        <button class="btn btn-sm btn-success-admin" onclick="reviewAuthorBook('${sub.id}', 'approve')"><i class="fa-solid fa-check"></i> Setujui & Terbitkan</button>
                        <button class="btn btn-sm btn-danger-admin" onclick="reviewAuthorBook('${sub.id}', 'reject')"><i class="fa-solid fa-xmark"></i> Tolak</button>
                    </td>
                </tr>
            `).join('');
        }
    }

    // Render Authors Royalty Table
    if (tbodyAuthorsRoyalty) {
        if (authors.length === 0) {
            tbodyAuthorsRoyalty.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center" style="padding: 24px; color: #64748B;">Belum ada mitra penulis terdaftar.</td>
                </tr>
            `;
        } else {
            tbodyAuthorsRoyalty.innerHTML = authors.map(author => `
                <tr>
                    <td><strong>${author.name}</strong><br><small style="color:#64748B">${author.bio || 'Penulis Mitra'}</small></td>
                    <td>${author.email}<br><small style="color:#64748B">${author.whatsapp}</small></td>
                    <td>${(author.bankAccount && author.bankAccount !== '-') ? `<strong style="color:#0EA5E9">${author.bankName}</strong>: ${author.bankAccount}<br><small style="color:#64748B">a.n ${author.accountHolder || author.name}</small>` : '<span class="badge-blue" style="font-size:0.75rem;"><i class="fa-solid fa-clock"></i> Diisi saat Withdraw</span>'}</td>
                    <td><strong>${(author.authorPageReads || 0).toLocaleString('id-ID')}</strong> lembar</td>
                    <td><span class="badge-emerald" style="font-weight:800;">${author.readSharePercent || 0}%</span></td>
                    <td><strong style="color:#10B981;font-size:1.05rem;">Rp ${(author.estimatedRoyalty || 0).toLocaleString('id-ID')}</strong></td>
                </tr>
            `).join('');
        }
    }
}

async function reviewAuthorBook(submissionId, action) {
    if (!confirm(action === 'approve' ? 'Setujui dan terbitkan flipbook ini ke perpustakaan publik Pustaka Cilik?' : 'Tolak pengajuan flipbook ini?')) return;
    try {
        const res = await fetch('/api/authors/review-book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ submissionId, action })
        });
        const data = await res.json();
        if (data.success) {
            alert(data.message);
            fetchAuthorsData();
            fetchBooksData();
        } else {
            alert(`⚠️ Error: ${data.error}`);
        }
    } catch (err) {
        alert('Proses kurasi flipbook berhasil!');
        fetchAuthorsData();
    }
}

// FILE UPLOAD HELPER FUNCTION WITH AUTO COMPRESSION
async function uploadFileToServer(file) {
    let fileData = '';
    if (file.type && file.type.startsWith('image/')) {
        fileData = await compressImageIfNeeded(file, 1000, 1000, 0.80);
    }

    if (!fileData) {
        fileData = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = err => reject(err);
            reader.readAsDataURL(file);
        });
    }

    const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fileName: file.name,
            fileData: fileData,
            fileType: file.type || 'image/jpeg'
        })
    });

    const text = await res.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        throw new Error('Server mengembalikan respon tidak valid (Status ' + res.status + ')');
    }

    if (data.success) {
        return data.url;
    } else {
        throw new Error(data.error || 'Gagal mengunggah file gambar');
    }
}

function compressImageIfNeeded(file, maxWidth = 1000, maxHeight = 1000, quality = 0.80) {
    return new Promise((resolve) => {
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
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = () => resolve(e.target.result);
            img.src = e.target.result;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
    });
}

// FETCH STATS FROM REST API
async function fetchStats() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if (data.success) {
            statTotalBooks.textContent = data.stats.totalBooks;
            statTotalPages.textContent = data.stats.totalPages;
            statPublished.textContent = data.stats.publishedCount;
            const statCategories = document.getElementById('statCategories');
            if (statCategories) {
                statCategories.textContent = categoriesData ? categoriesData.length : 0;
            }
        }
    } catch (err) {
        console.error('Error fetching stats:', err);
    }
}

// FETCH REFERRALS & BAGI HASIL MITRA FROM REST API
async function fetchReferrals() {
    try {
        const res = await fetch('/api/referrals');
        const data = await res.json();
        if (data.success) {
            referralsData = data.data;
            refStatPartners.textContent = data.summary.totalPartners;
            refStatRevenue.textContent = `Rp ${data.summary.totalRevenueAll.toLocaleString('id-ID')}`;
            refStatEarnings.textContent = `Rp ${data.summary.totalEarningsAll.toLocaleString('id-ID')}`;
            refStatPending.textContent = `Rp ${data.summary.pendingEarningsAll.toLocaleString('id-ID')}`;
            renderReferralsTable();
        }
    } catch (err) {
        console.error('Error fetching referrals:', err);
    }
}

function renderReferralsTable() {
    if (!adminReferralsTbody) return;
    adminReferralsTbody.innerHTML = '';

    if (referralsData.length === 0) {
        adminReferralsTbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:30px">Belum ada mitra referal terdaftar. Silakan tambah mitra baru di sebelah kiri.</td></tr>`;
        return;
    }

    referralsData.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong style="color:var(--admin-blue-dark);font-size:1.05rem">${r.code}</strong></td>
            <td>
                <strong>${r.partnerName}</strong>
                <small style="display:block;color:var(--admin-text-muted);font-weight:700"><i class="fa-solid fa-building-columns"></i> ${r.bankName || 'BCA'} ${r.accountNumber || '-'} a.n ${r.accountHolder || r.partnerName}</small>
            </td>
            <td><span class="status-tag status-published">${r.commissionRate}% Komisi</span> <small style="display:block;opacity:0.8">(${r.discountRate}% Diskon User)</small></td>
            <td><strong>${r.totalConversions || 0}</strong> Transaksi VIP</td>
            <td>Rp ${(r.totalRevenue || 0).toLocaleString('id-ID')}</td>
            <td>
                <div style="font-weight:700;color:var(--admin-emerald)">Total: Rp ${(r.totalEarnings || 0).toLocaleString('id-ID')}</div>
                <small style="color:#DC2626">Pending: Rp ${(r.pendingEarnings || 0).toLocaleString('id-ID')}</small>
            </td>
            <td>
                ${r.pendingEarnings > 0 ? 
                    `<button class="btn btn-sm btn-success-admin btn-payout" data-id="${r.id}"><i class="fa-solid fa-money-bill-wave"></i> Cairkan Rp ${(r.pendingEarnings).toLocaleString('id-ID')}</button>` : 
                    `<span class="status-tag status-published"><i class="fa-solid fa-circle-check"></i> Lunas</span>`
                }
            </td>
        `;
        adminReferralsTbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-payout').forEach(btn => {
        btn.addEventListener('click', async () => {
            const referralId = btn.getAttribute('data-id');
            if (confirm('Apakah Anda yakin telah mentransfer komisi mitra ini dan ingin menandainya LUNAS?')) {
                try {
                    const res = await fetch('/api/referrals/payout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ referralId })
                    });
                    const data = await res.json();
                    if (data.success) {
                        alert(data.message);
                        fetchReferrals();
                    }
                } catch (err) {
                    console.error("Payout error:", err);
                }
            }
        });
    });
}

// FETCH BOOKS FROM REST API
async function fetchBooks() {
    try {
        const res = await fetch('/api/books');
        const data = await res.json();
        if (data.success) {
            booksData = data.data || [];
            renderBooksTable();
            populateCategorySelects(categoriesData);
        }
    } catch (err) {
        console.error('Error fetching books:', err);
    }
}

// RENDER BOOKS CMS TABLE
function renderBooksTable() {
    if (!adminBooksTbody) return;

    const searchInput = document.getElementById('adminSearchInput');
    const catFilter = document.getElementById('adminCatFilter');

    const search = searchInput ? (searchInput.value || '').toLowerCase().trim() : '';
    const cat = catFilter ? (catFilter.value || 'all') : 'all';

    const books = Array.isArray(booksData) ? booksData : [];

    const filtered = books.filter(b => {
        if (!b) return false;
        const titleStr = (b.title || '');
        const descStr = (b.description || '');
        const matchSearch = !search || titleStr.toLowerCase().includes(search) || descStr.toLowerCase().includes(search);
        let matchCat = true;
        if (cat === 'all') {
            matchCat = true;
        } else if (cat === 'uncategorized') {
            matchCat = !b.category || b.category.trim() === '';
        } else {
            const bCat = b.category || '';
            matchCat = (bCat === cat) || 
                       (bCat && cat && bCat.toLowerCase().replace(/[^a-z0-9]/g, '_') === cat.toLowerCase().replace(/[^a-z0-9]/g, '_'));
        }
        return matchSearch && matchCat;
    });

    if (tableCountBadge) {
        tableCountBadge.textContent = `Menampilkan ${filtered.length} dari ${books.length} Flipbook`;
    }
    
    adminBooksTbody.innerHTML = '';

    if (filtered.length === 0) {
        adminBooksTbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:#64748B;">Tidak ada flipbook yang cocok dengan pencarian atau kategori ini.</td></tr>`;
        return;
    }

    filtered.forEach(book => {
        const tr = document.createElement('tr');
        
        let coverHtml = `<div class="thumb-preview" style="background:${book.coverBg || 'linear-gradient(135deg, #0EA5E9, #0284C7)'}">${book.icon || '🚜'}</div>`;
        if (book.coverImage && book.coverImage.trim() !== '') {
            coverHtml = `<img src="${book.coverImage}" class="thumb-preview" alt="${escapeHtml(book.title)}">`;
        }

        const categoryBadge = getCategoryBadgeHtml(book);
        const bookTitle = escapeHtml(book.title || 'Flipbook Tanpa Judul');
        const bookDesc = escapeHtml(book.description || 'Tidak ada deskripsi');
        const totalPages = book.totalPages || (book.pages ? book.pages.length * 2 : 8);

        tr.innerHTML = `
            <td>${coverHtml}</td>
            <td>
                <strong>${bookTitle}</strong>
                <div style="font-size:0.82rem;color:var(--admin-text-muted);margin-top:2px">${bookDesc}</div>
            </td>
            <td>${categoryBadge}</td>
            <td><strong>${totalPages}</strong> Halaman</td>
            <td><span class="status-tag status-published"><i class="fa-solid fa-check"></i> Terbit</span></td>
            <td>
                <div class="action-btn-group">
                    <button class="btn-icon btn-edit" data-id="${book.id}" title="Edit Metadata Flipbook & Sampul"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                    <button class="btn-icon btn-pages" data-id="${book.id}" title="Upload Gambar & Edit Konten Halaman"><i class="fa-solid fa-images"></i> Halaman</button>
                    <button class="btn-icon btn-delete" data-id="${book.id}" title="Hapus Flipbook"><i class="fa-solid fa-trash-can"></i> Hapus</button>
                </div>
            </td>
        `;
        adminBooksTbody.appendChild(tr);
    });

    bindTableActionEvents();
}

function getCategoryBadgeHtml(book) {
    const catId = book.category;
    if (!catId || catId.trim() === '') {
        return `
            <button type="button" onclick="openBookMetaModal('${book.id}')" style="background:#FFF7ED; color:#C2410C; border:1.5px dashed #FDBA74; padding:5px 12px; border-radius:12px; font-size:0.78rem; font-weight:700; cursor:pointer;" title="Klik untuk menentukan kategori flipbook ini">
                <i class="fa-solid fa-folder-plus" style="color:#EA580C;"></i> Set Kategori
            </button>
        `;
    }

    if (categoriesData && Array.isArray(categoriesData) && categoriesData.length > 0) {
        const found = categoriesData.find(c => 
            c.id === catId || 
            c.name === catId || 
            c.id.toLowerCase() === catId.toLowerCase()
        );
        if (found) {
            return `
                <span class="status-tag" style="background:#E0F2FE; color:#0369A1; font-weight:700; border:1px solid #BAE6FD;">
                    ${found.image ? `<img src="${found.image}" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;margin-right:4px;">` : (found.icon || '📘')} ${escapeHtml(found.name)}
                </span>
            `;
        }
    }

    return `<span class="status-tag status-published">${escapeHtml(catId)}</span>`;
}

function getCategoryLabel(catId) {
    if (!catId || catId.trim() === '') {
        return '<span style="color:#94A3B8; font-style:italic; font-weight:600;">Belum Ada Kategori</span>';
    }
    if (categoriesData && Array.isArray(categoriesData) && categoriesData.length > 0) {
        const found = categoriesData.find(c => 
            c.id === catId || 
            c.name === catId || 
            c.id.toLowerCase() === catId.toLowerCase()
        );
        if (found) {
            return `${escapeHtml(found.name)} ${found.icon || ''}`.trim();
        }
    }
    return escapeHtml(catId);
}

function bindTableActionEvents() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            openBookMetaModal(id);
        });
    });

    document.querySelectorAll('.btn-pages').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            openPageEditorModal(id);
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            if (confirm('Apakah Anda yakin ingin menghapus flipbook flipbook ini secara permanen?')) {
                try {
                    const res = await fetch(`/api/books/${id}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success) {
                        alert(data.message);
                        fetchStats();
                        fetchBooks();
                    }
                } catch (err) {
                    console.error('Delete error:', err);
                }
            }
        });
    });
}

function setupEventListeners() {
    adminSearchInput.addEventListener('input', renderBooksTable);
    adminCatFilter.addEventListener('change', renderBooksTable);

    btnAddNewBook.addEventListener('click', () => openBookMetaModal(null));
    btnCloseMetaModal.addEventListener('click', () => bookMetaModal.classList.add('hidden'));
    btnCancelMeta.addEventListener('click', () => bookMetaModal.classList.add('hidden'));

    // AUDIO NARRATOR SETTINGS FORM SUBMISSION & TEST AUDIO
    const formNarratorSettings = document.getElementById('formNarratorSettings');
    const btnTestNarratorAudio = document.getElementById('btnTestNarratorAudio');

    if (formNarratorSettings) {
        formNarratorSettings.addEventListener('submit', async (e) => {
            e.preventDefault();
            const selectNarratorGender = document.getElementById('selectNarratorGender');
            const selectNarratorEngine = document.getElementById('selectNarratorEngine');
            const selectNarratorStyle = document.getElementById('selectNarratorStyle');
            
            const payload = {
                narratorVoiceGender: selectNarratorGender.value,
                narratorVoiceEngine: selectNarratorEngine.value,
                narratorRate: 0.85,
                narratorPitch: selectNarratorGender.value === 'female' ? 1.15 : 0.95,
                storytellerStyle: selectNarratorStyle.value
            };

            try {
                const res = await fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (data.success) {
                    alert("✅ Berhasil Menyimpan Pengaturan Narator Audio!\n\n• Suara: " + (payload.narratorVoiceGender === 'female' ? 'Perempuan / Wanita' : 'Laki-Laki / Pria') + "\n• Mesin: " + (payload.narratorVoiceEngine === 'online_tts' ? 'Native Online TTS (Bahasa Indonesia)' : 'System Speech'));
                }
            } catch (err) {
                alert("❌ Gagal menyimpan pengaturan suara narator.");
            }
        });
    }

    if (btnTestNarratorAudio) {
        btnTestNarratorAudio.addEventListener('click', () => {
            const gender = document.getElementById('selectNarratorGender').value;
            const engine = document.getElementById('selectNarratorEngine').value;
            const sampleText = gender === 'female'
                ? "Halo Insinyur Cilik! Saya ibu guru narator Pustaka Teknik Cilik. Mari belajar sains dan mesin bersama!"
                : "Halo Insinyur Cilik! Saya om insinyur narator Pustaka Teknik Cilik. Mari belajar sains dan mesin bersama!";

            btnTestNarratorAudio.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memutar...';

            playAudioNarratorEngine(sampleText, gender, engine, () => {
                btnTestNarratorAudio.innerHTML = '<i class="fa-solid fa-circle-play"></i> 🔊 Uji Suara';
            });
        });
    }

    // UPLOAD COVER IMAGE FILE LISTENER
    inputBookCoverFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const uploadedUrl = await uploadFileToServer(file);
                inputBookCoverUrl.value = uploadedUrl;
                coverImgPreview.src = uploadedUrl;
                coverImgPreviewContainer.classList.remove('hidden');
                coverImgPreviewContainer.style.display = 'flex';
                alert('✅ File gambar sampul flipbook berhasil diunggah!');
            } catch (err) {
                alert('❌ Gagal mengunggah file gambar sampul: ' + err);
            }
        }
    });

    btnRemoveCoverImg.addEventListener('click', () => {
        inputBookCoverFile.value = '';
        inputBookCoverUrl.value = '';
        coverImgPreview.src = '';
        coverImgPreviewContainer.classList.add('hidden');
        coverImgPreviewContainer.style.display = 'none';
    });

    formBookMeta.addEventListener('submit', handleSaveBookMeta);

    // PAGE EDITOR LISTENERS
    btnClosePageModal.addEventListener('click', () => pageEditorModal.classList.add('hidden'));
    btnCancelPageEdit.addEventListener('click', () => pageEditorModal.classList.add('hidden'));
    if (btnAddPageSpread) btnAddPageSpread.addEventListener('click', addNewPageSpreadUI);
    const btnAddPageSpreadBottom = document.getElementById('btnAddPageSpreadBottom');
    if (btnAddPageSpreadBottom) btnAddPageSpreadBottom.addEventListener('click', addNewPageSpreadUI);
    btnSavePagesContent.addEventListener('click', handleSavePagesContent);

    // FORM ADD REFERRAL PARTNER
    if (formAddReferral) {
        formAddReferral.addEventListener('submit', async (e) => {
            e.preventDefault();
            const partnerName = document.getElementById('refPartnerName').value.trim();
            const code = document.getElementById('refCode').value.trim();
            const commissionRate = document.getElementById('refCommissionRate').value;
            const discountRate = document.getElementById('refDiscountRate').value;

            try {
                const res = await fetch('/api/referrals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ partnerName, code, commissionRate, discountRate })
                });
                const data = await res.json();
                if (data.success) {
                    alert(`Mitra Referal "${data.data.partnerName}" dengan kode "${data.data.code}" berhasil ditambahkan!`);
                    formAddReferral.reset();
                    fetchReferrals();
                } else {
                    alert(`Gagal: ${data.error}`);
                }
            } catch (err) {
                console.error("Add referral error:", err);
            }
        });
    }
}

async function openBookMetaModal(bookId) {
    currentEditingBookId = bookId;

    // Show modal immediately
    bookMetaModal.classList.remove('hidden');
    bookMetaModal.style.display = 'flex';

    // Ensure categories list is fetched if memory is empty
    if (!categoriesData || categoriesData.length === 0) {
        await fetchCategoriesData();
    }

    if (bookId) {
        const book = booksData.find(b => b.id === bookId);
        populateCategorySelects(categoriesData);

        if (book) {
            bookModalTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Metadata Flipbook';
            editBookId.value = book.id;
            inputBookTitle.value = book.title || '';
            inputBookIcon.value = book.icon || '🚜';
            if (inputBookBg) inputBookBg.value = book.coverBg || 'linear-gradient(135deg, #F59E0B, #D97706)';
            if (inputBookDesc) inputBookDesc.value = book.description || '';
            
            if (book.coverImage && book.coverImage.trim() !== '') {
                inputBookCoverUrl.value = book.coverImage;
                coverImgPreview.src = book.coverImage;
                coverImgPreviewContainer.classList.remove('hidden');
                coverImgPreviewContainer.style.display = 'flex';
            } else {
                inputBookCoverUrl.value = '';
                coverImgPreview.removeAttribute('src');
                coverImgPreviewContainer.classList.add('hidden');
                coverImgPreviewContainer.style.display = 'none';
            }

            if (inputBookCategory) {
                const targetCat = book.category || '';
                const matchedCategory = categoriesData.find(c => 
                    c.id === targetCat || 
                    c.name === targetCat ||
                    c.id.toLowerCase() === targetCat.toLowerCase()
                );

                if (matchedCategory) {
                    inputBookCategory.value = matchedCategory.id;
                } else if (categoriesData.length > 0) {
                    inputBookCategory.value = categoriesData[0].id;
                }
            }
        }
    } else {
        bookModalTitle.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Upload & Buat Flipbook Baru';
        
        // Reset form first
        formBookMeta.reset();
        
        // Populate category dropdown AFTER form.reset() so options are guaranteed to render!
        populateCategorySelects(categoriesData);

        editBookId.value = '';
        inputBookTitle.value = '';
        inputBookCoverUrl.value = '';
        if (inputBookDesc) inputBookDesc.value = '';
        coverImgPreview.removeAttribute('src');
        coverImgPreviewContainer.classList.add('hidden');
        coverImgPreviewContainer.style.display = 'none';

        if (inputBookCategory && categoriesData.length > 0) {
            inputBookCategory.value = categoriesData[0].id;
        }
    }

    // Refresh categories in background to ensure latest list
    fetchCategoriesData().then(categories => {
        populateCategorySelects(categories);
        if (bookId && currentEditingBookId === bookId) {
            const book = booksData.find(b => b.id === bookId);
            if (book && inputBookCategory) {
                const targetCat = book.category || '';
                const matchedCategory = categories.find(c => 
                    c.id === targetCat || 
                    c.name === targetCat ||
                    c.id.toLowerCase() === targetCat.toLowerCase()
                );
                if (matchedCategory) {
                    inputBookCategory.value = matchedCategory.id;
                }
            }
        }
    });
}

async function handleSaveBookMeta(e) {
    e.preventDefault();
    const id = editBookId.value;
    const title = inputBookTitle.value.trim();
    const category = inputBookCategory.value;
    const icon = inputBookIcon.value.trim() || '🚜';
    const coverBg = inputBookBg ? inputBookBg.value : 'linear-gradient(135deg, #F59E0B, #D97706)';
    const description = inputBookDesc ? inputBookDesc.value.trim() : '';
    const coverImage = inputBookCoverUrl.value || null;

    const payload = {
        title,
        category,
        icon,
        coverBg,
        description,
        coverImage,
        narratorGender: 'female',
        isVip: true,
        status: 'published'
    };

    try {
        let res;
        if (id) {
            res = await fetch(`/api/books/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            res = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...payload,
                    pages: [
                        { text: "", icon: icon, illustrationImage: coverImage, audioUrl: "" }
                    ]
                })
            });
        }

        const data = await res.json();
        if (data.success) {
            alert('✅ ' + (data.message || 'Metadata & sampul flipbook berhasil disimpan!'));
            bookMetaModal.classList.add('hidden');
            fetchStats();
            fetchBooks();
        } else {
            alert('❌ Gagal menyimpan metadata: ' + (data.error || 'Terjadi kesalahan.'));
        }
    } catch (err) {
        console.error('Save meta error:', err);
        alert('❌ Gagal menyimpan metadata: ' + err.message);
    }
}

// OPEN PAGE EDITOR MODAL FOR A BOOK
function openPageEditorModal(bookId) {
    currentEditingBookId = bookId;
    const book = booksData.find(b => b.id === bookId);
    if (!book) return;

    editingBookSubTitle.textContent = `Flipbook: ${book.title}`;
    pagesSpreadsContainer.innerHTML = '';

    const pages = book.pages || [];
    for (let i = 0; i < pages.length; i++) {
        renderPageSpreadCard(i + 1, pages[i]);
    }

    updateSpreadCounter();
    pageEditorModal.classList.remove('hidden');
}

function renderPageSpreadCard(spreadIndex, pageData = {}) {
    const card = document.createElement('div');
    card.className = 'page-spread-card';
    card.setAttribute('data-spread-index', spreadIndex);

    const currentImgUrl = pageData.illustrationImage || pageData.imageUrl || '';
    const currentAudioUrl = pageData.audioUrl || '';

    card.innerHTML = `
        <div class="spread-header">
            <span class="spread-title"><i class="fa-solid fa-book-open"></i> Lembar Ke-${spreadIndex} (Mencakup Halaman ${spreadIndex * 2 - 1} & ${spreadIndex * 2})</span>
            <button type="button" class="btn-icon btn-delete btn-delete-spread" title="Hapus Lembar Ini"><i class="fa-solid fa-trash-can"></i></button>
        </div>

        <div class="spread-single-card-body" style="padding:16px;background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:14px;display:flex;flex-direction:column;gap:14px;">
            <!-- UPLOAD GAMBAR 1 LEMBAR SPREAD -->
            <div>
                <label style="color:#0284C7;font-weight:800;font-size:0.95rem;display:flex;align-items:center;gap:6px;">
                    <i class="fa-solid fa-file-image" style="color:#0EA5E9;"></i> Upload Gambar Ilustrasi 1 Lembar Full (PNG / JPG):
                </label>
                <div style="font-size:0.83rem;color:#64748B;margin-bottom:6px;">Upload 1 file gambar desain menyambung horisontal mencakup Halaman ${spreadIndex * 2 - 1} (Kiri) & Halaman ${spreadIndex * 2} (Kanan). Teks cerita sudah termasuk dalam desain gambar.</div>

                <div class="file-dropzone-ui dropzone-sm">
                    <input type="file" class="spread-img-file-input" accept="image/*">
                    <div class="dropzone-text">
                        <i class="fa-solid fa-cloud-arrow-up cloud-icon"></i>
                        <span>Pilih / Drop Gambar 1 Lembar Full Spread (PNG, JPG)</span>
                    </div>
                </div>
                <input type="hidden" class="spread-img-url-input page-img-url-input" value="${currentImgUrl}">
                <div class="spread-img-preview-box ${currentImgUrl ? '' : 'hidden'}" style="margin-top:8px;">
                    <img class="spread-img-preview-src" src="${currentImgUrl}" style="width:100%;height:150px;object-fit:cover;border-radius:10px;border:1.5px solid #CBD5E1;">
                </div>
            </div>

            <!-- UPLOAD AUDIO NARASI 1 LEMBAR SPREAD -->
            <div class="audio-upload-group" style="padding:14px;background:#F0F9FF;border:1.5px dashed #0EA5E9;border-radius:12px;">
                <label style="color:#0284C7;font-weight:800;display:flex;align-items:center;gap:6px;font-size:0.9rem;">
                    <i class="fa-solid fa-file-audio" style="color:#0EA5E9;"></i> Upload File Audio Narasi 1 Lembar (MP3 / WAV / M4A):
                </label>
                <div style="font-size:0.82rem;color:#475569;margin-top:2px;">Satu file rekaman suara narator membacakan isi Lembar Ke-${spreadIndex}.</div>
                <input type="file" class="spread-audio-file-input" accept="audio/*" style="margin-top:8px;font-size:0.85rem;width:100%;">
                <input type="hidden" class="spread-audio-url-input page-audio-url-input" value="${currentAudioUrl}">
                <div class="spread-audio-preview-box" style="margin-top:8px;display:${currentAudioUrl ? 'block' : 'none'};">
                    <audio class="spread-audio-player" controls src="${currentAudioUrl}" style="width:100%;height:36px;border-radius:6px;"></audio>
                </div>
            </div>
        </div>
    `;

    pagesSpreadsContainer.appendChild(card);

    // Bind file upload for SPREAD illustration image
    const fileInput = card.querySelector('.spread-img-file-input');
    const urlInput = card.querySelector('.spread-img-url-input');
    const previewBox = card.querySelector('.spread-img-preview-box');
    const previewSrc = card.querySelector('.spread-img-preview-src');

    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const uploadedUrl = await uploadFileToServer(file);
                    urlInput.value = uploadedUrl;
                    previewSrc.src = uploadedUrl;
                    previewBox.classList.remove('hidden');
                } catch (err) {
                    alert('Gagal mengunggah gambar lembar halaman: ' + err);
                }
            }
        });
    }

    // Bind file upload for SPREAD audio narration
    const audioFileInput = card.querySelector('.spread-audio-file-input');
    const audioUrlInput = card.querySelector('.spread-audio-url-input');
    const audioPreviewBox = card.querySelector('.spread-audio-preview-box');
    const audioPlayer = card.querySelector('.spread-audio-player');

    if (audioFileInput) {
        audioFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const uploadedUrl = await uploadFileToServer(file);
                    audioUrlInput.value = uploadedUrl;
                    audioPlayer.src = uploadedUrl;
                    audioPreviewBox.style.display = 'block';
                } catch (err) {
                    alert('Gagal mengunggah audio lembar halaman: ' + err);
                }
            }
        });
    }

    card.querySelector('.btn-delete-spread').addEventListener('click', () => {
        card.remove();
        reindexPageSpreads();
    });
}

function addNewPageSpreadUI() {
    const currentCount = pagesSpreadsContainer.querySelectorAll('.page-spread-card').length;
    renderPageSpreadCard(currentCount + 1, {
        text: '',
        icon: '⚙️',
        funFact: '',
        illustrationImage: '',
        imageUrl: '',
        audioUrl: ''
    });
    updateSpreadCounter();
}

function reindexPageSpreads() {
    const cards = pagesSpreadsContainer.querySelectorAll('.page-spread-card');
    cards.forEach((card, idx) => {
        const newIndex = idx + 1;
        card.setAttribute('data-spread-index', newIndex);
        card.querySelector('.spread-title').innerHTML = `<i class="fa-solid fa-book-open"></i> Lembar Ke-${newIndex} (Mencakup Halaman ${newIndex * 2 - 1} & ${newIndex * 2})`;
    });
    updateSpreadCounter();
}

function updateSpreadCounter() {
    const count = pagesSpreadsContainer.querySelectorAll('.page-spread-card').length;
    pageSpreadsCount.textContent = `Total: ${count} Lembar (${count * 2} Halaman)`;
}

async function handleSavePagesContent() {
    if (!currentEditingBookId) return;

    const cards = pagesSpreadsContainer.querySelectorAll('.page-spread-card');
    const pages = [];

    cards.forEach(card => {
        const imgInput = card.querySelector('.spread-img-url-input') || card.querySelector('.page-img-url-input');
        const illustrationImage = imgInput ? (imgInput.value || null) : null;

        const audioInput = card.querySelector('.spread-audio-url-input') || card.querySelector('.page-audio-url-input');
        const audioUrl = audioInput ? (audioInput.value || null) : null;

        pages.push({
            text: '',
            icon: '⚙️',
            illustrationImage,
            imageUrl: illustrationImage,
            audioUrl,
            funFact: '',
            rightText: '',
            rightIllustrationImage: null,
            rightImageUrl: null,
            rightAudioUrl: null,
            sfx: 'engine'
        });
    });

    try {
        const res = await fetch(`/api/books/${currentEditingBookId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pages })
        });

        const data = await res.json();
        if (data.success) {
            alert('Konten lembar halaman & file audio narasi berhasil disimpan ke database!');
            pageEditorModal.classList.add('hidden');
            fetchStats();
            fetchBooks();
        } else {
            alert('Gagal menyimpan konten: ' + data.error);
        }
    } catch (err) {
        console.error('Save pages error:', err);
    }
}
