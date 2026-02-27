import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoMic,
  IoMicOff,
  IoStop,
  IoCheckmark,
  IoClose,
  IoVolumeHigh,
  IoSparkles,
  IoRefresh,
  IoAlertCircle,
  IoInformationCircle
} from 'react-icons/io5';
import './VoiceInput.css';

// ─── Gemini API helper ────────────────────────────────────────────────────────
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

async function extractFieldsWithGemini(transcript) {
  const prompt = `
You are a smart assistant for a campus lost-and-found app.

A user described an item they lost or found using voice. Extract structured information from the transcript below and return ONLY a valid JSON object with these exact keys:

{
  "type": "lost" or "found" (detect from context, default to "lost"),
  "title": "short item name e.g. Black iPhone 15 Pro",
  "category": one of ["Electronics","Clothing","Bags & Accessories","Books & Stationery","Sports Equipment","Personal Items","Documents","Keys","Other"],
  "description": "a clean 1-2 sentence description using details mentioned",
  "location": "location mentioned, or empty string",
  "date": "date mentioned in YYYY-MM-DD format, or empty string"
}

Rules:
- Return ONLY the JSON object, no markdown, no code fences, no explanation.
- If a field cannot be determined, use an empty string.
- Infer category intelligently (e.g. phone/earbuds → Electronics, wallet → Personal Items, ID card → Documents).
- Title should be concise, 3–6 words max.

Transcript: "${transcript}"
`;

 const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 512 }
    })
  }
);

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || 'Gemini API error');
  }

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

// ─── Field display labels ─────────────────────────────────────────────────────
const FIELD_LABELS = {
  type:        'Type (Lost/Found)',
  title:       'Item Title',
  category:    'Category',
  description: 'Description',
  location:    'Location',
  date:        'Date'
};

const FIELD_ICONS = {
  type:        '🔖',
  title:       '📌',
  category:    '🗂️',
  description: '📝',
  location:    '📍',
  date:        '📅'
};

