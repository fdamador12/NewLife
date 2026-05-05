"use client"

import { useState, useMemo, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pencil, Plus, Search, MessageSquare, CalendarIcon, CalendarDays,
  List, ChevronLeft, ChevronRight, Upload, Loader2, AlertCircle
} from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addDays } from "date-fns"
import { es } from "date-fns/locale"

// --- Integración Backend ---
import { getForos, createForo, updateForo, createForosBulk, ForoDiaBackend } from "@/lib/foros-dia"

interface DailyForum {
  id: string
  date: string
  question: string
  description?: string
  createdAt: string
}

const emptyFormData = {
  date: undefined as Date | undefined,
  question: "",
  description: ""
}

export default function ForosPage() {
  const [forums, setForums] = useState<DailyForum[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState("")

  // ✅ FIX BUG 2: Estado controlado del tab activo (antes usaba defaultValue y se reseteaba)
  const [activeTab, setActiveTab] = useState("calendar")

  const [showModal, setShowModal] = useState(false)
  const [editingForum, setEditingForum] = useState<DailyForum | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState(emptyFormData)

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>(undefined)
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>(undefined)
  const [lockedDate, setLockedDate] = useState<Date | undefined>(undefined)

  // Bulk import state
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkText, setBulkText] = useState("")
  const [bulkStartDate, setBulkStartDate] = useState<string>("")
  const [isBulkSaving, setIsBulkSaving] = useState(false)
  const [bulkError, setBulkError] = useState("")

  // Parse utils
  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return new Date()
    const [year, month, day] = dateStr.split('-')
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }
  const formatDisplayDate = (dateStr: string) => format(parseLocalDate(dateStr), "d 'de' MMMM", { locale: es })
  const formatFullDate = (dateStr: string) => format(parseLocalDate(dateStr), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })

  // --- CARGA DE DATOS ---
  const loadForos = async () => {
    try {
      setIsLoadingData(true)
      const data: ForoDiaBackend[] = await getForos()
      const mappedForums: DailyForum[] = data.map((item) => ({
        id: item._id,
        date: item.fecha,
        question: item.pregunta,
        description: item.descripcion || "",
        createdAt: item.created_at || new Date().toISOString(),
      }))
      setForums(mappedForums)
    } catch (error) {
      console.error("Error al cargar foros:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    loadForos()
  }, [])

  // Forum lookup by date
  const forumsByDate = useMemo(() => {
    const map = new Map<string, DailyForum>()
    forums.forEach((f) => {
      map.set(f.date, f)
    })
    return map
  }, [forums])

  const getForumForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return forumsByDate.get(dateStr)
  }

  // Filtered forums for list view
  const filteredForums = useMemo(() => {
    let result = [...forums]
    if (searchQuery) {
      result = result.filter((f) =>
        f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    if (dateRangeStart) {
      result = result.filter((f) => parseLocalDate(f.date) >= dateRangeStart)
    }
    if (dateRangeEnd) {
      result = result.filter((f) => parseLocalDate(f.date) <= dateRangeEnd)
    }
    return result.sort((a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime())
  }, [forums, searchQuery, dateRangeStart, dateRangeEnd])

  const openCreateModal = (date?: Date) => {
    setFormError("")
    setEditingForum(null)
    setFormData({ date: date, question: "", description: "" })
    setLockedDate(date)
    setShowModal(true)
  }

  const openEditModal = (forum: DailyForum) => {
    setFormError("")
    setEditingForum(forum)
    setFormData({
      date: parseLocalDate(forum.date),
      question: forum.question,
      description: forum.description || "",
    })
    setLockedDate(parseLocalDate(forum.date))
    setShowModal(true)
  }

  // --- GUARDAR INDIVIDUAL ---
  // ✅ FIX BUG 1: En update enviamos descripcion explícita (incluso vacía) para permitir borrarla.
  // En create la omitimos si está vacía, ya que la columna es nullable en ROBLE.
  const handleSave = async () => {
    if (!formData.date || !formData.question.trim()) return
    setFormError("")
    setIsSaving(true)

    const fecha = format(formData.date, "yyyy-MM-dd")
    const pregunta = formData.question.trim()
    const descripcion = formData.description?.trim() ?? ""

    try {
      if (editingForum) {
        // En update: descripcion siempre va, así "" significa "borrar el contenido previo"
        await updateForo(editingForum.id, {
          fecha,
          pregunta,
          descripcion,
        })
      } else {
        // En create: si está vacía, omitimos el campo para que la columna quede null en ROBLE
        await createForo({
          fecha,
          pregunta,
          ...(descripcion ? { descripcion } : {}),
        })
      }

      await loadForos()
      setShowModal(false)
      setFormData(emptyFormData)
      setEditingForum(null)
      setLockedDate(undefined)
    } catch (error: any) {
      console.error("Error al guardar:", error)
      if (error.response?.status === 409) {
        setFormError("Ya existe un foro programado para esta fecha.")
      } else {
        setFormError("Ocurrió un error al guardar el foro.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Find first available date without a forum
  const findFirstAvailableDate = (startDate: Date): Date => {
    let current = startDate
    const maxDays = 365
    for (let i = 0; i < maxDays; i++) {
      const dateStr = format(current, "yyyy-MM-dd")
      if (!forumsByDate.has(dateStr)) return current
      current = addDays(current, 1)
    }
    return current
  }

  const openBulkModal = () => {
    setBulkError("")
    const firstAvailable = findFirstAvailableDate(new Date())
    setBulkStartDate(format(firstAvailable, "yyyy-MM-dd"))
    setBulkText("")
    setShowBulkModal(true)
  }

  const parsedBulkQuestions = useMemo(() => {
    return bulkText.split("\n").map((line) => line.trim()).filter((line) => line.length > 0)
  }, [bulkText])

  // --- CARGA MASIVA ---
  // ✅ Mejora: usamos un Set local en vez de mutar el Map memoizado de forumsByDate
  const handleBulkImport = async () => {
    if (parsedBulkQuestions.length === 0 || !bulkStartDate) return
    setBulkError("")
    setIsBulkSaving(true)

    const startDate = parseLocalDate(bulkStartDate)
    const reservedDates = new Set<string>(forumsByDate.keys())
    let currentDate = startDate
    const payloadForos: { fecha: string; pregunta: string }[] = []

    for (const questionText of parsedBulkQuestions) {
      while (reservedDates.has(format(currentDate, "yyyy-MM-dd"))) {
        currentDate = addDays(currentDate, 1)
      }

      const dayStr = format(currentDate, "yyyy-MM-dd")
      payloadForos.push({
        fecha: dayStr,
        pregunta: questionText,
        // descripción se omite en carga masiva
      })

      reservedDates.add(dayStr)
      currentDate = addDays(currentDate, 1)
    }

    try {
      await createForosBulk(payloadForos)
      await loadForos()
      setShowBulkModal(false)
      setBulkText("")
      setBulkStartDate("")
    } catch (error) {
      console.error("Error en carga masiva:", error)
      setBulkError("Hubo un error al procesar las preguntas. Intenta de nuevo.")
    } finally {
      setIsBulkSaving(false)
    }
  }

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentMonth])

  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

  if (isLoadingData) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#d4854a] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white border-[#e5e5e5] shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#d4854a]">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a1a1a]">{forums.length}</p>
                <p className="text-sm text-[#737373]">Total de foros</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-[#e5e5e5] shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-600">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a1a1a]">
                  {forums.filter((f) => parseLocalDate(f.date) >= new Date()).length}
                </p>
                <p className="text-sm text-[#737373]">Foros programados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Card className="bg-white border-[#e5e5e5] shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-[#1a1a1a]">Foros del Día</CardTitle>
              <CardDescription className="text-[#737373]">
                Crea preguntas diarias para fomentar la reflexión y el diálogo en la comunidad
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-[#f8f6f3] p-1">
              <TabsTrigger value="calendar" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1a1a1a] text-[#737373]">
                <CalendarDays className="w-4 h-4" />
                Vista Calendario
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1a1a1a] text-[#737373]">
                <List className="w-4 h-4" />
                Vista Lista
              </TabsTrigger>
            </TabsList>

            {/* Calendar View */}
            <TabsContent value="calendar" className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-[#f8f6f3]">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#737373]">Ir a:</span>
                  <Select value={currentMonth.getFullYear().toString()} onValueChange={(year) => { const d = new Date(currentMonth); d.setFullYear(parseInt(year)); setCurrentMonth(d); }}>
                    <SelectTrigger className="w-24 bg-white border-[#e5e5e5] text-[#1a1a1a]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={currentMonth.getMonth().toString()} onValueChange={(month) => { const d = new Date(currentMonth); d.setMonth(parseInt(month)); setCurrentMonth(d); }}>
                    <SelectTrigger className="w-32 bg-white border-[#e5e5e5] text-[#1a1a1a]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()} className="capitalize">
                          {format(new Date(2024, i, 1), "MMMM", { locale: es })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())} className="text-[#d4854a] hover:bg-[#d4854a]/10">Hoy</Button>
              </div>

              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft className="w-5 h-5" /></Button>
                <h2 className="text-lg font-semibold capitalize">{format(currentMonth, "MMMM yyyy", { locale: es })}</h2>
                <Button variant="ghost" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight className="w-5 h-5" /></Button>
              </div>

              <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                <div className="grid grid-cols-7 bg-[#f8f6f3]">
                  {weekDays.map((day) => <div key={day} className="py-3 text-center text-sm font-medium text-[#737373] border-b border-[#e5e5e5]">{day}</div>)}
                </div>
                <div className="grid grid-cols-7">
                  {calendarDays.map((day, index) => {
                    const isCurrentMonth = isSameMonth(day, currentMonth)
                    const isToday = isSameDay(day, new Date())
                    const forum = getForumForDate(day)
                    return (
                      <button
                        key={index}
                        onClick={() => forum ? openEditModal(forum) : openCreateModal(day)}
                        className={`relative min-h-24 p-2 border-b border-r border-[#e5e5e5] text-left transition-colors ${isCurrentMonth ? "bg-white hover:bg-[#f8f6f3]" : "bg-[#fafafa] text-[#a3a3a3]"} ${isToday ? "ring-2 ring-inset ring-[#d4854a]" : ""}`}
                      >
                        <span className={`text-sm font-medium ${isToday ? "text-[#d4854a]" : isCurrentMonth ? "text-[#1a1a1a]" : "text-[#a3a3a3]"}`}>{format(day, "d")}</span>
                        {forum && (
                          <div className="mt-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mb-1" />
                            <p className="text-xs text-[#737373] line-clamp-2 leading-tight">{forum.question.substring(0, 35)}...</p>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </TabsContent>

            {/* List View */}
            <TabsContent value="list" className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#737373]">{filteredForums.length} foros encontrados</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={openBulkModal} className="border-[#e5e5e5] text-[#737373] hover:bg-[#f8f6f3] gap-2">
                    <Upload className="w-4 h-4" /> Carga Masiva
                  </Button>
                  <Button onClick={() => openCreateModal()} className="bg-[#d4854a] hover:bg-[#c07842] text-white gap-2">
                    <Plus className="w-4 h-4" /> Crear Foro
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a3a3a3]" />
                  <Input placeholder="Buscar por pregunta..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-[#f8f6f3] border-[#e5e5e5]" />
                </div>
                <div className="flex items-center gap-2">
                  <Input type="date" value={dateRangeStart ? format(dateRangeStart, "yyyy-MM-dd") : ""} onChange={(e) => setDateRangeStart(e.target.value ? new Date(e.target.value) : undefined)} className="w-36 bg-[#f8f6f3] border-[#e5e5e5]" />
                  <span className="text-[#a3a3a3]">-</span>
                  <Input type="date" value={dateRangeEnd ? format(dateRangeEnd, "yyyy-MM-dd") : ""} onChange={(e) => setDateRangeEnd(e.target.value ? new Date(e.target.value) : undefined)} className="w-36 bg-[#f8f6f3] border-[#e5e5e5]" />
                  {(dateRangeStart || dateRangeEnd) && (
                    <Button variant="ghost" size="sm" onClick={() => { setDateRangeStart(undefined); setDateRangeEnd(undefined); }} className="text-[#737373]">Limpiar</Button>
                  )}
                </div>
              </div>

              <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#f8f6f3] hover:bg-[#f8f6f3]">
                      <TableHead className="w-32">Fecha</TableHead>
                      <TableHead>Pregunta</TableHead>
                      <TableHead className="text-right w-24">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredForums.map((forum) => (
                      <TableRow key={forum.id}>
                        <TableCell>
                          <p className="font-semibold capitalize">{formatDisplayDate(forum.date)}</p>
                          <p className="text-xs text-[#a3a3a3]">{parseLocalDate(forum.date).getFullYear()}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-[#1a1a1a]">{forum.question}</p>
                          {forum.description && <p className="text-xs text-[#737373] line-clamp-1">{forum.description}</p>}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(forum)} className="text-[#737373] hover:text-[#d4854a]">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredForums.length === 0 && (
                <div className="text-center py-12 text-[#737373]">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron foros</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal Single Create/Edit */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-white border-[#e5e5e5] max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingForum ? "Editar Foro" : "Crear Foro del Día"}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {formError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{formError}</p>
              </div>
            )}
            <div className="space-y-2 flex flex-col">
              <Label>Fecha *</Label>
              {lockedDate ? (
                <div className="p-3 rounded-lg bg-[#f8f6f3] border"><p className="capitalize text-sm font-medium">{formatFullDate(format(lockedDate, "yyyy-MM-dd"))}</p></div>
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal border-[#e5e5e5]", !formData.date && "text-[#737373]")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? formatFullDate(format(formData.date, "yyyy-MM-dd")) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border-[#e5e5e5]" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => date && setFormData({ ...formData, date })}
                      disabled={(date) => {
                        const dateStr = format(date, "yyyy-MM-dd");
                        if (editingForum && dateStr === editingForum.date) return false;
                        return forumsByDate.has(dateStr);
                      }}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <div className="space-y-2">
              <Label>Pregunta para reflexionar *</Label>
              <Input
                placeholder="¿Qué te motiva a seguir adelante hoy?"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="bg-[#f8f6f3] border-[#e5e5e5]"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción / Contexto <span className="text-[#a3a3a3] text-xs">(opcional)</span></Label>
              <Textarea
                placeholder="Añade contexto o guía para la reflexión..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-[#f8f6f3] border-[#e5e5e5] min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={isSaving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.date || !formData.question.trim()} className="bg-[#d4854a] text-white">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingForum ? "Guardar cambios" : "Crear foro"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Modal */}
      <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden bg-white border-[#e5e5e5]">
          <div className="p-6 border-b border-[#e5e5e5]">
            <DialogHeader>
              <DialogTitle>Carga Masiva de Foros</DialogTitle>
              <DialogDescription>Pega una lista de preguntas. El sistema rellenará los próximos días vacíos saltándose los días que ya tengan foros programados.</DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 flex-1 flex flex-col min-h-0 space-y-4">
            {bulkError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex-shrink-0">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{bulkError}</p>
              </div>
            )}
            <div className="space-y-2 flex-shrink-0">
              <Label>Asignar a partir de:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[280px] justify-start text-left font-normal border-[#e5e5e5]", !bulkStartDate && "text-[#737373]")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {bulkStartDate ? formatFullDate(bulkStartDate) : "Seleccionar fecha de inicio"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border-[#e5e5e5]" align="start">
                  <Calendar
                    mode="single"
                    selected={bulkStartDate ? parseLocalDate(bulkStartDate) : undefined}
                    onSelect={(date) => date && setBulkStartDate(format(date, "yyyy-MM-dd"))}
                    disabled={(date) => forumsByDate.has(format(date, "yyyy-MM-dd"))}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 flex-1 flex flex-col min-h-0">
              <Label>Preguntas (una por línea)</Label>
              <div className="flex-1 min-h-0 relative rounded-md border border-[#e5e5e5] focus-within:ring-1 focus-within:ring-[#d4854a] transition-shadow">
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full h-full p-3 resize-none outline-none bg-transparent text-[#1a1a1a]"
                />
              </div>
              <p className="text-sm text-[#737373] text-right pt-1 font-medium flex-shrink-0">
                {parsedBulkQuestions.length} {parsedBulkQuestions.length === 1 ? 'pregunta detectada' : 'preguntas detectadas'}
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-[#e5e5e5] flex justify-end gap-2 flex-shrink-0">
            <Button variant="outline" onClick={() => setShowBulkModal(false)} disabled={isBulkSaving}>Cancelar</Button>
            <Button onClick={handleBulkImport} disabled={isBulkSaving || parsedBulkQuestions.length === 0 || !bulkStartDate} className="bg-[#d4854a] hover:bg-[#c07842] text-white">
              {isBulkSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              {isBulkSaving ? "Procesando..." : `Importar ${parsedBulkQuestions.length} foros`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}