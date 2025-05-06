import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAspirantesPlazas } from '@/hooks/useAspirantesPlazas';
import { exportAspirantesToPDF } from '@/lib/pdfUtils';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, FileText, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    filteredAspirantes, 
    loading, 
    searchQuery, 
    setSearchQuery, 
    resetAllPlazas,
    updateAspirantePuesto
  } = useAspirantesPlazas(user?.id);
  
  const [editingAspirante, setEditingAspirante] = useState<{ id: number, puesto: number } | null>(null);
  const [newPuesto, setNewPuesto] = useState<number>(0);
  const [isResetting, setIsResetting] = useState(false);

  // Si el usuario es un aspirante, redireccionar a selección de plazas
  React.useEffect(() => {
    if (user?.role === 'aspirante') {
      navigate('/seleccion');
    }
  }, [user, navigate]);

  const handleExportPDF = () => {
    try {
      exportAspirantesToPDF(filteredAspirantes);
      toast({
        title: "PDF generado con éxito",
        description: "El archivo se ha descargado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error al generar PDF",
        description: "No se pudo generar el archivo PDF",
        variant: "destructive",
      });
    }
  };

  const handleResetPlazas = async () => {
    setIsResetting(true);
    await resetAllPlazas();
    setIsResetting(false);
  };

  const openEditDialog = (id: number, puesto: number) => {
    setEditingAspirante({ id, puesto });
    setNewPuesto(puesto);
  };

  const handleUpdatePuesto = async () => {
    if (editingAspirante && newPuesto > 0) {
      await updateAspirantePuesto(editingAspirante.id, newPuesto);
      setEditingAspirante(null);
    }
  };

  // Memoizar para evitar re-renderizados innecesarios
  const aspirantesTable = useMemo(() => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Puesto</TableHead>
          <TableHead className="w-[80px]">Puntaje</TableHead>
          {user?.role === 'admin' && <TableHead className="w-[120px]">Cédula</TableHead>}
          <TableHead>Nombre</TableHead>
          <TableHead>Plaza Asignada</TableHead>
          {user?.role === 'admin' && <TableHead className="w-[100px] text-right">Acciones</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredAspirantes.length === 0 ? (
          <TableRow>
            <TableCell colSpan={user?.role === 'admin' ? 6 : 4} className="text-center py-8 text-gray-500">
              {loading ? 'Cargando aspirantes...' : 'No se encontraron aspirantes'}
            </TableCell>
          </TableRow>
        ) : (
          filteredAspirantes.map((aspirante) => (
            <TableRow key={aspirante.id}>
              <TableCell>{aspirante.puesto}</TableCell>
              <TableCell>{aspirante.puntaje}</TableCell>
              {user?.role === 'admin' && <TableCell>{aspirante.cedula}</TableCell>}
              <TableCell>{aspirante.nombre}</TableCell>
              <TableCell>
                {aspirante.plaza_deseada || <span className="text-gray-400">No asignada</span>}
              </TableCell>
              {user?.role === 'admin' && (
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openEditDialog(aspirante.id, aspirante.puesto)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cambiar Puesto</DialogTitle>
                        <DialogDescription>
                          Actualice la posición del aspirante {aspirante.nombre}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label htmlFor="puesto" className="text-sm font-medium">
                            Nuevo Puesto
                          </label>
                          <Input
                            id="puesto"
                            type="number"
                            min="1"
                            value={newPuesto || ''}
                            onChange={(e) => setNewPuesto(parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          onClick={handleUpdatePuesto} 
                          disabled={!newPuesto || newPuesto <= 0}
                          className="bg-snr hover:bg-snr-dark"
                        >
                          Guardar Cambios
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  ), [filteredAspirantes, loading, user?.role, newPuesto]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {user?.role === 'admin' && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleExportPDF}
              >
                <FileText className="mr-2 h-4 w-4" />
                Exportar a PDF
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Resetear Plazas
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción eliminará todas las asignaciones de plazas y no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleResetPlazas}
                      disabled={isResetting}
                      className="bg-snr hover:bg-snr-dark"
                    >
                      {isResetting ? 'Reseteando...' : 'Resetear Plazas'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Aspirantes</CardTitle>
            <CardDescription>
              {filteredAspirantes.length} aspirantes registrados para la convocatoria OPEC 205763
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <Search className="mr-2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, cédula o plaza asignada..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="rounded-md border">
              {aspirantesTable}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-gray-500">
              Ordenados por puesto (menor a mayor)
            </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
