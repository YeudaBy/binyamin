"use client"

import {repo} from "remult";
import {useCallback, useEffect, useMemo, useState} from "react";
import {
    Accordion,
    AccordionBody,
    AccordionHeader,
    AccordionList,
    Button,
    Card,
    Dialog,
    DialogPanel,
    Icon,
    Text,
    Title
} from "@tremor/react";
import {Tractate} from "@/shared/Entities/Tractate";
import {Page, PageStatus} from "@/shared/Entities/Page";
import {User} from "@/shared/Entities/User";
import {RiCloseLine} from "@remixicon/react";
import Auth from "@/ui/auth";
import {useSession} from "next-auth/react"; // Assuming this path is correct for global styles
// Initialize Remult repositories for Page and Tractate entities
const pRepo = repo(Page)
const tRepo = repo(Tractate)

// Extend Tractate type to include pages for easier state management
type TractateItem = Tractate & {
    pages: Page[]
}

// Define the structure for mapping seders to tractates
type SederMap = {
    [seder: string]: TractateItem[]; // Changed to TractateItem to include pages
};

export default function PagesList() {
    // State to hold all tractates, each with its associated pages
    const [tractates, setTractates] = useState<TractateItem[]>([]);
    // State to hold the currently selected tractate for the dialog
    const [selectedTractate, setSelectedTractate] = useState<TractateItem | undefined>(undefined);
    // State to hold pages that the user has selected to take, but not yet saved
    const [pagesToTake, setPagesToTake] = useState<Page[]>([]); // Renamed from draftedPages
    const {data} = useSession()

    // Loading states
    const [isLoading, setIsLoading] = useState(true); // For initial data fetch
    const [isSaving, setIsSaving] = useState(false); // For saving selected pages

    // Error state
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Callback to open the tractate dialog, memoized for performance
    const openTractateDialog = useCallback((t: TractateItem) => setSelectedTractate(t), []);

    // Effect to fetch initial data on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true); // Start loading
            setErrorMessage(null); // Clear previous errors
            try {
                // Fetch all tractates
                const fetchedTractates = await tRepo.find();

                // For each tractate, fetch its associated pages
                const tractatesWithPages = await Promise.all(
                    fetchedTractates.map(async (t) => {
                        const pages = await pRepo.find({
                            include: {tractate: true}, // Include tractate relation
                            where: {tractate: t}, // Filter pages by tractate
                        });
                        return {...t, pages}; // Combine tractate data with its pages
                    })
                );
                setTractates(tractatesWithPages);

                // Initialize pagesToTake with any pages already taken by the current user
                // This ensures reloads reflect the user's current "taken" pages for potential deselection
                const initialUserTakenPages = tractatesWithPages.flatMap(t =>
                    t.pages.filter(p => p.pageStatus === PageStatus.Taken && p.byUser === data?.user.id)
                );
                setPagesToTake(initialUserTakenPages);
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
                setErrorMessage("שגיאה בטעינת הנתונים. אנא נסה/י שוב מאוחר יותר.");
            } finally {
                setIsLoading(false); // End loading
            }
        };

        fetchInitialData();
    }, []); // Empty dependency array ensures this runs only once on mount

    // Memoized SederMap for efficient rendering of AccordionList
    const sederMap: SederMap = useMemo(() => {
        const map: SederMap = {};
        for (const t of tractates) {
            if (!map[t.seder]) {
                map[t.seder] = [];
            }
            map[t.seder].push(t);
        }
        return map;
    }, [tractates]); // Recalculate only when tractates state changes

    // Memoized selectedTractate to ensure it always reflects the latest state of pages
    const memoizedSelectedTractate = useMemo(() => {
        if (!selectedTractate) return undefined;
        // Find the latest version of the selected tractate from the global tractates state
        return tractates.find(t => t.id === selectedTractate.id);
    }, [selectedTractate, tractates]);

    // Function to update a page's status locally within the tractates state
    const updatePageStatusLocally = useCallback((pageId: string, newStatus: PageStatus, byUser?: User) => {
        setTractates(prevTractates =>
            prevTractates.map(tractate => ({
                ...tractate,
                pages: tractate.pages.map(page =>
                    page.id === pageId ? {...page, pageStatus: newStatus, byUser: byUser} : page
                ),
            }))
        );
    }, []);

    // Callback for when a single page is selected/deselected in the dialog
    const onPageSelected = useCallback(async (page: Page) => {
        // If the page is completed or taken by another user, it's not clickable
        if (page.pageStatus === PageStatus.Completed || (page.pageStatus === PageStatus.Taken && page.byUser !== data?.user.id)) {
            return;
        }

        // Check if the page is currently in the local selection queue (pagesToTake)
        const isCurrentlySelectedForTaking = pagesToTake.some(p => p.id === page.id);

        if (isCurrentlySelectedForTaking) {
            // If already in pagesToTake, deselect it
            setPagesToTake(prev => prev.filter(p => p.id !== page.id));
        } else {
            // If not in pagesToTake and it's available or taken by current user, select it
            if (page.pageStatus === PageStatus.Available || (page.pageStatus === PageStatus.Taken && page.byUser === data?.user.id)) {
                setPagesToTake(prev => [...prev, page]);
            }
        }
    }, [pagesToTake, data?.user.id]); // Depend on pagesToTake and currentUserId

    // Callback to select all available pages in the currently open tractate dialog
    const onSelectAllInTractate = useCallback(() => {
        if (!memoizedSelectedTractate) return;

        // Filter for pages that are currently available and not already in pagesToTake
        const availablePagesInTractate = memoizedSelectedTractate.pages.filter(
            p => p.pageStatus === PageStatus.Available && !pagesToTake.some(selected => selected.id === p.id)
        );

        // Add these pages to the pagesToTake array
        setPagesToTake(prev => [...prev, ...availablePagesInTractate]);

    }, [memoizedSelectedTractate, pagesToTake]);

    // Callback to handle saving the selected pages to 'Taken' status
    const handleTakeSelectedPages = useCallback(async () => {
        if (pagesToTake.length === 0) return;

        setIsSaving(true); // Start saving
        setErrorMessage(null); // Clear previous errors
        console.log(data?.user)

        // Prepare optimistic UI updates for pages that will be taken
        const updatesForOptimisticUI = pagesToTake.map(page => ({
            id: page.id,
            newStatus: PageStatus.Taken,
            byUser: data?.user.id,
            byUserName: data?.user.name
        }));

        // Apply optimistic updates to the local state
        setTractates(prevTractates =>
            prevTractates.map(tractate => ({
                ...tractate,
                pages: tractate.pages.map(page => {
                    const foundUpdate = updatesForOptimisticUI.find(u => u.id === page.id);
                    if (foundUpdate) {
                        return {...page, pageStatus: foundUpdate.newStatus, byUser: foundUpdate.byUser};
                    }
                    return page;
                }),
            }))
        );
        setPagesToTake([]); // Clear the selection queue after initiating the save

        try {
            // Persist changes to the backend for all selected pages
            await Promise.all(
                pagesToTake.map(page => pRepo.update(page.id, {
                    pageStatus: PageStatus.Taken,
                    byUser: data?.user.id,
                    byUserName: data?.user.name
                }))
            );
            console.log("Successfully took selected pages.");
        } catch (error) {
            console.error('Failed to take selected pages:', error);
            setErrorMessage("שגיאה בשמירת הדפים. אנא נסה/י שוב.");
            // Revert UI for each page that failed to update.
            // This rollback logic for batch updates can be complex.
            // For simplicity, here we just log the error. In a robust app, you might:
            // 1. Re-fetch the data for specific pages/tractates.
            // 2. Add individual error states to PageBox components.
            // 3. Show a global error message and instruct user to refresh.
            // For a simple rollback, you'd need to re-add pages back to pagesToTake
            // and revert their status in tractates. This is skipped for brevity here.
        } finally {
            setIsSaving(false); // End saving
        }
    }, [pagesToTake, data?.user]); // Depend on pagesToTake, updatePageStatusLocally, currentUserId

    return (
        <Auth>
            <div className={"relative"}>

                <div className={"w-full bg-tremor-brand-muted py-2 shadow-md shadow-tremor-brand-muted sticky top-0"}
                     style={{zIndex: 1000}}>
                    <Text className={"font-light tracking-wide text-base text-center text-tremor-brand-emphasis"}>
                        לעילוי נשמת הב׳
                        <span className={"font-extrabold"}> בנימין </span>
                        בן הרב
                        <span className={"font-extrabold"}> אפרים שבתי </span>
                        יעבץ זצ״ל
                    </Text>
                </div>

                {/* Display loading message for initial data fetch */}
                {isLoading && (
                    <div className="text-center p-4 text-tremor-content-strong">
                        טוען נתונים...
                    </div>
                )}

                {/* Display error message if any */}
                {errorMessage && (
                    <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg m-4">
                        {errorMessage}
                    </div>
                )}

                {/* Accordion List for Seders and Tractates - conditionally rendered after loading */}
                {!isLoading && (
                    <AccordionList className={"bg-blue-800"}>
                        {Object.entries(sederMap).map(([sederName, tractateList]) => (
                            <Accordion key={sederName}>
                                <AccordionHeader>{sederName}</AccordionHeader>
                                <AccordionBody>
                                    <ul className="space-y-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2"> {/* Added responsive grid and padding */}
                                        {tractateList.map((t) => {
                                            const totalPages = t.pages.length;
                                            const availableCount = t.pages.filter(p => p.pageStatus === PageStatus.Available).length;
                                            const takenCount = t.pages.filter(p => p.pageStatus === PageStatus.Taken).length;
                                            const completedCount = t.pages.filter(p => p.pageStatus === PageStatus.Completed).length;

                                            // Build the combined status text
                                            let statusTextParts: string[] = [`סה"כ דפים: ${totalPages}`];
                                            if (availableCount > 0) {
                                                statusTextParts.push(`פנויים: ${availableCount}`);
                                            }
                                            if (takenCount > 0) {
                                                statusTextParts.push(`נלקחו: ${takenCount}`);
                                            }
                                            if (completedCount > 0) {
                                                statusTextParts.push(`הסתיימו: ${completedCount}`);
                                            }
                                            const combinedStatusText = statusTextParts.join(' ✦ ');


                                            return (
                                                <Card key={t.id}
                                                      className="p-4 text-start cursor-pointer hover:bg-gray-50 flex flex-col justify-between">
                                                    <div>
                                                        <Title className="font-bold text-lg mb-2">{t.name}</Title>
                                                        <Text className="text-sm text-tremor-content">
                                                            {combinedStatusText}
                                                        </Text>
                                                    </div>

                                                    <Button
                                                        size="xs"
                                                        variant="secondary"
                                                        className="mt-4 w-full"
                                                        onClick={() => openTractateDialog(t)}
                                                    >
                                                        צפה בדפים
                                                    </Button>
                                                </Card>
                                            );
                                        })}
                                    </ul>
                                </AccordionBody>
                            </Accordion>
                        ))}
                    </AccordionList>
                )}

                {/* Dialog for displaying pages within a selected tractate */}
                <Dialog className={"bg-black border border-red-700"}
                        open={!!memoizedSelectedTractate} onClose={() => setSelectedTractate(undefined)} static>
                    <DialogPanel className={"relative text-start mt-14"}>
                        <Icon onClick={() => setSelectedTractate(undefined)} icon={RiCloseLine}
                              className={"bg-tremor-brand-muted rounded-full p-2 absolute -top-2 -left-2 cursor-pointer shadow-md shadow-tremor-brand-muted"}/>
                        <h3 className="text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                            {memoizedSelectedTractate?.name}
                        </h3>
                        <div className="flex justify-end my-2">
                            <Button
                                size="xs"
                                variant="light"
                                onClick={onSelectAllInTractate}
                                disabled={isSaving || isLoading || !memoizedSelectedTractate?.pages.some(p => p.pageStatus === PageStatus.Available && !pagesToTake.some(s => s.id === p.id))}
                            >
                                בחר את כל הדפים הפנויים במסכת זו
                            </Button>
                        </div>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-2">
                            {memoizedSelectedTractate?.pages
                                .sort((a, b) => a.index - b.index) // Ensure pages are sorted by index
                                .map(page => (
                                    <PageBox
                                        key={page.id}
                                        page={page}
                                        onSelect={() => onPageSelected(page)}
                                        // Pass new props to PageBox
                                        isSelectedForTaking={pagesToTake.some(p => p.id === page.id)}
                                        currentUserId={data?.user.id || "-"}
                                        isSaving={isSaving} // Pass saving state to PageBox
                                    />
                                ))}
                        </div>
                        {/* Button to save (take) the selected pages */}
                        {!!pagesToTake.length && (
                            <Button
                                color={"emerald"}
                                className={"w-full sticky bottom-3 shadow-xl shadow-emerald-200 my-3"}
                                onClick={handleTakeSelectedPages}
                                disabled={isSaving} // Disable button while saving
                            >
                                {isSaving ? "שומר דפים..." : `קח דפים מסומנים (${pagesToTake.length})`}
                            </Button>
                        )}
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
    isSelectedForTaking: boolean; // Indicates if this page is in the local 'pagesToTake' array
    currentUserId: string; // The ID of the current logged-in user
    isSaving: boolean; // Indicates if the parent component is currently saving
}

