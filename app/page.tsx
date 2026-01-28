"use client"

import { useState, useCallback } from "react"
import { WorkspaceHeader } from "@/components/agent-workspace/workspace-header"
import { ContactContext } from "@/components/agent-workspace/contact-context"
import { CustomerPanel, type CustomerData } from "@/components/agent-workspace/customer-panel"
import { ActionsPanel } from "@/components/agent-workspace/actions-panel"
import { OutboundTasksPanel, type OutboundTask } from "@/components/agent-workspace/outbound-tasks-panel"
import { ActiveChatsPanel, type ActiveChat } from "@/components/agent-workspace/active-chats-panel"
import type { CallClosureData } from "@/components/agent-workspace/call-closure-dialog"
import type { ChannelType } from "@/components/agent-workspace/contact-context"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Phone, PhoneOutgoing, MessageCircle, Send } from "lucide-react"

type ViewType = "inbound_call" | "outbound_call" | "chat_inbound" | "chat_outbound"

const mockContacts = {
  inbound_call: {
    id: "CTX-2024-001234",
    type: "inbound" as const,
    channel: "inbound_call" as ChannelType,
    queue: "Soporte Premium",
    startTime: new Date(Date.now() - 120000),
    ani: "+34 612 345 678",
    dnis: "+34 900 123 456",
    attributes: {
      "IVR Path": "Consultas > Cuentas",
      "Idioma": "Español",
      "Prioridad": "Alta",
      "Intentos previos": "1",
    },
  },
  outbound_call: {
    id: "CTX-2024-001235",
    type: "outbound" as const,
    channel: "outbound_call" as ChannelType,
    queue: "Ventas Outbound",
    startTime: new Date(Date.now() - 45000),
    ani: "+34 655 123 456",
    dnis: "+34 900 123 456",
    attributes: {
      "Campaña": "Retención Q1",
      "Prioridad": "Alta",
      "Intentos": "2 de 3",
      "Motivo": "Seguimiento producto",
    },
  },
  chat_inbound: {
    id: "CTX-2024-001236",
    type: "inbound" as const,
    channel: "whatsapp" as ChannelType,
    queue: "Chat Premium",
    startTime: new Date(Date.now() - 300000),
    ani: "+34 677 890 123",
    dnis: "WhatsApp Business",
    attributes: {
      "Canal": "WhatsApp",
      "Idioma": "Español",
      "Tema": "Consulta inversiones",
    },
  },
  chat_outbound: {
    id: "CTX-2024-001237",
    type: "outbound" as const,
    channel: "whatsapp" as ChannelType,
    queue: "WhatsApp Campañas",
    startTime: new Date(Date.now() - 60000),
    ani: "+34 688 111 222",
    dnis: "WhatsApp Business",
    attributes: {
      "Campaña": "Seguimiento Leads",
      "Template": "Bienvenida",
      "Idioma": "Español",
    },
  },
}

