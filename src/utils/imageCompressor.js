// Client-side lightweight image compressor for receipts and memos
// Resizes and compresses image to ~800px max width and ~80KB JPEG DataURL

export const compressReceiptImage = (file, maxWidth = 800, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('দয়া করে একটি সঠিক ছবির ফাইল নির্বাচন করুন।'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('ছবি প্রসেস করা সম্ভব হয়নি।'));
      img.src = readerEvent.target.result;
    };
    reader.onerror = () => reject(new Error('ফাইল পড়া সম্ভব হয়নি।'));
    reader.readAsDataURL(file);
  });
};

