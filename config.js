// Configuration for WAV to MP3 conversion

// Number of channels (1 for mono, 2 for stereo)
// LameJS currently performs best with mono (1 channel) encoding.
export const channels = 1;

// Sample rate in Hz. If set to null, it will use the sample rate from the input WAV file.
// Common values: 44100, 48000.
// Using the source file's sample rate is generally recommended.
export const sampleRate = null; // Use source sample rate

// MP3 bitrate in kbps (kilobits per second).
// Higher values mean better quality but larger file size.
// Common values: 128, 192, 256, 320.
export const kbps = 128;
`````` index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WAV to MP3 Converter</title>
    <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@18.2.0",
        "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
        "lamejs": "https://cdn.jsdelivr.net/npm/lamejs@1.2.1/+esm",
        "lucide-react": "https://esm.sh/lucide-react@0.396.0",
        "@/components/ui/button": "./button.js",
        "./config.js": "./config.js"
      }
    }
    </script>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script type="module" src="app.js"></script>
</body>
</html>

// Configuration for WAV to MP3 conversion using LameJS

// Number of channels (1 for mono, 2 for stereo)
// LameJS is generally optimized and tested primarily for MONO (1 channel) encoding.
// While stereo *might* be technically possible with some versions/forks,
// sticking to 1 is highly recommended for stability and predictable results
// with the standard library.
export const channels = 1;

// Target Sample rate in Hz.
// If set to null, it will attempt to use the sample rate from the input WAV file.
// LameMP3Encoder supports sample rates like: 8000, 11025, 12000, 16000, 22050, 24000, 32000, 44100, 48000.
// Using the source sample rate is generally best if supported.
// If your source WAV has an unsupported rate (e.g., 96000Hz), you might need
// to resample *before* encoding (which this basic example doesn't do) or set a
// supported rate here (though quality might be affected if not resampled).
export const sampleRate = null; // null = Use source sample rate if possible and supported

// MP3 bitrate in kbps (kilobits per second).
// This determines the quality and file size. Higher values = better quality, larger file.
// Common values supported by LameJS include: 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320.
// 128 kbps is a common default for reasonable quality and size.
export const kbps = 128;

