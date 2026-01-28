"use client"

import { User, Mail, Phone, MapPin, Edit2, Save, X, FileText, AlertTriangle, Shield, CheckCircle, Clock, AlertCircle, Bot, MessageSquare, Fingerprint, Route, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export interface Contract {
  id: string
  name: string
  type: string
  status: "active" | "inactive" | "pending"
}

export interface AutogestionAction {
  id: string
  action: string
  result: "success" | "pending" | "failed" | "transferred"
  timestamp: Date
  details?: string
  intent?: string
}

export interface CustomerData {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  segment: string
  serviceLevel: "Standard" | "Premium" | "VIP" | "Institucional"
  contracts: Contract[]
  selectedContractId: string
  isTestAccount: boolean
  // Autogestión flow data
  identifiedBy?: "rut" | "phone" | "account"
  identificationValue?: string
  botChannel?: "ivr" | "whatsapp" | "web"
  menuOptionsSelected: string[]
  consultaResuelta: boolean
  transferReason?: string
  routingInfo?: {
    priority: "normal" | "alta" | "vip"
    sla: string
    serviceType: string
    skillRequired?: string
  }
  waitTime?: number
  autogestionActions: AutogestionAction[]
}

interface CustomerPanelProps {
  customer: CustomerData
  onUpdateCustomer: (customer: CustomerData) => void
}

export function CustomerPanel({ customer, onUpdateCustomer }: CustomerPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedCustomer, setEditedCustomer] = useState(customer)

  const selectedContract = customer.contracts.find(c => c.id === customer.selectedContractId)

  const handleSave = () => {
    onUpdateCustomer(editedCustomer)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedCustomer(customer)
    setIsEditing(false)
  }

  const handleContractChange = (contractId: string) => {
    onUpdateCustomer({ ...customer, selectedContractId: contractId })
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-auto">
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Datos del Cliente</CardTitle>
            {!isEditing ? (
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4" />
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="default" onClick={handleSave}>
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {customer.isTestAccount && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10 border border-warning/30 mb-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-xs font-medium text-warning">Cuenta de Prueba</span>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-muted border-2 border-primary/20">
              <User className="w-7 h-7 text-muted-foreground" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    value={editedCustomer.firstName}
                    onChange={(e) => setEditedCustomer({ ...editedCustomer, firstName: e.target.value })}
                    placeholder="Nombre"
                    className="h-8"
                  />
                  <Input
                    value={editedCustomer.lastName}
                    onChange={(e) => setEditedCustomer({ ...editedCustomer, lastName: e.target.value })}
                    className="h-8 flex-1"
                  />
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-foreground">
                    {customer.firstName} {customer.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-foreground text-background border-0 rounded-full px-3 py-0.5 text-xs font-medium">
                      {customer.segment}
                    </Badge>
                    <Badge className="bg-primary/10 text-primary border-0 rounded-full px-3 py-0.5 text-xs font-medium flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {customer.serviceLevel}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              {isEditing ? (
                <Input
                  value={editedCustomer.email}
                  onChange={(e) => setEditedCustomer({ ...editedCustomer, email: e.target.value })}
                  className="h-8 flex-1"
                />
              ) : (
                <span className="text-foreground">{customer.email}</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              {isEditing ? (
                <Input
                  value={editedCustomer.phone}
                  onChange={(e) => setEditedCustomer({ ...editedCustomer, phone: e.target.value })}
                  className="h-8 flex-1"
                />
              ) : (
                <span className="text-foreground">{customer.phone}</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              {isEditing ? (
                <Input
                  value={editedCustomer.address}
                  onChange={(e) => setEditedCustomer({ ...editedCustomer, address: e.target.value })}
                  className="h-8 flex-1"
                />
              ) : (
                <span className="text-foreground">{customer.address}</span>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-border space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">ID Cliente</p>
              <p className="text-sm font-mono text-foreground">{customer.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Contrato Asociado
              </p>
              <Select value={customer.selectedContractId} onValueChange={handleContractChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar contrato" />
                </SelectTrigger>
                <SelectContent>
                  {customer.contracts.map((contract) => (
                    <SelectItem key={contract.id} value={contract.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{contract.id}</span>
                        <span className="text-muted-foreground">-</span>
                        <span>{contract.name}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ml-1 ${
                            contract.status === "active" ? "border-success/30 text-success" :
                            contract.status === "pending" ? "border-warning/30 text-warning" :
                            "border-muted text-muted-foreground"
                          }`}
                        >
                          {contract.status === "active" ? "Activo" : 
                           contract.status === "pending" ? "Pendiente" : "Inactivo"}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedContract && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Tipo: {selectedContract.type}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border flex-1 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Proceso de Autogestión
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Identificación del Cliente */}
          {customer.identifiedBy && (
            <div className="p-3 rounded-xl bg-muted/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                <Fingerprint className="w-3 h-3" />
                Identificación
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {customer.identifiedBy === "rut" ? "RUT/DNI" : 
                   customer.identifiedBy === "phone" ? "Teléfono" : "N° Cuenta"}
                </Badge>
                <span className="text-sm font-mono text-foreground">{customer.identificationValue}</span>
                {customer.botChannel && (
                  <Badge className="bg-primary/10 text-primary border-0 text-xs ml-auto">
                    {customer.botChannel === "ivr" ? "IVR" : 
                     customer.botChannel === "whatsapp" ? "WhatsApp Bot" : "Web Bot"}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Menú de Autogestión - Opciones seleccionadas */}
          {customer.menuOptionsSelected && customer.menuOptionsSelected.length > 0 && (
            <div className="p-3 rounded-xl bg-muted/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                <Route className="w-3 h-3" />
                Ruta en Autogestión
              </p>
              <div className="flex flex-wrap items-center gap-1">
                {customer.menuOptionsSelected.map((option, idx) => (
                  <div key={idx} className="flex items-center">
                    <Badge variant="outline" className="text-xs bg-card">
                      {option}
                    </Badge>
                    {idx < customer.menuOptionsSelected.length - 1 && (
                      <span className="text-muted-foreground mx-1">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estado de Resolución y Motivo de Transferencia */}
          <div className={`p-3 rounded-xl border ${
            customer.consultaResuelta 
              ? "bg-success/5 border-success/20" 
              : "bg-warning/5 border-warning/20"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Estado de Consulta
              </p>
              <Badge className={`text-xs border-0 ${
                customer.consultaResuelta 
                  ? "bg-success/10 text-success" 
                  : "bg-warning/10 text-warning"
              }`}>
                {customer.consultaResuelta ? "Resuelta en Bot" : "No Resuelta"}
              </Badge>
            </div>
            {customer.transferReason && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Motivo de Transferencia</p>
                <p className="text-sm font-medium text-foreground">{customer.transferReason}</p>
              </div>
            )}
          </div>

          {/* Información de Enrutamiento */}
          {customer.routingInfo && (
            <div className="p-3 rounded-xl bg-muted/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                <Target className="w-3 h-3" />
                Enrutamiento
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Prioridad</p>
                  <Badge className={`text-xs border-0 mt-0.5 ${
                    customer.routingInfo.priority === "vip" ? "bg-primary/10 text-primary" :
                    customer.routingInfo.priority === "alta" ? "bg-destructive/10 text-destructive" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {customer.routingInfo.priority === "vip" ? "VIP" : 
                     customer.routingInfo.priority === "alta" ? "Alta" : "Normal"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">SLA</p>
                  <p className="text-sm font-medium text-foreground">{customer.routingInfo.sla}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tipo Servicio</p>
                  <p className="text-sm text-foreground">{customer.routingInfo.serviceType}</p>
                </div>
                {customer.waitTime !== undefined && (
                  <div>
                    <p className="text-xs text-muted-foreground">Tiempo en Cola</p>
                    <p className="text-sm font-semibold text-foreground">{customer.waitTime}s</p>
                  </div>
                )}
              </div>
              {customer.routingInfo.skillRequired && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">Skill Requerido</p>
                  <Badge variant="outline" className="text-xs mt-0.5">
                    {customer.routingInfo.skillRequired}
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Acciones Realizadas en Autogestión */}
          {customer.autogestionActions && customer.autogestionActions.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                Acciones en Bot
              </p>
              <ScrollArea className="h-[140px]">
                <div className="space-y-2 pr-2">
                  {customer.autogestionActions.map((action) => (
                    <div
                      key={action.id}
                      className={`p-3 rounded-lg border ${
                        action.result === "success" ? "border-success/20 bg-success/5" :
                        action.result === "failed" ? "border-destructive/20 bg-destructive/5" :
                        action.result === "transferred" ? "border-info/20 bg-info/5" :
                        "border-border bg-card"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          {action.result === "success" ? (
                            <CheckCircle className="w-4 h-4 text-success" />
                          ) : action.result === "failed" ? (
                            <AlertCircle className="w-4 h-4 text-destructive" />
                          ) : action.result === "transferred" ? (
                            <Phone className="w-4 h-4 text-info" />
                          ) : (
                            <Clock className="w-4 h-4 text-warning" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{action.action}</p>
                          {action.details && (
                            <p className="text-xs text-muted-foreground mt-0.5">{action.details}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {action.timestamp.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Empty state */}
          {(!customer.autogestionActions || customer.autogestionActions.length === 0) && 
           !customer.identifiedBy && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Bot className="w-8 h-8 text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">
                Sin proceso de autogestión registrado
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
