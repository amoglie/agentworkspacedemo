"use client"

import { Clock, PhoneIncoming, PhoneOutgoing, PhoneOff, MessageCircle, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { CallClosureDialog, type CallClosureData } from "./call-closure-dialog"

export type ChannelType = "inbound_call" | "outbound_call" | "whatsapp" | "email"

interface ContactContextProps {
  contact: {
    id: string
    type: "inbound" | "outbound"
    channel: ChannelType
    queue: string
    startTime: Date
    ani: string
    dnis: string
    attributes: Record<string, string>
  }
  onCallClosure?: (data: CallClosureData) => void
}

export function ContactContext({ contact, onCallClosure }: ContactContextProps) {
  const [duration, setDuration] = useState("00:00")
  const [showClosureDialog, setShowClosureDialog] = useState(false)

  const handleEndContact = () => {
    setShowClosureDialog(true)
  }

  const handleClosureComplete = (data: CallClosureData) => {
    onCallClosure?.(data)
    setShowClosureDialog(false)
  }

  const channelConfig = {
    inbound_call: { 
      label: "Llamada Entrante", 
      icon: PhoneIncoming, 
      color: "bg-success/10 text-success",
      badgeColor: "bg-success/10 text-success border-0"
    },
    outbound_call: { 
      label: "Llamada Saliente", 
      icon: PhoneOutgoing, 
      color: "bg-info/10 text-info",
      badgeColor: "bg-info/10 text-info border-0"
    },
    whatsapp: { 
      label: "WhatsApp", 
      icon: MessageCircle, 
      color: "bg-[#25D366]/10 text-[#25D366]",
      badgeColor: "bg-[#25D366]/10 text-[#25D366] border-0"
    },
    email: { 
      label: "Email", 
      icon: Mail, 
      color: "bg-warning/10 text-warning",
      badgeColor: "bg-warning/10 text-warning border-0"
    },
  }

  const config = channelConfig[contact.channel]
  const ChannelIcon = config.icon
  const isVoiceChannel = contact.channel === "inbound_call" || contact.channel === "outbound_call"
  const isChatChannel = contact.channel === "whatsapp" || contact.channel === "email"

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - contact.startTime.getTime()) / 1000)
      const mins = Math.floor(diff / 60).toString().padStart(2, "0")
      const secs = (diff % 60).toString().padStart(2, "0")
      setDuration(`${mins}:${secs}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [contact.startTime])

  return (
    <div className="flex flex-col gap-4 h-full">
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contacto Activo</CardTitle>
            <Badge className={`${config.badgeColor} rounded-full px-3 py-1 text-xs font-medium`}>
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full ${config.color} border-2 border-current/20`}>
              <ChannelIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-foreground">{contact.ani}</p>
              <p className="text-sm text-muted-foreground">{config.label}</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-foreground">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xl font-mono font-bold">{duration}</span>
              </div>
            </div>
          </div>

          {isVoiceChannel && null}

          {isChatChannel && null}
        </CardContent>
      </Card>

      <CallClosureDialog
        open={showClosureDialog}
        onOpenChange={setShowClosureDialog}
        channel={contact.channel}
        contactId={contact.id}
        onClose={handleClosureComplete}
      />

      <Card className="border-border flex-1 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Detalles del Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">ID Contacto</p>
              <p className="text-sm font-mono text-foreground">{contact.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Cola</p>
              <p className="text-sm text-foreground">{contact.queue}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">ANI</p>
              <p className="text-sm font-mono text-foreground">{contact.ani}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">DNIS</p>
              <p className="text-sm font-mono text-foreground">{contact.dnis}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Atributos</p>
            <div className="space-y-2">
              {Object.entries(contact.attributes).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{key}</span>
                  <span className="text-foreground font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
