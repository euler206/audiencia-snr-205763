
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAspirantesPlazas } from '@/hooks/useAspirantesPlazas';
import { exportPrioridadesToPDF } from '@/lib/pdfUtils';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Prioridad, PlazaWithOcupacion } from '@/types';
import { FileText, RotateCcw, Save, Search } from 'lucide-react';

const SeleccionPlazas: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentAspirante, plazas, loading, savePrioridades } = useAspirantesPlazas(user?.id);
  
  const [searchMunicipio, setSearchMunicipio] = useState('');
  const [prioridades, setPrioridades] = useState<Omit<Prioridad, 'id'>[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavingDialog, setShowSavingDialog] = useState(false);

  // Redireccionar si no es un aspirante o no se ha cargado el aspirante
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Inicializar prioridades cuando se carga el aspirante
  useEffect(() => {
    if (currentAspirante) {
      setPrioridades(
        currentAspirante.prioridades.map(p => ({
          aspirante_id: p.aspirante_id,
          municipio: p.municipio,
          prioridad: p.prioridad
        }))
      );
    }
  }, [currentAspirante]);

  // Filtrar plazas por búsqueda
  const filteredPlazas = useMemo(() => {
    if (!searchMunicipio.trim()) return plazas;
    
    const searchTerm = searchMunicipio.toLowerCase();
    return plazas.filter(plaza => 
      plaza.municipio.toLowerCase().includes(searchTerm) || 
      plaza.departamento.toLowerCase().includes(searchTerm)
    );
  }, [plazas, searchMunicipio]);

  // Obtener el número máximo de plazas que puede seleccionar (igual a su puesto)
  const maxPrioridades = currentAspirante?.puesto || 0;

  // Verificar si una plaza ya está seleccionada
  const getPrioridadForMunicipio = useCallback((municipio: string) => {
    const prioridad = prioridades.find(p => p.municipio === municipio);
    return prioridad ? prioridad.prioridad : null;
  }, [prioridades]);

  // Manejar selección/deselección de plaza
  const handlePrioridadChange = useCallback((municipio: string) => {
    setPrioridades(prev => {
      // Si ya está seleccionada, eliminarla
      const existingIndex = prev.findIndex(p => p.municipio === municipio);
      if (existingIndex >= 0) {
        const newPrioridades = [...prev];
        const removedPrioridad = newPrioridades.splice(existingIndex, 1)[0];
        
        // Reordenar prioridades restantes
        return newPrioridades.map(p => ({
          ...p,
          prioridad: p.prioridad > removedPrioridad.prioridad ? p.prioridad - 1 : p.prioridad
        }));
      } 
      
      // Si no está seleccionada y no ha llegado al máximo, añadirla
      if (prev.length < maxPrioridades) {
        const newPrioridad = prev.length + 1;
        return [...prev, {
          aspirante_id: currentAspirante!.id,
          municipio,
          prioridad: newPrioridad
        }];
      }
      
      return prev;
    });
  }, [currentAspirante, maxPrioridades]);

  // Resetear todas las selecciones
  const handleReset = () => {
    setPrioridades([]);
  };

  // Guardar prioridades
  const handleSave = async () => {
    if (!currentAspirante) return;
    
    setIsSaving(true);
    setShowSavingDialog(true);
    
    try {
      await savePrioridades(currentAspirante.id, prioridades);
    } finally {
      setTimeout(() => {
        setIsSaving(false);
        setShowSavingDialog(false);
      }, 2000); // Simular un tiempo de procesamiento
    }
  };

  // Exportar selección a PDF
  const handleExportPDF = () => {
    if (currentAspirante) {
      // Crear una versión del aspirante con las prioridades actuales
      const aspiranteWithCurrentPrioridades = {
        ...currentAspirante,
        prioridades: prioridades.map((p, idx) => ({
          ...p,
          id: idx + 1, // ID temporal para el PDF
        }))
      };
      exportPrioridadesToPDF(aspiranteWithCurrentPrioridades, plazas);
    }
  };

  // Renderizar estado de ocupación de una plaza
  const renderOcupacionStatus = useCallback((plaza: PlazaWithOcupacion) => {
    const { vacantes, ocupadas } = plaza;
    const disponibles = vacantes - ocupadas;
    
    if (disponibles <= 0) {
      return <Badge variant="destructive">Completa</Badge>;
    } else if (disponibles <= vacantes * 0.3) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
        {disponibles} disp. de {vacantes}
      </Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
        {disponibles} disp. de {vacantes}
      </Badge>;
    }
  }, []);

  if (!currentAspirante && !loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Error de Acceso</CardTitle>
              <CardDescription>
                No se encontraron sus datos como aspirante.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500">
                Por favor, contacte al administrador del sistema.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => navigate('/login')}>
                Volver al Inicio
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Selección de Plazas</h1>
            <p className="text-gray-500">
              Puesto: {currentAspirante?.puesto} | Puntaje: {currentAspirante?.puntaje}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={handleExportPDF}
              disabled={prioridades.length === 0}
            >
              <FileText className="mr-2 h-4 w-4" />
              Exportar Selección
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reiniciar Selección
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará todas sus selecciones actuales.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleReset}
                    className="bg-snr hover:bg-snr-dark"
                  >
                    Reiniciar Selección
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button 
              onClick={handleSave} 
              className="bg-snr hover:bg-snr-dark"
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Guardando...' : 'Guardar Selección'}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Seleccione sus Plazas de Preferencia</CardTitle>
            <CardDescription>
              Puede seleccionar hasta {maxPrioridades} plazas en orden de preferencia.
              Ha seleccionado {prioridades.length} de {maxPrioridades}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <Search className="mr-2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por municipio o departamento..."
                value={searchMunicipio}
                onChange={(e) => setSearchMunicipio(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlazas.map((plaza) => {
                const prioridadNum = getPrioridadForMunicipio(plaza.municipio);
                const isSelected = prioridadNum !== null;
                
                return (
                  <Card 
                    key={plaza.id} 
                    className={`cursor-pointer ${isSelected ? 'border-snr bg-red-50' : 'hover:border-gray-300'}`}
                    onClick={() => handlePrioridadChange(plaza.municipio)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">{plaza.municipio}</h3>
                        {isSelected && (
                          <Badge className="bg-snr hover:bg-snr-dark">
                            Prioridad {prioridadNum}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mb-3">
                        {plaza.departamento}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          {renderOcupacionStatus(plaza)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {filteredPlazas.length === 0 && (
                <div className="col-span-full text-center py-10 text-gray-500">
                  {loading ? 'Cargando plazas...' : 'No se encontraron plazas'}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              Las plazas se asignan por orden de prioridad y puesto.
              Los puestos con menor número tienen preferencia.
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Diálogo de proceso de guardado */}
      <Dialog open={showSavingDialog} onOpenChange={setShowSavingDialog}>
        <DialogContent className="sm:max-w-md" hideCloseButton>
          <DialogHeader>
            <DialogTitle>Procesando selección</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-center mb-4">
              Guardando sus prioridades y recalculando asignaciones
              <span className="loading-dots"></span>
            </p>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-snr rounded-full transition-all duration-1000"
                style={{ width: isSaving ? '100%' : '0%' }}
              ></div>
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">
              Este proceso puede tardar unos momentos, por favor espere.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default SeleccionPlazas;
