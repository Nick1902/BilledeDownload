let uploadedImageData = null;
let dragOffset = { x: 0, y: 0 };
let imageScale = 1;

let previewScale = 1;
const basePreviewSize = 500;

const activePointers = new Map();
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let dragStartOffset = { x: 0, y: 0 };
let pinchStartDistance = null;
let pinchStartScale = null;

const imageUpload = document.getElementById('imageUpload');
const uploadedImage = document.getElementById('uploadedImage');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const previewEl = document.getElementById('preview');
const imageBox = document.getElementById('imageBox');
const nameInput = document.getElementById('nameInput');
const titleInput = document.getElementById('titleInput');
const companyInput = document.getElementById('companyInput');
const standInput = document.getElementById('standInput');
const namePreview = document.getElementById('namePreview');
const titlePreview = document.getElementById('titlePreview');
const companyPreview = document.getElementById('companyPreview');
const standBadge = document.getElementById('standBadge');
const standText = document.getElementById('standText');
const generateBtn = document.getElementById('generateBtn');

imageUpload.addEventListener('change', handleImageUpload);
nameInput.addEventListener('input', updateTextPreview);
titleInput.addEventListener('input', updateTextPreview);
companyInput.addEventListener('input', updateTextPreview);
standInput.addEventListener('input', updateStandBadge);
generateBtn.addEventListener('click', generateFinalImage);

imageBox.addEventListener('pointerdown', onPointerDown);
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUpOrCancel);
window.addEventListener('pointercancel', onPointerUpOrCancel);
imageBox.addEventListener('wheel', onWheel, { passive: false });
imageBox.addEventListener('dblclick', resetImageTransform);
window.addEventListener('resize', updatePreviewScale);
updatePreviewScale();

uploadedImage.addEventListener('dragstart', (e) => e.preventDefault());
imageBox.addEventListener('dragstart', (e) => e.preventDefault());

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Vælg venligst en billedfil (JPG, PNG, etc.)');
        e.target.value = '';
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        alert('Billedet er for stort. Vælg venligst et billede under 10MB');
        e.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        uploadedImageData = event.target.result;
        
        const img = new Image();
        img.onload = function() {
            uploadedImage.src = uploadedImageData;
            uploadedImage.classList.add('active');
            uploadPlaceholder.classList.add('hidden');
            generateBtn.disabled = false;
            resetImageTransform();
        };
        
        img.onerror = function() {
            alert('Kunne ikke indlæse billedet. Prøv venligst et andet billede');
            uploadedImageData = null;
            e.target.value = '';
        };
        
        img.src = uploadedImageData;
    };
    
    reader.onerror = function() {
        alert('Fejl ved læsning af filen. Prøv venligst igen');
        e.target.value = '';
    };
    
    reader.readAsDataURL(file);
}

function updatePreviewScale() {
    const rect = previewEl.getBoundingClientRect();
    const renderedWidth = rect.width;
    previewScale = renderedWidth > 0 ? renderedWidth / basePreviewSize : 1;
}

function applyImageTransform() {
    uploadedImage.style.transform = `translate(calc(-50% + ${dragOffset.x}px), calc(-50% + ${dragOffset.y}px)) scale(${imageScale})`;
}

function resetImageTransform() {
    dragOffset = { x: 0, y: 0 };
    imageScale = 1;
    applyImageTransform();
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function getPointerPosInBaseCoords(e) {
    const rect = previewEl.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) / previewScale,
        y: (e.clientY - rect.top) / previewScale
    };
}

