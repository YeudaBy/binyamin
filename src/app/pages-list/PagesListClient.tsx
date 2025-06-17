"use client"

import {repo} from "remult";
import {useCallback, useEffect, useMemo, useState} from "react";
import {Button, Card, Dialog, DialogPanel, Icon, Text, Title} from "@tremor/react";
import {Tractate} from "@/shared/Entities/Tractate";
import {Page, PageStatus} from "@/shared/Entities/Page";
import {RiArrowRightSLine, RiBookOpenLine, RiCheckLine, RiCloseLine} from "@remixicon/react";
import Auth from "@/ui/auth";
import {useSession} from "next-auth/react";
import Link from "next/link";

// Initialize Remult repositories for Page and Tractate entities
const pRepo = repo(Page)
const tRepo = repo(Tractate)

// Extend Tractate type to include pages and counts for easier state management
interface TractateWithPagesAndCounts {
    tractate: Tractate;
    pages: Page[];
    counts: {
        available: number;
        taken: number;
        completed: number;
        total: number;
    };
}

export default function PagesList() {
    // State to hold all tractates, each with its associated pages and counts
    const [tractates, setTractates] = useState<TractateWithPagesAndCounts[]>([]);
    // State to hold the currently selected tractate for the dialog
    const [selectedTractate, setSelectedTractate] = useState<TractateWithPagesAndCounts | undefined>(undefined);
    // State to hold pages that the user has selected to take, but not yet saved
    const [pagesToTake, setPagesToTake] = useState<Page[]>([]);
    const {data} = useSession()

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDialogLoading, setIsDialogLoading] = useState(false);

    // Error state
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Callback to open the tractate dialog and fetch its pages
    const openTractateDialog = useCallback(async (tractateInfo: TractateWithPagesAndCounts) => {
        setSelectedTractate(tractateInfo);
        // If pages for this tractate are already loaded, don't refetch
        if (tractateInfo.pages.length > 0) return;

        setIsDialogLoading(true);
        try {
            const pages = await pRepo.find({
                where: {tractate: tractateInfo.tractate},
                orderBy: {index: "asc"}
            });

            // Update the specific tractate in the state with its newly fetched pages
            setTractates(currentTractates =>
                currentTractates.map(t =>
                    t.tractate.id === tractateInfo.tractate.id ? {...t, pages} : t
                )
            );
        } catch (error) {
            console.error("Failed to fetch pages for tractate:", error);
            // Optionally, set an error message for the dialog
        } finally {
            setIsDialogLoading(false);
        }
    }, []);

    // Effect to fetch initial data on component mount (tractates and counts)
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            try {
                // Fetch all tractates
                const fetchedTractates = await tRepo.find({orderBy: {seder: "asc"}});

                // For each tractate, fetch its page counts
                const tractatesWithCounts = await Promise.all(
                    fetchedTractates.map(async (t) => {
                        const available = await pRepo.count({tractate: t, pageStatus: PageStatus.Available});
                        const taken = await pRepo.count({tractate: t, pageStatus: PageStatus.Taken});
                        const completed = await pRepo.count({tractate: t, pageStatus: PageStatus.Completed});
                        const total = available + taken + completed;

                        return {
                            tractate: t,
                            pages: [], // Pages will be fetched on demand
                            counts: {available, taken, completed, total}
                        };
                    })
                );
                setTractates(tractatesWithCounts);
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
                setErrorMessage("שגיאה בטעינת הנתונים. אנא נסה/י שוב מאוחר יותר.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Memoized SederMap for efficient rendering of AccordionList
    const sederMap: Record<string, TractateWithPagesAndCounts[]> = useMemo(() => {
        const map: Record<string, TractateWithPagesAndCounts[]> = {};
        for (const t of tractates) {
            if (!map[t.tractate.seder]) {
                map[t.tractate.seder] = [];
            }
            map[t.tractate.seder].push(t);
        }
        return map;
    }, [tractates]);

    // Memoized selectedTractate to ensure it always reflects the latest state of pages
    const memoizedSelectedTractate = useMemo(() => {
        if (!selectedTractate) return undefined;
        return tractates.find(t => t.tractate.id === selectedTractate.tractate.id);
    }, [selectedTractate, tractates])

    // Callback for when a single page is selected/deselected in the dialog
    const onPageSelected = useCallback(async (page: Page) => {
        if (page.pageStatus === PageStatus.Completed || page.pageStatus === PageStatus.Taken) {
            return;
        }

        const isCurrentlySelectedForTaking = pagesToTake.some(p => p.id === page.id);

        if (isCurrentlySelectedForTaking) {
            setPagesToTake(prev => prev.filter(p => p.id !== page.id));
        } else {
            if (page.pageStatus === PageStatus.Available) {
                setPagesToTake(prev => [...prev, page]);
            }
        }
    }, [pagesToTake]);

    // Callback to select all available pages in the currently open tractate dialog
    const onSelectAllInTractate = useCallback(() => {
        if (!memoizedSelectedTractate) return;

        const availablePagesInTractate = memoizedSelectedTractate.pages.filter(
            p => p.pageStatus === PageStatus.Available && !pagesToTake.some(selected => selected.id === p.id)
        );

        setPagesToTake(prev => [...prev, ...availablePagesInTractate]);
    }, [memoizedSelectedTractate, pagesToTake]);

    // Callback to handle saving the selected pages to 'Taken' status
    const handleTakeSelectedPages = useCallback(async () => {
        if (pagesToTake.length === 0) return;

        setIsSaving(true);
        setErrorMessage(null);

        const updatesForOptimisticUI = pagesToTake.map(page => ({
            id: page.id,
            newStatus: PageStatus.Taken,
            byUser: data?.user.id,
            byUserName: data?.user.name
        }));

        setTractates(prevTractates =>
            prevTractates.map(tractateWithPages => ({
                ...tractateWithPages,
                pages: tractateWithPages.pages.map(page => {
                    const foundUpdate = updatesForOptimisticUI.find(u => u.id === page.id);
                    if (foundUpdate) {
                        return page.assign({
                            pageStatus: foundUpdate.newStatus,
                            byUser: foundUpdate.byUser
                        });
                    }
                    return page;
                })
            }))
        );
        setPagesToTake([]);

        try {
            await Promise.all(
                pagesToTake.map(page => {
                    if (!data?.user?.id) return Promise.resolve();
                    return pRepo.update(page.id, {
                        pageStatus: PageStatus.Taken,
                        byUser: data.user.id,
                        byUserName: data.user.name || undefined
                    });
                })
            );
        } catch (error) {
            console.error('Failed to take selected pages:', error);
            setErrorMessage("שגיאה בשמירת הדפים. אנא נסה/י שוב.");
        } finally {
            setIsSaving(false);
        }
    }, [pagesToTake, data?.user]);

    const hasPagesTakenByCurrentUser = useMemo(() => {
        if (!memoizedSelectedTractate) return false;
        return memoizedSelectedTractate.pages.some(p =>
            p.pageStatus === PageStatus.Taken && p.byUser === data?.user?.id
        );
    }, [memoizedSelectedTractate, data?.user?.id]);

    return (
        <Auth>
            <div className="min-h-screen flex flex-col items-center bg-fixed">
                {/* Full Screen Loading Overlay */}
                {isSaving && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
                        <div
                            className="glass-effect rounded-2xl p-8 shadow-xl border border-blue-100 flex flex-col items-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                            <div className="text-blue-800 font-heading text-xl">שומר דפים...</div>
                            <div className="text-blue-600 font-body text-sm mt-2">אנא המתן, אל תצא מהדף</div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="w-full max-w-4xl px-2 md:px-0 flex flex-col gap-6 mt-6 mb-8">
                    <div
                        className="glass-effect rounded-2xl p-6 md:p-8 shadow-xl border border-blue-100 flex flex-col items-center text-center">
                        <Link href="/" className="self-start mb-4 text-blue-600 hover:text-blue-800 transition-colors">
                            <Icon icon={RiArrowRightSLine} size="lg"/>
                        </Link>
                        <Icon icon={RiBookOpenLine} size="xl" className="mb-4 text-blue-600"/>
                        <Title
                            className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4 font-heading">
                            לקיחת דפים
                        </Title>
                        <div
                            className="text-lg md:text-xl font-light tracking-wide text-blue-900 leading-snug font-body">
                            לעילוי נשמת ידידינו
                            <span className="font-extrabold"> בנימין </span>
                            יעבץ בן
                            <span className="font-extrabold"> אפרים פישל </span>
                            זצ״ל
                        </div>
                    </div>

                    {/* Quick Navigation */}
                    {!isLoading && Object.keys(sederMap).length > 0 && (
                        <Card className="glass-effect rounded-2xl p-6 shadow-xl border border-blue-100">
                            <h3 className="text-lg font-semibold text-blue-800 mb-4 font-heading text-center">דילוג מהיר
                                לסדר</h3>
                            <div className="flex flex-wrap justify-center gap-2">
                                {Object.keys(sederMap).map((sederName) => (
                                    <Button
                                        key={sederName}
                                        size="sm"
                                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-body text-sm px-3 py-1"
                                        onClick={() => {
                                            const element = document.getElementById(`seder-${sederName}`);
                                            element?.scrollIntoView({behavior: 'smooth', block: 'start'});
                                        }}
                                    >
                                        {sederName}
                                    </Button>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <Card className="glass-effect rounded-2xl p-8 shadow-xl border border-blue-100 text-center">
                            <div className="text-blue-600 animate-pulse font-body">
                                טוען נתונים...
                            </div>
                        </Card>
                    )}

                    {/* Error State */}
                    {errorMessage && (
                        <Card
                            className="glass-effect rounded-2xl p-6 shadow-xl border border-red-200 bg-red-50/80 text-center">
                            <div className="text-red-700 font-body">
                                {errorMessage}
                            </div>
                        </Card>
                    )}

                    {/* Seders and Tractates */}
                    {!isLoading && tractates.length === 0 && (
                        <Card className="glass-effect rounded-2xl p-8 shadow-xl border border-blue-100 text-center">
                            <div className="text-blue-700 font-body">
                                עדיין לא הוגדרו מסכתות במערכת.
                            </div>
                        </Card>
                    )}

                    {!isLoading && tractates.length > 0 && (
                        <div className="space-y-6">
                            {Object.entries(sederMap).map(([sederName, tractateList]) => (
                                <Card key={sederName} id={`seder-${sederName}`}
                                      className="glass-effect rounded-2xl p-6 md:p-8 shadow-xl border border-blue-100 scroll-mt-6">
                                    <h2 className="text-2xl font-semibold text-blue-800 mb-6 font-heading text-center">{sederName}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {tractateList.map((t) => {
                                            const {total, available, taken, completed} = t.counts;

                                            return (
                                                <Card key={t.tractate.id}
                                                      className="rounded-2xl p-4">
                                                    <div className="flex flex-col h-full">
                                                        <Title
                                                            className="text-lg font-bold text-blue-800 mb-3 font-heading text-right">{t.tractate.name}</Title>
                                                        <div
                                                            className="space-y-1 text-sm text-blue-700 mb-4 flex-grow font-body text-right">
                                                            <div>סה״כ דפים: {total}</div>
                                                            {available > 0 && <div
                                                                className="text-green-600">פנויים: {available}</div>}
                                                            {taken > 0 &&
                                                                <div className="text-amber-600">נלקחו: {taken}</div>}
                                                            {completed > 0 && <div
                                                                className="text-emerald-600">הושלמו: {completed}</div>}
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-body"
                                                            onClick={() => {
                                                                openTractateDialog(t);
                                                                console.log(t);
                                                            }}
                                                        >
                                                            צפה בדפים
                                                        </Button>
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Dialog for displaying pages within a selected tractate */}
                <Dialog open={!!memoizedSelectedTractate} onClose={() => setSelectedTractate(undefined)} static>
                    <DialogPanel
                        className="relative text-start mt-14 flex flex-col max-h-[80vh] glass-effect rounded-2xl border border-blue-100">
                        <Icon onClick={() => setSelectedTractate(undefined)} icon={RiCloseLine}
                              className="bg-blue-600 text-white rounded-full p-2 absolute -top-2 -left-2 cursor-pointer shadow-lg hover:bg-blue-700 transition-colors"/>

                        <div className="p-6 border-b border-blue-100">
                            <h3 className="text-2xl font-bold text-blue-800 font-heading text-right">
                                {memoizedSelectedTractate?.tractate.name}
                            </h3>
                            <div className="flex justify-end mt-4">
                                <Button
                                    size="sm"
                                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-body"
                                    onClick={onSelectAllInTractate}
                                    disabled={isSaving || isLoading || !memoizedSelectedTractate?.pages.some(p => p.pageStatus === PageStatus.Available && !pagesToTake.some(s => s.id === p.id))}
                                >
                                    בחר את כל הדפים הפנויים במסכת זו
                                </Button>
                            </div>
                        </div>

                        {isDialogLoading ? (
                            <div className="flex justify-center items-center h-48">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div
                                className="grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-3 overflow-y-auto p-6">
                                {memoizedSelectedTractate?.pages
                                    .sort((a, b) => a.index - b.index)
                                    .map(page => (
                                        <PageBox
                                            key={page.id}
                                            page={page}
                                            onSelect={() => onPageSelected(page)}
                                            isSelectedForTaking={pagesToTake.some(p => p.id === page.id)}
                                            currentUserId={data?.user.id || "-"}
                                            isSaving={isSaving}
                                        />
                                    ))}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 p-6 border-t border-blue-100 bg-white/90 rounded-b-2xl">
                            {hasPagesTakenByCurrentUser && (
                                <Link href="/my-pages">
                                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-body">
                                        <span className="flex items-center justify-center gap-2">
                                            ניהול הדפים שלי <RiCheckLine size={16}/>
                                        </span>
                                    </Button>
                                </Link>
                            )}
                            {!!pagesToTake.length && (
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg font-body"
                                    onClick={handleTakeSelectedPages}
                                    disabled={isSaving}
                                >
                                    {isSaving ? "שומר דפים..." : `קח דפים מסומנים (${pagesToTake.length})`}
                                </Button>
                            )}
                        </div>
                    </DialogPanel>
                </Dialog>
            </div>
        </Auth>
    );
}

// PageBox component to display individual page status and handle clicks
interface PageBoxProps {
    page: Page;
    onSelect: () => void;
    isSelectedForTaking: boolean;
    currentUserId: string;
    isSaving: boolean;
}

function PageBox({page, onSelect, isSelectedForTaking, currentUserId, isSaving}: PageBoxProps) {
    let bgc = "";
    let txc = "";
    let cursorClass = "cursor-default";

    switch (page.pageStatus) {
        case PageStatus.Available:
            bgc = isSelectedForTaking ? "bg-blue-200 border-blue-400" : "bg-blue-50 border-blue-200";
            txc = isSelectedForTaking ? "text-blue-800" : "text-blue-600";
            cursorClass = "cursor-pointer hover:bg-blue-100";
            break;
        case PageStatus.Taken:
            bgc = page.byUser === currentUserId ? "bg-amber-100 border-amber-300" : "bg-gray-100 border-gray-300";
            txc = page.byUser === currentUserId ? "text-amber-800" : "text-gray-600";
            cursorClass = page.byUser === currentUserId ? "cursor-pointer hover:bg-amber-200" : "cursor-not-allowed";
            break;
        case PageStatus.Completed:
            bgc = "bg-emerald-100 border-emerald-300";
            txc = "text-emerald-700";
            cursorClass = "cursor-not-allowed";
            break;
    }

    const handleClick = () => {
        if (!isSaving && (page.pageStatus === PageStatus.Available || (page.pageStatus === PageStatus.Taken && page.byUser === currentUserId))) {
            onSelect();
        }
    };

    return (
        <Card onClick={handleClick}
              className={`p-3 text-center rounded-xl border-2 transition-all duration-200 ${bgc} ${txc} ${isSaving ? "opacity-70" : ""} ${cursorClass}`}>
            <Title className="font-bold text-sm font-body">{page.indexName}</Title>
            {page.pageStatus === PageStatus.Taken && page.byUser && (
                <Text className="text-xs mt-1 font-body">
                    {page.byUser === currentUserId ? 'שלך' : 'נלקח'}
                </Text>
            )}
            {page.pageStatus === PageStatus.Completed && (
                <Text className="text-xs mt-1 font-body">
                    הושלם
                </Text>
            )}
        </Card>
    )
}
