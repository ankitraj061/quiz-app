'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { config } from '@/lib/utils';

type VerificationStatus = 'loading' | 'success' | 'error' | 'invalid';

export default function VerifyEmailPage() {
    const [status, setStatus] = useState<VerificationStatus>('loading');
    const [message, setMessage] = useState('');
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('invalid');
            setMessage('Invalid verification link');
            return;
        }

        verifyEmail(token);
    }, [token]);

    const verifyEmail = async (token: string) => {
        try {
            const response = await fetch(
                `${config.backendUrl}/api/v1/student/verify-email?token=${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message || 'Email verified successfully!');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/auth/student/login');
                }, 3000);
            } else {
                setStatus('error');
                setMessage(data.message || 'Verification failed');
            }
        } catch (error) {
            console.error('Verification error:', error);
            setStatus('error');
            setMessage('An error occurred during verification');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    {status === 'loading' && (
                        <>
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                                Verifying your email...
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Please wait while we verify your email address.
                            </p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                                <svg
                                    className="h-10 w-10 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                                Email Verified!
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">{message}</p>
                            <p className="mt-4 text-sm text-gray-500">
                                Redirecting to login page...
                            </p>
                            <Link
                                href="/login"
                                className="mt-4 inline-block text-blue-600 hover:text-blue-500"
                            >
                                Click here if not redirected
                            </Link>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                                <svg
                                    className="h-10 w-10 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                                Verification Failed
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">{message}</p>
                            <div className="mt-6 space-y-4">
                                <p className="text-sm text-gray-500">
                                    Your verification link may have expired or is invalid.
                                </p>
                                <Link
                                    href="/resend-verification"
                                    className="inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Resend Verification Email
                                </Link>
                            </div>
                        </>
                    )}

                    {status === 'invalid' && (
                        <>
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
                                <svg
                                    className="h-10 w-10 text-yellow-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                                Invalid Link
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">{message}</p>
                            <Link
                                href="/login"
                                className="mt-6 inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Go to Login
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ===========================
// 2. RESEND VERIFICATION PAGE (OPTIONAL)
// ===========================
// app/resend-verification/page.tsx

// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';

// export default function ResendVerificationPage() {
//     const [email, setEmail] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [message, setMessage] = useState('');
//     const [error, setError] = useState('');
//     const router = useRouter();

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setLoading(true);
//         setMessage('');
//         setError('');

//         try {
//             const response = await fetch(
//                 `${process.env.NEXT_PUBLIC_API_URL}/api/students/resend-verification`,
//                 {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({ email }),
//                 }
//             );

//             const data = await response.json();

//             if (response.ok) {
//                 setMessage('Verification email sent! Please check your inbox.');
//                 setTimeout(() => {
//                     router.push('/login');
//                 }, 3000);
//             } else {
//                 setError(data.message || 'Failed to send verification email');
//             }
//         } catch (err) {
//             setError('An error occurred. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//             <div className="max-w-md w-full space-y-8">
//                 <div>
//                     <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//                         Resend Verification Email
//                     </h2>
//                     <p className="mt-2 text-center text-sm text-gray-600">
//                         Enter your email address to receive a new verification link
//                     </p>
//                 </div>
//                 <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//                     <div>
//                         <label htmlFor="email" className="sr-only">
//                             Email address
//                         </label>
//                         <input
//                             id="email"
//                             name="email"
//                             type="email"
//                             autoComplete="email"
//                             required
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
//                             placeholder="Email address"
//                         />
//                     </div>

//                     {message && (
//                         <div className="rounded-md bg-green-50 p-4">
//                             <p className="text-sm text-green-800">{message}</p>
//                         </div>
//                     )}

//                     {error && (
//                         <div className="rounded-md bg-red-50 p-4">
//                             <p className="text-sm text-red-800">{error}</p>
//                         </div>
//                     )}

//                     <div>
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
//                         >
//                             {loading ? 'Sending...' : 'Send Verification Email'}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// }

// // ===========================
// // 3. ENVIRONMENT VARIABLES
// // ===========================
// // .env.local
// /*
// NEXT_PUBLIC_API_URL=http://localhost:5000
// */