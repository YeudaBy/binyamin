"use client";
import {SessionProvider} from "next-auth/react";
import {ContextProvider} from "@/app/context";

export function Providers({children}: {children: React.ReactNode}) {
    return (
        <SessionProvider>
            <ContextProvider>
                {children}
            </ContextProvider>
        </SessionProvider>
    );
} 