import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fpPromise = null;

export const getBrowserFingerprint = async () => {
  try {
    if (!fpPromise) {
      fpPromise = FingerprintJS.load();
    }
    
    const fp = await fpPromise;
    const result = await fp.get();
    
    return result.visitorId;
  } catch (error) {
    console.error('Error generating fingerprint:', error);
    // Fallback fingerprint based on user agent and screen
    return `fallback_${navigator.userAgent.slice(0, 20)}_${screen.width}x${screen.height}`;
  }
};
