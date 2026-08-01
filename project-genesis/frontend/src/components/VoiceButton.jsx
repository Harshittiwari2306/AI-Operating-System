import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceButton = ({ onActionTriggered }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const navigate = useNavigate();

  let recognition = null;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
  }

  const speakFeedback = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1; // Slightly futuristic synthetic tone
      window.speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (!recognition) {
      const msg = "Voice recognition is not supported in this browser. Please try Chrome or Edge.";
      setFeedbackText(msg);
      speakFeedback(msg);
      return;
    }

    try {
      setIsListening(true);
      setTranscript('');
      setFeedbackText('Listening...');
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  };

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = async (event) => {
      const speechToText = event.results[0][0].transcript;
      setTranscript(speechToText);
      setIsListening(false);
      setFeedbackText(`Interpreting: "${speechToText}"`);

      try {
        const res = await axios.post('/api/voice/command', { transcript: speechToText });
        const { action, params, feedback } = res.data;

        setFeedbackText(feedback);
        speakFeedback(feedback);

        // Perform action on the frontend
        if (action === 'navigate') {
          navigate(params.page);
        }

        // Notify parent components to reload data if needed
        if (onActionTriggered) {
          onActionTriggered(action, params);
        }
      } catch (err) {
        console.error("Voice command processing error:", err);
        const errFeedback = "Apologies, I couldn't execute that command.";
        setFeedbackText(errFeedback);
        speakFeedback(errFeedback);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      setFeedbackText("Sorry, I didn't catch that. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [recognition, navigate, onActionTriggered]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Feedback text popover */}
      <AnimatePresence>
        {feedbackText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="px-4 py-2 bg-cyber-dark/95 border border-cyber-border rounded-xl text-xs text-white max-w-xs shadow-2xl flex items-center gap-2 backdrop-blur-md"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyber-teal flex-shrink-0" />
            <span>{feedbackText}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={isListening ? stopListening : startListening}
        className={`w-14 h-14 rounded-full flex items-center justify-center border shadow-2xl cursor-pointer ${
          isListening 
            ? 'bg-gradient-to-tr from-red-600 to-cyber-pink border-red-500 shadow-cyber-pink/30 animate-pulse'
            : 'bg-gradient-to-tr from-cyber-violet to-cyber-teal border-cyber-violet/50 shadow-cyber-teal/20'
        }`}
      >
        {isListening ? (
          <MicOff className="w-6 h-6 text-white" />
        ) : (
          <Mic className="w-6 h-6 text-cyber-dark" />
        )}
      </motion.button>
    </div>
  );
};

export default VoiceButton;
