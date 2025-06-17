"use client"

import {useEffect, useState, useMemo} from "react";
import {Page, PageStatus} from "@/shared/Entities/Page";
import {repo} from "remult";
import {useSession} from "next-auth/react";
import {User} from "@/shared/Entities/User";
import Auth from "@/ui/auth";
import {
    Card,
    Title,
    Text,
    Badge,
    Icon,
    Tab,
    TabList,
    TabGroup,
    TabPanels,
    TabPanel,
    ProgressBar,
    Select,
    SelectItem,
    Button,
    Grid,
    Col,
    Metric,
    Flex,
    DonutChart,
    Dialog,
    DialogPanel
} from "@tremor/react";
import {
    RiArrowLeftSLine,
    RiCheckLine,
    RiTimeLine,
    RiSearchLine,
    RiFilterLine,
    RiShareLine,
    RiAddLine,
    RiStarLine,
    RiStarFill,
    RiArrowGoBackLine
} from "@remixicon/react";
import Link from "next/link";
import {motion, AnimatePresence} from "framer-motion";

const pRepo = repo(Page)
const uRepo = repo(User)

// Statistics Component
const Statistics = ({ stats }: { stats: { total: number; completed: number; inProgress: number; completionRate: number } }) => (
    <>
        <div className="grid grid-cols-3 gap-2 mb-4">
            <Card className="py-2 px-2 text-center">
                <Text className="text-xs">סה"כ דפים</Text>
                <div className="text-xl font-bold">{stats.total}</div>
            </Card>
            <Card className="py-2 px-2 text-center">
                <Text className="text-xs">הושלמו</Text>
                <div className="text-xl font-bold">{stats.completed}</div>
            </Card>
            <Card className="py-2 px-2 text-center">
                <Text className="text-xs">בתהליך</Text>
                <div className="text-xl font-bold">{stats.inProgress}</div>
            </Card>
        </div>
        <Card className="mb-4 text-center py-2 px-2">
            <Text className="text-xs">אחוז השלמה</Text>
            <div className="text-lg font-bold">{Math.round(stats.completionRate)}%</div>
            <ProgressBar value={stats.completionRate} className="mt-1 h-2"/>
        </Card>
    </>
);

// Status Filter Component
const StatusFilter = ({ selectedStatus, onStatusChange }: { 
    selectedStatus: PageStatus | "all"; 
    onStatusChange: (status: PageStatus | "all") => void 
}) => {
    const statusChips = [
        {label: "הכל", value: "all" as const},
        {label: "בתהליך", value: PageStatus.Taken},
        {label: "הושלמו", value: PageStatus.Completed}
    ];

    return (
        <div className="flex gap-2 mb-4 justify-end">
            {statusChips.map(chip => (
                <button
                    key={chip.value}
                    className={`px-3 py-1 rounded-full border text-xs transition font-bold ${
                        selectedStatus === chip.value 
                            ? "bg-blue-500 text-white border-blue-500" 
                            : "bg-white text-blue-500 border-blue-300 hover:bg-blue-50"
                    }`}
                    onClick={() => onStatusChange(chip.value)}
                >
                    {chip.label}
                </button>
            ))}
        </div>
    );
};

// Status Badge Component
const StatusBadge = ({ status }: { status: PageStatus }) => {
    switch (status) {
        case PageStatus.Completed:
            return <Badge color="green"><span className="flex items-center gap-1">הושלם <RiCheckLine size={"12px"}/></span></Badge>
        case PageStatus.Taken:
            return <Badge color="yellow"><span className="flex items-center gap-1">בתהליך <RiTimeLine size={"12px"}/></span></Badge>
        default:
            return null
    }
}

