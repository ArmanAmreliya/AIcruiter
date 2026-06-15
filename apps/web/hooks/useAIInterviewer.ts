import { useState, useEffect, useRef } from 'react';
import Groq from 'groq-sdk';
import { supabase } from '../lib/supabase';
import { apolloClient } from '../lib/apollo-client';
import { GET_DEEPGRAM_TOKEN } from '../lib/graphql-queries';
import { toast } from 'sonner';

// --- Safe Environment Fetch Helper ---
const getEnv = (key: string): string | undefined => {
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }
    return (import.meta as any).env?.[key];
};

const GROQ_API_KEY = getEnv('VITE_GROQ_API_KEY');

type InterviewStatus = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING';

export const useAIInterviewer = (jobId: string, candidateId: string, candidateName: string, jobTitle: string, companyName: string) => {
    const [status, setStatus] = useState<InterviewStatus>('IDLE');
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [history, setHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);

    // Refs for persistent objects
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const deepgramLiveRef = useRef<WebSocket | null>(null);
    const groqRef = useRef<Groq | null>(null);
    const audioQueueRef = useRef<ArrayBuffer[]>([]);
    const isSpeakingRef = useRef(false);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize Groq
    useEffect(() => {
        if (GROQ_API_KEY) {
            groqRef.current = new Groq({ apiKey: GROQ_API_KEY, dangerouslyAllowBrowser: true });
        }
    }, []);

    // --- 1. TTS: Play Audio Buffer ---
    const playAudioBuffer = async (buffer: ArrayBuffer) => {
        if (!audioContextRef.current) return;

        try {
            const audioBuffer = await audioContextRef.current.decodeAudioData(buffer);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);

            source.onended = () => {
                if (audioQueueRef.current.length === 0) {
                    isSpeakingRef.current = false;
                    setStatus('LISTENING');
                }
            };

            source.start();
        } catch (error) {
            console.error("Audio playback error:", error);
        }
    };

    // --- 2. Brain: Groq LLM ---
    const generateResponse = async (userText: string) => {
        if (!groqRef.current) return;

        setStatus('THINKING');

        const systemPrompt = `You are Sarah, a warm and professional talent recruiter at ${companyName}.
**Speaking Style:** Speak casually and naturally. Use short sentences. Use contractions ('I'm', 'Let's').
**Active Listening:** Occasionally start responses with natural fillers like 'Hmm, I see', 'That makes sense', or 'Interesting point'.
**Task:** Interview the candidate for ${jobTitle}. Ask ONE question at a time. Dig into their specific experience.
**Avoid:** Do not use robotic phrases like 'I have processed your answer.' Do not give long monologues.`;

        const messages = [
            { role: 'system' as const, content: systemPrompt },
            ...history,
            { role: 'user' as const, content: userText }
        ];

        try {
            const completion = await groqRef.current.chat.completions.create({
                messages,
                model: 'llama-3.1-8b-instant',
                temperature: 0.7,
                max_tokens: 150,
            });

            const responseText = completion.choices[0]?.message?.content || "";
            setAiResponse(responseText);
            setHistory(prev => [...prev, { role: 'user', content: userText }, { role: 'assistant', content: responseText }]);

            // Save to Supabase
            saveTranscript(userText, responseText);

            // Speak it
            speak(responseText);
        } catch (error) {
            console.error("Groq Error:", error);
            setStatus('LISTENING');
        }
    };

    // --- 3. Voice: Deepgram Aura TTS with Secure Temporary Token ---
    const speak = async (text: string) => {
        setStatus('SPEAKING');
        isSpeakingRef.current = true;

        try {
            // A. Get a fresh short-lived token from backend to prevent key leakage
            const { data } = await apolloClient.mutate<any>({
                mutation: GET_DEEPGRAM_TOKEN
            });
            const token = data?.getDeepgramToken;
            if (!token) throw new Error("Could not retrieve temporary Deepgram token");

            // B. Request speech audio from Deepgram using temp token
            const response = await fetch(`https://api.deepgram.com/v1/speak?model=aura-asteria-en`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) throw new Error("TTS Failed");

            const audioBlob = await response.blob();
            const arrayBuffer = await audioBlob.arrayBuffer();
            playAudioBuffer(arrayBuffer);

        } catch (error) {
            console.error("TTS Error:", error);
            setStatus('LISTENING');
        }
    };

    const saveTranscript = async (question: string, answer: string) => {
        try {
            await supabase.from('interview_transcripts').insert({
                job_id: jobId,
                candidate_id: candidateId,
                user_text: question,
                ai_text: answer
            });
        } catch (error) {
            console.error("Failed to save transcript:", error);
        }
    };

    // --- 4. Ears: Deepgram Nova-2 STT via Browser WebSocket & Temp Token ---
    const startListening = async () => {
        try {
            // A. Get a short-lived Deepgram token from backend
            const { data } = await apolloClient.mutate<any>({
                mutation: GET_DEEPGRAM_TOKEN
            });
            const token = data?.getDeepgramToken;
            if (!token) throw new Error("Could not fetch Deepgram token");

            // B. Connect directly to Deepgram WebSocket via native browser API
            const wsUrl = `wss://api.deepgram.com/v1/listen?token=${token}&model=nova-2&interim_results=true&smart_format=true&filler_words=true&endpointing=1200`;
            const ws = new WebSocket(wsUrl);
            deepgramLiveRef.current = ws;

            ws.onopen = () => {
                console.log("Deepgram STT WebSocket Connected");
                setStatus('LISTENING');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const transcriptText = data.channel?.alternatives?.[0]?.transcript;
                    if (transcriptText) {
                        setTranscript(transcriptText);

                        // Interrupt logic: If user starts speaking while AI is talking, stop playback
                        if (isSpeakingRef.current) {
                            if (audioContextRef.current) {
                                audioContextRef.current.suspend();
                                audioContextRef.current.resume(); // Reset context to stop sound
                            }
                            isSpeakingRef.current = false;
                        }

                        // Handle silence/final result
                        if (data.is_final) {
                            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                            silenceTimerRef.current = setTimeout(() => {
                                generateResponse(transcriptText);
                            }, 1200);
                        }
                    }
                } catch (e) {
                    console.error("Error parsing STT message:", e);
                }
            };

            ws.onerror = (error) => {
                console.error("Deepgram STT WebSocket Error:", error);
            };

            ws.onclose = () => {
                console.log("Deepgram STT WebSocket Closed");
            };

            // Capture Audio
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
                    ws.send(event.data);
                }
            };

            mediaRecorder.start(250); // Send chunks every 250ms

            // Initial Greet
            if (history.length === 0) {
                speak(`Hi ${candidateName}, thanks for joining. I'm Sarah, a recruiter here at ${companyName}. Shall we start the interview for the ${jobTitle} position?`);
                setHistory([{ role: 'assistant', content: "Welcome message sent." }]);
            }
        } catch (err: any) {
            console.error('STT setup error:', err);
            toast.error('Could not connect to voice service. Please try again.');
        }
    };

    useEffect(() => {
        // Setup AudioContext on mount
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

        return () => {
            if (deepgramLiveRef.current && deepgramLiveRef.current.readyState === WebSocket.OPEN) {
                deepgramLiveRef.current.close();
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, []);

    return {
        status,
        transcript,
        aiResponse,
        isEnabled: !!mediaRecorderRef.current,
        startInterview: startListening,
        toggleMic: () => {
            if (mediaRecorderRef.current?.state === 'recording') {
                mediaRecorderRef.current.pause();
            } else {
                mediaRecorderRef.current?.resume();
            }
        }
    };
};
