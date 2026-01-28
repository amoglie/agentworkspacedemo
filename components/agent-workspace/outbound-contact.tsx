"use client"

import { Clock, PhoneOutgoing, MessageCircle, User, Phone, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"

export type OutboundChannelType = "outbound_call" | "whatsapp"

interface OutboundCustomer {
  id: string
  name: string
  phone: string
  email: string
  segment: string
}

interface OutboundContactProps {
  channel: OutboundChannelType
  customers: OutboundCustomer[]
  selectedCustomerId?: string
  isContactActive: boolean
  contactStartTime?: Date
  onSelectCustomer: (customerId: string) => void
  onInitiateContact: () => void
}

export function OutboundContact({ 
  channel, 
  customers, 
  selectedCustomerId,
  isContactActive,
  contactStartTime,
  onSelectCustomer,
  onInitiateContact
}: OutboundContactProps) {
  const [duration, setDuration] = useState("00:00")

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId)

  const isVoice = channel === "outbound_call"
  const channelConfig = {
    outbound_call: { 
      label: "Llamada Saliente", 
      icon: PhoneOutgoing, 
      color: "bg-info/10 text-info",
      badgeColor: "bg-info/10 text-info border-0",
      actionLabel: "Iniciar Llamada",
      actionIcon: Phone
    },
    whatsapp: { 
      label: "Chat Saliente", 
      icon: MessageCircle, 
      color: "bg-[#25D366]/10 text-[#25D366]",
      badgeColor: "bg-[#25D366]/10 text-[#25D366] border-0",
      actionLabel: "Iniciar Conversación",
      actionIcon: Send
    },
  }

  const config = channelConfig[channel]
  const ChannelIcon = config.icon
  const ActionIcon = config.actionIcon

  useEffect(() => {
    if (!isContactActive || !contactStartTime) {
      setDuration("00:00")
      return
    }
    
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - contactStartTime.getTime()) / 1000)
      const mins = Math.floor(diff / 60).toString().padStart(2, "0")
      const secs = (diff % 60).toString().padStart(2, "0")
      setDuration(`${mins}:${secs}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [isContactActive, contactStartTime])

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {isContactActive ? "Contacto Activo" : "Nuevo Contacto"}
          </CardTitle>
          <Badge className={`${config.badgeColor} rounded-full px-3 py-1 text-xs font-medium`}>
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isContactActive ? (
          <>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Seleccionar Cliente
              </label>
              <Select value={selectedCustomerId || ""} onValueChange={onSelectCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Buscar cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{customer.name}</span>
                        <span className="text-muted-foreground text-xs">({customer.phone})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCustomer && (
              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${config.color}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{selectedCustomer.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.segment}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <p className="font-mono text-foreground">{selectedCustomer.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-foreground truncate">{selectedCustomer.email}</p>
                  </div>
                </div>
              </div>
            )}

            <Button 
              className={`w-full gap-2 rounded-full ${isVoice ? "" : "bg-[#25D366] hover:bg-[#25D366]/90"}`}
              onClick={onInitiateContact}
              disabled={!selectedCustomerId}
            >
              <ActionIcon className="w-4 h-4" />
              {config.actionLabel}
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full ${config.color} border-2 border-current/20`}>
              <ChannelIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-foreground">{selectedCustomer?.name}</p>
              <p className="text-sm text-muted-foreground">{selectedCustomer?.phone}</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-foreground">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xl font-mono font-bold">{duration}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
