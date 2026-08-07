"use client";
import { signIn } from "next-auth/react";

export default function LoginForm({ onClose }: { onClose: () => void }) {
    const googleLogin = async () => {
        await signIn("google", {
            callbackUrl: window.location.pathname,
        });
    };

    return (
        <div>
            <div className="flex flex-col mt-3 w-full md:w-96">
                <div className="flex justify-end">
                    <button
                        className="w-9 h-9 text-3xl rounded-full flex items-center justify-center text-(--text) hover:bg-(--loginform-close-hover)"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center mt-3">
                    <p className="text-2xl mb-2 text-(--text)">
                        로그인 및 회원가입
                    </p>
                    <p className="text-(--loginform-explain)">
                        로그인을 통해 자소서 정보를 관리하세요.
                    </p>
                </div>

                <button onClick={() => googleLogin()}
                        className="w-full mt-6 p-3 rounded-full border border-(--loginform-button-border)">
                    <div className="flex items-center justify-center gap-2 cursor-pointer">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 48 48"
                            width="24px"
                            height="24px"
                        >
                            <path
                                fill="#FFC107"
                                d="M43.611 20.083H42V20H24v8h11.303C33.654 31.91 29.17 35 24 35c-6.075 0-11-4.925-11-11s4.925-11 11-11c2.802 0 5.355 1.047 7.29 2.77l5.657-5.657C33.654 7.053 28.977 5 24 5 13.507 5 5 13.507 5 24s8.507 19 19 19c10.493 0 19-8.507 19-19 0-1.273-.13-2.515-.389-3.917z"
                            />
                            <path
                                fill="#FF3D00"
                                d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c2.802 0 5.355 1.047 7.29 2.77l5.657-5.657C33.654 7.053 28.977 5 24 5 16.318 5 9.656 9.337 6.306 14.691z"
                            />
                            <path
                                fill="#4CAF50"
                                d="M24 43c4.865 0 9.4-1.866 12.773-4.9l-5.891-4.99C28.977 35 26.635 36 24 36c-5.146 0-9.614-3.075-11.625-7.484l-6.522 5.025C9.19 38.556 16.089 43 24 43z"
                            />
                            <path
                                fill="#1976D2"
                                d="M43.611 20.083H42V20H24v8h11.303c-1.087 3.064-3.23 5.461-5.421 7.11l5.891 4.99C39.816 36.625 43 31.25 43 24c0-1.273-.13-2.515-.389-3.917z"
                            />
                        </svg>

                        <span className="text-(--text)">
                            구글 계정으로 계속하기
                        </span>
                    </div>
                </button>
            </div>
        </div>
    );
}