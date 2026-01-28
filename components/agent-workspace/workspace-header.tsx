"use client"

import { Settings, Bell, LogOut, User, Circle, Phone, PhoneOutgoing, MessageCircle, Mail, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

type ChannelType = "inbound_call" | "outbound_call" | "whatsapp" | "email" | null

interface ActiveContact {
  id: string
  channel: ChannelType
  customerName?: string
}

interface ActiveChatPreview {
  id: string
  customerName: string
  lastMessage: string
  unreadCount: number
}

interface AgentStatus {
  name: string
  status: "available" | "busy" | "away" | "offline"
  queue: string
}

interface WorkspaceHeaderProps {
  agent: AgentStatus
  onStatusChange: (status: AgentStatus["status"]) => void
  activeContacts?: ActiveContact[]
  onSelectContact?: (contactId: string) => void
  selectedContactId?: string
  activeChats?: ActiveChatPreview[]
  onSelectChat?: (chatId: string) => void
}

const channelConfig = {
  inbound_call: { 
    label: "Inbound Call", 
    icon: Phone, 
    color: "bg-success/20 text-success border-success/30" 
  },
  outbound_call: { 
    label: "Outbound Call", 
    icon: PhoneOutgoing, 
    color: "bg-info/20 text-info border-info/30" 
  },
  whatsapp: { 
    label: "WhatsApp", 
    icon: MessageCircle, 
    color: "bg-[#25D366]/20 text-[#25D366] border-[#25D366]/30" 
  },
  email: { 
    label: "Email", 
    icon: Mail, 
    color: "bg-warning/20 text-warning border-warning/30" 
  },
}

const statusConfig = {
  available: { label: "Disponible", color: "text-success", bg: "bg-success" },
  busy: { label: "Ocupado", color: "text-destructive", bg: "bg-destructive" },
  away: { label: "Ausente", color: "text-warning", bg: "bg-warning" },
  offline: { label: "Desconectado", color: "text-muted-foreground", bg: "bg-muted-foreground" },
}

export function WorkspaceHeader({ agent, onStatusChange, activeContacts = [], onSelectContact, selectedContactId, activeChats = [], onSelectChat }: WorkspaceHeaderProps) {
  const voiceContacts = activeContacts.filter(c => c.channel === "inbound_call" || c.channel === "outbound_call")
  const chatContacts = activeContacts.filter(c => c.channel === "whatsapp" || c.channel === "email")
  const selectedContact = activeContacts.find(c => c.id === selectedContactId)
  const ChannelIcon = selectedContact?.channel ? channelConfig[selectedContact.channel].icon : null
  const totalUnread = activeChats.reduce((sum, chat) => sum + chat.unreadCount, 0)
  
  return (
    <header className="h-16 border-b border-border bg-sidebar px-6 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">GBM</span>
          </div>
          <span className="font-semibold text-sidebar-foreground text-lg">Agent Workspace</span>
        </div>
        <Badge className="bg-sidebar-accent text-sidebar-foreground border-0 rounded-full px-3 py-1">
          {agent.queue}
        </Badge>
        
        {/* Active Contacts Indicators */}
        <div className="flex items-center gap-2">
          {voiceContacts.length > 0 && (
            <Badge className="bg-success/20 text-success border-success/30 rounded-full px-3 py-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              1 Llamada
            </Badge>
          )}
          {chatContacts.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-auto p-0 hover:bg-transparent"
                >
                  <Badge className="bg-[#25D366]/20 text-[#25D366] border-[#25D366]/30 rounded-full px-3 py-1 flex items-center gap-1.5 cursor-pointer hover:bg-[#25D366]/30 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {chatContacts.length} Chat{chatContacts.length > 1 ? "s" : ""}
                    {totalUnread > 0 && (
                      <span className="bg-destructive text-destructive-foreground rounded-full px-1.5 text-xs min-w-[18px] h-[18px] flex items-center justify-center">
                        {totalUnread}
                      </span>
                    )}
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  </Badge>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="p-3 border-b border-border">
                  <h4 className="text-sm font-medium">Chats Activos</h4>
                  <p className="text-xs text-muted-foreground">Selecciona un chat para cambiar</p>
                </div>
                <ScrollArea className="max-h-[300px]">
                  <div className="p-2 space-y-1">
                    {activeChats.map((chat) => (
                      <Button
                        key={chat.id}
                        variant="ghost"
                        className="w-full h-auto p-3 justify-start rounded-lg hover:bg-[#25D366]/10"
                        onClick={() => onSelectChat?.(chat.id)}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#25D366]/10">
                            <MessageCircle className="w-4 h-4 text-[#25D366]" />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium truncate">
                                {chat.customerName}
                              </span>
                              {chat.unreadCount > 0 && (
                                <Badge className="bg-destructive text-destructive-foreground border-0 rounded-full px-1.5 py-0 text-xs">
                                  {chat.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {chat.lastMessage}
                            </p>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {selectedContact && ChannelIcon && (
          <Badge className={`border rounded-full px-3 py-1 flex items-center gap-1.5 ${channelConfig[selectedContact.channel!].color}`}>
            <ChannelIcon className="w-3.5 h-3.5" />
            {channelConfig[selectedContact.channel!].label}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Select value={agent.status} onValueChange={(value) => onStatusChange(value as AgentStatus["status"])}>
          <SelectTrigger className="w-44 bg-sidebar-accent border-0 text-sidebar-foreground rounded-full">
            <div className="flex items-center gap-2">
              <Circle className={`w-2.5 h-2.5 fill-current ${statusConfig[agent.status].color}`} />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <Circle className={`w-2.5 h-2.5 fill-current ${config.color}`} />
                  {config.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button size="icon" variant="ghost" className="relative text-sidebar-foreground hover:bg-sidebar-accent">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">
            3
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 hover:bg-sidebar-accent">
              <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center">
                <User className="w-4 h-4 text-sidebar-foreground" />
              </div>
              <span className="text-sm text-sidebar-foreground font-medium">{agent.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Mi Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
