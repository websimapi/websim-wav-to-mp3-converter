import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { channels, sampleRate, kbps } from './config.js';

const WavToMp3Converter = () => {
  const [convertedFile, setConvertedFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState(null);

  const convertWavToMp3 = async (wavFile) => {
    setIsConverting(true);
    setError(null);
    setConvertedFile(null);

    // Dynamically import Lamejs
    const lamejs = await import('lamejs');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const arrayBuffer = e.target.result;

          // Decode WAV data
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          // Get audio samples (use only the first channel for mono)
          const samples = audioBuffer.getChannelData(0);

          // Create MP3 encoder
          const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate || audioBuffer.sampleRate, kbps);

          // Convert float samples to 16-bit PCM
          const intSamples = new Int16Array(samples.length);
          for (let i = 0; i < samples.length; i++) {
            intSamples[i] = samples[i] < 0 ? samples[i] * 0x8000 : samples[i] * 0x7FFF;
          }

          // Encode MP3
          const mp3Data = [];
          const sampleBlockSize = 1152; // Standard sample block size for MP3
          for (let i = 0; i < intSamples.length; i += sampleBlockSize) {
            const sampleChunk = intSamples.subarray(i, i + sampleBlockSize);
            const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
            if (mp3buf.length > 0) {
              mp3Data.push(mp3buf);
            }
          }

          // Finish encoding
          const finalBuf = mp3encoder.flush();
          if (finalBuf.length > 0) {
            mp3Data.push(finalBuf);
          }

          // Combine MP3 data into a Blob
          const blob = new Blob(mp3Data, { type: 'audio/mp3' });
          resolve(blob);

        } catch (err) {
            if (err instanceof DOMException && err.name === 'EncodingError') {
                 reject(new Error('Could not decode audio data. Please ensure it is a valid WAV file.'));
             } else {
                 reject(new Error('An unexpected error occurred during conversion.'));
             }
             console.error("Conversion error details:", err);
        } finally {
          setIsConverting(false);
        }
      };

       reader.onerror = (e) => {
            setIsConverting(false);
            reject(new Error('Failed to read the file.'));
        };

      reader.readAsArrayBuffer(wavFile);
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'audio/wav') {
       try {
         const mp3Blob = await convertWavToMp3(file);
         setConvertedFile({
           blob: mp3Blob,
           name: file.name.replace(/\.wav$/i, '.mp3') // Case-insensitive replace
         });
       } catch (err) {
         setError(err.message);
         console.error('Conversion error:', err);
       }
     } else if (file) {
       setError('Please select a valid .wav file.');
       setConvertedFile(null); // Clear previous result if invalid file is chosen
     } else {
       // No file selected, clear any previous state
       setError(null);
       setConvertedFile(null);
     }
  };

  const downloadMp3 = () => {
    if (convertedFile) {
      const url = URL.createObjectURL(convertedFile.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = convertedFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="converter-container">
      <h2>WAV to MP3 Converter</h2>
       <p className="description">
         Convert your .wav audio files to .mp3 format directly in your browser.
       </p>
      <input
        type="file"
        id="fileInput"
        accept=".wav,audio/wav" // More specific accept attribute
        onChange={handleFileChange}
        disabled={isConverting}
        className="file-input"
      />
       <label htmlFor="fileInput" className={`file-label ${isConverting ? 'disabled' : ''}`}>
         {isConverting ? 'Converting...' : 'Choose WAV File'}
       </label>

      {error && <p className="error-message">Error: {error}</p>}

      {convertedFile && !isConverting && (
        <div className="result-section">
          <span className="file-name">{convertedFile.name}</span>
          <Button onClick={downloadMp3} className="download-button">
            <Download className="icon" />
            Download MP3
          </Button>
        </div>
      )}
       {isConverting && (
         <div className="loading-indicator">
           Converting, please wait...
           <div className="spinner"></div>
         </div>
       )}
    </div>
  );
};


const root = createRoot(document.getElementById('root'));
root.render(<WavToMp3Converter />);

import React, { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@/components/ui/button';
import { Download, UploadCloud } from 'lucide-react';
import { channels, sampleRate as configSampleRate, kbps } from './config.js';

// Helper to format bytes
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const WavToMp3Converter = () => {
  const [convertedFile, setConvertedFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0); // For potential future progress bar

  const convertWavToMp3 = useCallback(async (wavFile) => {
    setIsConverting(true);
    setError(null);
    setConvertedFile(null);
    setProgress(0);

    // Dynamically import Lamejs
    const lamejs = await import('lamejs');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const arrayBuffer = e.target.result;

          // Decode WAV data
          console.log('Decoding audio data...');
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          console.log(`Decoded: ${audioBuffer.duration}s, ${audioBuffer.sampleRate}Hz, ${audioBuffer.numberOfChannels} channels`);

          // Use configured sample rate or fallback to source rate
          const targetSampleRate = configSampleRate || audioBuffer.sampleRate;

          // Get audio samples (using only the first channel for mono as configured)
           // Ensure we handle potential mono/stereo input based on config
           if (channels > audioBuffer.numberOfChannels) {
                throw new Error(`Input file has ${audioBuffer.numberOfChannels} channels, but ${channels} channels were requested for encoding.`);
           }
           // For now, we hardcode to mono based on config.js and lamejs preference
           const samples = audioBuffer.getChannelData(0);


          console.log(`Using ${channels} channel(s), ${targetSampleRate}Hz sample rate, ${kbps}kbps bitrate.`);

          // Create MP3 encoder
          const mp3encoder = new lamejs.Mp3Encoder(channels, targetSampleRate, kbps);

          // Convert float samples to 16-bit PCM
          console.log('Converting samples to 16-bit PCM...');
          const sampleBlockSize = 1152; // Standard sample block size for MP3 encoding
          const mp3Data = [];
          const dataLength = samples.length;
          let samplesProcessed = 0;

           // Process in chunks
          for (let i = 0; i < dataLength; i += sampleBlockSize) {
                const rightBound = Math.min(i + sampleBlockSize, dataLength);
                const sampleChunkFloat = samples.subarray(i, rightBound);

                // Convert the chunk to Int16
                const sampleChunkInt = new Int16Array(sampleChunkFloat.length);
                for (let j = 0; j < sampleChunkFloat.length; j++) {
                     // Clamp values to avoid issues and scale
                     const val = Math.max(-1, Math.min(1, sampleChunkFloat[j]));
                     sampleChunkInt[j] = val < 0 ? val * 0x8000 : val * 0x7FFF;
                }

               // Encode chunk
               const mp3buf = mp3encoder.encodeBuffer(sampleChunkInt);
               if (mp3buf.length > 0) {
                 mp3Data.push(mp3buf);
               }
                 samplesProcessed += sampleChunkFloat.length;
                 // Basic progress update (can be refined)
                 setProgress(Math.round((samplesProcessed / dataLength) * 95)); // Cap at 95% before flush
          }


          // Finish encoding
          console.log('Flushing encoder...');
          const finalBuf = mp3encoder.flush();
          if (finalBuf.length > 0) {
            mp3Data.push(finalBuf);
          }
           setProgress(100);

          // Combine MP3 data into a Blob
          const blob = new Blob(mp3Data, { type: 'audio/mp3' });
          console.log(`Conversion complete. MP3 size: ${formatBytes(blob.size)}`);
          resolve(blob);

        } catch (err) {
            console.error("Conversion process error:", err);
             if (err instanceof DOMException && err.name === 'EncodingError') {
                 reject(new Error('Could not decode audio data. Please ensure it is a valid, uncorrupted WAV file.'));
             } else if (err.message.includes("sample rate") || err.message.includes("channel")) {
                 reject(new Error(`Audio format error: ${err.message}`));
             }
              else {
                 reject(new Error('An unexpected error occurred during conversion. Check console for details.'));
             }
        } finally {
          setIsConverting(false);
        }
      };

       reader.onerror = (e) => {
            console.error("File reading error:", e);
            setIsConverting(false);
            reject(new Error('Failed to read the file.'));
        };

      console.log(`Reading file: ${wavFile.name} (${formatBytes(wavFile.size)})`);
      reader.readAsArrayBuffer(wavFile);
    });
  }, []); // useCallback with empty dependency array

  const handleFileChange = useCallback(async (event) => {
    const file = event.target.files[0];
     // Reset file input visually if needed, allows selecting the same file again
     event.target.value = null;

    if (file) {
        setFileName(file.name); // Show selected file name immediately
        if (file.type === 'audio/wav' || file.name.toLowerCase().endsWith('.wav')) {
            try {
                const mp3Blob = await convertWavToMp3(file);
                setConvertedFile({
                    blob: mp3Blob,
                    name: file.name.replace(/\.wav$/i, '.mp3') // Case-insensitive replace
                });
                setError(null); // Clear previous errors on success
            } catch (err) {
                setError(err.message);
                setConvertedFile(null); // Clear previous result on error
            }
        } else {
            setError('Invalid file type. Please select a .wav file.');
            setConvertedFile(null); // Clear previous result
            setFileName(''); // Clear filename display
        }
    } else {
        // No file selected scenario (e.g., user cancels dialog)
        // Keep existing error/result state or clear it based on desired UX
        // setError(null);
        // setConvertedFile(null);
        // setFileName('');
    }
  }, [convertWavToMp3]); // Depend on convertWavToMp3


  const downloadMp3 = useCallback(() => {
    if (convertedFile) {
      const url = URL.createObjectURL(convertedFile.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = convertedFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up the object URL
    }
  }, [convertedFile]); // Depend on convertedFile

  return (
    <div className="converter-container">
      <h2>WAV to MP3 Converter</h2>
       <p className="description">
         Convert your <code>.wav</code> audio files to <code>.mp3</code> format directly in your browser using LameJS.
       </p>

       <input
         type="file"
         id="fileInput"
         accept=".wav,audio/wav" // Be specific
         onChange={handleFileChange}
         disabled={isConverting}
         className="file-input" // Hidden visually
       />
        {/* Custom styled label acting as the button */}
       <label htmlFor="fileInput" className={`file-label button-style ${isConverting ? 'disabled' : ''}`}>
         <UploadCloud className="icon" />
         {fileName ? `Selected: ${fileName}` : 'Choose WAV File'}
       </label>

       {isConverting && (
         <div className="progress-indicator">
           <div className="progress-bar-container">
             <div
               className="progress-bar"
               style={{ width: `${progress}%` }}
             ></div>
           </div>
           <span>Converting... {progress}%</span>
         </div>
       )}

      {error && <p className="error-message">Error: {error}</p>}

      {convertedFile && !isConverting && (
        <div className="result-section">
          <div className="result-info">
            <span className="file-name">{convertedFile.name}</span>
            <span className="file-size">({formatBytes(convertedFile.blob.size)})</span>
           </div>
          <Button onClick={downloadMp3} className="download-button button-style">
            <Download className="icon" />
            Download MP3
          </Button>
        </div>
      )}
       <footer className="info-footer">
            Conversion happens entirely in your browser. No files are uploaded.
            <br />
            Using LameJS v1.2.1. Config: {channels}ch, {configSampleRate || 'source'}Hz, {kbps}kbps.
        </footer>
    </div>
  );
};


const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <WavToMp3Converter />
    </React.StrictMode>
);

