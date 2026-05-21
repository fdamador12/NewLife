"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Pencil, Plus, Trash2, Search, Trophy, Calendar, CheckCircle,
  ListChecks, Footprints, Target, Flame, Zap, Sparkles, Loader2, AlertCircle
} from "lucide-react"

import { getChallenges, createChallenge, updateChallenge, deleteChallenge, publishChallenge } from "@/lib/retos"

export type ChallengeType = "SOBRIETY_DAYS" | "CHECKIN_STREAK" | "CHECKIN_TOTAL" | "PATH_LEVEL"
export type ChallengeDifficulty = "SUAVE" | "MODERADA" | "INTENSA"
export type ChallengeStatus = "DRAFT" | "PUBLISHED"

interface Challenge {
  id: string 
  title: string
  description: string
  target: number
  difficulty: ChallengeDifficulty
  type: ChallengeType
  status: ChallengeStatus
  createdAt: string
}

const challengeTypeInfo: Record<ChallengeType, { label: string; description: string; icon: React.ElementType }> = {
  SOBRIETY_DAYS: { label: "Días de Sobriedad", description: "Días consecutivos de sobriedad absoluta.", icon: Calendar },
  CHECKIN_STREAK: { label: "Racha de Registros", description: "Racha de días consecutivos haciendo el registro diario.", icon: Flame },
  CHECKIN_TOTAL: { label: "Total de Registros", description: "Sumatoria total de registros diarios hechos, sin importar si no son consecutivos.", icon: ListChecks },
  PATH_LEVEL: { label: "Nivel del Camino", description: "Nivel alcanzado en el camino de los 12 pasos.", icon: Footprints },
}

const difficultyInfo: Record<ChallengeDifficulty, { label: string; color: string }> = {
  SUAVE: { label: "Suave", color: "bg-green-100 text-green-700 border-green-200" },
  MODERADA: { label: "Moderada", color: "bg-[#e8a84c]/20 text-[#c08a30] border-[#e8a84c]/30" },
  INTENSA: { label: "Intensa", color: "bg-red-100 text-red-700 border-red-200" },
}

const emptyFormData = {
  title: "",
  description: "",
  target: 0,
  difficulty: "SUAVE" as ChallengeDifficulty,
  type: "SOBRIETY_DAYS" as ChallengeType,
  status: "DRAFT" as ChallengeStatus,
}

