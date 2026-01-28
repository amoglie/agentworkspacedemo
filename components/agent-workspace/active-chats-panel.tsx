"use client"

import { MessageCircle, Clock, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from "react"

export interface ActiveChat {
  id: string
  channel: "whatsapp" | "email"
  customerName: string
  customerPhone: string
  lastMessage: string
  startTime: Date
  unreadCount: number
  status: "active" | "waiting" | "on_hold"
}

interface ActiveChatsPanelProps {
  chats: ActiveChat[]
  selectedChatId?: string
  onSelectChat: (chatId: string) => void
}

export function ActiveChatsPanel({ chats, selectedChatId, onSelectChat }: ActiveChatsPanelProps) {
  const [durations, setDurations] = useState<Record<string, string>>({})

  useEffect(() => {
    const updateDurations = () => {
      const newDurations: Record<string, string> = {}
      chats.forEach(chat => {
        const diff = Math.floor((Date.now() - chat.startTime.getTime()) / 1000)
        const mins = Math.floor(diff / 60).toString().padStart(2, "0")
        const secs = (diff % 60).toString().padStart(2, "0")
        newDurations[chat.id] = `${mins}:${secs}`
      })
      setDurations(newDurations)
    }

    updateDurations()
    const interval = setInterval(updateDurations, 1000)
    return () => clearInterval(interval)
  }, [chats])

  if (chats.length === 0) return null

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            Chats Activos
          </CardTitle>
          <Badge className="bg-[#25D366]/10 text-[#25D366] border-0 rounded-full px-2.5 py-0.5 text-xs">
            {chats.length} activo{chats.length > 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-[200px]">
          <div className="px-4 pb-4 space-y-2">
            {chats.map((chat) => {
              const isSelected = chat.id === selectedChatId
              return (
                <Button
                  key={chat.id}
                  variant="ghost"
                  className={`w-full h-auto p-3 justify-start rounded-xl transition-all ${
                    isSelected 
                      ? "bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/15" 
                      : "hover:bg-muted/50 border border-transparent"
                  }`}
                  onClick={() => onSelectChat(chat.id)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      isSelected ? "bg-[#25D366]/20" : "bg-muted"
                    }`}>
                      <MessageCircle className={`w-5 h-5 ${isSelected ? "text-[#25D366]" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm font-medium truncate ${isSelected ? "text-[#25D366]" : "text-foreground"}`}>
                          {chat.customerName}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {chat.unreadCount > 0 && (
                            <Badge className="bg-destructive text-destructive-foreground border-0 rounded-full px-1.5 py-0 text-xs min-w-[18px] h-[18px] flex items-center justify-center">
                              {chat.unreadCount}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground font-mono">
                            {durations[chat.id] || "00:00"}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {chat.lastMessage}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-1.5 py-0 ${
                            chat.status === "active" ? "border-success/30 text-success" :
                            chat.status === "waiting" ? "border-warning/30 text-warning" :
                            "border-muted text-muted-foreground"
                          }`}
                        >
                          {chat.status === "active" ? "Activo" : 
                           chat.status === "waiting" ? "Esperando" : "En espera"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
