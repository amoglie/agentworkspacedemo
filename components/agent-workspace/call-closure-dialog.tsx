"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle, AlertTriangle, Calendar, User, Clock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { ChannelType } from "./contact-context"

export type CallResult = "successful" | "unsuccessful"

export type UnsuccessfulReason = 
  | "no_answer" 
  | "busy" 
  | "voicemail" 
  | "wrong_number" 
  | "customer_unavailable" 
  | "technical_issues"
  | "callback_requested"

export interface CallClosureData {
  result: CallResult
  unsuccessfulReason?: UnsuccessfulReason
  typification: string
  notes: string
  scheduleCallback: boolean
  callbackDate?: string
  callbackTime?: string
  callbackResponsible?: string
  awsContactId?: string
  salesforceRecordId?: string
}

interface CallClosureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  channel: ChannelType
  contactId: string
  onClose: (data: CallClosureData) => void
}

const unsuccessfulReasons = [
  { value: "no_answer", label: "Sin respuesta" },
  { value: "busy", label: "Ocupado" },
  { value: "voicemail", label: "Buzón de voz" },
  { value: "wrong_number", label: "Número equivocado" },
  { value: "customer_unavailable", label: "Cliente no disponible" },
  { value: "technical_issues", label: "Problemas técnicos" },
  { value: "callback_requested", label: "Callback solicitado" },
]

const typificationOptionsVoice = [
  { value: "consulta_saldo", label: "Consulta de Saldo" },
  { value: "consulta_movimientos", label: "Consulta de Movimientos" },
  { value: "reclamo", label: "Reclamo" },
  { value: "solicitud_producto", label: "Solicitud de Producto" },
  { value: "actualizacion_datos", label: "Actualización de Datos" },
  { value: "soporte_tecnico", label: "Soporte Técnico" },
  { value: "venta_realizada", label: "Venta Realizada" },
  { value: "seguimiento_caso", label: "Seguimiento de Caso" },
  { value: "otros", label: "Otros" },
]

const typificationOptionsChat = [
  { value: "whatsapp_consulta", label: "WhatsApp - Consulta General" },
  { value: "whatsapp_soporte", label: "WhatsApp - Soporte" },
  { value: "whatsapp_reclamo", label: "WhatsApp - Reclamo" },
  { value: "whatsapp_solicitud", label: "WhatsApp - Solicitud" },
  { value: "whatsapp_informacion", label: "WhatsApp - Información" },
  { value: "whatsapp_seguimiento", label: "WhatsApp - Seguimiento" },
  { value: "whatsapp_otros", label: "WhatsApp - Otros" },
]

const responsibleOptions = [
  { value: "mismo_agente", label: "Mismo agente" },
  { value: "equipo_ventas", label: "Equipo de Ventas" },
  { value: "equipo_soporte", label: "Equipo de Soporte" },
  { value: "supervisor", label: "Supervisor" },
]

const typificationOptions = {
  inbound_call: typificationOptionsVoice,
  outbound_call: typificationOptionsVoice,
  whatsapp: typificationOptionsChat,
  email: [
    { value: "email_consulta", label: "Email - Consulta General" },
    { value: "email_soporte", label: "Email - Soporte" },
    { value: "email_reclamo", label: "Email - Reclamo" },
    { value: "email_solicitud", label: "Email - Solicitud" },
    { value: "email_informacion", label: "Email - Información" },
    { value: "email_seguimiento", label: "Email - Seguimiento" },
    { value: "email_otros", label: "Email - Otros" },
  ]
}

