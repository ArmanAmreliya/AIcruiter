import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Star, MessageSquare, ArrowRight, Heart, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

export const ThankYouPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useTheme();
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const candidateId = location.state?.candidateId;
    const jobId = location.state?.jobId;

    const handleSubmitFeedback = async () => {
        if (rating === 0) {
            toast.error("Please select a rating before submitting.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Update candidate status to COMPLETED and save feedback
            if (candidateId) {
                const { error } = await supabase
                    .from('candidates')
                    .update({
                        status: 'COMPLETED',
                        meta_data: {
                            ...(location.state?.meta_data || {}),
                            rating,
                            feedback,
                            completed_at: new Date().toISOString()
                        }
                    })
                    .eq('id', candidateId);

                if (error) throw error;
            }

            setSubmitted(true);
            toast.success("Thank you for your feedback!");
        } catch (error: any) {
            console.error("Feedback error:", error);
            toast.error("Failed to save feedback, but your interview was submitted.");
            setSubmitted(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={cn(
            "min-h-screen flex flex-col items-center justify-center p-6 font-sans transition-colors duration-500",
            theme === 'light' ? "bg-gray-50 text-gray-900" : "bg-black text-white"
        )}>

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                    "w-full max-w-xl p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative z-10 border text-center",
                    theme === 'light' ? "bg-white border-gray-100" : "bg-zinc-900 border-white/5"
                )}
            >
                {!submitted ? (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12 }}
                            className="w-20 h-20 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-8"
                        >
                            <CheckCircle2 size={40} />
                        </motion.div>

                        <h1 className="text-4xl font-bold mb-4 tracking-tight">Interview Completed!</h1>
                        <p className={cn("text-lg mb-10", theme === 'light' ? "text-gray-500" : "text-gray-400")}>
                            Your session has been recorded and sent to the recruiter. We'd love to hear about your experience.
                        </p>

                        <div className="space-y-8">
                            {/* Rating Section */}
                            <div className="space-y-4">
                                <p className="text-sm font-bold uppercase tracking-widest opacity-50">Rate your experience</p>
                                <div className="flex justify-center gap-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className={cn(
                                                "p-2 transition-all transform hover:scale-120",
                                                rating >= star ? "text-yellow-400" : "text-gray-300 dark:text-gray-700"
                                            )}
                                        >
                                            <Star size={32} fill={rating >= star ? "currentColor" : "none"} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Feedback Text */}
                            <div className="space-y-4">
                                <p className="text-sm font-bold uppercase tracking-widest opacity-50">Additional Comments</p>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="How was the AI interaction? Any technical issues?"
                                    className={cn(
                                        "w-full px-5 py-4 rounded-3xl outline-none border transition-all min-h-[120px] resize-none",
                                        theme === 'light'
                                            ? "bg-gray-50 border-gray-100 focus:bg-white focus:ring-4 focus:ring-purple-50"
                                            : "bg-black/40 border-white/10 focus:bg-black focus:border-purple-500/50"
                                    )}
                                />
                            </div>

                            <button
                                disabled={isSubmitting}
                                onClick={handleSubmitFeedback}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg shadow-xl shadow-purple-600/20 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? "Submitting..." : "Submit Review"}
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-8"
                    >
                        <div className="w-20 h-20 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-8">
                            <Heart size={40} fill="currentColor" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">You're all set!</h2>
                        <p className={cn("text-lg mb-10", theme === 'light' ? "text-gray-500" : "text-gray-400")}>
                            Thank you for helping us improve AIcruiter. The recruiter will be in touch soon regarding next steps.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className={cn(
                                "px-8 py-4 rounded-2xl font-bold flex items-center gap-2 mx-auto transition-all",
                                theme === 'light' ? "bg-black text-white" : "bg-white text-black hover:bg-gray-200"
                            )}
                        >
                            <Home size={20} />
                            Return Home
                        </button>
                    </motion.div>
                )}
            </motion.div>

            <div className="mt-12 text-sm opacity-40 flex items-center gap-2">
                <span>Powered by</span>
                <div className="flex items-center gap-1 font-bold">
                    <div className="w-4 h-4 rounded bg-purple-600 flex items-center justify-center text-[8px] text-white">AI</div>
                    <span>AIcruiter</span>
                </div>
            </div>
        </div>
    );
};