function getDistance(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function onPointerDown(e) {
    if (!uploadedImageData) return;

    e.preventDefault();
    e.stopPropagation();

    imageBox.setPointerCapture(e.pointerId);
    const pos = getPointerPosInBaseCoords(e);
    activePointers.set(e.pointerId, pos);

    if (activePointers.size === 1) {
        isDragging = true;
        imageBox.classList.add('dragging');
        dragStart = pos;
        dragStartOffset = { ...dragOffset };
    } else if (activePointers.size === 2) {
        isDragging = false;
        imageBox.classList.remove('dragging');
        const pts = Array.from(activePointers.values());
        pinchStartDistance = getDistance(pts[0], pts[1]);
        pinchStartScale = imageScale;
    }
}

function onPointerMove(e) {
    if (!activePointers.has(e.pointerId)) return;
    const pos = getPointerPosInBaseCoords(e);
    activePointers.set(e.pointerId, pos);

    if (activePointers.size === 1 && isDragging) {
        const dx = pos.x - dragStart.x;
        const dy = pos.y - dragStart.y;
        dragOffset = {
            x: dragStartOffset.x + dx,
            y: dragStartOffset.y + dy
        };
        applyImageTransform();
        return;
    }

    if (activePointers.size === 2 && pinchStartDistance && pinchStartScale) {
        const pts = Array.from(activePointers.values());
        const dist = getDistance(pts[0], pts[1]);
        const ratio = dist / pinchStartDistance;
        const newScale = clamp(pinchStartScale * ratio, 0.5, 2.0);
        
        if (newScale !== imageScale) {
            imageScale = newScale;
            applyImageTransform();
        }
    }
}

function onPointerUpOrCancel(e) {
    if (activePointers.has(e.pointerId)) {
        activePointers.delete(e.pointerId);
    }

    if (activePointers.size === 0) {
        isDragging = false;
        imageBox.classList.remove('dragging');
        pinchStartDistance = null;
        pinchStartScale = null;
    }

    if (activePointers.size === 1) {
        // Reset pinch state when going back to single pointer.
        pinchStartDistance = null;
        pinchStartScale = null;
        const remaining = Array.from(activePointers.values())[0];
        isDragging = true;
        imageBox.classList.add('dragging');
        dragStart = remaining;
        dragStartOffset = { ...dragOffset };
    }
}

function onWheel(e) {
    if (!uploadedImageData) return;
    e.preventDefault();

    const direction = Math.sign(e.deltaY);
    const factor = direction > 0 ? 0.95 : 1.05;
    imageScale = clamp(imageScale * factor, 0.5, 2.0);
    applyImageTransform();
}

function updateTextPreview() {
    namePreview.textContent = nameInput.value || 'NAVN';
    titlePreview.textContent = titleInput.value || 'TITEL';
    companyPreview.textContent = companyInput.value || 'VIRKSOMHED';
}

function updateStandBadge() {
    const standValue = standInput.value.trim();
    if (standValue) {
        standBadge.style.display = 'flex';
        standText.innerHTML = `STAND<br>${standValue}`;
    } else {
        standBadge.style.display = 'none';
    }
}

function generateFinalImage() {
    if (!uploadedImageData) {
        alert('Upload venligst et billede først');
        return;
    }
    
    const name = nameInput.value.trim();
    const title = titleInput.value.trim();
    const company = companyInput.value.trim();
    
    if (!name || !title || !company) {
        alert('Udfyld venligst alle felter (Navn, Titel og Virksomhed)');
        return;
    }
    
    generateBtn.disabled = true;
    generateBtn.classList.add('loading');
    generateBtn.innerHTML = '<span class="spinner"></span> Genererer billede...';
    
    const canvas = document.getElementById('outputCanvas');
    const ctx = canvas.getContext('2d');
    
    const width = 1000;
    const height = 1000;
    canvas.width = width;
    canvas.height = height;
    
    const backgroundImg = document.getElementById('backgroundImage');
    
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.onload = function() {
        ctx.drawImage(bgImg, 0, 0, width, height);
        
        const layout = getLayoutForExport(width, height);

        if (uploadedImageData) {
            const userImg = new Image();
            userImg.onload = function() {
                const { boxX, boxY, boxWidth, boxHeight, boxRadius } = layout;
                
                ctx.save();
                ctx.beginPath();
                ctx.roundRect(boxX, boxY, boxWidth, boxHeight, boxRadius);
                ctx.clip();

                const scaleValue = imageScale;
                
                const imgWidth = userImg.width;
                const imgHeight = userImg.height;
                const aspectRatio = imgWidth / imgHeight;
                
                let drawWidth, drawHeight;
                if (aspectRatio > 1) {
                    drawHeight = boxHeight * scaleValue;
                    drawWidth = drawHeight * aspectRatio;
                } else {
                    drawWidth = boxWidth * scaleValue;
                    drawHeight = drawWidth / aspectRatio;
                }
                
                const centerX = boxX + boxWidth / 2;
                const centerY = boxY + boxHeight / 2;
                const offsetX = dragOffset.x * layout.exportScale;
                const offsetY = dragOffset.y * layout.exportScale;
                
                ctx.drawImage(
                    userImg,
                    centerX - drawWidth / 2 + offsetX,
                    centerY - drawHeight / 2 + offsetY,
                    drawWidth,
                    drawHeight
                );
                
                ctx.restore();
                
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.roundRect(boxX, boxY, boxWidth, boxHeight, boxRadius);
                ctx.stroke();
                
                drawStandBadge(ctx, layout);
                drawText(ctx, layout);
                
                downloadImage(canvas);
            };
            userImg.src = uploadedImageData;
        } else {
            drawStandBadge(ctx, layout);
            drawText(ctx, layout);
            downloadImage(canvas);
        }
    };
    
    bgImg.onerror = function() {
        alert('Fejl: Kunne ikke indlæse baggrundsbilledet');
        generateBtn.disabled = false;
        generateBtn.classList.remove('loading');
        generateBtn.textContent = 'Hent billede';
    };
    
    bgImg.src = backgroundImg.src;
}

function getLayoutForExport(canvasWidth, canvasHeight) {
    const previewRect = previewEl.getBoundingClientRect();
    const boxRect = imageBox.getBoundingClientRect();
    const badgeRect = standBadge.getBoundingClientRect();
    const nameRect = namePreview.getBoundingClientRect();
    const titleRect = titlePreview.getBoundingClientRect();
    const companyRect = companyPreview.getBoundingClientRect();

    const boxBorderRadiusPx = parseFloat(getComputedStyle(imageBox).borderRadius) || 0;

    const exportScale = canvasWidth / basePreviewSize;

    const baseBoxX = (boxRect.left - previewRect.left) / previewScale;
    const baseBoxY = (boxRect.top - previewRect.top) / previewScale;
    const baseBoxW = boxRect.width / previewScale;
    const baseBoxH = boxRect.height / previewScale;

    const baseBadgeX = (badgeRect.left - previewRect.left) / previewScale;
    const baseBadgeY = (badgeRect.top - previewRect.top) / previewScale;
    const baseBadgeW = badgeRect.width / previewScale;
    const baseBadgeH = badgeRect.height / previewScale;

    const baseNameX = ((nameRect.left - previewRect.left) + nameRect.width / 2) / previewScale;
    const baseNameY = ((nameRect.top - previewRect.top) + nameRect.height / 2) / previewScale;
    const baseTitleY = ((titleRect.top - previewRect.top) + titleRect.height / 2) / previewScale;
    const baseCompanyY = ((companyRect.top - previewRect.top) + companyRect.height / 2) / previewScale;

    return {
        exportScale,
        boxX: baseBoxX * exportScale,
        boxY: baseBoxY * exportScale,
        boxWidth: baseBoxW * exportScale,
        boxHeight: baseBoxH * exportScale,
        boxRadius: (boxBorderRadiusPx / previewScale) * exportScale,
        badgeX: baseBadgeX * exportScale,
        badgeY: baseBadgeY * exportScale,
        badgeWidth: baseBadgeW * exportScale,
        badgeHeight: baseBadgeH * exportScale,
        nameX: baseNameX * exportScale,
        nameY: baseNameY * exportScale,
        titleY: baseTitleY * exportScale,
        companyY: baseCompanyY * exportScale,
        canvasWidth,
        canvasHeight
    };
}

function drawText(ctx, layout) {
    const name = nameInput.value || 'NAVN';
    const title = titleInput.value || 'TITEL';
    const company = companyInput.value || 'VIRKSOMHED';

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 72px Arial, sans-serif';
    ctx.fillText(name, layout.nameX, layout.nameY);
    
    ctx.font = '48px Arial, sans-serif';
    ctx.fillText(title, layout.nameX, layout.titleY);
    ctx.fillText(company, layout.nameX, layout.companyY);
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

function drawStandBadge(ctx, layout) {
    const standValue = standInput.value.trim();
    if (!standValue) return;

    const radius = Math.min(layout.badgeWidth, layout.badgeHeight) / 2;
    const badgeCenterX = layout.badgeX + layout.badgeWidth / 2;
    const badgeCenterY = layout.badgeY + layout.badgeHeight / 2;
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(badgeCenterX, badgeCenterY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 36px Arial, sans-serif';
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    ctx.fillText('STAND', badgeCenterX, badgeCenterY - 20 * layout.exportScale);
    ctx.fillText(standValue, badgeCenterX, badgeCenterY + 20 * layout.exportScale);
}

function downloadImage(canvas) {
    canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const name = nameInput.value.trim();
        const sanitizedName = name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[æ]/g, 'ae')
            .replace(/[ø]/g, 'oe')
            .replace(/[å]/g, 'aa')
            .replace(/[^a-z0-9-]/g, '');
        
        a.download = `${sanitizedName}-billede.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        generateBtn.disabled = false;
        generateBtn.classList.remove('loading');
        generateBtn.textContent = 'Hent billede';
        alert('Dit billede er blevet downloadet!');
    }, 'image/png');
}

if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        this.beginPath();
        this.moveTo(x + radius, y);
        this.arcTo(x + width, y, x + width, y + height, radius);
        this.arcTo(x + width, y + height, x, y + height, radius);
        this.arcTo(x, y + height, x, y, radius);
        this.arcTo(x, y, x + width, y, radius);
        this.closePath();
        return this;
    };
}