function PageBox({page, onSelect, isSelectedForTaking, currentUserId, isSaving}: PageBoxProps) {
    let bgc = ""; // Background color class
    let txc = ""; // Text color class
    let cursorClass = "cursor-default"; // Cursor style class

    // Determine colors and cursor based on page status and selection state
    switch (page.pageStatus) {
        case PageStatus.Available:
            bgc = isSelectedForTaking ? "bg-blue-200" : "bg-blue-100"; // Blue shades for available/selected
            txc = isSelectedForTaking ? "text-blue-700" : "text-blue-500";
            cursorClass = "cursor-pointer"; // Available pages are clickable
            break;
        case PageStatus.Taken:
            // Different colors if taken by current user vs. another user
            bgc = page.byUser === currentUserId ? "bg-amber-200" : "bg-gray-200";
            txc = page.byUser === currentUserId ? "text-amber-700" : "text-gray-500";
            // Only clickable if taken by the current user (to allow deselection)
            cursorClass = page.byUser === currentUserId ? "cursor-pointer" : "cursor-not-allowed";
            break;
        case PageStatus.Completed:
            bgc = "bg-emerald-100"; // Green for completed
            txc = "text-emerald-500";
            cursorClass = "cursor-not-allowed"; // Completed pages are not clickable
            break;
    }

    // Determine if the click handler should be active
    const handleClick = () => {
        // Allow click if page is Available, or if it's Taken by the current user (to deselect)
        // Also ensure not currently saving
        if (!isSaving && (page.pageStatus === PageStatus.Available || (page.pageStatus === PageStatus.Taken && page.byUser === currentUserId))) {
            onSelect(); // Trigger the selection/deselection logic in parent component
        }
    };

    return (
        <Card onClick={handleClick}
              className={`p-2 text-center ${bgc} ${txc} ${isSaving ? "opacity-70" : ""} ${cursorClass}`}>
            <Title className={"font-bold"}>{page.indexName}</Title>
            {/* Display who took the page if it's in 'Taken' status */}
            {page.pageStatus === PageStatus.Taken && page.byUser && (
                <Text className="text-xs mt-1">
                    {page.byUser === currentUserId ? 'שלך' : `נלקח`}
                </Text>
            )}
        </Card>
    )
}