// Tractate Card Component
const TractateCard = ({ 
    tractate, 
    pages, 
    onComplete, 
    onReturn 
}: { 
    tractate: string; 
    pages: Page[]; 
    onComplete: (page: Page) => Promise<void>;
    onReturn: (page: Page) => void;
}) => (
    <Card className="p-3 border-tremor-border border">
        <div className="flex items-center gap-2 mb-2">
            <Title className="text-lg">{tractate}</Title>
            <Badge color="blue">{pages.length} דפים</Badge>
        </div>
        <div className="flex flex-col gap-2">
            {pages.map(page => (
                <div key={page.id}
                     className="flex items-center justify-between bg-white rounded border border-gray-200 px-3 py-2 mb-2 shadow-sm hover:bg-gray-50 transition">
                    <div className="flex items-center gap-2">
                        <StatusBadge status={page.pageStatus} />
                        <Text className="text-base font-bold text-gray-800">דף {page.indexName}</Text>
                    </div>
                    <div className="flex items-center gap-2">
                        {page.pageStatus === PageStatus.Taken && (
                            <>
                                <Button
                                    size="xs"
                                    color="emerald"
                                    onClick={async () => await onComplete(page)}
                                >
                                    <span className="flex items-center gap-1">סמן כהושלם <RiCheckLine size={"12px"}/></span>
                                </Button>
                                <Button
                                    size="xs"
                                    color="gray"
                                    onClick={() => onReturn(page)}
                                >
                                    <span className="flex items-center gap-1">החזר דף <RiArrowGoBackLine size={"12px"}/></span>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </Card>
);

// Return Dialog Component
const ReturnDialog = ({ 
    page, 
    onClose, 
    onConfirm 
}: { 
    page: Page | null; 
    onClose: () => void; 
    onConfirm: () => Promise<void>;
}) => (
    <Dialog open={!!page} onClose={onClose}>
        <DialogPanel className="text-center">
            <Title className="mb-2 text-lg">האם להחזיר את הדף?</Title>
            <Text className="mb-4">הדף יחזור למאגר ויוכל להילקח ע"י אחרים.</Text>
            <div className="flex gap-4 justify-center mt-4">
                <Button color="gray" onClick={onClose}>ביטול</Button>
                <Button color="red" onClick={onConfirm}>החזר דף</Button>
            </div>
        </DialogPanel>
    </Dialog>
);

export default function MyPagesPage() {
    const [pages, setPages] = useState<Page[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedStatus, setSelectedStatus] = useState<PageStatus | "all">("all")
    const {data} = useSession()
    const [returnDialog, setReturnDialog] = useState<Page | null>(null)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        if (!data?.user) return
        const getByUser = async () => {
            try {
                setLoading(true)
                setError(null)
                const pages = await pRepo.find({
                    where: {byUser: data.user.id},
                    orderBy: {tractate: "desc"},
                    include: {tractate: true}
                })
                setPages(pages)
            } catch (err) {
                setError("אירעה שגיאה בטעינת הדפים")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        getByUser()
    }, [data]);

    const formatDate = (date: Date | undefined) => {
        if (!date) return ""
        return new Date(date).toLocaleDateString('he-IL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const filteredPages = pages.filter(page => {
        const matchesStatus = selectedStatus === "all" || page.pageStatus === selectedStatus
        return matchesStatus
    })

    const stats = useMemo(() => ({
        total: pages.length,
        completed: pages.filter(p => p.pageStatus === PageStatus.Completed).length,
        inProgress: pages.filter(p => p.pageStatus === PageStatus.Taken).length,
        completionRate: pages.length ? 
            (pages.filter(p => p.pageStatus === PageStatus.Completed).length / pages.length) * 100 : 0
    }), [pages])

    const getEncouragementMessage = () => {
        if (stats.total === 0) return "בוא נתחיל את המסע שלך!"
        if (stats.completionRate === 100) return "כל הכבוד! השלמת את כל הדפים שלך!"
        if (stats.completionRate > 75) return "אתה בדרך הנכונה! המשך כך!"
        if (stats.completionRate > 50) return "חצי הדרך מאחוריך!"
        if (stats.completionRate > 25) return "התחלת מצוין! המשך כך!"
        return "כל התחלה קשה, אבל אתה בדרך הנכונה!"
    }

    const handleComplete = async (page: Page) => {
        try {
            setActionLoading(true)
            await pRepo.save({
                ...page,
                pageStatus: PageStatus.Completed
            })
            setPages(pages => pages.map(p => {
                if (p.id === page.id) {
                    p.pageStatus = PageStatus.Completed;
                }
                return p;
            }))
        } catch (err) {
            setError("אירעה שגיאה בסימון הדף כהושלם")
            console.error(err)
        } finally {
            setActionLoading(false)
        }
    }

    const handleReturn = async (page: Page) => {
        try {
            setActionLoading(true)
            await pRepo.save({
                ...page,
                pageStatus: PageStatus.Available,
                byUser: undefined,
                takenAt: undefined
            })
            setPages(pages => pages.filter(p => p.id !== page.id))
            setReturnDialog(null)
        } catch (err) {
            setError("אירעה שגיאה בהחזרת הדף")
            console.error(err)
        } finally {
            setActionLoading(false)
        }
    }

    // קיבוץ לפי מסכת
    const tractateGroups = useMemo(() => pages.reduce((acc, page) => {
        const name = page.tractate.name;
        if (!acc[name]) acc[name] = [];
        acc[name].push(page);
        return acc;
    }, {} as Record<string, Page[]>), [pages])

    // סטטוסים לצ'יפים
    const statusChips = [
        {label: "הכל", value: "all" as const},
        {label: "בתהליך", value: PageStatus.Taken},
        {label: "הושלמו", value: PageStatus.Completed}
    ];

    // סינון לפי סטטוס
    const filteredGroups = useMemo(() => Object.entries(tractateGroups).reduce((acc, [tractate, arr]) => {
        let filtered = arr;
        if (selectedStatus !== "all") {
            filtered = arr.filter(p => p.pageStatus === selectedStatus);
        }
        if (filtered.length > 0) acc[tractate] = filtered;
        return acc;
    }, {} as Record<string, Page[]>), [tractateGroups, selectedStatus])

    return <Auth>
        <div className="min-h-screen bg-tremor-brand-muted/20 p-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/">
                        <Icon icon={RiArrowLeftSLine} size="xl" className="cursor-pointer hover:scale-110 transition-transform"/>
                    </Link>
                    <Title className="text-3xl">הדפים שלי</Title>
                </div>

                {error && (
                    <Card className="mb-4 p-4 bg-red-50 border-red-200">
                        <Text className="text-red-600">{error}</Text>
                    </Card>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 animate-pulse">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-200 to-blue-400 mb-4"/>
                        <Text className="text-lg text-gray-500">טוען דפים...</Text>
                    </div>
                ) : (
                    <>
                        <Statistics stats={stats} />
                        
                        <Card className="mb-4 text-center py-2 px-2">
                            <Text className="text-base font-medium">{getEncouragementMessage()}</Text>
                        </Card>

                        <StatusFilter 
                            selectedStatus={selectedStatus} 
                            onStatusChange={setSelectedStatus} 
                        />

                        {Object.keys(filteredGroups).length === 0 ? (
                            <Card className="text-center py-12">
                                <Text className="text-lg">אין דפים להצגה</Text>
                                <Link href="/pages-list">
                                    <Card className="mt-4 max-w-sm mx-auto hover:scale-105 transition-transform cursor-pointer">
                                        <Text className="text-lg">לקחת דף</Text>
                                    </Card>
                                </Link>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.entries(filteredGroups).map(([tractate, arr]) => (
                                    <TractateCard
                                        key={tractate}
                                        tractate={tractate}
                                        pages={arr}
                                        onComplete={handleComplete}
                                        onReturn={setReturnDialog}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="mt-6 text-center">
                            <Link href="/pages-list">
                                <Button
                                    size="xl"
                                    className="hover:scale-105 transition-transform"
                                    disabled={actionLoading}
                                >
                                    <span className="flex items-center gap-1">
                                        לקחת דפים נוספים <RiAddLine className="w-4 h-4"/>
                                    </span>
                                </Button>
                            </Link>
                        </div>

                        <ReturnDialog
                            page={returnDialog}
                            onClose={() => setReturnDialog(null)}
                            onConfirm={async () => {
                                if (returnDialog) {
                                    await handleReturn(returnDialog)
                                }
                            }}
                        />
                    </>
                )}
            </div>
        </div>
    </Auth>
}