const mockCustomers: Record<ViewType, CustomerData> = {
  inbound_call: {
    id: "CLI-2024-567890",
    firstName: "María",
    lastName: "García López",
    email: "maria.garcia@email.com",
    phone: "+34 612 345 678",
    address: "Calle Mayor 123, 28001 Madrid",
    segment: "Premium",
    serviceLevel: "VIP",
    contracts: [
      { id: "CTR-2024-001234", name: "Cuenta Plus Inversión Premium", type: "Inversión", status: "active" },
      { id: "CTR-2024-001235", name: "Cuenta Ahorro Flexible", type: "Ahorro", status: "active" },
      { id: "CTR-2024-001100", name: "Tarjeta Platinum", type: "Crédito", status: "inactive" },
    ],
    selectedContractId: "CTR-2024-001234",
    isTestAccount: false,
    // Autogestión data
    identifiedBy: "rut",
    identificationValue: "12.345.678-9",
    botChannel: "ivr",
    menuOptionsSelected: ["Consultas", "Estado de Cuenta", "Movimientos"],
    consultaResuelta: false,
    transferReason: "Cliente requiere aclaración de movimiento no reconocido",
    routingInfo: {
      priority: "vip",
      sla: "30 segundos",
      serviceType: "Atención Preferente",
      skillRequired: "Inversiones Premium",
    },
    waitTime: 15,
    autogestionActions: [
      {
        id: "AG-001",
        action: "Consulta de saldo",
        result: "success",
        timestamp: new Date(Date.now() - 600000),
        details: "Saldo consultado: $1,260,000.26 MXN",
        intent: "balance_inquiry",
      },
      {
        id: "AG-002",
        action: "Consulta de movimientos",
        result: "success",
        timestamp: new Date(Date.now() - 480000),
        details: "Últimos 5 movimientos mostrados",
        intent: "transaction_history",
      },
      {
        id: "AG-003",
        action: "Aclaración de movimiento",
        result: "failed",
        timestamp: new Date(Date.now() - 360000),
        details: "Requiere validación manual por agente",
        intent: "dispute_transaction",
      },
    ],
  },
  outbound_call: {
    id: "CLI-2024-567891",
    firstName: "Juan",
    lastName: "Pérez Rodríguez",
    email: "juan.perez@email.com",
    phone: "+34 655 123 456",
    address: "Av. Reforma 456, CDMX",
    segment: "Standard",
    serviceLevel: "Standard",
    contracts: [
      { id: "CTR-2024-001235", name: "Cuenta Básica", type: "Corriente", status: "active" },
    ],
    selectedContractId: "CTR-2024-001235",
    isTestAccount: false,
    menuOptionsSelected: [],
    consultaResuelta: true,
    routingInfo: {
      priority: "normal",
      sla: "60 segundos",
      serviceType: "Campaña Outbound",
    },
    autogestionActions: [],
  },
  chat_inbound: {
    id: "CLI-2024-567892",
    firstName: "Ana",
    lastName: "Rodríguez Martínez",
    email: "ana.rodriguez@email.com",
    phone: "+34 677 890 123",
    address: "Paseo de la Castellana 100, Madrid",
    segment: "Premium",
    serviceLevel: "Premium",
    contracts: [
      { id: "CTR-2024-001236", name: "Smart Cash Plus", type: "Inversión", status: "active" },
      { id: "CTR-2024-001237", name: "Fondo Crecimiento", type: "Fondos", status: "active" },
    ],
    selectedContractId: "CTR-2024-001236",
    isTestAccount: false,
    // Autogestión WhatsApp
    identifiedBy: "phone",
    identificationValue: "+34 677 890 123",
    botChannel: "whatsapp",
    menuOptionsSelected: ["Consultas", "Inversiones", "Fondos Externos"],
    consultaResuelta: false,
    transferReason: "Bot no pudo resolver consulta sobre fondos externos",
    routingInfo: {
      priority: "alta",
      sla: "45 segundos",
      serviceType: "Asesoría Inversiones",
      skillRequired: "Fondos Mutuos",
    },
    waitTime: 45,
    autogestionActions: [
      {
        id: "AG-C01",
        action: "Consulta de portafolio",
        result: "success",
        timestamp: new Date(Date.now() - 900000),
        details: "Rendimiento mostrado: +12.5%",
        intent: "portfolio_inquiry",
      },
      {
        id: "AG-C02",
        action: "Solicitud información fondos externos",
        result: "failed",
        timestamp: new Date(Date.now() - 600000),
        details: "Bot no tiene información actualizada",
        intent: "external_funds_info",
      },
    ],
  },
  chat_outbound: {
    id: "CLI-2024-567897",
    firstName: "Roberto",
    lastName: "Gómez Silva",
    email: "roberto.gomez@email.com",
    phone: "+34 688 111 222",
    address: "Calle Nueva 45, Barcelona",
    segment: "Standard",
    serviceLevel: "Standard",
    contracts: [
      { id: "CTR-2024-001240", name: "Cuenta Básica Plus", type: "Corriente", status: "active" },
      { id: "CTR-2024-001241", name: "Seguro Auto", type: "Seguros", status: "pending" },
    ],
    selectedContractId: "CTR-2024-001240",
    isTestAccount: false,
    menuOptionsSelected: [],
    consultaResuelta: true,
    routingInfo: {
      priority: "normal",
      sla: "90 segundos",
      serviceType: "Campaña WhatsApp",
    },
    autogestionActions: [],
  },
}

