"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { Checkbox } from "@/features/core/components/checkbox"
import { Button } from "@/features/core/components/button"
import { Badge } from "@/features/core/components/badge"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/features/core/components/dropdown-menu"
import { Input } from "@/features/core/components/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/features/core/components/table"

// Interface for booking data from API
export interface BookingData {
    id: string
    startDate: string
    endDate: string
    totalDays: number
    totalAmount: number
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
    contactPhone: string
    pickupTime: string
    specialRequests?: string
    createdAt: string
    user: {
        id: string
        username: string
        email: string
        kyc?: {
            phoneNumber: string
            fullName: string
        }
    }
    vehicle: {
        id: string
        title: string
        brand: string
        model: string
        year: number
        registrationNumber: string
        pricePerDay: number
        vehicleFrontPhoto: string
    }
}

interface BookingsTableProps {
    bookings: BookingData[]
    onStatusUpdate?: (bookingId: string, status: string) => void
}

// Create columns function to access onStatusUpdate
const createColumns = (onStatusUpdate?: (bookingId: string, status: string) => void): ColumnDef<BookingData>[] => [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "vehicle.registrationNumber",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Registration No.
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => (
            <div className="font-medium">{row.original.vehicle.registrationNumber}</div>
        ),
    },
    {
        accessorKey: "vehicle.title",
        header: "Vehicle",
        cell: ({ row }) => (
            <div className="font-medium">
                {row.original.vehicle.brand} {row.original.vehicle.model} ({row.original.vehicle.year})
            </div>
        ),
    },
    {
        accessorKey: "user.username",
        header: "Renter Name",
        cell: ({ row }) => {
            const fullName = row.original.user.kyc?.fullName || row.original.user.username
            return <div>{fullName}</div>
        },
    },
    {
        accessorKey: "contactPhone",
        header: "Contact",
        cell: ({ row }) => {
            const phone = row.original.contactPhone || row.original.user.kyc?.phoneNumber
            return <div className="text-sm">{phone}</div>
        },
    },
    {
        accessorKey: "startDate",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Start Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = new Date(row.getValue("startDate"))
            return <div>{date.toLocaleDateString()}</div>
        },
    },
    {
        accessorKey: "endDate",
        header: "End Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("endDate"))
            return <div>{date.toLocaleDateString()}</div>
        },
    },
    {
        accessorKey: "totalDays",
        header: "Duration",
        cell: ({ row }) => {
            const days = row.getValue("totalDays") as number
            return <div>{days} day{days > 1 ? 's' : ''}</div>
        },
    },
    {
        accessorKey: "vehicle.pricePerDay",
        header: () => <div className="text-right">Price/Day</div>,
        cell: ({ row }) => {
            const price = row.original.vehicle.pricePerDay
            return <div className="text-right font-medium">Rs. {price.toLocaleString()}</div>
        },
    },
    {
        accessorKey: "totalAmount",
        header: () => <div className="text-right">Total Amount</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("totalAmount"))
            return <div className="text-right font-medium">Rs. {amount.toLocaleString()}</div>
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge
                    variant={
                        status === "CONFIRMED"
                            ? "default"
                            : status === "PENDING"
                                ? "secondary"
                                : status === "COMPLETED"
                                    ? "outline"
                                    : "destructive"
                    }
                    className={`capitalize ${
                        status === "COMPLETED" 
                            ? "bg-blue-100 text-blue-800 border-blue-300" 
                            : ""
                    }`}
                >
                    {status.toLowerCase()}
                </Badge>
            )
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const booking = row.original
            const isPending = booking.status === "PENDING"
            const isConfirmed = booking.status === "CONFIRMED"

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(booking.id)}
                        >
                            Copy booking ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {isPending && onStatusUpdate && (
                            <>
                                <DropdownMenuItem
                                    onClick={() => onStatusUpdate(booking.id, "CONFIRMED")}
                                    className="text-green-600"
                                >
                                    Accept Booking
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onStatusUpdate(booking.id, "CANCELLED")}
                                    className="text-red-600"
                                >
                                    Reject Booking
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                            </>
                        )}
                        {isConfirmed && onStatusUpdate && (
                            <>
                                <DropdownMenuItem
                                    onClick={() => onStatusUpdate(booking.id, "COMPLETED")}
                                    className="text-blue-600"
                                >
                                    Mark as Completed
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                            </>
                        )}
                        <DropdownMenuItem>View renter details</DropdownMenuItem>
                        <DropdownMenuItem>View booking details</DropdownMenuItem>
                        <DropdownMenuItem>Contact renter</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

export default function BookingsTable({ bookings, onStatusUpdate }: BookingsTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const columns = React.useMemo(() => createColumns(onStatusUpdate), [onStatusUpdate])

    const table = useReactTable({
        data: bookings,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="w-full">
            <div className="flex items-center py-4 gap-2">
                <Input
                    placeholder="Filter by registration number..."
                    value={(table.getColumn("vehicle.registrationNumber")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("vehicle.registrationNumber")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <Input
                    placeholder="Filter by renter name..."
                    value={(table.getColumn("user.username")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("user.username")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No bookings found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-muted-foreground flex-1 text-sm">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}