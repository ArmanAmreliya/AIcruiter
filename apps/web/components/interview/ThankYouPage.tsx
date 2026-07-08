import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Star, ArrowRight, Home, Heart } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from '../../lib/react-router-dom-compat';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { apolloClient } from '../../lib/apollo-client';
import { UPDATE_CANDIDATE_INTERVIEW_STATUS } from '../../lib/graphql-queries';

export const ThankYouPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // keep page styling local; do not force global theme changes

    const [searchParams] = useSearchParams();
    const candidateId = searchParams.get('candidateId') || location.state?.candidateId;
    const jobId = searchParams.get('jobId') || location.state?.jobId;
    const exitType = searchParams.get('exitType') || location.state?.meta_data?.exit_type || 'AUTOMATIC';
    const timeSpent = searchParams.get('timeSpent') 
        ? parseInt(searchParams.get('timeSpent') || '0', 10) 
        : location.state?.meta_data?.time_spent || 0;

    // Automatically mark the candidate interview as COMPLETED on mount
    useEffect(() => {
        const markInterviewCompleted = async () => {
            if (candidateId && candidateId !== 'guest') {
                try {
                    const meta = {
                        exit_type: exitType,
                        time_spent: timeSpent,
                        completed_at: new Date().toISOString()
                    };
                    await apolloClient.mutate({
                        mutation: UPDATE_CANDIDATE_INTERVIEW_STATUS,
                        variables: {
                            id: candidateId,
                            status: 'COMPLETED',
                            metaData: JSON.stringify(meta)
                        }
                    });
                } catch (err) {
                    console.error('Error auto-completing interview on mount:', err);
                }
            }
        };
        markInterviewCompleted();
    }, [candidateId, exitType, timeSpent]);

    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmitFeedback = async () => {
        if (rating === 0) {
            toast.error('Please select a rating before submitting.');
            return;
        }

        setIsSubmitting(true);
        try {
            if (candidateId && candidateId !== 'guest') {
                const meta = {
                    exit_type: exitType,
                    time_spent: timeSpent,
                    rating,
                    candidateFeedback: feedback,
                    completed_at: new Date().toISOString()
                };

                await apolloClient.mutate({
                    mutation: UPDATE_CANDIDATE_INTERVIEW_STATUS,
                    variables: {
                        id: candidateId,
                        status: 'COMPLETED',
                        metaData: JSON.stringify(meta)
                    }
                });
            }

            setSubmitted(true);
            toast.success('Thank you for your feedback!');
        } catch (error: any) {
            console.error('Feedback error:', error);
            toast.error('Failed to save feedback, but your interview was submitted.');
            setSubmitted(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className={cn(
                'min-h-screen w-screen fixed inset-0 flex items-center justify-center p-6 font-sans',
                'bg-gray-50 text-gray-900'
            )}
            style={{
                overflow: 'hidden'
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.28 }}
                className={cn(
                    'w-full max-w-2xl p-8 rounded-2xl shadow-sm relative z-10',
                    'bg-white border border-gray-100'
                )}
            >
                {!submitted ? (
                    <>
                        <div className="flex flex-col items-center gap-3 text-center">
                            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                                <CheckCircle2 size={28} className="text-purple-600" />
                            </div>
                            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Interview Completed</h1>
                            <p className="text-sm text-gray-600 max-w-prose">
                                Your interview was recorded and securely submitted to the recruiter. Thank you for your time.
                            </p>
                        </div>

                        <div className="mt-8 space-y-6">
                            <div className="text-center">
                                <p className="text-xs font-bold uppercase opacity-90 tracking-wide mb-3">Rate your experience</p>
                                <div className="flex items-center justify-center gap-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className={cn(
                                                'text-2xl transition-transform transform hover:scale-110',
                                                rating >= star ? 'text-yellow-400' : 'text-gray-300'
                                            )}
                                        >
                                            <Star size={24} fill={rating >= star ? 'currentColor' : 'none'} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Additional comments</label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Tell us about the experience or any technical issues."
                                    className={cn(
                                        'w-full min-h-[100px] rounded-lg px-3 py-2 outline-none resize-none',
                                        'bg-white border border-gray-100 text-gray-800 placeholder-gray-400'
                                    )}
                                />
                            </div>

                            <div className="flex items-center justify-center gap-4 mt-4">
                                <button
                                    disabled={isSubmitting}
                                    onClick={handleSubmitFeedback}
                                    className={cn(
                                        'flex items-center gap-2 px-5 py-2 rounded-md font-semibold',
                                        'bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60'
                                    )}
                                >
                                    <ArrowRight size={16} className="opacity-90" />
                                    <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
                                </button>

                                <button
                                    onClick={() => navigate('/')}
                                    className={cn(
                                        'px-4 py-2 rounded-md font-medium border border-gray-200 text-gray-700 flex items-center gap-2',
                                        'bg-white hover:bg-gray-50'
                                    )}
                                >
                                    <Home size={16} className="text-gray-600" />
                                    <span>Return Home</span>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="py-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
                            <Heart size={28} className="text-purple-600" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2 text-gray-900">You're all set!</h2>
                        <p className="text-sm text-gray-600 mb-6">
                            Thank you for completing the interview. The recruiter will be in touch with next steps.
                        </p>
                        <div className="flex items-center justify-center">
                            <button
                                onClick={() => navigate('/')}
                                className={cn(
                                    'px-5 py-2 rounded-md font-semibold flex items-center gap-2',
                                    'bg-purple-600 text-white hover:bg-purple-700'
                                )}
                            >
                                <Home size={16} />
                                <span>Return Home</span>
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ThankYouPage;
