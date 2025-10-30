"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Filter, X, Search } from "lucide-react"

export interface TaskFilters {
  search: string
  priority: string
  assignee: string
  status: string
  sortBy: string
}

interface TaskFilterProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  members: Array<{ userId: string; user: { name: string | null; email: string } }>
}

export function TaskFilter({ filters, onFiltersChange, members }: TaskFilterProps) {
  const [open, setOpen] = useState(false)

  const updateFilter = (key: keyof TaskFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      priority: "all",
      assignee: "all",
      status: "all",
      sortBy: "recent",
    })
  }

  const activeFiltersCount = [
    filters.priority !== "all",
    filters.assignee !== "all",
    filters.status !== "all",
  ].filter(Boolean).length

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm"
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="default" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Filter & Sort Tasks</DialogTitle>
            <DialogDescription>
              Refine your task view with filters and sorting options
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Priority Filter */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={filters.priority}
                onValueChange={(value) => updateFilter("priority", value)}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => updateFilter("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignee Filter */}
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select
                value={filters.assignee}
                onValueChange={(value) => updateFilter("assignee", value)}
              >
                <SelectTrigger id="assignee">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.user.name || member.user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <Label htmlFor="sortBy">Sort By</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => updateFilter("sortBy", value)}
              >
                <SelectTrigger id="sortBy">
                  <SelectValue placeholder="Select sort option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recently Updated</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="priority_high">Priority: High to Low</SelectItem>
                  <SelectItem value="priority_low">Priority: Low to High</SelectItem>
                  <SelectItem value="due_date">Due Date</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Active Filters</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-auto p-1 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear all
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.priority !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Priority: {filters.priority}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => updateFilter("priority", "all")}
                      />
                    </Badge>
                  )}
                  {filters.status !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Status: {filters.status.replace("_", " ")}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => updateFilter("status", "all")}
                      />
                    </Badge>
                  )}
                  {filters.assignee !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Assignee:{" "}
                      {filters.assignee === "unassigned"
                        ? "Unassigned"
                        : members.find((m) => m.userId === filters.assignee)?.user.name ||
                          "Unknown"}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => updateFilter("assignee", "all")}
                      />
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button onClick={() => setOpen(false)}>Apply Filters</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