const mockOutboundTasks: OutboundTask[] = [
  {
    id: "OT-001",
    customerId: "CLI-2024-567893",
    customerName: "Carlos Sánchez",
    phone: "+34 677 345 678",
    campaign: "Retención Q1 2024",
    taskType: "retencion",
    priority: "alta",
    reason: "Cliente inactivo por 60 días, alto valor",
    status: "pending",
    attempts: 0,
    maxAttempts: 3,
    createdAt: new Date(Date.now() - 86400000),
    dueDate: new Date().toISOString().split("T")[0],
  },
  {
    id: "OT-002",
    customerId: "CLI-2024-567894",
    customerName: "Laura Fernández",
    phone: "+34 688 456 789",
    campaign: "Cross-Sell Fondos",
    taskType: "venta",
    priority: "media",
    reason: "Perfil apto para Fondos GBM Premium",
    status: "pending",
    attempts: 1,
    maxAttempts: 3,
    createdAt: new Date(Date.now() - 172800000),
  },
  {
    id: "OT-003",
    customerId: "CLI-2024-567895",
    customerName: "Pedro Martín",
    phone: "+34 699 567 890",
    campaign: "Encuesta NPS",
    taskType: "encuesta",
    priority: "baja",
    reason: "Encuesta de satisfacción post-servicio",
    status: "pending",
    attempts: 0,
    maxAttempts: 2,
    createdAt: new Date(Date.now() - 259200000),
  },
]

const mockHistory = [
  {
    id: "HIS-001",
    type: "call" as const,
    title: "Llamada - Consulta de Saldo",
    description: "Cliente consultó el saldo de su cuenta corriente y movimientos del último mes.",
    timestamp: new Date(Date.now() - 3600000 * 24 * 2),
    agent: "Carlos Martínez",
    status: "completed" as const,
    callResult: "successful" as const,
  },
  {
    id: "HIS-002",
    type: "case" as const,
    title: "Caso - Actualización de Datos",
    description: "Solicitud de cambio de dirección postal completada.",
    timestamp: new Date(Date.now() - 3600000 * 24 * 5),
    agent: "Ana López",
    status: "completed" as const,
  },
  {
    id: "HIS-003",
    type: "note" as const,
    title: "Nota - Preferencias del cliente",
    description: "Cliente prefiere ser contactado por email. Interesado en productos de inversión.",
    timestamp: new Date(Date.now() - 3600000 * 24 * 7),
    agent: "Carlos Martínez",
  },
  {
    id: "HIS-004",
    type: "call" as const,
    title: "Llamada Saliente - Oferta Productos",
    description: "Se contactó al cliente para oferta de Fondos Premium. Cliente solicitó llamar después.",
    timestamp: new Date(Date.now() - 3600000 * 24 * 10),
    agent: "Laura Sánchez",
    status: "completed" as const,
    callResult: "unsuccessful" as const,
    isCallback: false,
  },
]

