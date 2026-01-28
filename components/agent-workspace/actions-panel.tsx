"use client"

import { 
  Plus, Send, FileText, Tag, 
  MessageSquare, History, Clock, CheckCircle, AlertCircle, User,
  PhoneIncoming, PhoneOutgoing, PhoneMissed, Calendar, XCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"

interface HistoryItem {
  id: string
  type: "call" | "case" | "note" | "action"
  title: string
  description: string
  timestamp: Date
  agent?: string
  status?: "completed" | "pending" | "failed"
  callResult?: "successful" | "unsuccessful"
  channel?: "inbound_call" | "outbound_call" | "whatsapp" | "email"
}

interface ActionsPanelProps {
  history: HistoryItem[]
  onAddNote: (note: string) => void
  onCreateCase: (caseType: string, description: string) => void
  onTypify: (typification: string) => void
  onSendWhatsApp: (template: string) => void
}

const typificationOptions = [
  { value: "consulta_saldo", label: "Consulta de Saldo" },
  { value: "consulta_movimientos", label: "Consulta de Movimientos" },
  { value: "reclamo", label: "Reclamo" },
  { value: "solicitud_producto", label: "Solicitud de Producto" },
  { value: "actualizacion_datos", label: "Actualización de Datos" },
  { value: "soporte_tecnico", label: "Soporte Técnico" },
  { value: "otros", label: "Otros" },
]

const whatsappTemplates = [
  { value: "bienvenida", label: "Bienvenida" },
  { value: "confirmacion_solicitud", label: "Confirmación de Solicitud" },
  { value: "estado_cuenta", label: "Estado de Cuenta" },
  { value: "recordatorio_pago", label: "Recordatorio de Pago" },
  { value: "seguimiento_caso", label: "Seguimiento de Caso" },
  { value: "encuesta_satisfaccion", label: "Encuesta de Satisfacción" },
  { value: "promocion", label: "Promoción" },
  { value: "actualizacion_datos", label: "Actualización de Datos" },
]

const caseTypes = [
  { value: "reclamo", label: "Reclamo" },
  { value: "solicitud", label: "Solicitud" },
  { value: "incidencia", label: "Incidencia" },
  { value: "seguimiento", label: "Seguimiento" },
]

export function ActionsPanel({ 
  history, 
  onAddNote, 
  onCreateCase, 
  onTypify,
  onSendWhatsApp
}: ActionsPanelProps) {
  const [note, setNote] = useState("")
  const [selectedTypification, setSelectedTypification] = useState("")
  const [selectedWhatsappTemplate, setSelectedWhatsappTemplate] = useState("")
  const [selectedCaseType, setSelectedCaseType] = useState("")
  const [caseDescription, setCaseDescription] = useState("")

  const handleAddNote = () => {
    if (note.trim()) {
      onAddNote(note)
      setNote("")
    }
  }

  const handleCreateCase = () => {
    if (selectedCaseType && caseDescription.trim()) {
      onCreateCase(selectedCaseType, caseDescription)
      setSelectedCaseType("")
      setCaseDescription("")
    }
  }

  const handleTypify = () => {
    if (selectedTypification) {
      onTypify(selectedTypification)
      setSelectedTypification("")
    }
  }

  const handleSendWhatsApp = () => {
    if (selectedWhatsappTemplate) {
      onSendWhatsApp(selectedWhatsappTemplate)
      setSelectedWhatsappTemplate("")
    }
  }

  const getHistoryIcon = (item: HistoryItem) => {
    if (item.type === "call") {
      if (item.isCallback) {
        return <Calendar className="w-4 h-4 text-info" />
      }
      if (item.callResult === "successful") {
        return <PhoneIncoming className="w-4 h-4 text-success" />
      }
      if (item.callResult === "unsuccessful") {
        return <PhoneMissed className="w-4 h-4 text-destructive" />
      }
      if (item.channel === "outbound_call") {
        return <PhoneOutgoing className="w-4 h-4 text-info" />
      }
      return <PhoneIncoming className="w-4 h-4 text-info" />
    }
    switch (item.type) {
      case "callback":
        return <Calendar className="w-4 h-4 text-info" />
      case "case":
        return <FileText className="w-4 h-4 text-warning" />
      case "note":
        return <MessageSquare className="w-4 h-4 text-primary" />
      case "action":
        return <CheckCircle className="w-4 h-4 text-success" />
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getResultBadge = (item: HistoryItem) => {
    if (item.type !== "call" || !item.callResult) return null
    
    if (item.callResult === "successful") {
      return (
        <Badge className="bg-success/10 text-success border-0 text-xs px-2 py-0">
          Exitosa
        </Badge>
      )
    }
    return (
      <Badge className="bg-destructive/10 text-destructive border-0 text-xs px-2 py-0">
        No exitosa
      </Badge>
    )
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Ahora"
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`
    return date.toLocaleDateString("es-ES")
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <Card className="border-border shadow-sm">
        <Tabs defaultValue="actions" className="h-full flex flex-col">
          <CardHeader className="pb-0">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-full p-1">
              <TabsTrigger value="actions">Acciones</TabsTrigger>
              <TabsTrigger value="notes">Notas</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="flex-1 pt-4">
            <TabsContent value="actions" className="mt-0 space-y-5">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Tipificación</label>
                <div className="flex gap-2">
                  <Select value={selectedTypification} onValueChange={setSelectedTypification}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar tipificación" />
                    </SelectTrigger>
                    <SelectContent>
                      {typificationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    onClick={handleTypify} 
                    disabled={!selectedTypification}
                  >
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#25D366]" />
                  Enviar WhatsApp
                </label>
                <div className="flex gap-2">
                  <Select value={selectedWhatsappTemplate} onValueChange={setSelectedWhatsappTemplate}>
                    <SelectTrigger className="flex-1 border-[#25D366]/30 focus:ring-[#25D366]/20">
                      <SelectValue placeholder="Seleccionar template" />
                    </SelectTrigger>
                    <SelectContent>
                      {whatsappTemplates.map((template) => (
                        <SelectItem key={template.value} value={template.value}>
                          {template.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    size="icon" 
                    variant="outline"
                    className="border-[#25D366]/30 hover:bg-[#25D366]/10 hover:text-[#25D366]"
                    onClick={handleSendWhatsApp} 
                    disabled={!selectedWhatsappTemplate}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Templates aprobados para envío a clientes
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Crear Caso</label>
                <Select value={selectedCaseType} onValueChange={setSelectedCaseType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de caso" />
                  </SelectTrigger>
                  <SelectContent>
                    {caseTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Descripción del caso..."
                  value={caseDescription}
                  onChange={(e) => setCaseDescription(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
                <Button 
                  className="w-full gap-2 rounded-full" 
                  onClick={handleCreateCase}
                  disabled={!selectedCaseType || !caseDescription.trim()}
                >
                  <Plus className="w-4 h-4" />
                  Crear Caso
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-0 space-y-3">
              <div className="space-y-2">
                <Textarea
                  placeholder="Escribir nota..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="resize-none"
                  rows={4}
                />
                <Button className="w-full gap-2 rounded-full" onClick={handleAddNote} disabled={!note.trim()}>
                  <Send className="w-4 h-4" />
                  Agregar Nota
                </Button>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <Card className="border-border flex-1 flex flex-col min-h-[400px] shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <History className="w-4 h-4" />
            Historial de Interacciones
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-0">
          <ScrollArea className="h-full px-6 pb-6">
            <div className="space-y-3">
              {history.map((item) => {
                const isCallItem = item.type === "call"
                const borderClass = isCallItem && item.callResult === "unsuccessful"
                  ? "border-destructive/20"
                  : isCallItem && item.callResult === "successful"
                  ? "border-success/20"
                  : "border-border"

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border ${borderClass} hover:border-primary/30 hover:shadow-sm transition-all bg-card`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getHistoryIcon(item)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                            {getResultBadge(item)}
                            {item.isCallback && (
                              <Badge className="bg-info/10 text-info border-0 text-xs px-2 py-0">
                                Callback
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimestamp(item.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          {item.agent && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="w-3 h-3" />
                              {item.agent}
                            </div>
                          )}
                          {item.status && (
                            <div className={`flex items-center gap-1 text-xs ${
                              item.status === "completed" ? "text-success" :
                              item.status === "pending" ? "text-warning" :
                              "text-destructive"
                            }`}>
                              {item.status === "completed" ? <CheckCircle className="w-3 h-3" /> :
                               item.status === "pending" ? <Clock className="w-3 h-3" /> :
                               <XCircle className="w-3 h-3" />}
                              {item.status === "completed" ? "Completado" :
                               item.status === "pending" ? "Pendiente" : "Fallido"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
