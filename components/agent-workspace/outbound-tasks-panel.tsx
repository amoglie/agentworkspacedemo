"use client"

import { PhoneOutgoing, Clock, User, AlertCircle, MoreVertical, Target, FileText, Building } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface OutboundTask {
  id: string
  customerId: string
  customerName: string
  phone: string
  campaign: string
  taskType: "venta" | "cobranza" | "encuesta" | "seguimiento" | "retencion"
  priority: "alta" | "media" | "baja"
  reason: string
  assignedAgent?: string
  status: "pending" | "in_progress" | "completed" | "skipped"
  attempts: number
  maxAttempts: number
  createdAt: Date
  dueDate?: string
  notes?: string
}

interface OutboundTasksPanelProps {
  tasks: OutboundTask[]
  onInitiateCall: (task: OutboundTask) => void
  onSkipTask: (taskId: string) => void
  onRescheduleTask: (taskId: string) => void
}

const taskTypeConfig = {
  venta: { label: "Venta", color: "bg-success/10 text-success", icon: Target },
  cobranza: { label: "Cobranza", color: "bg-destructive/10 text-destructive", icon: FileText },
  encuesta: { label: "Encuesta", color: "bg-info/10 text-info", icon: FileText },
  seguimiento: { label: "Seguimiento", color: "bg-warning/10 text-warning", icon: FileText },
  retencion: { label: "Retención", color: "bg-primary/10 text-primary", icon: Building },
}

const priorityConfig = {
  alta: { label: "Alta", color: "bg-destructive/10 text-destructive border-destructive/30" },
  media: { label: "Media", color: "bg-warning/10 text-warning border-warning/30" },
  baja: { label: "Baja", color: "bg-muted text-muted-foreground border-muted" },
}

export function OutboundTasksPanel({
  tasks,
  onInitiateCall,
  onSkipTask,
  onRescheduleTask,
}: OutboundTasksPanelProps) {
  const pendingTasks = tasks.filter((t) => t.status === "pending" || t.status === "in_progress")
  const highPriorityCount = pendingTasks.filter((t) => t.priority === "alta").length

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <PhoneOutgoing className="w-4 h-4" />
            Tareas Salientes
          </CardTitle>
          <div className="flex items-center gap-2">
            {highPriorityCount > 0 && (
              <Badge className="bg-destructive/10 text-destructive border-0 rounded-full px-2.5 py-0.5 text-xs">
                {highPriorityCount} urgente{highPriorityCount > 1 ? "s" : ""}
              </Badge>
            )}
            <Badge className="bg-primary/10 text-primary border-0 rounded-full px-2.5 py-0.5 text-xs">
              {pendingTasks.length} pendientes
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          <div className="px-6 pb-4 space-y-3">
            {pendingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <PhoneOutgoing className="w-10 h-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No hay tareas salientes pendientes
                </p>
              </div>
            ) : (
              pendingTasks.map((task) => {
                const typeConfig = taskTypeConfig[task.taskType]
                const prioConfig = priorityConfig[task.priority]
                const TaskIcon = typeConfig.icon

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border ${
                      task.priority === "alta" ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"
                    } hover:shadow-sm transition-all`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-foreground">
                            {task.customerName}
                          </span>
                          <Badge variant="outline" className={`text-xs ${prioConfig.color}`}>
                            {prioConfig.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <PhoneOutgoing className="w-3 h-3" />
                            {task.phone}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onRescheduleTask(task.id)}>
                            <Clock className="w-4 h-4 mr-2" />
                            Posponer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onSkipTask(task.id)}
                            className="text-destructive"
                          >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Omitir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={`text-xs ${typeConfig.color} border-0`}>
                        <TaskIcon className="w-3 h-3 mr-1" />
                        {typeConfig.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {task.campaign}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {task.reason}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Intento {task.attempts + 1} de {task.maxAttempts}
                      </span>
                      <Button
                        size="sm"
                        className="h-7 rounded-full text-xs px-3"
                        onClick={() => onInitiateCall(task)}
                      >
                        <PhoneOutgoing className="w-3 h-3 mr-1" />
                        Llamar
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
