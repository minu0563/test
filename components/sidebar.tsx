// 사이드바
"use client";

import { useRouter } from "next/navigation";

export default function Sidebar() {
      const router = useRouter();

    return (
        <div className="w-12 md:w-48 lg:w-64 p-4 border-r border-gray-300 h-screen flex flex-col">
            <p className="hidden md:block text-4xl font-bold cursor-pointer"
                onClick={() => router.push("/")} >test</p>
            <p className="block md:hidden text-2xl font-bold text-center items-center cursor-pointer">+</p>
                <p className="hidden md:block mt-7 p-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200">
                    새 채팅
                </p>

                <div className="hidden md:block p-2 mt-5 font-bold">
                    <p>최근 채팅</p>
                </div>

                <div className=" hidden md:block p-2 mt-auto font-bold cursor-pointer hover:bg-gray-100">
                    <p>login</p>
                </div>
            </div>
    )
}