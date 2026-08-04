"use client";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";


export default function LoginForm({ onClose }: { onClose: () => void }) {
    const { data: session, status } = useSession();

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

                <div className="flex flex-col items-center justify-center mt-3 w-full">
                    <p className="text-2xl mb-2 text-(--text)">
                        프로필
                    </p>
                    <p className="text-(--text)">
                        계정 : {session?.user?.email}
                    </p>
                    <p className="mt-3 text-(--text)">
                        이름 : {session?.user?.name}
                    </p>

                    <button className="mt-5 text-(--loginform-explain) cursor-pointer py-2 mb-2 w-full 
                            border border-(--loginform-border) hover:text-red-600/80 hover:border-red-500/60"
                            onClick={() => signOut()}>
                        로그아웃
                    </button>
                </div>
            </div>
        </div>
    );
}