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
    const [logs, setLogs] = useState<string[]>([]);

    const contextRef = useRef({ jobTitle, companyName, jobDescription, candidateName });
    const historyRef = useRef<{ role: 'user' | 'assistant', content: string }[]>([]);

    useEffect(() => {
        contextRef.current = { jobTitle, companyName, jobDescription, candidateName };
    }, [jobTitle, companyName, jobDescription, candidateName]);

    useEffect(() => {
        historyRef.current = history;
    }, [history]);

    // Refs for persistent objects
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const deepgramLiveRef = useRef<WebSocket | null>(null);
    const aiApiKeyRef = useRef<string | null>(null);
    const isSpeakingRef = useRef(false);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const accumulatedTranscriptRef = useRef('');
    const activeAudioRef = useRef<HTMLAudioElement | null>(null);
    const keepAliveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Logging helper with timestamping
    const logTrace = (msg: string) => {
        const timestamp = new Date().toLocaleTimeString();
        const fullMsg = `[${timestamp}] ${msg}`;
        console.log(`[useAIInterviewer] ${msg}`);
        setLogs(prev => [...prev, fullMsg]);
    };

    // Initialize AI API key dynamically using environment helper
    useEffect(() => {
        logTrace("Initializing AI Brain components...");
        const apiKey =
            getEnv('NEXT_GROQ_API_KEY') ||
            getEnv('VITE_GROQ_API_KEY') ||
            getEnv('GROQ_API_KEY') ||
            getEnv('NEXT_AI_API_KEY') ||
            getEnv('VITE_AI_API_KEY');
        if (apiKey) {
            aiApiKeyRef.current = apiKey;
            logTrace(`Groq API key loaded successfully (Prefix: ${apiKey.substring(0, 4)}..., Length: ${apiKey.length})`);
        } else {
            console.error("Groq API key could not be initialized on client-side");
            logTrace("ERROR: Groq API key could not be loaded from client environment. Brain connection will fail.");
        }
    }, []);

    // --- 2. Brain: Groq LLM ---
    const generateResponse = async (userText: string) => {
        if (!aiApiKeyRef.current) {
            logTrace("ERROR: Cannot generate response. Groq API Key is not configured.");
            toast.error("AI Interviewer brain service is not configured. Please contact support.");
            setStatus('LISTENING');
            return;
        }

        setStatus('THINKING');
        logTrace(`Stored candidate response: "${userText}"`);

        const { jobTitle: title, companyName: company, jobDescription: description, candidateName: candidate } = contextRef.current;
        logTrace(`Preparing Groq LLM context for candidate "${candidate}" matching role "${title}" at "${company}"`);
        
        const systemPrompt = `You are Sarah, a calm, warm, friendly, and highly professional female recruiter at ${company}.
    You are interviewing the candidate (${candidate}) for the position of ${title}.

Here is the Job Description for this position:
"""
${description}
"""

**Your Task:**
1. Start the interview with a brief candidate introduction first, then move into the questions. Do not give a long introduction or ask for permission to begin.
2. Begin with fundamentals, then move to medium-difficulty questions, and finish with hard questions.
3. Screen the candidate specifically for the skills, requirements, and responsibilities detailed in the Job Description above.
4. Ask ONE question at a time.
5. After each candidate answer, ask a thoughtful follow-up based on what they actually said.
6. Probe for depth with gentle but targeted follow-ups like implementation details, tradeoffs, edge cases, ownership, and outcomes.
7. Keep the flow structured and adaptive: if a candidate answers strongly, raise difficulty; if they struggle, stay one level deeper on fundamentals before moving up.
8. Maintain a supportive tone that feels encouraging, attentive, and professional.

**Speaking Style:**
* Speak directly, clearly, and naturally. Use short sentences and contractions (e.g. "I'm", "Let's").
* Sound calm, confident, and encouraging, like a thoughtful recruiter guiding a strong conversation.
* Use conversational fillers occasionally (e.g. "Hmm, I see", "Interesting", "That makes sense") to show active listening.
* Avoid robotic phrasing or giving long monologues.`;

        const messages = [
            { role: 'system' as const, content: systemPrompt },
            ...historyRef.current,
            { role: 'user' as const, content: userText }
        ];

        const startTime = Date.now();
        try {
            logTrace("Sending prompt to Groq API (model: llama-3.3-70b-versatile)...");
            let response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${aiApiKeyRef.current}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages,
                    temperature: 0.7,
                    max_tokens: 150,
                })
            });

            if (response.status === 429) {
                logTrace("WARNING: Llama 3.3 70B rate limited. Retrying with Llama 3.1 8B instant...");
                response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${aiApiKeyRef.current}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "llama-3.1-8b-instant",
                        messages,
                        temperature: 0.7,
                        max_tokens: 150,
                    })
                });
            }

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Groq API error: ${response.status} - ${errText}`);
            }

            const data = await response.json();
            const responseText = data.choices?.[0]?.message?.content || "";
            const duration = Date.now() - startTime;
            logTrace(`Groq response generated successfully in ${duration}ms: "${responseText.substring(0, 60)}..."`);

            setAiResponse(responseText);

            // Keep the in-memory dialogue history in sync for the next turn.
            const nextHistory: { role: 'user' | 'assistant', content: string }[] = [
                ...historyRef.current,
                { role: 'user' as const, content: userText },
                { role: 'assistant' as const, content: responseText }
            ];
            historyRef.current = nextHistory;
            setHistory(nextHistory);

            // Save to Supabase
            logTrace("Saving dialogue exchange to database (InterviewTranscript)...");
            saveTranscript(userText, responseText);

            // Speak it
            speak(responseText);
        } catch (error: any) {
            logTrace(`ERROR generating AI response: ${error.message || error}`);
            toast.error("Error communicating with AI recruiter brain.");
            setStatus('LISTENING');
        }
    };

    // --- 3. Voice: Proxy TTS call through backend to bypass CORS using HTML5 Audio ---
    const speak = async (text: string) => {
        setStatus('SPEAKING');
        isSpeakingRef.current = true;
        const mediaRecorder = mediaRecorderRef.current;
        const recorderWasActive = mediaRecorder?.state === 'recording';
        if (recorderWasActive && mediaRecorder) {
            try {
                mediaRecorder.pause();
                logTrace("Pausing mic capture while Sarah is speaking to prevent self-echo in Deepgram.");
            } catch (e) {
                logTrace("WARNING: Could not pause MediaRecorder before TTS playback.");
            }
        }

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

            logTrace(`Requesting TTS from local proxy: ${apiUrl}/api/speak`);
            const response = await fetch(`${apiUrl}/api/speak`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) throw new Error(`TTS service returned status ${response.status}`);

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            logTrace(`TTS audio payload downloaded (Size: ${audioBlob.size} bytes)`);

            if (activeAudioRef.current) {
                try {
                    activeAudioRef.current.pause();
                } catch (e) {}
            }

            const audio = new Audio(audioUrl);
            activeAudioRef.current = audio;

            audio.onended = () => {
                logTrace("AI Audio speech track completed. Reverting to LISTENING status.");
                if (activeAudioRef.current === audio) {
                    activeAudioRef.current = null;
                }
                isSpeakingRef.current = false;
                if (recorderWasActive && mediaRecorder) {
                    try {
                        mediaRecorder.resume();
                        logTrace("Resumed mic capture after Sarah finished speaking.");
                    } catch (e) {
                        logTrace("WARNING: Could not resume MediaRecorder after TTS playback.");
                    }
                }
                setStatus('LISTENING');
            };

            await audio.play();
            logTrace("Audio playback started");

        } catch (error: any) {
            logTrace(`ERROR in TTS generation or playback: ${error.message || error}`);
            if (recorderWasActive && mediaRecorder) {
                try {
                    mediaRecorder.resume();
                } catch (e) {}
            }
            setStatus('LISTENING');
            isSpeakingRef.current = false;
        }
    };

    const saveTranscript = async (question: string, answer: string) => {
        try {
            const { error } = await supabase.from('InterviewTranscript').insert({
                jobId: jobId,
                candidateId: candidateId,
                userText: question,
                aiText: answer
            });
            if (error) throw error;
            logTrace("Supabase dialogue transcript saved successfully");
        } catch (error: any) {
            logTrace(`WARNING: Failed to save dialogue to Supabase: ${error.message || error}`);
        }
    };

    // --- 4. Ears: Deepgram Nova-2 STT via Browser WebSocket & Temp Token ---
    const startListening = async (userStream?: MediaStream) => {
        logTrace("Initial startInterview invoked. Generating Deepgram credential token...");
        try {
            // A. Get a short-lived Deepgram token from backend
            const { data } = await apolloClient.mutate<any>({
                mutation: GET_DEEPGRAM_TOKEN
            });
            const token = data?.getDeepgramToken;
            if (!token) throw new Error("Could not fetch Deepgram token");
            logTrace("Deepgram token obtained successfully from server resolver.");

            // B. Connect directly to Deepgram WebSocket via native browser API with sub-protocol auth (endpointing=500 for low latency)
            const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&interim_results=true&smart_format=true&filler_words=true&endpointing=1000`;
            logTrace(`Establishing direct WebSocket to Deepgram: wss://api.deepgram.com/v1/listen...`);
            const ws = new WebSocket(wsUrl, ['token', token]);
            deepgramLiveRef.current = ws;

            ws.onopen = () => {
                logTrace("Deepgram STT WebSocket connected successfully.");
                setStatus('LISTENING');

                // Start KeepAlive heartbeat interval every 5 seconds to prevent Deepgram silent timeout
                logTrace("Initializing 5s KeepAlive WebSocket heartbeat interval.");
                if (keepAliveTimerRef.current) clearInterval(keepAliveTimerRef.current);
                keepAliveTimerRef.current = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'KeepAlive' }));
                        logTrace("STT KeepAlive heartbeat sent.");
                    }
                }, 5000);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    // Filter out keepalive return messages
                    if (data.type === 'KeepAlive') return;

                    const alternative = data.channel?.alternatives?.[0];
                    const segmentText = alternative?.transcript || '';

                    if (segmentText) {
                        if (isSpeakingRef.current) {
                            logTrace("Ignoring assistant audio bleed while Sarah is speaking.");
                            return;
                        }

                        if (data.is_final) {
                            accumulatedTranscriptRef.current += (accumulatedTranscriptRef.current ? ' ' : '') + segmentText;
                            setTranscript(accumulatedTranscriptRef.current);

                            // Fallback timer: trigger LLM if speech_final is delayed
                            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                            silenceTimerRef.current = setTimeout(() => {
                                const fallbackUtterance = accumulatedTranscriptRef.current.trim();
                                if (fallbackUtterance) {
                                    logTrace(`Fallback silence timer expired (2500ms). Submitting: "${fallbackUtterance}"`);
                                    accumulatedTranscriptRef.current = '';
                                    generateResponse(fallbackUtterance);
                                }
                                }, 2500);
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
                            logTrace(`Natural speech final event received. Submitting candidate input: "${finalUtterance}"`);
                            accumulatedTranscriptRef.current = '';
                            generateResponse(finalUtterance);
                        }
                    }
                } catch (e: any) {
                    logTrace(`ERROR parsing WebSocket stream text: ${e.message || e}`);
                }
            };

            ws.onerror = (error) => {
                logTrace("ERROR: Deepgram STT WebSocket connection encountered an error.");
                if (keepAliveTimerRef.current) {
                    clearInterval(keepAliveTimerRef.current);
                    keepAliveTimerRef.current = null;
                }
            };

            ws.onclose = (event) => {
                logTrace(`Deepgram STT WebSocket closed. Code: ${event.code}, Reason: ${event.reason || 'None provided'}`);
                if (keepAliveTimerRef.current) {
                    clearInterval(keepAliveTimerRef.current);
                    keepAliveTimerRef.current = null;
                }
            };

            accumulatedTranscriptRef.current = '';

            // Use the passed in userStream if available; otherwise capture audio cross-browser compatible fallback options
            logTrace("Requesting microphone device tracks...");
            let stream = userStream;
            if (!stream) {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            }

            // Extract audio tracks only so MediaRecorder does not try to record video
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length === 0) {
                throw new Error("No active audio tracks found in capture stream");
            }
            logTrace(`Active mic track: "${audioTracks[0].label}"`);
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
            
            logTrace(`Initializing MediaRecorder with container mimeType: "${options.mimeType || 'default'}"`);
            const mediaRecorder = new MediaRecorder(audioStream, options);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
                    ws.send(event.data);
                }
            };

            mediaRecorder.onerror = (e: any) => {
                logTrace(`ERROR in MediaRecorder instance: ${e.message || e}`);
            };

            mediaRecorder.start(250); // Send chunks every 250ms
            logTrace("MediaRecorder started capture cycle (250ms audio chunk slices).");

            // Initial Greet
            const { jobTitle: title, companyName: company, candidateName: candidate } = contextRef.current;
            if (historyRef.current.length === 0) {
                const greetMsg = `Hi ${candidate}, thanks for joining. I'm Sarah, a recruiter here at ${company}. Shall we start the interview for the ${title} position?`;
                logTrace("Triggering Sarah's initial greeting message.");
                speak(greetMsg);
                historyRef.current = [{ role: 'assistant', content: greetMsg }];
                setHistory(historyRef.current);
            }
        } catch (err: any) {
            logTrace(`ERROR during STT capture pipeline setup: ${err.message || err}`);
            toast.error('Could not connect to voice service. Please try again.');
        }
    };

    useEffect(() => {
        return () => {
            logTrace("Tearing down useAIInterviewer instance...");
            if (deepgramLiveRef.current && deepgramLiveRef.current.readyState === WebSocket.OPEN) {
                deepgramLiveRef.current.close();
            }
            if (keepAliveTimerRef.current) {
                clearInterval(keepAliveTimerRef.current);
                keepAliveTimerRef.current = null;
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

    // Expose hooks for testing
    if (typeof window !== 'undefined') {
        (window as any).__testAIInterviewer = {
            status,
            transcript,
            aiResponse,
            history,
            logs,
            setLogs,
            generateResponse,
            speak,
            startListening
        };
    }

    return {
        status,
        transcript,
        aiResponse,
        history,
        logs,
        isEnabled: !!mediaRecorderRef.current,
        startInterview: startListening,
        toggleMic: () => {
            if (mediaRecorderRef.current?.state === 'recording') {
                logTrace("Muting user microphone track (pausing MediaRecorder).");
                mediaRecorderRef.current.pause();
            } else {
                logTrace("Resuming user microphone track (resuming MediaRecorder).");
                mediaRecorderRef.current?.resume();
            }
        }
    };
};