export function CallClosureDialog({
  open,
  onOpenChange,
  channel,
  contactId,
  onClose,
}: CallClosureDialogProps) {
  const [result, setResult] = useState<CallResult | null>(null)
  const [unsuccessfulReason, setUnsuccessfulReason] = useState<UnsuccessfulReason | "">("")
  const [typification, setTypification] = useState("")
  const [notes, setNotes] = useState("")
  const [scheduleCallback, setScheduleCallback] = useState(false)
  const [callbackDate, setCallbackDate] = useState("")
  const [callbackTime, setCallbackTime] = useState("")
  const [callbackResponsible, setCallbackResponsible] = useState("")

  // Auto-suggest callback when call is unsuccessful
  useEffect(() => {
    if (result === "unsuccessful" && unsuccessfulReason && unsuccessfulReason !== "wrong_number") {
      setScheduleCallback(true)
      // Suggest next business day
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setCallbackDate(tomorrow.toISOString().split("T")[0])
      setCallbackTime("10:00")
      setCallbackResponsible("mismo_agente")
    }
  }, [result, unsuccessfulReason])

  const isValid = () => {
    if (!result) return false
    if (!typification) return false
    if (result === "unsuccessful" && !unsuccessfulReason) return false
    if (scheduleCallback && (!callbackDate || !callbackTime || !callbackResponsible)) return false
    return true
  }

  const handleSubmit = () => {
    if (!isValid()) return

    const closureData: CallClosureData = {
      result: result!,
      typification,
      notes,
      scheduleCallback,
      ...(result === "unsuccessful" && { unsuccessfulReason: unsuccessfulReason as UnsuccessfulReason }),
      ...(scheduleCallback && {
        callbackDate,
        callbackTime,
        callbackResponsible,
      }),
      awsContactId: contactId,
      salesforceRecordId: `SF-${Date.now()}`,
    }

    onClose(closureData)
    onOpenChange(false)
    
    // Reset state
    setResult(null)
    setUnsuccessfulReason("")
    setTypification("")
    setNotes("")
    setScheduleCallback(false)
    setCallbackDate("")
    setCallbackTime("")
    setCallbackResponsible("")
  }

  const isVoiceChannel = channel === "inbound_call" || channel === "outbound_call"
  const channelLabel = isVoiceChannel ? "Llamada" : channel === "whatsapp" ? "Chat WhatsApp" : "Email"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Cierre de {channelLabel}
            <Badge variant="outline" className="text-xs font-mono">
              {contactId}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Complete los campos obligatorios para cerrar la interacción.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Result Selection */}
          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Resultado de la {channelLabel} *
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={result === "successful" ? "default" : "outline"}
                className={`h-auto py-3 flex flex-col items-center gap-2 ${
                  result === "successful" ? "bg-success hover:bg-success/90 text-success-foreground" : ""
                }`}
                onClick={() => {
                  setResult("successful")
                  setUnsuccessfulReason("")
                  setScheduleCallback(false)
                }}
              >
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Exitosa</span>
              </Button>
              <Button
                type="button"
                variant={result === "unsuccessful" ? "default" : "outline"}
                className={`h-auto py-3 flex flex-col items-center gap-2 ${
                  result === "unsuccessful" ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : ""
                }`}
                onClick={() => setResult("unsuccessful")}
              >
                <XCircle className="w-5 h-5" />
                <span className="text-sm font-medium">No Exitosa</span>
              </Button>
            </div>
          </div>

          {/* Unsuccessful Reason */}
          {result === "unsuccessful" && (
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Motivo *
              </Label>
              <Select value={unsuccessfulReason} onValueChange={(v) => setUnsuccessfulReason(v as UnsuccessfulReason)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar motivo" />
                </SelectTrigger>
                <SelectContent>
                  {unsuccessfulReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Typification */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Tipificación *
            </Label>
            <Select value={typification} onValueChange={setTypification}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipificación" />
              </SelectTrigger>
              <SelectContent>
                {typificationOptions[channel].map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Notas
            </Label>
            <Textarea
              placeholder="Notas adicionales sobre la interacción..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Callback Section */}
          <div className="space-y-4 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Programar Callback</Label>
              </div>
              <Switch
                checked={scheduleCallback}
                onCheckedChange={setScheduleCallback}
              />
            </div>

            {scheduleCallback && (
              <div className="space-y-3 p-3 rounded-lg bg-muted/50">
                {result === "unsuccessful" && unsuccessfulReason !== "wrong_number" && (
                  <div className="flex items-center gap-2 text-xs text-warning mb-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Se recomienda programar un callback para contactos no exitosos</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Fecha *
                    </Label>
                    <Input
                      type="date"
                      value={callbackDate}
                      onChange={(e) => setCallbackDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Hora *
                    </Label>
                    <Input
                      type="time"
                      value={callbackTime}
                      onChange={(e) => setCallbackTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Responsable *
                  </Label>
                  <Select value={callbackResponsible} onValueChange={setCallbackResponsible}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar responsable" />
                    </SelectTrigger>
                    <SelectContent>
                      {responsibleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid()} className="rounded-full">
            Cerrar Interacción
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