// ─── Main Component ───────────────────────────────────────────────────────────
const VoiceInput = ({ onTranscript, onAIFill, existingText = '', placeholder = '' }) => {
  const [isListening, setIsListening]             = useState(false);
  const [transcript, setTranscript]               = useState(existingText);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported]             = useState(false);
  const [error, setError]                         = useState(null);
  const [volume, setVolume]                       = useState(0);
  const [isProcessingAI, setIsProcessingAI]       = useState(false);
  const [aiResult, setAiResult]                   = useState(null);
  const [showPreview, setShowPreview]             = useState(false);
  const [appliedFields, setAppliedFields]         = useState([]);

  const recognitionRef = useRef(null);
  const analyserRef    = useRef(null);
  const audioCtxRef    = useRef(null);
  const animFrameRef   = useRef(null);

  // ── Setup Speech Recognition ──────────────────────────────────────────────
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setIsSupported(false); return; }
    setIsSupported(true);

    const rec = new SR();
    rec.continuous     = true;
    rec.interimResults = true;
    rec.lang           = 'en-US';

    rec.onstart = () => { setIsListening(true); setError(null); };
    rec.onend   = () => { setIsListening(false); setInterimTranscript(''); };
    rec.onerror = (e) => {
      const msgs = {
        'no-speech':   'No speech detected. Please try again.',
        'not-allowed': 'Microphone access denied. Please allow microphone access.',
      };
      setError(msgs[e.error] || 'Speech recognition error. Please retry.');
      setIsListening(false);
    };

    rec.onresult = (event) => {
      let interim = '';
      let final   = transcript;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += (final ? ' ' : '') + piece;
        else interim += piece;
      }
      setTranscript(final);
      setInterimTranscript(interim);
    };

    recognitionRef.current = rec;

    return () => {
      rec.stop();
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  useEffect(() => { setTranscript(existingText); }, [existingText]);

  // ── Audio Visualisation ───────────────────────────────────────────────────
  const startViz = async () => {
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx      = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current) return;
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setVolume(Math.min(avg / 100, 1));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch { /* visualization optional */ }
  };

  const stopViz = () => {
    if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setVolume(0);
  };

  const startListening = async () => {
    if (!isSupported || !recognitionRef.current) return;
    setError(null);
    setAiResult(null);
    setShowPreview(false);
    setAppliedFields([]);
    await startViz();
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    stopViz();
  };

  // ── Gemini AI ─────────────────────────────────────────────────────────────
  const handleAnalyseWithAI = async () => {
    if (!transcript.trim()) return;
    setIsProcessingAI(true);
    setError(null);
    setShowPreview(false);

    try {
      const result = await extractFieldsWithGemini(transcript.trim());
      setAiResult(result);
      setShowPreview(true);
    } catch (err) {
      setError(`AI parsing failed: ${err.message}. Make sure VITE_GEMINI_API_KEY is set.`);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleApplyAll = () => {
    if (!aiResult || !onAIFill) return;
    onAIFill(aiResult);
    setAppliedFields(Object.keys(aiResult).filter(k => aiResult[k]));
    setShowPreview(false);
  };

  const handleApplyField = (field) => {
    if (!onAIFill || appliedFields.includes(field)) return;
    onAIFill({ [field]: aiResult[field] });
    setAppliedFields(prev => [...prev, field]);
  };

  const handleRawTranscript = () => {
    onTranscript?.(transcript);
  };

  const handleClear = () => {
    setTranscript('');
    setInterimTranscript('');
    setAiResult(null);
    setShowPreview(false);
    setAppliedFields([]);
    setError(null);
  };

  // ── Unsupported ───────────────────────────────────────────────────────────
  if (!isSupported) {
    return (
      <div className="voice-input-unsupported">
        <IoMicOff />
        <p>Voice input is not supported in this browser.</p>
        <p className="suggestion">Try Chrome, Edge, or Safari.</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="voice-input-container">

      {/* Mic Button */}
      <div className="mic-button-wrapper">
        <AnimatePresence mode="wait">
          {!isListening ? (
            <motion.button
              key="start"
              className="mic-button"
              onClick={startListening}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <div className="mic-icon"><IoMic /></div>
              <span>Tap to speak</span>
              <small className="mic-hint">✨ Google Gemini AI will auto-fill your form</small>
            </motion.button>
          ) : (
            <motion.button
              key="stop"
              className="mic-button listening"
              onClick={stopListening}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <div className="mic-icon pulsing">
                <IoStop />
                <div className="volume-indicator" style={{ transform: `scale(${1 + volume * 0.6})` }} />
              </div>
              <span>Tap to stop</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Audio Bars */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            className="audio-visualization"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="sound-bars">
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  className="sound-bar"
                  animate={{ scaleY: 0.2 + volume * (0.8 + Math.sin(i * 0.9) * 0.3) }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </div>
            <div className="listening-text">
              <IoVolumeHigh />
              <span>Speak now — describe the item, its type and location…</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript Box */}
      <AnimatePresence>
        {(transcript || interimTranscript) && (
          <motion.div
            className="transcript-box"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="transcript-label">
              <IoInformationCircle /> What we heard
            </div>
            <div className="transcript-content">
              {transcript && <span className="final-transcript">{transcript}</span>}
              {interimTranscript && (
                <span className="interim-transcript"> {interimTranscript}</span>
              )}
            </div>

            {transcript && !isListening && (
              <motion.div className="transcript-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.button
                  className="action-btn ai-fill-btn"
                  onClick={handleAnalyseWithAI}
                  disabled={isProcessingAI}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isProcessingAI
                    ? <><span className="ai-spinner" /> Analysing with Google AI…</>
                    : <><IoSparkles /> Auto-fill with Google AI</>
                  }
                </motion.button>

                <button className="action-btn plain-btn" onClick={handleRawTranscript}>
                  <IoCheckmark /> Use as description only
                </button>

                <button className="action-btn clear-btn" onClick={handleClear}>
                  <IoClose />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Preview Panel */}
      <AnimatePresence>
        {showPreview && aiResult && (
          <motion.div
            className="ai-preview-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="ai-preview-header">
              <div className="ai-preview-title">
                <IoSparkles className="sparkle-anim" />
                <span>Google Gemini detected these fields</span>
              </div>
              <button className="close-preview-btn" onClick={() => setShowPreview(false)}>
                <IoClose />
              </button>
            </div>

            <div className="ai-fields-list">
              {Object.entries(aiResult).map(([field, value]) => {
                if (!value) return null;
                const applied = appliedFields.includes(field);
                return (
                  <motion.div
                    key={field}
                    className={`ai-field-row ${applied ? 'applied' : ''}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
                  >
                    <div className="field-info">
                      <span className="field-icon">{FIELD_ICONS[field]}</span>
                      <div>
                        <span className="field-name">{FIELD_LABELS[field] || field}</span>
                        <span className="field-value">{String(value)}</span>
                      </div>
                    </div>
                    <button
                      className={`apply-field-btn ${applied ? 'done' : ''}`}
                      onClick={() => handleApplyField(field)}
                      disabled={applied}
                    >
                      {applied ? <><IoCheckmark /> Applied</> : 'Apply'}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            <div className="ai-preview-footer">
              <motion.button
                className="apply-all-btn"
                onClick={handleApplyAll}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IoSparkles /> Apply All Fields to Form
              </motion.button>
              <button className="retry-btn" onClick={handleAnalyseWithAI}>
                <IoRefresh /> Re-analyse
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Applied Banner */}
      <AnimatePresence>
        {appliedFields.length > 0 && !showPreview && (
          <motion.div
            className="applied-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <IoCheckmark />
            AI filled: <strong>{appliedFields.map(f => FIELD_LABELS[f] || f).join(', ')}</strong>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="voice-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <IoAlertCircle /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      {!isListening && !transcript && (
        <motion.div className="voice-tips" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <p>💡 Try saying: <em>"I lost my black Samsung phone near the library on Monday"</em></p>
        </motion.div>
      )}

    </div>
  );
};

export default VoiceInput;
