// WebAuthn Biometric & Device Screen Lock Helper for CashFlow
// Uses native browser Credentials API (zero external dependencies, 100% offline & local)

export const isWebAuthnSupported = () => {
  return typeof window !== 'undefined' && 
         window.PublicKeyCredential !== undefined &&
         typeof window.PublicKeyCredential === 'function';
};

export const isBiometricsAvailable = async () => {
  if (!isWebAuthnSupported()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (err) {
    console.warn('WebAuthn platform check error:', err);
    return false;
  }
};

// Generates a cryptographically random challenge Uint8Array
const getRandomChallenge = (length = 32) => {
  const arr = new Uint8Array(length);
  window.crypto.getRandomValues(arr);
  return arr;
};

// Converts ArrayBuffer to Base64
const bufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Converts Base64 to Uint8Array
const base64ToBuffer = (base64) => {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// Register the device's biometric / screen lock for the current user
export const registerDeviceBiometric = async (username = 'cashflow_user') => {
  if (!isWebAuthnSupported()) {
    throw new Error('আপনার ব্রাউজারে বায়োমেট্রিক বা WebAuthn সাপোর্ট নেই।');
  }

  const userId = new Uint8Array(16);
  window.crypto.getRandomValues(userId);

  const publicKeyCredentialCreationOptions = {
    challenge: getRandomChallenge(),
    rp: {
      name: 'CashFlow Fintech',
      id: window.location.hostname
    },
    user: {
      id: userId,
      name: username,
      displayName: username
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' },   // ES256
      { alg: -257, type: 'public-key' }  // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform', // Uses internal fingerprint/face/screen lock
      userVerification: 'preferred',       // Falls back to pattern/pin if sensor broken
      requireResidentKey: false
    },
    timeout: 60000,
    attestation: 'none'
  };

  try {
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    });

    if (credential) {
      const credIdBase64 = bufferToBase64(credential.rawId);
      localStorage.setItem('cashflow_biometric_cred_id', credIdBase64);
      localStorage.setItem('cashflow_biometric_enabled', 'true');
      return true;
    }
    return false;
  } catch (err) {
    console.error('Registration failed:', err);
    if (err.name === 'NotAllowedError') {
      throw new Error('বায়োমেট্রিক বা ডিভাইস স্ক্রিন লক পারমিশন বাতিল করা হয়েছে।');
    }
    throw new Error('ডিভাইস ভেরিফিকেশন সেটআপ করা যায়নি: ' + (err.message || ''));
  }
};

// Verify identity using biometric / device screen lock
export const verifyDeviceBiometric = async () => {
  if (!isWebAuthnSupported()) {
    throw new Error('আপনার ব্রাউজারে বায়োমেট্রিক সাপোর্ট নেই।');
  }

  const savedCredId = localStorage.getItem('cashflow_biometric_cred_id');
  const allowCredentials = savedCredId ? [{
    type: 'public-key',
    id: base64ToBuffer(savedCredId)
  }] : [];

  const publicKeyCredentialRequestOptions = {
    challenge: getRandomChallenge(),
    timeout: 60000,
    rpId: window.location.hostname,
    userVerification: 'preferred', // Allows screen PIN / Pattern if fingerprint hardware is unavailable
    ...(allowCredentials.length > 0 ? { allowCredentials } : {})
  };

  try {
    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions
    });

    return !!assertion;
  } catch (err) {
    console.warn('Verification failed or cancelled:', err);
    if (err.name === 'NotAllowedError') {
      return false; // User cancelled or failed
    }
    throw err;
  }
};

