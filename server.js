const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const DATA_FILE = path.join(__dirname, 'data', 'books.json');
const REFERRALS_FILE = path.join(__dirname, 'data', 'referrals.json');
const AUTHORS_FILE = path.join(__dirname, 'data', 'authors.json');
const SUBMISSIONS_FILE = path.join(__dirname, 'data', 'submissions.json');
const CATEGORIES_FILE = path.join(__dirname, 'data', 'categories.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.ogg': 'audio/ogg'
};

// HELPER: READ BOOKS DATA FROM DATA FILE
function getBooksData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading books.json:', err);
    return [];
  }
}

// HELPER: SAVE BOOKS DATA TO DATA FILE
function saveBooksData(data) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing books.json:', err);
    return false;
  }
}

// HELPER: READ REFERRALS DATA FROM DATA FILE
function getReferralsData() {
  try {
    if (!fs.existsSync(REFERRALS_FILE)) {
      return [];
    }
    const content = fs.readFileSync(REFERRALS_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading referrals.json:', err);
    return [];
  }
}

// HELPER: SAVE REFERRALS DATA TO DATA FILE
function saveReferralsData(data) {
  try {
    const dir = path.dirname(REFERRALS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(REFERRALS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing referrals.json:', err);
    return false;
  }
}

// HELPER: READ AUTHORS DATA
function getAuthorsData() {
  try {
    if (!fs.existsSync(AUTHORS_FILE)) {
      saveAuthorsData([]);
      return [];
    }
    const content = fs.readFileSync(AUTHORS_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading authors.json:', err);
    return [];
  }
}

// HELPER: SAVE AUTHORS DATA
function saveAuthorsData(data) {
  try {
    const dir = path.dirname(AUTHORS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(AUTHORS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing authors.json:', err);
    return false;
  }
}

// HELPER: READ BOOK SUBMISSIONS
function getSubmissionsData() {
  try {
    if (!fs.existsSync(SUBMISSIONS_FILE)) return [];
    const content = fs.readFileSync(SUBMISSIONS_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading submissions.json:', err);
    return [];
  }
}

// HELPER: SAVE BOOK SUBMISSIONS
function saveSubmissionsData(data) {
  try {
    const dir = path.dirname(SUBMISSIONS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing submissions.json:', err);
    return false;
  }
}

// HELPER: READ CATEGORIES DATA
function getCategoriesData() {
  try {
    if (!fs.existsSync(CATEGORIES_FILE)) {
      saveCategoriesData([]);
      return [];
    }
    const content = fs.readFileSync(CATEGORIES_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading categories.json:', err);
    return [];
  }
}

// HELPER: SAVE CATEGORIES DATA
function saveCategoriesData(data) {
  try {
    const dir = path.dirname(CATEGORIES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing categories.json:', err);
    return false;
  }
}

// HELPER: SAVE BASE64 IMAGE TO PHYSICAL UPLOADS FILE
function saveBase64Image(base64Str, prefix = 'cover') {
  if (!base64Str || typeof base64Str !== 'string') return '/uploads/default_cover.jpg';
  if (!base64Str.startsWith('data:image')) return base64Str; // Already a URL path

  try {
    const matches = base64Str.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) return '/uploads/default_cover.jpg';

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const fileName = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    fs.writeFileSync(filePath, buffer);
    return `/uploads/${fileName}`;
  } catch (e) {
    console.error('Error saving base64 image:', e);
    return '/uploads/default_cover.jpg';
  }
}

// HELPER: PARSE JSON REQUEST BODY
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString('utf8');
      if (body.length > 25 * 1024 * 1024) {
        reject(new Error('Ukuran file terlalu besar (maksimal 20 MB).'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Format data request JSON tidak valid.'));
      }
    });
    req.on('error', err => {
      reject(err);
    });
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = reqUrl.pathname;

  // -------------------------------------------------------------
  // REST API ENDPOINTS FOR FILE UPLOADS & CONTENT MANAGEMENT
  // -------------------------------------------------------------

  // POST /api/upload - UPLOAD IMAGE / AUDIO / PDF FILE (BASE64 OR BINARY)
  if (req.method === 'POST' && pathname === '/api/upload') {
    try {
      const bodyData = await parseRequestBody(req);
      const { fileName, fileData, fileType } = bodyData;

      if (!fileData) {
        res.writeHead(400, { 'Content-Type': MIME_TYPES['.json'] });
        res.end(JSON.stringify({ success: false, error: 'File data tidak boleh kosong' }));
        return;
      }

      const base64Content = fileData.includes(',') ? fileData.split(',')[1] : fileData;
      const buffer = Buffer.from(base64Content, 'base64');
      
      let safeExt = path.extname(fileName || '').toLowerCase();
      if (!safeExt && fileType) {
        const sub = (fileType.split('/')[1] || 'png').split(';')[0];
        safeExt = `.${sub}`;
      }
      if (!safeExt) safeExt = '.mp3';

      const uniqueFileName = `file_${Date.now()}_${Math.floor(Math.random() * 1000)}${safeExt}`;
      const savePath = path.join(UPLOADS_DIR, uniqueFileName);

      fs.writeFileSync(savePath, buffer);

      const publicUrl = `/uploads/${uniqueFileName}`;
      res.writeHead(200, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({
        success: true,
        message: 'File berhasil diunggah!',
        url: publicUrl,
        fileName: uniqueFileName
      }));
    } catch (err) {
      console.error('Upload Error:', err);
      res.writeHead(500, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({ success: false, error: 'Gagal memproses file upload' }));
    }
    return;
  }

  // GET /api/books - GET ALL BOOKS
  if (req.method === 'GET' && pathname === '/api/books') {
    const categoryFilter = reqUrl.searchParams.get('category');
    let books = getBooksData();
    if (categoryFilter && categoryFilter !== 'all') {
      books = books.filter(b => b.category === categoryFilter);
    }

    res.writeHead(200, { 'Content-Type': MIME_TYPES['.json'] });
    res.end(JSON.stringify({ success: true, count: books.length, data: books }));
    return;
  }

  // GET /api/categories - GET ALL CATEGORIES
  if (req.method === 'GET' && pathname === '/api/categories') {
    const categories = getCategoriesData();
    res.writeHead(200, { 'Content-Type': MIME_TYPES['.json'] });
    res.end(JSON.stringify({ success: true, count: categories.length, data: categories }));
    return;
  }

  // POST /api/categories - ADD / UPDATE CATEGORY (INCLUDING COVER IMAGE & ICON)
  if (req.method === 'POST' && pathname === '/api/categories') {
    try {
      const bodyData = await parseRequestBody(req);
      const { id, name, icon, description, image } = bodyData;

      if (!name || !name.trim()) {
        res.writeHead(400, { 'Content-Type': MIME_TYPES['.json'] });
        res.end(JSON.stringify({ success: false, error: 'Nama kategori wajib diisi!' }));
        return;
      }

      const catId = (id && id.trim()) 
        ? id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') 
        : name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');

      let categories = getCategoriesData();
      let finalImageUrl = image || '';

      // If image is Base64 data URL, write to file in uploads directory
      if (image && image.startsWith('data:image')) {
        const matches = image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          const fileName = `category_${catId}_${Date.now()}.${ext}`;
          const savePath = path.join(UPLOADS_DIR, fileName);
          fs.writeFileSync(savePath, buffer);
          finalImageUrl = `/uploads/${fileName}`;
        }
      }

      const existingIndex = categories.findIndex(c => c.id === catId);
      const categoryObj = {
        id: catId,
        name: name.trim(),
        icon: icon || '📘',
        description: description ? description.trim() : '',
        image: finalImageUrl
      };

      if (existingIndex >= 0) {
        categories[existingIndex] = { ...categories[existingIndex], ...categoryObj };
      } else {
        categories.push(categoryObj);
      }

      saveCategoriesData(categories);
      res.writeHead(200, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({ success: true, message: 'Kategori berhasil disimpan!', data: categories }));
    } catch (err) {
      console.error('Error saving category:', err);
      res.writeHead(500, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({ success: false, error: 'Gagal menyimpan data kategori' }));
    }
    return;
  }

  // DELETE /api/categories/:id - DELETE CATEGORY BY ID
  if (req.method === 'DELETE' && pathname.startsWith('/api/categories/')) {
    try {
      const catId = pathname.replace('/api/categories/', '').trim();
      let categories = getCategoriesData();
      const updatedCategories = categories.filter(c => c.id !== catId);
      saveCategoriesData(updatedCategories);

      res.writeHead(200, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({ success: true, message: `Kategori "${catId}" berhasil dihapus!`, data: updatedCategories }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({ success: false, error: 'Gagal menghapus kategori' }));
    }
    return;
  }

  // POST /api/books - ADD NEW BOOK
  if (req.method === 'POST' && pathname === '/api/books') {
    try {
      const newBook = await parseRequestBody(req);
      if (!newBook.title) {
        res.writeHead(400, { 'Content-Type': MIME_TYPES['.json'] });
        res.end(JSON.stringify({ success: false, error: 'Judul flipbook wajib diisi' }));
        return;
      }

      const books = getBooksData();
      const savedCoverUrl = saveBase64Image(newBook.coverImage, 'book_cover');

      const bookToSave = {
        id: `book-${Date.now()}`,
        category: newBook.category || '',
        title: newBook.title,
        coverBg: newBook.coverBg || 'linear-gradient(135deg, #0EA5E9, #0284C7)',
        coverImage: savedCoverUrl,
        icon: newBook.icon || '🚜',
        totalPages: newBook.pages ? newBook.pages.length * 2 : (newBook.totalPages || 8),
        description: newBook.description || '',
        isVip: newBook.isVip !== undefined ? newBook.isVip : true,
        status: newBook.status || 'published',
        pages: newBook.pages || [
          { text: "Pustaka Teknik Cilik - Halaman 1", icon: "🚜", funFact: "Fakta menarik insinyur cilik!" }
        ],
        createdAt: new Date().toISOString()
      };

      books.unshift(bookToSave);
      saveBooksData(books);

      res.writeHead(201, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({ success: true, message: 'Flipbook berhasil ditambahkan!', data: bookToSave }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({ success: false, error: 'Format JSON request tidak valid' }));
    }
    return;
  }

  // PUT /api/books/:id - UPDATE EXISTING BOOK
  if (req.method === 'PUT' && pathname.startsWith('/api/books/')) {
    try {
      const bookId = pathname.replace('/api/books/', '');
      const updatedFields = await parseRequestBody(req);
      let books = getBooksData();
      const index = books.findIndex(b => b.id === bookId);

      if (index === -1) {
        res.writeHead(404, { 'Content-Type': MIME_TYPES['.json'] });
        res.end(JSON.stringify({ success: false, error: 'Flipbook tidak ditemukan untuk diperbarui' }));
        return;
      }

      if (updatedFields.coverImage) {
        updatedFields.coverImage = saveBase64Image(updatedFields.coverImage, 'book_cover');
      }

      books[index] = {
        ...books[index],
        ...updatedFields,
        totalPages: (updatedFields.pages ? updatedFields.pages.length * 2 : books[index].totalPages),
        updatedAt: new Date().toISOString()
      };

      saveBooksData(books);

      res.writeHead(200, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({ success: true, message: 'Flipbook berhasil diperbarui!', data: books[index] }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({ success: false, error: 'Format JSON request tidak valid' }));
    }
    return;
  }

  // DELETE /api/books/:id - DELETE A BOOK
  if (req.method === 'DELETE' && pathname.startsWith('/api/books/')) {
    const bookId = pathname.replace('/api/books/', '');
    let books = getBooksData();
    const initialLength = books.length;
    books = books.filter(b => b.id !== bookId);

    if (books.length < initialLength) {
      saveBooksData(books);
      res.writeHead(200, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({ success: true, message: 'Flipbook berhasil dihapus!' }));
    } else {
      res.writeHead(404, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({ success: false, error: 'Flipbook tidak ditemukan' }));
    }
    return;
  }

  // -------------------------------------------------------------
  // REFERRAL & REVENUE SHARING API ENDPOINTS (BAGI HASIL MITRA VIP)
  // -------------------------------------------------------------

  // GET /api/referrals - GET ALL REFERRAL PARTNERS & STATS
  if (req.method === 'GET' && pathname === '/api/referrals') {
    const referrals = getReferralsData();
    let totalRevenueAll = 0;
    let totalEarningsAll = 0;
    let pendingEarningsAll = 0;

    referrals.forEach(r => {
      totalRevenueAll += (r.totalRevenue || 0);
      totalEarningsAll += (r.totalEarnings || 0);
      pendingEarningsAll += (r.pendingEarnings || 0);
    });

    res.writeHead(200, { 'Content-Type': MIME_TYPES['.json'] });
    res.end(JSON.stringify({
      success: true,
      data: referrals,
      summary: {
        totalPartners: referrals.length,
        totalRevenueAll,
        totalEarningsAll,
        pendingEarningsAll
      }
    }));
    return;
  }

  // POST /api/referrals/validate - VALIDATE REFERRAL CODE & RECORD CONVERSION
  if (req.method === 'POST' && pathname === '/api/referrals/validate') {
    try {
      const { code, planAmount } = await parseRequestBody(req);
      if (!code) {
        res.writeHead(400, { 'Content-Type': MIME_TYPES['.json'] });
        res.end(JSON.stringify({ success: false, error: 'Kode referal tidak boleh kosong' }));
        return;
      }

      const referrals = getReferralsData();
      const ref = referrals.find(r => r.code.toUpperCase() === code.trim().toUpperCase() && r.status === 'active');

      if (!ref) {
        res.writeHead(404, { 'Content-Type': MIME_TYPES['.json'] });
        res.end(JSON.stringify({ success: false, error: 'Kode referal tidak ditemukan atau sudah tidak aktif' }));
        return;
      }

      const amount = Number(planAmount) || 249000;
      const discount = Math.round((amount * ref.discountRate) / 100);
      const finalPrice = amount - discount;
      const commission = Math.round((finalPrice * ref.commissionRate) / 100);

      // Record conversion
      ref.totalConversions = (ref.totalConversions || 0) + 1;
      ref.totalRevenue = (ref.totalRevenue || 0) + finalPrice;
      ref.totalEarnings = (ref.totalEarnings || 0) + commission;
      ref.pendingEarnings = (ref.pendingEarnings || 0) + commission;

      saveReferralsData(referrals);

      res.writeHead(200, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({
        success: true,
        message: `Kode Referal "${ref.code}" Berhasil Digunakan!`,
        partnerName: ref.partnerName,
        discountRate: ref.discountRate,
        discountAmount: discount,
        originalPrice: amount,
        finalPrice: finalPrice,
        commissionEarned: commission
      }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({ success: false, error: 'Gagal memproses validasi kode referal' }));
    }
    return;
  }

  // POST /api/referrals - CREATE NEW REFERRAL PARTNER
  if (req.method === 'POST' && pathname === '/api/referrals') {
    try {
      const newRef = await parseRequestBody(req);
      if (!newRef.code || !newRef.partnerName) {
        res.writeHead(400, { 'Content-Type': MIME_TYPES['.json'] });
        res.end(JSON.stringify({ success: false, error: 'Kode referal dan nama mitra wajib diisi' }));
        return;
      }

      const referrals = getReferralsData();
      const codeUpper = newRef.code.trim().toUpperCase();

      if (referrals.some(r => r.code.toUpperCase() === codeUpper)) {
        res.writeHead(400, { 'Content-Type': MIME_TYPES['.json'] });
        res.end(JSON.stringify({ success: false, error: 'Kode referal sudah terdaftar sebelumnya' }));
        return;
      }

      const referralObj = {
        id: `ref-${Date.now()}`,
        code: codeUpper,
        partnerName: newRef.partnerName.trim(),
        bankName: newRef.bankName ? newRef.bankName.trim() : 'BCA',
        accountNumber: newRef.accountNumber ? newRef.accountNumber.trim() : '-',
        accountHolder: newRef.accountHolder ? newRef.accountHolder.trim() : newRef.partnerName.trim(),
        commissionRate: Number(newRef.commissionRate) || 25,
        discountRate: Number(newRef.discountRate) || 10,
        totalConversions: 0,
        totalRevenue: 0,
        totalEarnings: 0,
        paidEarnings: 0,
        pendingEarnings: 0,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      referrals.unshift(referralObj);
      saveReferralsData(referrals);

      res.writeHead(201, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({ success: true, message: 'Mitra referal baru berhasil ditambahkan!', data: referralObj }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({ success: false, error: 'Gagal menambahkan mitra referal' }));
    }
    return;
  }

  // POST /api/referrals/payout - PAYOUT COMMISSION TO PARTNER
  if (req.method === 'POST' && pathname === '/api/referrals/payout') {
    try {
      const { referralId } = await parseRequestBody(req);
      let referrals = getReferralsData();
      const ref = referrals.find(r => r.id === referralId);

      if (!ref) {
        res.writeHead(404, { 'Content-Type': MIME_TYPES['.json'] });
        res.end(JSON.stringify({ success: false, error: 'Data mitra referal tidak ditemukan' }));
        return;
      }

      const paidOut = ref.pendingEarnings || 0;
      ref.paidEarnings = (ref.paidEarnings || 0) + paidOut;
      ref.pendingEarnings = 0;

      saveReferralsData(referrals);

      res.writeHead(200, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({
        success: true,
        message: `Komisi Rp ${paidOut.toLocaleString('id-ID')} berhasil dicairkan kepada ${ref.partnerName}!`,
        data: ref
      }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({ success: false, error: 'Gagal mencairkan komisi mitra' }));
    }
    return;
  }

  // -------------------------------------------------------------
  // REST API ENDPOINTS FOR AUTHOR PARTNERS & PAY-PER-READ TRACKING
  // -------------------------------------------------------------

  // POST /api/track-read - INCREMENT READ COUNT FOR BOOK
  if (req.method === 'POST' && pathname === '/api/track-read') {
    try {
      const { bookId } = await parseRequestBody(req);
      let books = getBooksData();
      const book = books.find(b => b.id === bookId);
      if (book) {
        book.readCount = (book.readCount || 0) + 1;
        book.totalPageReads = (book.totalPageReads || 0) + (book.pages ? book.pages.length : 4);
        saveBooksData(books);
        res.writeHead(200, { 'Content-Type': MIME_TYPES['.json'] });
        res.end(JSON.stringify({ success: true, bookId, readCount: book.readCount }));
        return;
      }
      res.writeHead(404, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({ success: false, error: 'Flipbook tidak ditemukan' }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({ success: false, error: 'Gagal mencatat pembacaan' }));
    }
    return;
  }

  // GET /api/authors - LIST AUTHOR PARTNERS WITH ROYALTY CALCULATIONS
  if (req.method === 'GET' && pathname === '/api/authors') {
    const authors = getAuthorsData();
    const books = getBooksData();
    const submissions = getSubmissionsData();

    let totalSystemPageReads = 0;
    books.forEach(b => {
      totalSystemPageReads += (b.readCount || 0) * (b.pages ? b.pages.length : 4);
    });

    const ROYALTY_POOL_RUPIAH = (authors.length === 0 || totalSystemPageReads === 0) ? 0 : 20000000;

    const authorsWithStats = authors.map(author => {
      const authorBooks = books.filter(b => b.authorId === author.id || b.author === author.name);
      let authorPageReads = 0;
      authorBooks.forEach(b => {
        authorPageReads += (b.readCount || 0) * (b.pages ? b.pages.length : 4);
      });

      const readSharePercent = totalSystemPageReads > 0 ? (authorPageReads / totalSystemPageReads) * 100 : 0;
      const estimatedRoyalty = Math.round((readSharePercent / 100) * ROYALTY_POOL_RUPIAH);

      return {
        ...author,
        publishedBooksCount: authorBooks.length,
        authorPageReads,
        readSharePercent: parseFloat(readSharePercent.toFixed(2)),
        estimatedRoyalty,
        books: authorBooks
      };
    });

    res.writeHead(200, { 'Content-Type': MIME_TYPES['.json'] });
    res.end(JSON.stringify({
      success: true,
      totalSystemPageReads,
      royaltyPoolRupiah: ROYALTY_POOL_RUPIAH,
      data: authorsWithStats,
      pendingSubmissions: submissions.filter(s => s.status === 'pending')
    }));
    return;
  }

  // POST /api/authors/register - REGISTER NEW AUTHOR PARTNER
  if (req.method === 'POST' && pathname === '/api/authors/register') {
    try {
      const body = await parseRequestBody(req);
      const { name, email, whatsapp, bankName, bankAccount, accountHolder, bio } = body;

      if (!name || !email || !whatsapp) {
        res.writeHead(400, { 'Content-Type': MIME_TYPES['.json'] });
        res.end(JSON.stringify({ success: false, error: 'Nama, Email, dan WhatsApp wajib diisi' }));
        return;
      }

      let authors = getAuthorsData();
      const newAuthor = {
        id: `auth-${Date.now()}`,
        name,
        email,
        whatsapp,
        bankName: bankName || 'BCA',
        bankAccount: bankAccount || '-',
        accountHolder: accountHolder || name,
        bio: bio || 'Penulis Mitra Pustaka Cilik',
        submittedBooksCount: 0,
        joinedDate: new Date().toISOString().split('T')[0]
      };

      authors.push(newAuthor);
      saveAuthorsData(authors);

      res.writeHead(200, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({
        success: true,
        message: `Selamat ${name}, Pendaftaran Mitra Penulis Pustaka Cilik Berhasil!`,
        data: newAuthor
      }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({ success: false, error: 'Gagal mendaftar mitra penulis' }));
    }
    return;
  }

  // POST /api/authors/submit-book - AUTHOR SUBMITS NEW BOOK FOR REVIEW
  if (req.method === 'POST' && pathname === '/api/authors/submit-book') {
    try {
      const body = await parseRequestBody(req);
      const { authorName, title, category, ageGroup, description, coverImage, pages } = body;

      if (!title || !authorName) {
        res.writeHead(400, { 'Content-Type': MIME_TYPES['.json'] });
        res.end(JSON.stringify({ success: false, error: 'Judul dan Nama Penulis wajib diisi' }));
        return;
      }

      let submissions = getSubmissionsData();
      const savedCoverUrl = saveBase64Image(coverImage, 'author_cover');

      const newSubmission = {
        id: `sub-${Date.now()}`,
        authorName,
        title,
        category: category || 'Sains & Alam',
        ageGroup: ageGroup || '5-8 Tahun',
        description: description || '',
        coverImage: savedCoverUrl,
        pages: pages || [],
        status: 'pending',
        submittedAt: new Date().toISOString().split('T')[0]
      };

      submissions.push(newSubmission);
      saveSubmissionsData(submissions);

      res.writeHead(200, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({
        success: true,
        message: `Flipbook "${title}" berhasil dikirim untuk proses peninjauan kurasi!`,
        data: newSubmission
      }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({ success: false, error: 'Gagal mengunggah flipbook karya' }));
    }
    return;
  }

  // POST /api/authors/review-book - ADMIN APPROVES OR REJECTS SUBMISSION
  if (req.method === 'POST' && pathname === '/api/authors/review-book') {
    try {
      const { submissionId, action } = await parseRequestBody(req);
      let submissions = getSubmissionsData();
      const sub = submissions.find(s => s.id === submissionId);

      if (!sub) {
        res.writeHead(404, { 'Content-Type': MIME_TYPES['.json'] });
        res.end(JSON.stringify({ success: false, error: 'Pengajuan tidak ditemukan' }));
        return;
      }

      if (action === 'approve') {
        sub.status = 'approved';
        let books = getBooksData();
        const newBook = {
          id: `book-${Date.now()}`,
          title: sub.title,
          author: sub.authorName,
          category: sub.category,
          categoryName: sub.category,
          ageGroup: sub.ageGroup,
          description: sub.description,
          coverImage: sub.coverImage,
          readCount: 1,
          rating: 5.0,
          pages: sub.pages && sub.pages.length > 0 ? sub.pages : [
            { text: sub.description || 'Materi ilmu pengetahuan anak.', funFact: 'Fakta sains anak menarik.', illustrationImage: sub.coverImage, audioUrl: null }
          ]
        };
        books.push(newBook);
        saveBooksData(books);
      } else {
        sub.status = 'rejected';
      }

      saveSubmissionsData(submissions);

      res.writeHead(200, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({
        success: true,
        message: action === 'approve' ? `Flipbook "${sub.title}" berhasil disetujui & diterbitkan ke perpustakaan!` : `Flipbook "${sub.title}" ditolak.`,
        data: sub
      }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({ success: false, error: 'Gagal meninjau pengajuan flipbook' }));
    }
    return;
  }

  // GET /api/categories - LIST CATEGORIES
  if (req.method === 'GET' && pathname === '/api/categories') {
    const categories = [
      { id: 'machinery', name: 'Mesin & Rekayasa', icon: '🚜' },
      { id: 'bridges', name: 'Jembatan & Jalan', icon: '🌉' },
      { id: 'buildings', name: 'Gedung & Arsitektur', icon: '🏙️' },
      { id: 'cranes', name: 'Sains & Mesin', icon: '🏗️' }
    ];
    res.writeHead(200, { 'Content-Type': MIME_TYPES['.json'] });
    res.end(JSON.stringify({ success: true, data: categories }));
    return;
  }

  // GET /api/stats - CMS STATS SUMMARY
  if (req.method === 'GET' && pathname === '/api/stats') {
    const books = getBooksData();
    const referrals = getReferralsData();
    let totalPages = 0;
    books.forEach(b => {
      totalPages += (b.pages ? b.pages.length * 2 : b.totalPages || 0);
    });

    let totalReferralRevenue = 0;
    let totalPartnerCommissions = 0;
    referrals.forEach(r => {
      totalReferralRevenue += (r.totalRevenue || 0);
      totalPartnerCommissions += (r.totalEarnings || 0);
    });

    res.writeHead(200, { 'Content-Type': MIME_TYPES['.json'] });
    res.end(JSON.stringify({
      success: true,
      stats: {
        totalBooks: books.length,
        totalPages: totalPages,
        publishedCount: books.filter(b => b.status === 'published').length,
        categoriesCount: 4,
        referralPartnersCount: referrals.length,
        totalReferralRevenue: totalReferralRevenue,
        totalPartnerCommissions: totalPartnerCommissions
      }
    }));
    return;
  }

  // GET /api/settings - GET NARRATOR AUDIO SETTINGS
  if (req.method === 'GET' && pathname === '/api/settings') {
    const SETTINGS_FILE = path.join(__dirname, 'data', 'settings.json');
    let settings = { narratorVoiceGender: 'female', narratorRate: 0.85, narratorPitch: 1.15, storytellerStyle: 'expressive_kids' };
    if (fs.existsSync(SETTINGS_FILE)) {
      try {
        settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
      } catch (e) {}
    }
    res.writeHead(200, { 'Content-Type': MIME_TYPES['.json'] });
    res.end(JSON.stringify({ success: true, settings }));
    return;
  }

  // POST /api/settings - SAVE NARRATOR AUDIO SETTINGS
  if (req.method === 'POST' && pathname === '/api/settings') {
    try {
      const body = await parseRequestBody(req);
      const SETTINGS_FILE = path.join(__dirname, 'data', 'settings.json');
      const dir = path.dirname(SETTINGS_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(body, null, 2), 'utf8');
      
      res.writeHead(200, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({ success: true, settings: body }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': MIME_TYPES['.json'] });
      res.end(JSON.stringify({ success: false, error: 'Gagal menyimpan pengaturan narator' }));
    }
    return;
  }

  // -------------------------------------------------------------
  // STATIC FILE SERVER FOR FRONTEND, ADMIN CMS & UPLOADED FILES
  // -------------------------------------------------------------
  let filePath;
  if (pathname.startsWith('/uploads/')) {
    filePath = path.join(PUBLIC_DIR, pathname);
  } else {
    filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('404 File Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 PUSTAKA CILIK & ADMIN CMS BACKEND API IS LIVE!`);
  console.log(`📌 Frontend Main App : http://localhost:${PORT}`);
  console.log(`🛠️ Backend Admin CMS: http://localhost:${PORT}/admin.html`);
  console.log(`🤝 Referral API     : http://localhost:${PORT}/api/referrals`);
  console.log(`==================================================\n`);
});
