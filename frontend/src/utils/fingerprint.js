// Browser Fingerprinting Utility
// Creates a unique browser fingerprint to track anonymous users

class BrowserFingerprint {
  constructor() {
    this.fingerprint = null;
  }

  // Generate canvas fingerprint
  async getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Draw unique pattern
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Your Bank Statement Converter 🏦', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Fingerprint Test 123', 4, 45);
      
      return canvas.toDataURL();
    } catch (e) {
      return 'canvas_error';
    }
  }

  // Generate WebGL fingerprint
  async getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return 'no_webgl';
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      
      return `${vendor}_${renderer}`;
    } catch (e) {
      return 'webgl_error';
    }
  }

  // Generate audio context fingerprint
  async getAudioFingerprint() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      
      oscillator.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(0);
      oscillator.stop(0.1);
      
      const freqData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(freqData);
      
      await audioContext.close();
      
      return Array.from(freqData.slice(0, 20)).join(',');
    } catch (e) {
      return 'audio_error';
    }
  }

  // Get screen and hardware info
  getScreenFingerprint() {
    return {
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      available: `${screen.availWidth}x${screen.availHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      hardwareConcurrency: navigator.hardwareConcurrency || 0
    };
  }

  // Get browser features
  getBrowserFeatures() {
    const features = {
      webgl: !!window.WebGLRenderingContext,
      webgl2: !!window.WebGL2RenderingContext,
      webrtc: !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia),
      canvas: !!window.CanvasRenderingContext2D,
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
      indexedDB: !!window.indexedDB,
      webWorker: !!window.Worker,
      fetch: !!window.fetch,
      touchSupport: 'ontouchstart' in window
    };
    
    return Object.entries(features).map(([k, v]) => `${k}:${v}`).join('|');
  }

  // Generate comprehensive fingerprint
  async generateFingerprint() {
    try {
      const [canvas, webgl, audio] = await Promise.all([
        this.getCanvasFingerprint(),
        this.getWebGLFingerprint(),
        this.getAudioFingerprint()
      ]);
      
      const screen = this.getScreenFingerprint();
      const features = this.getBrowserFeatures();
      
      // Combine all fingerprint components
      const fingerprintData = {
        canvas,
        webgl,
        audio,
        screen: screen.screen,
        timezone: screen.timezone,
        language: screen.language,
        platform: screen.platform,
        features,
        hardwareConcurrency: screen.hardwareConcurrency,
        timestamp: Date.now()
      };
      
      // Create hash from fingerprint data
      const fingerprintString = JSON.stringify(fingerprintData);
      const hash = await this.hashString(fingerprintString);
      
      this.fingerprint = hash;
      return hash;
    } catch (error) {
      console.error('Fingerprinting error:', error);
      // Fallback fingerprint
      const fallback = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.fingerprint = fallback;
      return fallback;
    }
  }

  // Hash string using Web Crypto API
  async hashString(str) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // Fallback to simple hash if crypto API not available
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(16);
    }
  }

  // Get or create fingerprint (with caching)
  async getFingerprint() {
    if (this.fingerprint) {
      return this.fingerprint;
    }
    
    // Try to get from sessionStorage first
    const cached = sessionStorage.getItem('browser_fingerprint');
    if (cached) {
      this.fingerprint = cached;
      return cached;
    }
    
    // Generate new fingerprint
    const fingerprint = await this.generateFingerprint();
    
    // Cache in sessionStorage
    sessionStorage.setItem('browser_fingerprint', fingerprint);
    
    return fingerprint;
  }
}

// Export singleton instance
export const browserFingerprint = new BrowserFingerprint();

// Convenience function
export const getBrowserFingerprint = () => browserFingerprint.getFingerprint();