export default function AgentWorkspace() {
  const [currentView, setCurrentView] = useState<ViewType>("inbound_call")
  
  const [agent, setAgent] = useState({
    name: "Agente Demo",
    status: "available" as const,
    queue: "Soporte Premium",
  })

  const [contacts, setContacts] = useState(mockContacts)
  const [customers, setCustomers] = useState(mockCustomers)
  const [history, setHistory] = useState(mockHistory)
  const [outboundTasks, setOutboundTasks] = useState<OutboundTask[]>(mockOutboundTasks)
  
  // Track active contacts for concurrency (1 voice max + multiple chats)
  const [activeContacts, setActiveContacts] = useState<Array<{id: string, channel: ChannelType, customerName?: string}>>([
    { id: mockContacts.inbound_call.id, channel: "inbound_call", customerName: "María García" },
    { id: mockContacts.chat_inbound.id, channel: "whatsapp", customerName: "Ana Rodríguez" },
    { id: mockContacts.chat_outbound.id, channel: "whatsapp", customerName: "Roberto Gómez" },
  ])

  // Active chats data for the panel
  const [activeChats, setActiveChats] = useState<ActiveChat[]>([
    {
      id: mockContacts.chat_inbound.id,
      channel: "whatsapp",
      customerName: "Ana Rodríguez",
      customerPhone: "+34 677 890 123",
      lastMessage: "Necesito información sobre mis fondos de inversión",
      startTime: new Date(Date.now() - 300000),
      unreadCount: 2,
      status: "active",
    },
    {
      id: mockContacts.chat_outbound.id,
      channel: "whatsapp",
      customerName: "Roberto Gómez",
      customerPhone: "+34 688 111 222",
      lastMessage: "Gracias por la información, tengo otra consulta",
      startTime: new Date(Date.now() - 60000),
      unreadCount: 0,
      status: "waiting",
    },
  ])

  const [selectedChatId, setSelectedChatId] = useState<string>(mockContacts.chat_inbound.id)

  const currentContact = contacts[currentView]
  const currentCustomer = customers[currentView]
  
  // Check if there's an active voice call
  const hasActiveVoiceCall = activeContacts.some(c => c.channel === "inbound_call" || c.channel === "outbound_call")
  const activeChatCount = activeContacts.filter(c => c.channel === "whatsapp" || c.channel === "email").length

  // Handle chat selection from the panel
  const handleSelectChat = useCallback((chatId: string) => {
    setSelectedChatId(chatId)
    // Find which view corresponds to this chat
    const chat = activeChats.find(c => c.id === chatId)
    if (chat) {
      // Update to the correct view based on the chat
      if (chatId === mockContacts.chat_inbound.id) {
        setCurrentView("chat_inbound")
      } else if (chatId === mockContacts.chat_outbound.id) {
        setCurrentView("chat_outbound")
      }
      // Clear unread count when selecting
      setActiveChats(prev => prev.map(c => 
        c.id === chatId ? { ...c, unreadCount: 0 } : c
      ))
    }
  }, [activeChats])

  const handleStatusChange = useCallback((status: typeof agent.status) => {
    setAgent((prev) => ({ ...prev, status }))
  }, [])

  const handleCallClosure = useCallback((data: CallClosureData) => {
    const typificationLabels: Record<string, string> = {
      consulta_saldo: "Consulta de Saldo",
      consulta_movimientos: "Consulta de Movimientos",
      reclamo: "Reclamo",
      solicitud_producto: "Solicitud de Producto",
      actualizacion_datos: "Actualización de Datos",
      soporte_tecnico: "Soporte Técnico",
      venta_realizada: "Venta Realizada",
      seguimiento_caso: "Seguimiento de Caso",
      whatsapp_consulta: "WhatsApp - Consulta",
      whatsapp_soporte: "WhatsApp - Soporte",
      whatsapp_reclamo: "WhatsApp - Reclamo",
      otros: "Otros",
    }

    const isChat = currentView.includes("chat")
    const resultLabel = data.result === "successful" ? "Exitosa" : "No Exitosa"
    const typeLabel = isChat ? "Chat" : "Llamada"
    
    const historyItem = {
      id: `HIS-${Date.now()}`,
      type: "call" as const,
      title: `${typeLabel} ${resultLabel} - ${typificationLabels[data.typification] || data.typification}`,
      description: data.notes || `${typeLabel} cerrada como ${resultLabel.toLowerCase()}${data.unsuccessfulReason ? ` - Motivo: ${data.unsuccessfulReason}` : ""}`,
      timestamp: new Date(),
      agent: agent.name,
      status: "completed" as const,
      isCallback: false,
      callResult: data.result,
    }
    setHistory((prev) => [historyItem, ...prev])
  }, [agent.name, currentView])

  const handleInitiateOutboundCall = useCallback((task: OutboundTask) => {
    setCurrentView("outbound_call")
    setContacts((prev) => ({
      ...prev,
      outbound_call: {
        id: `CTX-${Date.now()}`,
        type: "outbound" as const,
        channel: "outbound_call" as ChannelType,
        queue: task.campaign,
        startTime: new Date(),
        ani: task.phone,
        dnis: "+34 900 123 456",
        attributes: {
          "Campaña": task.campaign,
          "Tipo": task.taskType,
          "Intento": `${task.attempts + 1} de ${task.maxAttempts}`,
          "Motivo": task.reason,
        },
      },
    }))
    
    setOutboundTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, status: "in_progress" as const, attempts: t.attempts + 1 } : t
      )
    )
  }, [])

  const handleSkipTask = useCallback((taskId: string) => {
    setOutboundTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: "skipped" as const } : t
      )
    )
  }, [])

  const handleRescheduleTask = useCallback((taskId: string) => {
    setOutboundTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0] } : t
      )
    )
  }, [])

  const handleUpdateCustomer = useCallback((updatedCustomer: CustomerData) => {
    setCustomers((prev) => ({
      ...prev,
      [currentView]: updatedCustomer,
    }))
  }, [currentView])

  const handleAddNote = useCallback((note: string) => {
    const newHistoryItem = {
      id: `HIS-${Date.now()}`,
      type: "note" as const,
      title: "Nota - Nueva nota agregada",
      description: note,
      timestamp: new Date(),
      agent: agent.name,
    }
    setHistory((prev) => [newHistoryItem, ...prev])
  }, [agent.name])

  const handleCreateCase = useCallback((caseType: string, description: string) => {
    const caseLabels: Record<string, string> = {
      reclamo: "Reclamo",
      solicitud: "Solicitud",
      incidencia: "Incidencia",
      seguimiento: "Seguimiento",
    }
    const newHistoryItem = {
      id: `HIS-${Date.now()}`,
      type: "case" as const,
      title: `Caso - ${caseLabels[caseType] || caseType}`,
      description,
      timestamp: new Date(),
      agent: agent.name,
      status: "pending" as const,
    }
    setHistory((prev) => [newHistoryItem, ...prev])
  }, [agent.name])

  const handleTransfer = useCallback((destination: string) => {
    const queueLabels: Record<string, string> = {
      ventas: "Ventas",
      soporte_premium: "Soporte Premium",
      reclamos: "Reclamos",
      supervisor: "Supervisor",
      backoffice: "Back Office",
    }
    const newHistoryItem = {
      id: `HIS-${Date.now()}`,
      type: "action" as const,
      title: "Acción - Transferencia iniciada",
      description: `Contacto transferido a ${queueLabels[destination] || destination}`,
      timestamp: new Date(),
      agent: agent.name,
      status: "pending" as const,
    }
    setHistory((prev) => [newHistoryItem, ...prev])
  }, [agent.name])

  const handleTypify = useCallback((typification: string) => {
    const typificationLabels: Record<string, string> = {
      consulta_saldo: "Consulta de Saldo",
      consulta_movimientos: "Consulta de Movimientos",
      reclamo: "Reclamo",
      solicitud_producto: "Solicitud de Producto",
      actualizacion_datos: "Actualización de Datos",
      soporte_tecnico: "Soporte Técnico",
      otros: "Otros",
    }

    const newHistoryItem = {
      id: `HIS-${Date.now()}`,
      type: "action" as const,
      title: "Acción - Tipificación registrada",
      description: `Tipificado como: ${typificationLabels[typification] || typification}`,
      timestamp: new Date(),
      agent: agent.name,
      status: "completed" as const,
    }
    setHistory((prev) => [newHistoryItem, ...prev])
  }, [agent.name])

  const handleSendWhatsApp = useCallback((template: string) => {
    const templateLabels: Record<string, string> = {
      bienvenida: "Bienvenida",
      confirmacion_solicitud: "Confirmación de Solicitud",
      estado_cuenta: "Estado de Cuenta",
      recordatorio_pago: "Recordatorio de Pago",
      seguimiento_caso: "Seguimiento de Caso",
      encuesta_satisfaccion: "Encuesta de Satisfacción",
      promocion: "Promoción",
      actualizacion_datos: "Actualización de Datos",
    }

    const newHistoryItem = {
      id: `HIS-${Date.now()}`,
      type: "action" as const,
      title: "Acción - WhatsApp enviado",
      description: `Template enviado: ${templateLabels[template] || template}`,
      timestamp: new Date(),
      agent: agent.name,
      status: "completed" as const,
    }
    setHistory((prev) => [newHistoryItem, ...prev])
  }, [agent.name])

  return (
    <div className="h-screen flex flex-col bg-muted/30">
      <WorkspaceHeader 
        agent={agent} 
        onStatusChange={handleStatusChange} 
        activeContacts={activeContacts}
        selectedContactId={currentContact.id}
        activeChats={activeChats}
        onSelectChat={handleSelectChat}
      />
      
      <div className="px-6 py-3 bg-card border-b border-border">
        <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as ViewType)}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="inbound_call" className="gap-2">
              <Phone className="w-4 h-4" />
              Llamada Entrante
              {activeContacts.some(c => c.channel === "inbound_call") && (
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              )}
            </TabsTrigger>
            <TabsTrigger value="outbound_call" className="gap-2">
              <PhoneOutgoing className="w-4 h-4" />
              Llamada Saliente
              {activeContacts.some(c => c.channel === "outbound_call") && (
                <span className="w-2 h-2 rounded-full bg-info animate-pulse" />
              )}
            </TabsTrigger>
            <TabsTrigger value="chat_inbound" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat Entrante
              {activeContacts.filter(c => c.channel === "whatsapp" && contacts.chat_inbound.id === c.id).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              )}
            </TabsTrigger>
            <TabsTrigger value="chat_outbound" className="gap-2">
              <Send className="w-4 h-4" />
              Chat Saliente
              {activeContacts.filter(c => c.channel === "whatsapp" && contacts.chat_outbound.id === c.id).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <main className="flex-1 p-6 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 min-h-0 overflow-auto flex flex-col gap-4">
            <ContactContext contact={currentContact} onCallClosure={handleCallClosure} onTransfer={handleTransfer} />
            {currentView === "outbound_call" && (
              <OutboundTasksPanel
                tasks={outboundTasks}
                onInitiateCall={handleInitiateOutboundCall}
                onSkipTask={handleSkipTask}
                onRescheduleTask={handleRescheduleTask}
              />
            )}
            {(currentView === "chat_inbound" || currentView === "chat_outbound") && activeChats.length > 0 && (
              <ActiveChatsPanel
                chats={activeChats}
                selectedChatId={selectedChatId}
                onSelectChat={handleSelectChat}
              />
            )}
          </div>
          
          <div className="lg:col-span-1 min-h-0 overflow-auto">
            <CustomerPanel customer={currentCustomer} onUpdateCustomer={handleUpdateCustomer} />
          </div>
          
          <div className="lg:col-span-1 min-h-0 overflow-auto">
            <ActionsPanel
              history={history}
              onAddNote={handleAddNote}
              onCreateCase={handleCreateCase}
              onTypify={handleTypify}
              onSendWhatsApp={handleSendWhatsApp}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
