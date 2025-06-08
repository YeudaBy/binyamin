"use client"

import {repo} from "remult";
import {Page, PageStatus} from "@/shared/Entities/Page";
import {Tractate} from "@/shared/Entities/Tractate";
import {useEffect, useState} from "react";
import {
    Accordion,
    AccordionBody,
    AccordionHeader,
    AccordionList,
    Button,
    Card,
    Dialog,
    DialogPanel,
    Text,
    Title,
    Tracker,
    TrackerProps
} from "@tremor/react";
import "../globals.css"

const pRepo = repo(Page)
const tRepo = repo(Tractate)

type TractateItem = {
    tractateId: string;
    tractateName: string;
    pages: Page[];
}

type SederMap = {
    [seder: string]: TractateItem[];
};

export default function PagesList() {
    const [sederMap, setSederMap] = useState<SederMap>({});
    const [selectedTractate, setSelectedTractate] = useState<TractateItem>();
    const [draftedPages, setDraftedPages] = useState<Page[]>([])

    const openTractateDialog = (t: TractateItem) => setSelectedTractate(t);

    useEffect(() => {
        const fetchPages = async () => {
            const tractates = await tRepo.find();

            const maps = await Promise.all(
                tractates.map(async (t) => {
                    const pages = await pRepo.find({
                        include: {tractate: true},
                        where: {tractate: t},
                    });

                    return {
                        seder: t.seder,
                        tractateId: t.id,
                        tractateName: t.name,
                        pages,
                    };
                })
            );

            const mapBySeder: SederMap = {};
            for (const t of maps) {
                if (!mapBySeder[t.seder]) mapBySeder[t.seder] = [];
                mapBySeder[t.seder].push({
                    tractateId: t.tractateId,
                    tractateName: t.tractateName,
                    pages: t.pages,
                });
            }

            setSederMap(mapBySeder);
        };

        fetchPages();
    }, []);

    async function onPageSelected(page: Page) {
        if (page.pageStatus === PageStatus.Available) {
            setDraftedPages(prevState => ([...prevState, page]))
            await pRepo.update(page.id, {pageStatus: PageStatus.Drafted})
        } else if (page.pageStatus === PageStatus.Drafted) { // todo user
            setDraftedPages(prevState => prevState.filter(p => p.id !== page.id))
            await pRepo.update(page.id, {pageStatus: PageStatus.Available})
        }
    }

    return <>
        <AccordionList className={"bg-blue-800"}>
            {Object.entries(sederMap).map(([sederName, tractates]) => (
                <Accordion key={sederName}>
                    <AccordionHeader>{sederName}</AccordionHeader>
                    <AccordionBody>
                        <ul className="space-y-2">
                            {tractates.map((t) => (
                                <li key={t.tractateId} className="p-2 border rounded cursor-pointer hover:bg-gray-100"
                                    onClick={() => openTractateDialog(t)}>
                                    <Text className="font-semibold text-base">{t.tractateName}</Text>
                                    <Tracker data={summarizePagesStatusForTracker(t.pages)}/>
                                </li>
                            ))}
                        </ul>
                    </AccordionBody>
                </Accordion>
            ))}
        </AccordionList>

        <Dialog className={"bg-black border border-red-700"}
                open={!!selectedTractate} onClose={() => setSelectedTractate(undefined)} static>
            <DialogPanel className={"relative"}>
                <h3 className="text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                    {selectedTractate?.tractateName}
                </h3>
                <p className="mt-2 leading-6 text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                    Your account has been created successfully. You can now login to your
                    account. For more information, please contact us.
                </p>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-2">
                    {selectedTractate?.pages.sort(p => p.index).map(page => (
                        <PageBox
                            key={page.id}
                            page={page}
                            onSelect={() => onPageSelected(page)}
                        />
                    ))}
                </div>
                {!!draftedPages.length &&
                    <Button color={"emerald"} className={"w-full sticky bottom-3 shadow-xl shadow-emerald-200 my-3"}>
                        שמירת הדפים
                    </Button>}
            </DialogPanel>

        </Dialog>
    </>;
};

function PageBox({page, onSelect}: { page: Page, onSelect: () => void }) {
    let bgc;
    let txc;

    console.log(page.pageStatus)

    switch (page.pageStatus) {
        case PageStatus.Drafted:
            bgc = "bg-blue-100"
            txc = "color-blue-500"
            break;
        case PageStatus.Taken:
            bgc = "bg-amber-100"
            txc = "color-amber-500"
            break;
        case PageStatus.Completed:
            bgc = "bg-emerald-100"
            txc = "color-emerald-500"
            break;
    }

    const canClick = page.pageStatus === PageStatus.Available || page.byUser?.id === "" // todo

    return <Card onClick={onSelect}
                 className={`p-2 text-center ${bgc} ${txc} ${canClick ? "cursor-pointer" : "cursor-not-allowed"}`}>
        <Title className={"font-bold"}>{page.indexName}</Title>
    </Card>
}


const STATUS_LABELS: Record<PageStatus, string> = {
    [PageStatus.Available]: "פנוי",
    [PageStatus.Drafted]: "שמור",
    [PageStatus.Taken]: "נלקח",
    [PageStatus.Completed]: "הסתיים",
};

const STATUS_COLORS: Record<PageStatus, TrackerProps["data"][number]["color"]> = {
    [PageStatus.Available]: "emerald",
    [PageStatus.Drafted]: "yellow",
    [PageStatus.Taken]: "blue",
    [PageStatus.Completed]: "red",
};

function summarizePagesStatusForTracker(pages: { pageStatus: PageStatus }[]): TrackerProps["data"] {
    const counts: Record<PageStatus, number> = {
        [PageStatus.Available]: 0,
        [PageStatus.Drafted]: 0,
        [PageStatus.Taken]: 0,
        [PageStatus.Completed]: 0,
    };

    for (const page of pages) {
        counts[page.pageStatus]++;
    }

    return Object.entries(counts)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => {
            const numericStatus = Number(status) as PageStatus;
            return {
                color: STATUS_COLORS[numericStatus],
                tooltip: `${STATUS_LABELS[numericStatus]}: ${count}`,
                value: count,
            };
        });
}
