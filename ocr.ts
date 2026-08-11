import Tesseract from 'tesseract.js';

export const supportedLanguages = [
  { code: 'eng', name: 'English', flag: '🇬🇧' },
  { code: 'hin', name: 'Hindi', flag: '🇮🇳' },
  { code: 'tam', name: 'Tamil', flag: '🇮🇳' },
  { code: 'tel', name: 'Telugu', flag: '🇮🇳' },
  { code: 'kan', name: 'Kannada', flag: '🇮🇳' },
  { code: 'mal', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'ben', name: 'Bengali', flag: '🇧🇩' },
  { code: 'guj', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'mar', name: 'Marathi', flag: '🇮🇳' },
  { code: 'pan', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'ara', name: 'Arabic', flag: '🇸🇦' },
  { code: 'spa', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fra', name: 'French', flag: '🇫🇷' },
  { code: 'deu', name: 'German', flag: '🇩🇪' },
  { code: 'ita', name: 'Italian', flag: '🇮🇹' },
  { code: 'por', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'rus', name: 'Russian', flag: '🇷🇺' },
  { code: 'chi_sim', name: 'Chinese Simplified', flag: '🇨🇳' },
  { code: 'chi_tra', name: 'Chinese Traditional', flag: '🇹🇼' },
  { code: 'jpn', name: 'Japanese', flag: '🇯🇵' },
  { code: 'kor', name: 'Korean', flag: '🇰🇷' },
  { code: 'tha', name: 'Thai', flag: '🇹🇭' },
  { code: 'vie', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'tur', name: 'Turkish', flag: '🇹🇷' },
  { code: 'pol', name: 'Polish', flag: '🇵🇱' },
  { code: 'nld', name: 'Dutch', flag: '🇳🇱' },
  { code: 'swe', name: 'Swedish', flag: '🇸🇪' },
  { code: 'nor', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'dan', name: 'Danish', flag: '🇩🇰' },
  { code: 'fin', name: 'Finnish', flag: '🇫🇮' },
];

export interface OCRProgress {
  status: string;
  progress: number;
}

// Image preprocessing for better OCR accuracy
const preprocessImage = async (imageFile: File | string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      try {
        if (!ctx) throw new Error('Canvas context not available');

        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply grayscale and contrast enhancement
        for (let i = 0; i < data.length; i += 4) {
          // Grayscale
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          
          // Increase contrast
          const contrast = 1.5;
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          const enhanced = factor * (gray - 128) + 128;
          
          // Apply thresholding for better text clarity
          const threshold = enhanced > 128 ? 255 : 0;
          
          data[i] = threshold;
          data[i + 1] = threshold;
          data[i + 2] = threshold;
        }

        // Put processed image data back
        ctx.putImageData(imageData, 0, 0);

        // Return processed image as data URL
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    if (typeof imageFile === 'string') {
      img.src = imageFile;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(imageFile);
    }
  });
};

export const performOCR = async (
  imageFile: File | string,
  language: string = 'eng',
  onProgress?: (progress: OCRProgress) => void
): Promise<string> => {
  try {
    // Preprocess image for better accuracy
    const preprocessedImage = await preprocessImage(imageFile);

    const worker = await Tesseract.createWorker(language, 1, {
      logger: (m) => {
        if (onProgress && m.status) {
          onProgress({
            status: m.status,
            progress: m.progress || 0,
          });
        }
      },
    });

    // Configure Tesseract for better accuracy
    await worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
      preserve_interword_spaces: '1',
    });

    const { data } = await worker.recognize(preprocessedImage);
    await worker.terminate();

    return data.text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
};

export interface ConversionHistory {
  id: string;
  timestamp: number;
  image: string;
  text: string;
  language: string;
  languageName: string;
}

export const saveToHistory = (conversion: Omit<ConversionHistory, 'id' | 'timestamp'>): ConversionHistory => {
  const history = getHistory();
  const newEntry: ConversionHistory = {
    ...conversion,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  
  const updatedHistory = [newEntry, ...history].slice(0, 50); // Keep last 50
  localStorage.setItem('ocr_history', JSON.stringify(updatedHistory));
  
  return newEntry;
};

export const getHistory = (): ConversionHistory[] => {
  try {
    const stored = localStorage.getItem('ocr_history');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const deleteHistoryItem = (id: string): void => {
  const history = getHistory();
  const updated = history.filter(item => item.id !== id);
  localStorage.setItem('ocr_history', JSON.stringify(updated));
};

export const clearHistory = (): void => {
  localStorage.removeItem('ocr_history');
};
