import { remultApi } from 'remult/remult-next'
import { User } from "@/shared/Entities/User";
import { Seder, Tractate } from "@/shared/Entities/Tractate";
import { Page, PageStatus } from "@/shared/Entities/Page";
import pagesJson from "./pages.json"
import { getUserOnServer } from "@/shared/auth";
import { Log } from "@/shared/Entities/Log";
import { StatsController } from './Stats';
import { createPostgresConnection } from 'remult/postgres';

// Use a flag to determine if the environment is Vercel production
const isVercelProduction = process.env.VERCEL_ENV === 'production';

export const api = remultApi({
    admin: true,
    entities: [User, Tractate, Page, Log],
    controllers: [StatsController],
    // dataProvider:  createPostgresConnection({
    //         connectionString: process.env.POSTGRES_URL,
    //         configuration: {
    //             ssl: {
    //                 rejectUnauthorized: false
    //             }
    //         }
    //     }),
    initApi: async (remult) => {
        console.log("Creating Pages...");
        const pRepo = remult.repo(Page);
        const tRepo = remult.repo(Tractate);

        const pagesCount = await pRepo.count();
        if (pagesCount == 2696) {
            console.log("Pages existed", pagesCount);
            return;
        }

        console.log("Deleting pages...");
        for await (const page of pRepo.query()) {
            page.delete()
        }
        for await (const tractate of tRepo.query()) {
            tractate.delete()
        }


        const seders = Object.keys(pagesJson) as Seder[];

        for (const sederKey of seders) {
            console.log("Seder:", sederKey);
            const tractates = pagesJson[sederKey as keyof typeof pagesJson];

            for (const [tractateName, numPages] of Object.entries(tractates)) {
                console.log("Creating tractate:", tractateName);

                const trOb = await tRepo.insert({
                    name: tractateName,
                    seder: sederKey,
                });

                const pagesToCreate = Array.from({ length: numPages - 1 }, (_, i) => {
                    return pRepo.insert({
                        index: i,
                        indexName: intToHebrewDaf(i + 2),
                        pageStatus: PageStatus.Available,
                        tractate: trOb,
                        byUser: undefined,
                        takenAt: undefined,
                    });
                });

                await Promise.all(pagesToCreate);
            }
        }

        console.log("All pages and tractates created.");
    },
    getUser: getUserOnServer
})

function intToHebrewDaf(n: number): string {
    const units: { [key: number]: string } = {
        1: "א", 2: "ב", 3: "ג", 4: "ד", 5: "ה",
        6: "ו", 7: "ז", 8: "ח", 9: "ט",
    };

    const tens: { [key: number]: string } = {
        10: "י", 20: "כ", 30: "ל", 40: "מ", 50: "נ",
        60: "ס", 70: "ע", 80: "פ", 90: "צ",
    };

    const hundreds: { [key: number]: string } = {
        100: "ק", 200: "ר", 300: "ש", 400: "ת"
    };

    if (n === 15) return "ט״ו"; // Avoid God's name
    if (n === 16) return "ט״ז";
    if (n === 115) return "קט״ו"
    if (n === 116) return "קט״ז"
    if (n === 215) return "רט״ו"
    if (n === 216) return "רט״ז"

    let result = "";

    const hundred = Math.floor(n / 100) * 100;
    const ten = Math.floor((n % 100) / 10) * 10;
    const unit = n % 10;

    if (hundred) result += hundreds[hundred] || "";
    if (ten) result += tens[ten] || "";
    if (unit) result += units[unit] || "";

    if (result.length >= 2) {
        // Add gershayim (״) before the last letter
        return result.slice(0, -1) + "״" + result.slice(-1);
    } else if (result.length === 1) {
        // Add geresh (׳) for single letter
        return result + "׳";
    }

    return result;
}
