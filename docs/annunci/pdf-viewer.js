// PDF.js must be loaded before this script
const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');
const pageInfo = document.getElementById('page-info');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

let pdfDoc = null;
let pageNum = 1;
let pageCount = 0;
let mediaFiles = [];
let currentMediaIndex = 0;

function renderPage(num) {
    pdfDoc.getPage(num).then(function(page) {
        // Fit PDF page to screen
        const maxWidth = window.innerWidth;
        const maxHeight = window.innerHeight;
        const viewport = page.getViewport({ scale: 1 });
        let scale = Math.max(
            Math.min(maxWidth / viewport.width, maxHeight / viewport.height),
            1
        );
        const scaledViewport = page.getViewport({ scale });
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        const renderContext = {
            canvasContext: ctx,
            viewport: scaledViewport
        };
        page.render(renderContext);
        pageInfo.textContent = `Pagina ${num} di ${pageCount}`;
        prevBtn.disabled = num <= 1;
        nextBtn.disabled = num >= pageCount;
    });
}

function loadPdf(index) {
    if (mediaFiles.length === 0) {
        pageInfo.textContent = 'Nessun file disponibile.';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }
    const url = 'locandine/' + mediaFiles[index];
    const ext = url.split('.').pop().toLowerCase();
    if (ext === 'pdf') {
        pdfjsLib.getDocument(url).promise.then(function(pdf) {
            pdfDoc = pdf;
            pageCount = pdf.numPages;
            pageNum = 1;
            renderPage(pageNum);
        });
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
        // Render image scaled to fit screen
        const img = new window.Image();
        img.onload = function() {
            const maxWidth = window.innerWidth;
            const maxHeight = window.innerHeight;
            let scale = Math.max(
                Math.min(maxWidth / img.width, maxHeight / img.height),
                1
            );
            const displayWidth = img.width * scale;
            const displayHeight = img.height * scale;
            canvas.width = displayWidth;
            canvas.height = displayHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
            pageInfo.textContent = 'Immagine';
            prevBtn.disabled = currentMediaIndex <= 0;
            nextBtn.disabled = currentMediaIndex >= mediaFiles.length - 1;
        };
        img.onerror = function() {
            pageInfo.textContent = 'Errore caricamento immagine.';
        };
        img.src = url;
    } else {
        pageInfo.textContent = 'Tipo file non supportato.';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

prevBtn.addEventListener('click', function() {
    if (mediaFiles.length === 0) return;
    const url = mediaFiles[currentMediaIndex];
    const ext = url.split('.').pop().toLowerCase();
    if (ext === 'pdf' && pageNum > 1) {
        pageNum--;
        renderPage(pageNum);
    } else if (currentMediaIndex > 0) {
        currentMediaIndex--;
        loadPdf(currentMediaIndex);
    }
});

nextBtn.addEventListener('click', function() {
    if (mediaFiles.length === 0) return;
    const url = mediaFiles[currentMediaIndex];
    const ext = url.split('.').pop().toLowerCase();
    if (ext === 'pdf' && pageNum < pageCount) {
        pageNum++;
        renderPage(pageNum);
    } else if (currentMediaIndex < mediaFiles.length - 1) {
        currentMediaIndex++;
        loadPdf(currentMediaIndex);
    }
});

// Fetch PDF list from pdf-list.json
function fetchPdfFiles() {
    fetch('locandine/pdf-list.json')
        .then(response => response.json())
        .then(files => {
            const today = new Date().toISOString().split('T')[0];
            mediaFiles = files;
            mediaFiles.sort((a, b) => {
                const dateA = a.match(/(\d{4}-\d{2}-\d{2})/)[1];
                const dateB = b.match(/(\d{4}-\d{2}-\d{2})/)[1];
                return dateB.localeCompare(dateA);
            });
            currentMediaIndex = 0;
            loadPdf(currentMediaIndex);
        })
        .catch(() => {
            pageInfo.textContent = 'Errore caricamento lista file.';
        });
}

// Initialize
fetchPdfFiles();

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
        prevBtn.click();
    } else if (e.key === 'ArrowRight') {
        nextBtn.click();
    }
});

// Touch swipe navigation
let touchStartX = null;
let touchEndX = null;
canvas.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
    }
});
canvas.addEventListener('touchend', function(e) {
    if (touchStartX !== null && e.changedTouches.length === 1) {
        touchEndX = e.changedTouches[0].clientX;
        const dx = touchEndX - touchStartX;
        if (Math.abs(dx) > 50) {
            if (dx < 0) {
                nextBtn.click(); // swipe left
            } else {
                prevBtn.click(); // swipe right
            }
        }
    }
    touchStartX = null;
    touchEndX = null;
});
