import {Button, Card} from "@tremor/react";
import Link from "next/link";

export default function Home() {
    return (
        <div
            className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <div className={"w-3/4 h-12 border-red-700 border rounded-xl"}>
                <Link href={"/pages-list"}>
                    <Card>
                        GO TO
                    </Card>
                </Link>
                <Button>
                    Test
                </Button>
            </div>
        </div>
    );
}
