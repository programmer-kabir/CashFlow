// Bangla & English Speech Recognition Engine for CashFlow
// Converts natural spoken language into accurate cash flow transaction data

const BENGALI_DIGITS = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
};

const BENGALI_WORDS_TO_NUM = {
  'এক': 1, 'দুই': 2, 'তিন': 3, 'চার': 4, 'পাঁচ': 5,
  'ছয়': 6, 'সাত': 7, 'আট': 8, 'নয়': 9, 'দশ': 10,
  'বিশ': 20, 'ত্রিশ': 30, 'চল্লিশ': 40, 'পঞ্চাশ': 50,
  'ষাট': 60, 'সত্তর': 70, 'আশি': 80, 'নব্বই': 90,
  'একশ': 100, 'একশো': 100, 'দুশ': 200, 'তিনশ': 300,
  'পাঁচশ': 500, 'পাঁচশো': 500, 'হাজার': 1000
};

export const normalizeBengaliDigits = (str) => {
  return str.replace(/[০-৯]/g, (d) => BENGALI_DIGITS[d] || d);
};

export const parseVoiceTranscript = (rawText) => {
  if (!rawText) return null;
  const normalized = normalizeBengaliDigits(rawText.toLowerCase().trim());

  let type = 'cash_out';
  let category = '';
  let amount = null;
  let personName = '';
  let note = rawText;

  // 1. Detect Cash In vs Cash Out
  const cashInKeywords = [
    'পেলাম', 'পেলুম', 'আয়', 'ইনকাম', 'বেতন', 'স্যালারি', 'লাভ', 
    'income', 'salary', 'received', 'deposit', 'পাওয়া', 'জমা'
  ];

  if (cashInKeywords.some(kw => normalized.includes(kw))) {
    type = 'cash_in';
  }

  // 2. Detect Person Name (e.g. "সাইজিদকে দিলাম" or "আবু বক্কর থেকে পেলাম")
  const personMatch = normalized.match(/([a-zA-Z\u0980-\u09FF\s]+?)\s*(কে দিলাম|থেকে পেলাম|কে ধার|এর কাছ থেকে)/);
  if (personMatch) {
    const rawPerson = personMatch[1].trim();
    // exclude generic words
    if (!['আজকে', 'আমি', 'টাকা'].includes(rawPerson)) {
      personName = rawPerson;
    }
  }

  // 3. Category Detection
  if (normalized.includes('খাবার') || normalized.includes('বিরিয়ানি') || normalized.includes('ভাত') || normalized.includes('ডিনার') || normalized.includes('লাঞ্চ') || normalized.includes('নাস্তা') || normalized.includes('food') || normalized.includes('dinner')) {
    category = 'Food & Groceries';
  } else if (normalized.includes('রিকশা') || normalized.includes('বাস') || normalized.includes('উবার') || normalized.includes('ভাড়া') || normalized.includes('তেল') || normalized.includes('গাড়ি') || normalized.includes('transport') || normalized.includes('uber')) {
    category = 'Transport & Fuel';
  } else if (normalized.includes('চা') || normalized.includes('সিগারেট') || normalized.includes('কফি') || normalized.includes('পান') || normalized.includes('tea') || normalized.includes('coffee')) {
    category = 'Cigarette & Tea';
  } else if (normalized.includes('বিল') || normalized.includes('কারেন্ট') || normalized.includes('বিদ্যুৎ') || normalized.includes('ওয়াইফাই') || normalized.includes('ইন্টারনেট') || normalized.includes('wifi') || normalized.includes('bill')) {
    category = 'Bills & Utilities';
  } else if (normalized.includes('শপিং') || normalized.includes('জামা') || normalized.includes('কাপড়') || normalized.includes('জুতা') || normalized.includes('shopping')) {
    category = 'Shopping & Clothes';
  } else if (normalized.includes('বিনোদন') || normalized.includes('সিনেমা') || normalized.includes('মুভি') || normalized.includes('movie')) {
    category = 'Entertainment & OTT';
  } else if (normalized.includes('পার্টি') || normalized.includes('আড্ডা') || normalized.includes('party')) {
    category = 'Party & Dine Out';
  } else if (normalized.includes('বেতন') || normalized.includes('স্যালারি') || normalized.includes('salary')) {
    category = 'Salary';
  } else if (normalized.includes('ফ্রিল্যান্স') || normalized.includes('প্রজেক্ট') || normalized.includes('ক্লায়েন্ট') || normalized.includes('freelance')) {
    category = 'Freelance & Projects';
  } else if (normalized.includes('ব্যবসা') || normalized.includes('দোকান') || normalized.includes('বিক্রি') || normalized.includes('business')) {
    category = 'Business Profit';
  } else if (normalized.includes('উপহার') || normalized.includes('গিফট') || normalized.includes('gift')) {
    category = 'Gift & Reward';
  }

  // 4. Extract Amount
  // A) Match numeric digits e.g. "450", "2000", "25000", or "15 হাজার"
  const numRegex = /(\d+(\.\d+)?)\s*(হাজার|লাখ|শ|শো|k)?/i;
  const match = normalized.match(numRegex);

  if (match) {
    let num = parseFloat(match[1]);
    const multiplier = (match[3] || '').toLowerCase();
    if (multiplier === 'হাজার' || multiplier === 'k') {
      num *= 1000;
    } else if (multiplier === 'লাখ') {
      num *= 100000;
    } else if (multiplier === 'শ' || multiplier === 'শো') {
      num *= 100;
    }
    amount = num;
  } else {
    // B) Check Bengali number words
    for (const [w, val] of Object.entries(BENGALI_WORDS_TO_NUM)) {
      if (normalized.includes(w)) {
        amount = val;
        break;
      }
    }
  }

  return {
    type,
    category: category || (type === 'cash_in' ? 'Salary' : 'Food & Groceries'),
    amount: amount || '',
    personName,
    note: rawText
  };
};

export const startSpeechToText = ({ onResult, onError, onEnd, onListening }) => {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    onError && onError('আপনার ব্রাউজার ভয়েস রিকগনিশন সাপোর্ট করে না। অনুগ্রহ করে Google Chrome বা Microsoft Edge ব্যবহার করুন।');
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.lang = 'bn-BD'; // বাংলা (বাংলাদেশ)
    recognition.continuous = false;
    recognition.interimResults = true; // Show words as spoken

    onListening && onListening();

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const textToParse = finalTranscript || interimTranscript;
      const parsed = parseVoiceTranscript(textToParse);
      onResult && onResult(parsed, textToParse, !!finalTranscript);
    };

    recognition.onerror = (event) => {
      let msg = 'ভয়েস শনাক্ত করা যায়নি। আবার চেষ্টা করুন।';
      if (event.error === 'not-allowed') {
        msg = 'মাইক্রোফোন পারমিশন প্রয়োজন। অনুগ্রহ করে ব্রাউজারে মাইক পারমিশন Allow করুন।';
      }
      onError && onError(msg);
    };

    recognition.onend = () => {
      onEnd && onEnd();
    };

    recognition.start();
    return recognition;
  } catch (err) {
    onError && onError(err.message);
    return null;
  }
};
