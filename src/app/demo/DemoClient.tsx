'use client'
import {
    Accordion,
    AccordionBody,
    AccordionHeader,
    AccordionList,
    BarChart,
    Button,
    Card,
    DonutChart,
    Flex,
    Grid,
    Legend,
    Metric,
    Tab,
    TabGroup,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    TabList,
    Text,
    Title
} from '@tremor/react'
import {useMemo, useState} from 'react'
import jsonData from './demo-data.json';

type Event = {
    title: string
    address: string
    date: Date
    status: 'פתוח' | 'נלקח' | 'נסגר'
    id: string
}

type City = {
    name: string
    events: Event[]
}

const data: City[] = jsonData.map(city => ({
    ...city,
    events: city.events.map(event => ({
        ...event,
        status: event.status as Event['status'],
        date: new Date(new Date().getTime() - (Math.random() * 1000 * 3600 * 24 * 5))
    }))
}));

type SortKey = 'date' | 'address'
type SortOrder = 'asc' | 'desc'
const statusOptions: (Event['status'] | 'הכל')[] = ['הכל', 'פתוח', 'נלקח', 'נסגר'];

export default function DemoClient() {
    const [selectedTabIndex, setSelectedTabIndex] = useState(1);
    const selectedStatus = statusOptions[selectedTabIndex];
    const [sortKey, setSortKey] = useState<SortKey>('date')
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

    const filteredAndSortedData = useMemo(() => {
        return data.map(city => {
            const filteredEvents =
                selectedStatus === 'הכל'
                    ? city.events
                    : city.events.filter(event => event.status === selectedStatus)

            const sortedEvents = [...filteredEvents].sort((a, b) => {
                const aValue = a[sortKey]
                const bValue = b[sortKey]

                if (aValue < bValue) {
                    return sortOrder === 'asc' ? -1 : 1
                }
                if (aValue > bValue) {
                    return sortOrder === 'asc' ? 1 : -1
                }
                return 0
            })

            return {...city, events: sortedEvents}
        })
    }, [selectedStatus, sortKey, sortOrder])

    const stats = useMemo(() => {
        const allEvents = data.flatMap(city => city.events);
        const totalEvents = allEvents.length;
        const openEvents = allEvents.filter(e => e.status === 'פתוח').length;
        const takenEvents = allEvents.filter(e => e.status === 'נלקח').length;
        const closedEvents = allEvents.filter(e => e.status === 'נסגר').length;

        const eventsByCity = data.map(city => ({
            name: city.name,
            'מספר אירועים': city.events.length,
        }));

        const statusDistribution = [
            { name: 'פתוח', value: openEvents },
            { name: 'נלקח', value: takenEvents },
            { name: 'נסגר', value: closedEvents }
        ].filter(item => item.value > 0);
        
        const titleDistribution = allEvents.reduce((acc, event) => {
            const existing = acc.find(item => item.name === event.title);
            if (existing) {
                existing.value++;
            } else {
                acc.push({ name: event.title, value: 1 });
            }
            return acc;
        }, [] as { name: string; value: number }[]);

        return {
            totalEvents,
            openEvents,
            takenEvents,
            closedEvents,
            eventsByCity,
            statusDistribution,
            titleDistribution
        }
    }, [])

    const handleCopy = (city: City) => {
        const cityData = filteredAndSortedData.find(c => c.name === city.name)
        if (!cityData) return

        const textToCopy = cityData.events
            .map(
                event =>
                    ` ${event.date.toLocaleDateString()}: ${event.title}, ${event.address}, ${city.name}`
            )
            .join('\n')

        navigator.clipboard.writeText(textToCopy).then(
            () => {
                alert(`${city.name} data copied to clipboard!`)
            },
            err => {
                console.error('Could not copy text: ', err)
            }
        )
    }

    const handleCopyId = (id: string) => {
        navigator.clipboard.writeText(id).then(
            () => {
                alert(`Event ID ${id} copied to clipboard!`)
            },
            err => {
                console.error('Could not copy text: ', err)
            }
        )
    }

    const toggleSortOrder = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortKey(key)
            setSortOrder('asc')
        }
    }

    return (
        <div className='bg-tremor-background w-screen min-h-screen'>
            <main className="p-4 md:p-10 mx-auto max-w-7xl bg-tremor-background">
                <Title className='text-center text-3xl font-bold'>דשבורד אירועים</Title>

                <Grid numItemsMd={2} numItemsLg={4} className="gap-6 mt-6">
                    <Card>
                        <Text>סך הכל אירועים</Text>
                        <Metric>{stats.totalEvents}</Metric>
                    </Card>
                    <Card>
                        <Text>אירועים פתוחים</Text>
                        <Metric>{stats.openEvents}</Metric>
                    </Card>
                    <Card>
                        <Text>אירועים שנלקחו</Text>
                        <Metric>{stats.takenEvents}</Metric>
                    </Card>
                    <Card>
                        <Text>אירועים שנסגרו</Text>
                        <Metric>{stats.closedEvents}</Metric>
                    </Card>
                </Grid>

                <AccordionList className="mt-6">
                    <Accordion>
                        <AccordionHeader>הצג/הסתר גרפים</AccordionHeader>
                        <AccordionBody>
                            <Card className="mt-6">
                                <Title>אירועים לפי עיר</Title>
                                <BarChart
                                    className="mt-6"
                                    data={stats.eventsByCity}
                                    index="name"
                                    categories={['מספר אירועים']}
                                    colors={['blue']}
                                    yAxisWidth={48}
                                />
                            </Card>
                            <Grid numItemsMd={2} className="gap-6 mt-6">
                                <Card>
                                    <Title>התפלגות לפי סטטוס</Title>
                                    <DonutChart
                                        className="mt-6"
                                        data={stats.statusDistribution}
                                        category="value"
                                        index="name"
                                        colors={["cyan", "amber", "pink"]}
                                    />
                                    <Legend
                                        categories={stats.statusDistribution.map(s => `${s.name} (${s.value})`)}
                                        colors={["cyan", "amber", "pink"]}
                                        className="mt-3"
                                    />
                                </Card>
                                 <Card>
                                    <Title>התפלגות לפי סוג קריאה</Title>
                                    <DonutChart
                                        className="mt-6"
                                        data={stats.titleDistribution}
                                        category="value"
                                        index="name"
                                        colors={["slate", "violet", "indigo", "rose", "cyan", "amber"]}
                                    />
                                    <Legend
                                        categories={stats.titleDistribution.map(t => `${t.name} (${t.value})`)}
                                        colors={["slate", "violet", "indigo", "rose", "cyan", "amber"]}
                                        className="mt-3"
                                    />
                                </Card>
                            </Grid>
                        </AccordionBody>
                    </Accordion>
                </AccordionList>

                <TabGroup
                    index={selectedTabIndex}
                    onIndexChange={setSelectedTabIndex}
                    className="mt-6"
                >
                    <TabList>
                        <Tab>הכל</Tab>
                        <Tab>פתוח</Tab>
                        <Tab>נלקח</Tab>
                        <Tab>נסגר</Tab>
                    </TabList>
                </TabGroup>

                {filteredAndSortedData.map(city => (
                    <Card key={city.name} className="mt-6">
                        <Flex>
                            <Title>{city.name}</Title>
                            <Button onClick={() => handleCopy(city)}>העתקת נתונים</Button>
                        </Flex>
                        <Table className="mt-5">
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell>Title</TableHeaderCell>
                                    <TableHeaderCell
                                        onClick={() => toggleSortOrder('address')}
                                        className="cursor-pointer"
                                    >
                                        כתובת {sortKey === 'address' && (sortOrder === 'asc' ? '🔼' : '🔽')}
                                    </TableHeaderCell>
                                    <TableHeaderCell
                                        onClick={() => toggleSortOrder('date')}
                                        className="cursor-pointer"
                                    >
                                        תאריך {sortKey === 'date' && (sortOrder === 'asc' ? '🔼' : '🔽')}
                                    </TableHeaderCell>
                                    <TableHeaderCell>מצב</TableHeaderCell>
                                    <TableHeaderCell>העתקת מזהה</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {city.events.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.title}</TableCell>
                                        <TableCell>{item.address}</TableCell>
                                        <TableCell>{item.date.toLocaleDateString()}</TableCell>
                                        <TableCell>{item.status}</TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleCopyId(item.id)} variant="secondary" size="xs">העתק</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                ))}
            </main>
        </div>
    )
}
