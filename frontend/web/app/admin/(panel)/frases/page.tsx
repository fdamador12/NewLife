"use client"

import { useState, useMemo, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Plus, Search, Quote, CalendarIcon, CalendarDays, List, ChevronLeft, ChevronRight, Upload, Loader2, AlertCircle } from "lucide-react"
import { format, parse, isValid, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addDays } from "date-fns"
import { es } from "date-fns/locale"

import { getFrases, createFrase, updateFrase, createFrasesBulk, FraseBackend } from "@/lib/frases"

interface DailyQuote {
  id: string | number
  date: string
  quote: string
  createdAt: string
}

export default function FrasesPage() {
  const [quotes, setQuotes] = useState<DailyQuote[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("calendar")
  const [formError, setFormError] = useState("")
  
  const [showModal, setShowModal] = useState(false)
  const [editingQuote, setEditingQuote] = useState<DailyQuote | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({ date: undefined as Date | undefined, quote: "" })
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>(undefined)
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>(undefined)
  const [lockedDate, setLockedDate] = useState<Date | undefined>(undefined)
  
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkText, setBulkText] = useState("")
  const [bulkStartDate, setBulkStartDate] = useState<string>("")
  const [isBulkSaving, setIsBulkSaving] = useState(false)
  const [bulkError, setBulkError] = useState("")

  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return new Date()
    const [year, month, day] = dateStr.split('-')
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }

  const formatDisplayDate = (dateStr: string) => format(parseLocalDate(dateStr), "d 'de' MMMM", { locale: es })
  const formatFullDate = (dateStr: string) => format(parseLocalDate(dateStr), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })

  const loadFrases = async () => {
    try {
      setIsLoadingData(true)
      const data: FraseBackend[] = await getFrases()
      const mappedQuotes: DailyQuote[] = data.map((item) => ({
        id: item.id || Math.random(),
        date: item.dia,
        quote: item.frase,
        createdAt: item.fecha_creacion || new Date().toISOString(),
      }))
      setQuotes(mappedQuotes)
    } catch (error) {
      console.error("Error al cargar las frases:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    loadFrases()
  }, [])

  const quotesByDate = useMemo(() => {
    const map = new Map<string, DailyQuote>()
    quotes.forEach((q) => {
      map.set(q.date, q)
    })
    return map
  }, [quotes])

  const getQuoteForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return quotesByDate.get(dateStr)
  }

  const filteredQuotes = useMemo(() => {
    let result = [...quotes]
    if (searchQuery) {
      result = result.filter((q) => q.quote.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    if (dateRangeStart) {
      result = result.filter((q) => parseLocalDate(q.date) >= dateRangeStart)
    }
    if (dateRangeEnd) {
      result = result.filter((q) => parseLocalDate(q.date) <= dateRangeEnd)
    }
    return result.sort((a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime())
  }, [quotes, searchQuery, dateRangeStart, dateRangeEnd])

  const openCreateModal = (date?: Date) => {
    setFormError("")
    setEditingQuote(null)
    setFormData({ date: date, quote: "" })
    setLockedDate(date)
    setShowModal(true)
  }

  const openEditModal = (quote: DailyQuote) => {
    setFormError("")
    setEditingQuote(quote)
    setFormData({
      date: parseLocalDate(quote.date),
      quote: quote.quote,
    })
    setLockedDate(parseLocalDate(quote.date))
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.date || !formData.quote) return
    setFormError("")
    setIsSaving(true)

    const diaNuevo = format(formData.date, "yyyy-MM-dd")

    try {
      if (editingQuote) {
        const diaActual = editingQuote.date
        await updateFrase(diaActual, diaNuevo, formData.quote)
      } else {
        await createFrase(diaNuevo, formData.quote)
      }
      
      await loadFrases() 
      setShowModal(false)
      setFormData({ date: undefined, quote: "" })
      setEditingQuote(null)
      setLockedDate(undefined)
    } catch (error: any) {
      console.error("Error al guardar la frase:", error)
      if (error.response?.status === 409) {
        setFormError("Ya existe una frase programada para esta fecha. Elige otro día o edita la existente.")
      } else {
        setFormError("Hubo un error de conexión al guardar. Intenta de nuevo.")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const findFirstAvailableDate = (startDate: Date): Date => {
    let current = startDate
    const maxDays = 365 
    for (let i = 0; i < maxDays; i++) {
      const dateStr = format(current, "yyyy-MM-dd")
      if (!quotesByDate.has(dateStr)) return current
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

  const parsedBulkQuotes = useMemo(() => {
    return bulkText.split("\n").map((line) => line.trim()).filter((line) => line.length > 0)
  }, [bulkText])

  // Lógica de importación usando el nuevo Endpoint Bulk de una sola vez
  const handleBulkImport = async () => {
    if (parsedBulkQuotes.length === 0 || !bulkStartDate) return
    setBulkError("")
    setIsBulkSaving(true)

    const startDate = parseLocalDate(bulkStartDate)
    let currentDate = startDate
    
    // Preparar el array gigante para enviarlo de golpe
    const payload: { dia: string, frase: string }[] = []

    for (const quoteText of parsedBulkQuotes) {
      while (quotesByDate.has(format(currentDate, "yyyy-MM-dd"))) {
        currentDate = addDays(currentDate, 1)
      }
      
      const dayStr = format(currentDate, "yyyy-MM-dd")
      payload.push({ dia: dayStr, frase: quoteText })
      
      // Anotar localmente para que el loop siga buscando el próximo vacío
      quotesByDate.set(dayStr, { id: 0, date: '', quote: '', createdAt: '' })
      currentDate = addDays(currentDate, 1)
    }

    try {
      // Una sola petición HTTP
      await createFrasesBulk(payload)
      
      await loadFrases()
      setShowBulkModal(false)
      setBulkText("")
      setBulkStartDate("")
    } catch (error: any) {
      console.error("Error en la carga masiva:", error)
      setBulkError("Se produjo un error al guardar las frases en la base de datos.")
      await loadFrases() // Recargar para limpiar el estado sucio del quotesByDate
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
                <Quote className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a1a1a]">{quotes.length}</p>
                <p className="text-sm text-[#737373]">Total de frases</p>
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
                  {quotes.filter((q) => parseLocalDate(q.date) >= new Date()).length}
                </p>
                <p className="text-sm text-[#737373]">Frases programadas</p>
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
              <CardTitle className="text-[#1a1a1a]">Frases del Día</CardTitle>
              <CardDescription className="text-[#737373]">
                Programa frases inspiradoras para motivar a los usuarios cada día
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-[#f8f6f3] p-1">
              <TabsTrigger value="calendar" className="gap-2 data-[state=active]:bg-white text-[#737373]">
                <CalendarDays className="w-4 h-4" />
                Vista Calendario
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2 data-[state=active]:bg-white text-[#737373]">
                <List className="w-4 h-4" />
                Vista Lista
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-[#f8f6f3]">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#737373]">Ir a:</span>
                  <Select value={currentMonth.getFullYear().toString()} onValueChange={(year) => { const d = new Date(currentMonth); d.setFullYear(parseInt(year)); setCurrentMonth(d); }}>
                    <SelectTrigger className="w-24 bg-white border-[#e5e5e5]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={currentMonth.getMonth().toString()} onValueChange={(month) => { const d = new Date(currentMonth); d.setMonth(parseInt(month)); setCurrentMonth(d); }}>
                    <SelectTrigger className="w-32 bg-white border-[#e5e5e5]">
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
                    const quote = getQuoteForDate(day)
                    return (
                      <button
                        key={index}
                        onClick={() => quote ? openEditModal(quote) : openCreateModal(day)}
                        className={`relative min-h-24 p-2 border-b border-r border-[#e5e5e5] text-left transition-colors ${isCurrentMonth ? "bg-white hover:bg-[#f8f6f3]" : "bg-[#fafafa]"} ${isToday ? "ring-2 ring-inset ring-[#d4854a]" : ""}`}
                      >
                        <span className={`text-sm font-medium ${isToday ? "text-[#d4854a]" : isCurrentMonth ? "text-[#1a1a1a]" : "text-[#a3a3a3]"}`}>{format(day, "d")}</span>
                        {quote && (
                          <div className="mt-1">
                            <div className="w-2 h-2 rounded-full bg-[#d4854a] mb-1" />
                            <p className="text-xs text-[#737373] line-clamp-2">{quote.quote}</p>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#737373]">{filteredQuotes.length} frases encontradas</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={openBulkModal} className="gap-2"><Upload className="w-4 h-4" /> Carga Masiva</Button>
                  <Button onClick={() => openCreateModal()} className="bg-[#d4854a] hover:bg-[#c07842] text-white gap-2"><Plus className="w-4 h-4" /> Crear Frase</Button>
                </div>
              </div>
              <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#f8f6f3] border-[#e5e5e5]">
                      <TableHead>Fecha</TableHead>
                      <TableHead>Frase</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell>
                          <p className="capitalize font-medium">{formatDisplayDate(quote.date)}</p>
                          <p className="text-xs text-[#a3a3a3]">{parseLocalDate(quote.date).getFullYear()}</p>
                        </TableCell>
                        <TableCell><p className="italic line-clamp-2">&ldquo;{quote.quote}&rdquo;</p></TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => openEditModal(quote)}><Pencil className="w-4 h-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal Single Create/Edit (CON CALENDARIO AVANZADO) */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingQuote ? "Editar frase" : "Nueva frase del día"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{formError}</p>
              </div>
            )}
            <div className="space-y-2 flex flex-col">
              <Label>Fecha</Label>
              {lockedDate ? (
                <div className="p-3 rounded-lg bg-[#f8f6f3] border"><p className="capitalize text-sm font-medium">{formatFullDate(format(lockedDate, "yyyy-MM-dd"))}</p></div>
              ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal border-[#e5e5e5]", !formData.date && "text-[#737373]")}
                    >
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
                        if (editingQuote && dateStr === editingQuote.date) return false;
                        return quotesByDate.has(dateStr);
                      }}
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <div className="space-y-2">
              <Label>Frase *</Label>
              <Textarea 
                value={formData.quote} 
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })} 
                className="min-h-[120px] resize-none font-serif text-lg focus-visible:ring-1 focus-visible:ring-[#d4854a] focus-visible:ring-offset-0" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)} disabled={isSaving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving || !(formData.date || lockedDate) || !formData.quote.trim()} className="bg-[#d4854a] text-white">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingQuote ? "Guardar cambios" : "Crear frase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Modal (TAMAÑO FIJO Y SIN BORDE MOCHO) */}
      <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden bg-white border-[#e5e5e5]">
          <div className="p-6 border-b border-[#e5e5e5]">
            <DialogHeader>
              <DialogTitle>Carga Masiva de Frases</DialogTitle>
              <DialogDescription>Pega una lista de frases. El sistema rellenará los próximos días vacíos saltándose los días que ya tengan frase.</DialogDescription>
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
                  <Button
                    variant="outline"
                    className={cn("w-[280px] justify-start text-left font-normal border-[#e5e5e5]", !bulkStartDate && "text-[#737373]")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {bulkStartDate ? formatFullDate(bulkStartDate) : "Seleccionar fecha de inicio"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border-[#e5e5e5]" align="start">
                  <Calendar
                    mode="single"
                    selected={bulkStartDate ? parseLocalDate(bulkStartDate) : undefined}
                    onSelect={(date) => date && setBulkStartDate(format(date, "yyyy-MM-dd"))}
                    disabled={(date) => quotesByDate.has(format(date, "yyyy-MM-dd"))}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2 flex-1 flex flex-col min-h-0">
              <Label>Frases (una por línea)</Label>
              <div className="flex-1 min-h-0 relative rounded-md border border-[#e5e5e5] focus-within:ring-1 focus-within:ring-[#d4854a] transition-shadow">
                <textarea 
                  value={bulkText} 
                  onChange={(e) => setBulkText(e.target.value)} 
                  className="w-full h-full p-3 resize-none outline-none font-serif bg-transparent text-[#1a1a1a]"
                  placeholder="Pega aquí tus frases..."
                />
              </div>
              <p className="text-sm text-[#737373] text-right pt-1 font-medium flex-shrink-0">
                {parsedBulkQuotes.length} {parsedBulkQuotes.length === 1 ? 'frase detectada' : 'frases detectadas'}
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-[#e5e5e5] flex justify-end gap-2 flex-shrink-0">
            <Button variant="outline" onClick={() => setShowBulkModal(false)} disabled={isBulkSaving}>Cancelar</Button>
            <Button onClick={handleBulkImport} disabled={isBulkSaving || parsedBulkQuotes.length === 0 || !bulkStartDate} className="bg-[#d4854a] hover:bg-[#c07842] text-white">
               {isBulkSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              {isBulkSaving ? "Procesando..." : `Importar ${parsedBulkQuotes.length} frases`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}