export default function RetosPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formError, setFormError] = useState("")
  
  const [showModal, setShowModal] = useState(false)
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)
  const [challengeToDelete, setChallengeToDelete] = useState<Challenge | null>(null)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ChallengeStatus | "ALL">("ALL")
  const [difficultyFilter, setDifficultyFilter] = useState<ChallengeDifficulty | "ALL">("ALL")
  const [typeFilter, setTypeFilter] = useState<ChallengeType | "ALL">("ALL")
  const [formData, setFormData] = useState(emptyFormData)

  const loadChallenges = async () => {
    try {
      setIsLoadingData(true)
      const data = await getChallenges()
      
      const mapped: Challenge[] = data.map((item: any) => ({
        id: item.reto_id || item.id,
        title: item.titulo,
        description: item.descripcion,
        target: item.target,
        difficulty: item.dificultad,
        type: item.tipo,
        status: item.estado,
        createdAt: item.fecha_creacion || new Date().toISOString()
      }))
      setChallenges(mapped)
    } catch (error) {
      console.error("Error al cargar los retos:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    loadChallenges()
  }, [])

  const filteredChallenges = challenges.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter
    const matchesDifficulty = difficultyFilter === "ALL" || c.difficulty === difficultyFilter
    const matchesType = typeFilter === "ALL" || c.type === typeFilter
    return matchesSearch && matchesStatus && matchesDifficulty && matchesType
  })

  const hasActiveFilters = statusFilter !== "ALL" || difficultyFilter !== "ALL" || typeFilter !== "ALL" || searchQuery !== ""

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("ALL")
    setDifficultyFilter("ALL")
    setTypeFilter("ALL")
  }

  const openCreateModal = () => {
    setFormError("")
    setEditingChallenge(null)
    setFormData(emptyFormData)
    setShowModal(true)
  }

  const openEditModal = (challenge: Challenge) => {
    setFormError("")
    setEditingChallenge(challenge)
    setFormData({
      title: challenge.title,
      description: challenge.description,
      target: challenge.target,
      difficulty: challenge.difficulty,
      type: challenge.type,
      status: challenge.status,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    setFormError("")
    setIsSaving(true)

    const payload = {
      titulo: formData.title,
      descripcion: formData.description,
      dificultad: formData.difficulty,
      tipo: formData.type,
      target: formData.target,
    }

    try {
      if (editingChallenge) {
        await updateChallenge(editingChallenge.id, payload)
        
        if (formData.status === "PUBLISHED" && editingChallenge.status === "DRAFT") {
          await publishChallenge(editingChallenge.id)
        }
      } else {
        const response = await createChallenge(payload)
        const newChallengeId = response.reto_id || response.id
        
        if (formData.status === "PUBLISHED" && newChallengeId) {
          await publishChallenge(newChallengeId)
        }
      }

      await loadChallenges()
      setShowModal(false)
      setFormData(emptyFormData)
      setEditingChallenge(null)
    } catch (error: any) {
      console.error("Error al guardar reto:", error)
      setFormError("Hubo un problema al guardar el reto. Revisa los datos y vuelve a intentarlo.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!challengeToDelete) return
    setIsDeleting(true)
    
    try {
      await deleteChallenge(challengeToDelete.id)
      await loadChallenges()
      setChallengeToDelete(null)
    } catch (error) {
      console.error("Error al eliminar:", error)
      // Ajuste en el mensaje de error
      alert("No se pudo eliminar el reto. Hubo un error de conexión con el servidor.")
    } finally {
      setIsDeleting(false)
    }
  }

  const isEditDisabled = (challenge: Challenge) => challenge.status === "PUBLISHED"

  if (isLoadingData) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#d4854a] animate-spin" />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-[#e5e5e5] shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#d4854a]">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1a1a1a]">{challenges.length}</p>
                  <p className="text-sm text-[#737373]">Total de retos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#e5e5e5] shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-600">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1a1a1a]">
                    {challenges.filter((c) => c.status === "PUBLISHED").length}
                  </p>
                  <p className="text-sm text-[#737373]">Publicados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-[#e5e5e5] shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#e8a84c]">
                  <Pencil className="w-5 h-5 text-[#1a1a1a]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1a1a1a]">
                    {challenges.filter((c) => c.status === "DRAFT").length}
                  </p>
                  <p className="text-sm text-[#737373]">Borradores</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header */}
        <Card className="bg-white border-[#e5e5e5] shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-[#1a1a1a]">Retos de Motivación</CardTitle>
              <CardDescription className="text-[#737373]">
                Gestiona los retos para motivar a los usuarios en su recuperación
              </CardDescription>
            </div>
            <Button onClick={openCreateModal} className="bg-[#d4854a] hover:bg-[#c07842] text-white gap-2">
              <Plus className="w-4 h-4" /> Nuevo reto
            </Button>
          </CardHeader>
          <CardContent>
            {/* Filters Bar */}
            <div className="flex flex-col lg:flex-row gap-3 mb-6 p-4 rounded-lg bg-[#f8f6f3]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
                <Input
                  placeholder="Buscar por título..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white border-[#e5e5e5] text-[#1a1a1a] placeholder:text-[#a3a3a3]"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: ChallengeStatus | "ALL") => setStatusFilter(value)}>
                <SelectTrigger className="w-full lg:w-40 bg-white border-[#e5e5e5] text-[#1a1a1a]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#e5e5e5]">
                  <SelectItem value="ALL" className="text-[#1a1a1a] hover:bg-[#f8f6f3]">Todos</SelectItem>
                  <SelectItem value="DRAFT" className="text-[#1a1a1a] hover:bg-[#f8f6f3]">Borrador</SelectItem>
                  <SelectItem value="PUBLISHED" className="text-[#1a1a1a] hover:bg-[#f8f6f3]">Publicado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={difficultyFilter} onValueChange={(value: ChallengeDifficulty | "ALL") => setDifficultyFilter(value)}>
                <SelectTrigger className="w-full lg:w-40 bg-white border-[#e5e5e5] text-[#1a1a1a]">
                  <SelectValue placeholder="Dificultad" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#e5e5e5]">
                  <SelectItem value="ALL" className="text-[#1a1a1a] hover:bg-[#f8f6f3]">Todas</SelectItem>
                  <SelectItem value="SUAVE" className="text-[#1a1a1a] hover:bg-[#f8f6f3]">
                    <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-green-600" />Suave</span>
                  </SelectItem>
                  <SelectItem value="MODERADA" className="text-[#1a1a1a] hover:bg-[#f8f6f3]">
                    <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-[#e8a84c]" />Moderada</span>
                  </SelectItem>
                  <SelectItem value="INTENSA" className="text-[#1a1a1a] hover:bg-[#f8f6f3]">
                    <span className="flex items-center gap-2"><Flame className="w-4 h-4 text-red-500" />Intensa</span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={(value: ChallengeType | "ALL") => setTypeFilter(value)}>
                <SelectTrigger className="w-full lg:w-48 bg-white border-[#e5e5e5] text-[#1a1a1a]">
                  <SelectValue placeholder="Tipo de reto" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#e5e5e5]">
                  <SelectItem value="ALL" className="text-[#1a1a1a] hover:bg-[#f8f6f3]">Todos los tipos</SelectItem>
                  {Object.entries(challengeTypeInfo).map(([value, info]) => (
                    <SelectItem key={value} value={value} className="text-[#1a1a1a] hover:bg-[#f8f6f3]">
                      <span className="flex items-center gap-2">
                        <info.icon className="w-4 h-4 text-[#d4854a]" />
                        {info.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" onClick={clearFilters} className="text-[#737373] hover:text-[#1a1a1a] hover:bg-white">
                  Limpiar
                </Button>
              )}
            </div>

            {/* Challenges List */}
            <div className="space-y-3">
              {filteredChallenges.map((challenge) => {
                const TypeIcon = challengeTypeInfo[challenge.type].icon
                return (
                  <div key={challenge.id} className="flex items-center gap-4 p-4 rounded-lg border border-[#e5e5e5] bg-white hover:bg-[#f8f6f3] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-[#d4854a]/10 flex items-center justify-center flex-shrink-0">
                      <TypeIcon className="w-6 h-6 text-[#d4854a]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-[#1a1a1a]">{challenge.title}</h3>
                        <Badge className={difficultyInfo[challenge.difficulty].color}>
                          {difficultyInfo[challenge.difficulty].label}
                        </Badge>
                        <Badge className={challenge.status === "PUBLISHED" ? "bg-green-100 text-green-700 border-green-200" : "bg-[#e5e5e5] text-[#737373] border-[#e5e5e5]"}>
                          {challenge.status === "PUBLISHED" ? "Publicado" : "Borrador"}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#737373] line-clamp-1 mt-1">{challenge.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-[#a3a3a3]">
                        <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Meta: {challenge.target}</span>
                        <span>{challengeTypeInfo[challenge.type].label}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isEditDisabled(challenge) ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button size="sm" variant="outline" disabled className="border-[#e5e5e5] text-[#a3a3a3] cursor-not-allowed">
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#1a1a1a] text-white">
                            <p>No se puede editar un reto publicado</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => openEditModal(challenge)} className="border-[#e5e5e5] text-[#737373] hover:bg-[#f8f6f3] hover:text-[#1a1a1a]">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      {/* Botón de eliminar habilitado para todos (Borradores y Publicados) */}
                      <Button size="sm" variant="outline" onClick={() => setChallengeToDelete(challenge)} className="border-[#e5e5e5] text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredChallenges.length === 0 && (
              <div className="text-center py-12 text-[#737373]">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron retos</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="bg-white border-[#e5e5e5] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#1a1a1a]">{editingChallenge ? "Editar reto" : "Nuevo reto"}</DialogTitle>
              <DialogDescription className="text-[#737373]">
                {editingChallenge ? "Modifica los campos del reto" : "Crea un nuevo reto de motivación para los usuarios"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{formError}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="text-[#1a1a1a]">Título *</Label>
                <Input placeholder="Nombre del reto" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-[#f8f6f3] border-[#e5e5e5] text-[#1a1a1a]" />
              </div>

              <div className="space-y-2">
                <Label className="text-[#1a1a1a]">Descripción *</Label>
                <Textarea placeholder="Describe el reto y su objetivo..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-[#f8f6f3] border-[#e5e5e5] text-[#1a1a1a] min-h-24" />
              </div>

              <div className="space-y-2">
                <Label className="text-[#1a1a1a]">Tipo de Reto *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(challengeTypeInfo).map(([value, info]) => {
                    const Icon = info.icon
                    const isSelected = formData.type === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: value as ChallengeType })}
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all ${isSelected ? "border-[#d4854a] bg-[#d4854a]/5" : "border-[#e5e5e5] hover:border-[#d4854a]/50 bg-white"}`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-[#d4854a]" : "bg-[#f8f6f3]"}`}>
                          <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-[#737373]"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${isSelected ? "text-[#d4854a]" : "text-[#1a1a1a]"}`}>{info.label}</p>
                          <p className="text-xs text-[#737373] mt-0.5">{info.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#1a1a1a]">Meta / Target *</Label>
                  <Input type="number" min="1" placeholder="30" value={formData.target || ""} onChange={(e) => setFormData({ ...formData, target: parseInt(e.target.value) || 0 })} className="bg-[#f8f6f3] border-[#e5e5e5] text-[#1a1a1a]" />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#1a1a1a]">Dificultad *</Label>
                  <Select value={formData.difficulty} onValueChange={(value: ChallengeDifficulty) => setFormData({ ...formData, difficulty: value })}>
                    <SelectTrigger className="bg-[#f8f6f3] border-[#e5e5e5] text-[#1a1a1a]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-[#e5e5e5]">
                      <SelectItem value="SUAVE"><span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-green-600" />Suave</span></SelectItem>
                      <SelectItem value="MODERADA"><span className="flex items-center gap-2"><Zap className="w-4 h-4 text-[#e8a84c]" />Moderada</span></SelectItem>
                      <SelectItem value="INTENSA"><span className="flex items-center gap-2"><Flame className="w-4 h-4 text-red-500" />Intensa</span></SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#1a1a1a]">Estado *</Label>
                  <Select value={formData.status} onValueChange={(value: ChallengeStatus) => setFormData({ ...formData, status: value })} disabled={editingChallenge?.status === "PUBLISHED"}>
                    <SelectTrigger className="bg-[#f8f6f3] border-[#e5e5e5] text-[#1a1a1a]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-[#e5e5e5]">
                      <SelectItem value="DRAFT">Borrador</SelectItem>
                      <SelectItem value="PUBLISHED">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                  {editingChallenge?.status === "PUBLISHED" && (
                    <p className="text-xs text-[#a3a3a3]">No se puede cambiar un reto publicado a borrador.</p>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowModal(false)} disabled={isSaving} className="border-[#e5e5e5] text-[#737373]">Cancelar</Button>
              <Button onClick={handleSave} disabled={isSaving || !formData.title || !formData.description || formData.target <= 0} className="bg-[#d4854a] hover:bg-[#c07842] text-white">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingChallenge ? "Guardar cambios" : "Crear reto"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!challengeToDelete} onOpenChange={() => setChallengeToDelete(null)}>
          <AlertDialogContent className="bg-white border-[#e5e5e5]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[#1a1a1a]">¿Eliminar reto?</AlertDialogTitle>
              <AlertDialogDescription className="text-[#737373]">
                Esta acción no se puede deshacer. El reto &quot;{challengeToDelete?.title}&quot; será eliminado permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting} className="border-[#e5e5e5] text-[#737373]">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}