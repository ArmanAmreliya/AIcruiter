import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { apolloClient } from '../lib/apollo-client';
import { GET_DEEPGRAM_TOKEN } from '../lib/graphql-queries';
import { toast } from 'sonner';

// --- Safe Environment Fetch Helper ---
const getEnv = (key: string): string | undefined => {
    if (typeof window !== 'undefined' && (window as any)[`__${key}__`]) {
        return (window as any)[`__${key}__`];
    }
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }
    return (import.meta as any).env?.[key];
};

type InterviewStatus = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING';

export const useAIInterviewer = (
    jobId: string, 
    candidateId: string, 
    candidateName: string, 
    jobTitle: string, 
    companyName: string,
    jobDescription: string = ""
) => {
    const [status, setStatus] = useState<InterviewStatus>('IDLE');
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [history, setHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);

    const contextRef = useRef({ jobTitle, companyName, jobDescription, candidateName });

    useEffect(() => {
        contextRef.current = { jobTitle, companyName, jobDescription, candidateName };
    }, [jobTitle, companyName, jobDescription, candidateName]);

    // Refs for persistent objects
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const deepgramLiveRef = useRef<WebSocket | null>(null);
    const aiApiKeyRef = useRef<string | null>(null);
    const isSpeakingRef = useRef(false);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const accumulatedTranscriptRef = useRef('');
    const activeAudioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize AI API key dynamically using environment helper
    useEffect(() => {
        const apiKey = getEnv('NEXT_AI_API_KEY') || getEnv('VITE_AI_API_KEY');
        if (apiKey) {
            aiApiKeyRef.current = apiKey;
        } else {
            console.error("NEXT_AI_API_KEY could not be initialized on client-side");
        }
    }, []);

    // (Deprecated Web Audio API in favor of HTML5 Audio)

    // --- 2. Brain: OpenRouter LLM ---
    const generateResponse = async (userText: string) => {
        if (!aiApiKeyRef.current) {
            console.error("AI API key not initialized - NEXT_AI_API_KEY may be missing!");
            toast.error("AI Interviewer brain service is not configured. Please contact support.");
            setStatus('LISTENING');
            return;
        }

        setStatus('THINKING');

        const { jobTitle: title, companyName: company, jobDescription: description, candidateName: candidate } = contextRef.current;
        const systemPrompt = `You are Sarah, a warm and professional talent recruiter at ${company}.
You are interviewing the candidate (${candidate}) for the position of ${title}.

Here is the Job Description for this position:
"""
${description}
"""

**Your Task:**
1. Screen the candidate specifically for the skills, requirements, and responsibilities detailed in the Job Description above.
2. Ask ONE question at a time. Probe their actual experience, and follow up on their answers to assess depth of knowledge.
3. Be conversational and professional.

**Speaking Style:**
* Speak casually, warmly, and naturally. Use short sentences and contractions (e.g. "I'm", "Let's").
* Use conversational fillers occasionally (e.g. "Hmm, I see", "Interesting", "That makes sense") to show active listening.
* Avoid robotic phrasing or giving long monologues.`;

        const messages = [
            { role: 'system' as const, content: systemPrompt },
            ...history,
            { role: 'user' as const, content: userText }
        ];

        try {
            let response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${aiApiKeyRef.current}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://aicruiter.com",
                    "X-Title": "AIcruiter",
                },
                body: JSON.stringify({
                    model: "meta-llama/llama-3.3-70b-instruct:free",
                    messages,
                    temperature: 0.7,
                    max_tokens: 150,
                })
            });

            if (response.status === 429) {
                console.warn("Llama 3.3 70B rate limited. Retrying with Llama 3.2 3B free...");
                response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${aiApiKeyRef.current}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://aicruiter.com",
                        "X-Title": "AIcruiter",
                    },
                    body: JSON.stringify({
                        model: "meta-llama/llama-3.2-3b-instruct:free",
                        messages,
                        temperature: 0.7,
                        max_tokens: 150,
                    })
                });
            }

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
            }

            const data = await response.json();
            const responseText = data.choices?.[0]?.message?.content || "";

            setAiResponse(responseText);
            setHistory(prev => [...prev, { role: 'user', content: userText }, { role: 'assistant', content: responseText }]);

            // Save to Supabase
            saveTranscript(userText, responseText);

            // Speak it
            speak(responseText);
        } catch (error) {
            console.error("OpenRouter Error:", error);
            toast.error("Error communicating with AI recruiter brain.");
            setStatus('LISTENING');
        }
    };

    // --- 3. Voice: Proxy TTS call through backend to bypass CORS using HTML5 Audio ---
    const speak = async (text: string) => {
        setStatus('SPEAKING');
        isSpeakingRef.current = true;

        try {
            const defaultUrl = 'http://localhost:4000';
            let apiUrl = defaultUrl;
            if (typeof window !== 'undefined') {
                if ((window as any).NEXT_PUBLIC_API_URL) {
                    apiUrl = (window as any).NEXT_PUBLIC_API_URL.replace('/graphql', '');
                } else {
                    apiUrl = `http://${window.location.hostname}:4000`;
                }
            } else if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL) {
                apiUrl = process.env.NEXT_PUBLIC_API_URL.replace('/graphql', '');
            }

            const response = await fetch(`${apiUrl}/api/speak`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) throw new Error("TTS Failed");

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            if (activeAudioRef.current) {
                try {
                    activeAudioRef.current.pause();
                } catch (e) {}
            }

            const audio = new Audio(audioUrl);
            activeAudioRef.current = audio;

            audio.onended = () => {
                if (activeAudioRef.current === audio) {
                    activeAudioRef.current = null;
                }
                isSpeakingRef.current = false;
                setStatus('LISTENING');
            };

            await audio.play();

        } catch (error) {
            console.error("TTS Error:", error);
            setStatus('LISTENING');
        }
    };

    const saveTranscript = async (question: string, answer: string) => {
        try {
            await supabase.from('InterviewTranscript').insert({
                jobId: jobId,
                candidateId: candidateId,
                userText: question,
                aiText: answer
            });
        } catch (error) {
            console.error("Failed to save transcript:", error);
        }
    };

    // --- 4. Ears: Deepgram Nova-2 STT via Browser WebSocket & Temp Token ---
    const startListening = async (userStream?: MediaStream) => {
        try {
            // A. Get a short-lived Deepgram token from backend
            const { data } = await apolloClient.mutate<any>({
                mutation: GET_DEEPGRAM_TOKEN
            });
            const token = data?.getDeepgramToken;
            if (!token) throw new Error("Could not fetch Deepgram token");

            // B. Connect directly to Deepgram WebSocket via native browser API with sub-protocol auth (endpointing=500 for low latency)
            const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&interim_results=true&smart_format=true&filler_words=true&endpointing=500`;
            const ws = new WebSocket(wsUrl, ['token', token]);
            deepgramLiveRef.current = ws;

            ws.onopen = () => {
                console.log("Deepgram STT WebSocket Connected");
                setStatus('LISTENING');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const alternative = data.channel?.alternatives?.[0];
                    const segmentText = alternative?.transcript || '';

                    if (segmentText) {
                        // Interrupt logic: If user starts speaking while AI is talking, stop playback
                        if (isSpeakingRef.current) {
                            if (activeAudioRef.current) {
                                try {
                                    activeAudioRef.current.pause();
                                } catch (e) {
                                    // Ignore if already paused
                                }
                                activeAudioRef.current = null;
                            }
                            isSpeakingRef.current = false;
                            setStatus('LISTENING');
                        }

                        if (data.is_final) {
                            // Append to our accumulated transcript for this speech turn to avoid truncation
                            accumulatedTranscriptRef.current += (accumulatedTranscriptRef.current ? ' ' : '') + segmentText;
                            setTranscript(accumulatedTranscriptRef.current);

                            // Fallback timer: trigger LLM if speech_final is delayed
                            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                            silenceTimerRef.current = setTimeout(() => {
                                const fallbackUtterance = accumulatedTranscriptRef.current.trim();
                                if (fallbackUtterance) {
                                    console.log("Fallback silence timer triggered with:", fallbackUtterance);
                                    accumulatedTranscriptRef.current = '';
                                    generateResponse(fallbackUtterance);
                                }
                            }, 1500);
                        } else {
                            // Show accumulated finalized text plus current interim text for live responsive subtitle feel
                            const interimDisplay = accumulatedTranscriptRef.current 
                                ? `${accumulatedTranscriptRef.current} ${segmentText}...` 
                                : `${segmentText}...`;
                            setTranscript(interimDisplay);
                        }
                    }

                    // Low-latency turn-taking trigger via Deepgram natural end of speech endpointing
                    if (data.speech_final) {
                        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                        const finalUtterance = accumulatedTranscriptRef.current.trim();
                        if (finalUtterance) {
                            console.log("Speech final detected, triggering LLM with:", finalUtterance);
                            accumulatedTranscriptRef.current = '';
                            generateResponse(finalUtterance);
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

            accumulatedTranscriptRef.current = '';

            // Use the passed in userStream if available; otherwise capture audio cross-browser compatible fallback options
            let stream = userStream;
            if (!stream) {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            }

            // Extract audio tracks only so MediaRecorder does not try to record video
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length === 0) {
                throw new Error("No audio tracks found in stream");
            }
            const audioStream = new MediaStream(audioTracks);
            
            let options: MediaRecorderOptions = {};
            if (typeof MediaRecorder !== 'undefined') {
                if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                    options.mimeType = 'audio/webm;codecs=opus';
                } else if (MediaRecorder.isTypeSupported('audio/webm')) {
                    options.mimeType = 'audio/webm';
                } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                    options.mimeType = 'audio/mp4';
                }
            }
            
            const mediaRecorder = new MediaRecorder(audioStream, options);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
                    ws.send(event.data);
                }
            };

            mediaRecorder.start(250); // Send chunks every 250ms

            // Initial Greet
            const { jobTitle: title, companyName: company, candidateName: candidate } = contextRef.current;
            if (history.length === 0) {
                const greetMsg = `Hi ${candidate}, thanks for joining. I'm Sarah, a recruiter here at ${company}. Shall we start the interview for the ${title} position?`;
                speak(greetMsg);
                setHistory([{ role: 'assistant', content: greetMsg }]);
            }
        } catch (err: any) {
            console.error('STT setup error:', err);
            toast.error('Could not connect to voice service. Please try again.');
        }
    };

    useEffect(() => {
        return () => {
            if (deepgramLiveRef.current && deepgramLiveRef.current.readyState === WebSocket.OPEN) {
                deepgramLiveRef.current.close();
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            if (activeAudioRef.current) {
                activeAudioRef.current.pause();
                activeAudioRef.current = null;
            }
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
