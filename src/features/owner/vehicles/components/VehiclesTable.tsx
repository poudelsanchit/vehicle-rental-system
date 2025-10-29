'use client'

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
import { ArrowUpDown, ChevronDown, Trash2, Calendar, Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/features/core/components/button"
import { Checkbox } from "@/features/core/components/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
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
import { Badge } from "@/features/core/components/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/features/core/components/alert-dialog"
import { IVehicle } from "../types/types"

interface VehiclesTableProps {
    vehicles: IVehicle[]
}

const truncateContent = (content: string, maxLength: number = 100) => {
    return content.length > maxLength ? content.substring(0, maxLength) + "..." : content
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

// API service function
async function deleteVehicleAPI(vehicleId: string) {
    const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error occurred' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

export default function VehiclesTable({ vehicles }: VehiclesTableProps) {
    const router = useRouter()
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [vehicleToDelete, setVehicleToDelete] = React.useState<IVehicle | null>(null)
    const [isDeleting, setIsDeleting] = React.useState(false)

    const handleDeleteClick = (vehicle: IVehicle) => {
        setVehicleToDelete(vehicle)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!vehicleToDelete) return

        setIsDeleting(true)

        try {
            const result = await deleteVehicleAPI(vehicleToDelete.id)

            if (result.success) {
                toast.success("Vehicle Deleted Successfully! 🗑️", {
                    description: `Vehicle "${vehicleToDelete.title}" has been removed.`,
                    duration: 4000,
                })

                setDeleteDialogOpen(false)
                setVehicleToDelete(null)
                router.refresh()
            } else {
                toast.error("Failed to Delete Vehicle ❌", {
                    description: result.error || "Something went wrong. Please try again.",
                    duration: 5000,
                })
            }
        } catch (error) {
            console.error("Delete error:", error)
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred."
            toast.error("Deletion Error ❌", {
                description: errorMessage,
                duration: 5000,
            })
        } finally {
            setIsDeleting(false)
        }
    }

    const columns: ColumnDef<IVehicle>[] = [
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
            accessorKey: "vehicleFrontPhoto",
            header: "Image",
            cell: ({ row }) => (
                <div className="flex gap-1">
                    <Image
                        height={48}
                        width={48}
                        src={row.getValue("vehicleFrontPhoto")}
                        alt={row.original.title}
                        className="h-12 w-12 object-cover rounded border"
                        onError={(e) => {
                            e.currentTarget.src = '/images/default-vehicle.png';
                        }}
                    />
                </div>
            ),
            enableSorting: false,
        },
        {
            accessorKey: "title",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Vehicle
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="font-medium">
                    <div className="font-semibold">{row.getValue("title")}</div>
                    <div className="text-sm text-muted-foreground">
                        {row.original.brand} {row.original.model}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {row.getValue("type")}
                </Badge>
            ),
        },
        {
            accessorKey: "year",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Year
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div>{row.getValue("year")}</div>,
        },
        {
            accessorKey: "transmission",
            header: "Transmission",
            cell: ({ row }) => {
                const transmission = row.getValue("transmission") as string
                return (
                    <Badge
                        variant="secondary"
                        className={
                            transmission === 'AUTOMATIC'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                        }
                    >
                        {transmission}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "fuelType",
            header: "Fuel Type",
            cell: ({ row }) => {
                const fuelType = row.getValue("fuelType") as string
                return (
                    <Badge
                        variant="secondary"
                        className={
                            fuelType === 'ELECTRIC'
                                ? 'bg-green-100 text-green-800'
                                : fuelType === 'HYBRID'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-orange-100 text-orange-800'
                        }
                    >
                        {fuelType}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "color",
            header: "Color",
            cell: ({ row }) => {
                const color = row.getValue("color") as string
                return (
                    <div className="flex items-center gap-2">
                        <div
                            className="h-4 w-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: color.toLowerCase() }}
                        />
                        <span className="text-sm">{color}</span>
                    </div>
                )
            },
        },
        {
            accessorKey: "seatingCapacity",
            header: "Seats",
            cell: ({ row }) => (
                <div className="text-center">{row.getValue("seatingCapacity")}</div>
            ),
        },
        {
            accessorKey: "registrationNumber",
            header: "Registration",
            cell: ({ row }) => (
                <span className="font-mono text-sm">
                    {row.getValue("registrationNumber")}
                </span>
            ),
        },
        {
            accessorKey: "pricePerDay",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Price/Day
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const price = parseFloat(row.getValue("pricePerDay"))
                const formatted = new Intl.NumberFormat("en-NP", {
                    style: "currency",
                    currency: "NPR",
                }).format(price)
                return (
                    <div className="flex items-center gap-1 font-semibold">
                        {formatted}
                    </div>
                )
            },
        },
        {
            accessorKey: "pickupLocation",
            header: "Pickup Location",
            cell: ({ row }) => (
                <div className="max-w-xs">
                    {truncateContent(row.getValue("pickupLocation"), 30)}
                </div>
            ),
        },
        {
            accessorKey: "insuranceValidTill",
            header: "Insurance Valid Till",
            cell: ({ row }) => (
                <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(row.getValue("insuranceValidTill"))}
                </div>
            ),
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Created At
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="text-sm text-muted-foreground">
                    {formatDate(row.getValue("createdAt"))}
                </div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2 justify-end">
                        <Button
                            size="sm"
                            className="text-white bg-red-700 hover:bg-red-800"
                            onClick={() => handleDeleteClick(row.original)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )
            },
        },
    ]

    const table = useReactTable({
        data: vehicles,
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
                    placeholder="Filter by vehicle name..."
                    value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("title")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <Input
                    placeholder="Filter by registration..."
                    value={(table.getColumn("registrationNumber")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("registrationNumber")?.setFilterValue(event.target.value)
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
                                    No vehicles found.
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the vehicle "{vehicleToDelete?.title}".
                            This action cannot be undone and all associated images will be removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}