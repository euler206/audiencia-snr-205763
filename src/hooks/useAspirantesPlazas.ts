
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Aspirante, AspiranteWithPrioridades, Plaza, Prioridad, PlazaWithOcupacion } from '@/types';

export const useAspirantesPlazas = (userId?: number) => {
  const [aspirantes, setAspirantes] = useState<AspiranteWithPrioridades[]>([]);
  const [plazas, setPlazas] = useState<PlazaWithOcupacion[]>([]);
  const [currentAspirante, setCurrentAspirante] = useState<AspiranteWithPrioridades | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Cargar todos los aspirantes con sus prioridades
  const loadAspirantes = useCallback(async () => {
    setLoading(true);
    try {
      // Obtener todos los aspirantes
      const { data: aspirantesData, error: aspirantesError } = await supabase
        .from('aspirantes')
        .select('*')
        .order('puesto', { ascending: true });

      if (aspirantesError) throw aspirantesError;

      // Obtener todas las prioridades
      const { data: prioridadesData, error: prioridadesError } = await supabase
        .from('prioridades')
        .select('*');

      if (prioridadesError) throw prioridadesError;

      // Combinar datos
      const aspirantesWithPrioridades: AspiranteWithPrioridades[] = aspirantesData.map(
        (aspirante: Aspirante) => ({
          ...aspirante,
          prioridades: prioridadesData.filter(
            (p: Prioridad) => p.aspirante_id === aspirante.id
          ),
        })
      );

      setAspirantes(aspirantesWithPrioridades);

      // Si es un usuario aspirante, establecer el aspirante actual
      if (userId) {
        const currentAsp = aspirantesWithPrioridades.find(a => a.id === userId);
        if (currentAsp) {
          setCurrentAspirante(currentAsp);
        }
      }
    } catch (error) {
      console.error('Error al cargar aspirantes:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los aspirantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  // Cargar todas las plazas
  const loadPlazas = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plazas')
        .select('*')
        .order('departamento', { ascending: true })
        .order('municipio', { ascending: true });

      if (error) throw error;

      // Inicialmente establecer plazas ocupadas a 0
      const plazasWithOcupacion: PlazaWithOcupacion[] = data.map((plaza: Plaza) => ({
        ...plaza,
        ocupadas: 0
      }));

      setPlazas(plazasWithOcupacion);
    } catch (error) {
      console.error('Error al cargar plazas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las plazas disponibles.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Calcular la ocupación de plazas basado en las prioridades de los aspirantes
  const calculatePlazaOcupacion = useCallback(() => {
    if (!aspirantes.length || !plazas.length) return;

    const updatedPlazas = [...plazas];

    // Reiniciar ocupadas a 0
    updatedPlazas.forEach(plaza => {
      plaza.ocupadas = 0;
    });

    // Ordenar aspirantes por puesto (menor a mayor)
    const sortedAspirantes = [...aspirantes].sort((a, b) => a.puesto - b.puesto);

    // Por cada aspirante, contar ocupación según prioridades
    sortedAspirantes.forEach(aspirante => {
      // Si el aspirante ya tiene plaza asignada, no continuar
      if (aspirante.plaza_deseada) return;

      // Ordenar prioridades del aspirante
      const prioridades = [...aspirante.prioridades].sort((a, b) => a.prioridad - b.prioridad);

      // Por cada prioridad, verificar disponibilidad
      for (const prioridad of prioridades) {
        const plazaIndex = updatedPlazas.findIndex(p => p.municipio === prioridad.municipio);
        
        if (plazaIndex >= 0) {
          const plaza = updatedPlazas[plazaIndex];
          
          // Si hay vacantes disponibles, asignar plaza
          if (plaza.ocupadas < plaza.vacantes) {
            plaza.ocupadas += 1;
            break;
          }
        }
      }
    });

    setPlazas(updatedPlazas);
  }, [aspirantes, plazas]);

  // Guardar las prioridades de un aspirante
  const savePrioridades = useCallback(async (
    aspiranteId: number, 
    nuevasPrioridades: Omit<Prioridad, 'id'>[]
  ) => {
    setLoading(true);
    try {
      // Eliminar prioridades anteriores
      const { error: deleteError } = await supabase
        .from('prioridades')
        .delete()
        .eq('aspirante_id', aspiranteId);

      if (deleteError) throw deleteError;

      // Insertar nuevas prioridades
      if (nuevasPrioridades.length > 0) {
        const { error: insertError } = await supabase
          .from('prioridades')
          .insert(nuevasPrioridades);

        if (insertError) throw insertError;
      }

      // Recargar datos
      await loadAspirantes();
      calculatePlazaOcupacion();

      toast({
        title: "Éxito",
        description: "Prioridades guardadas correctamente.",
      });

      return true;
    } catch (error) {
      console.error('Error al guardar prioridades:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar las prioridades.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadAspirantes, calculatePlazaOcupacion, toast]);

  // Reset todas las asignaciones de plazas (solo admin)
  const resetAllPlazas = useCallback(async () => {
    setLoading(true);
    try {
      // Actualizar todos los aspirantes para quitar plaza_deseada
      const { error } = await supabase
        .from('aspirantes')
        .update({ plaza_deseada: null })
        .neq('id', 0); // Actualizar todos

      if (error) throw error;

      // Recargar datos
      await loadAspirantes();
      calculatePlazaOcupacion();

      toast({
        title: "Éxito",
        description: "Se han reiniciado todas las asignaciones de plazas.",
      });

      return true;
    } catch (error) {
      console.error('Error al resetear plazas:', error);
      toast({
        title: "Error",
        description: "No se pudieron resetear las asignaciones de plazas.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadAspirantes, calculatePlazaOcupacion, toast]);

  // Actualizar el puesto de un aspirante (solo admin)
  const updateAspirantePuesto = useCallback(async (aspiranteId: number, nuevoPuesto: number) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('aspirantes')
        .update({ puesto: nuevoPuesto })
        .eq('id', aspiranteId);

      if (error) throw error;

      // Recargar datos
      await loadAspirantes();
      calculatePlazaOcupacion();

      toast({
        title: "Éxito",
        description: "Puesto actualizado correctamente.",
      });

      return true;
    } catch (error) {
      console.error('Error al actualizar puesto:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el puesto del aspirante.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadAspirantes, calculatePlazaOcupacion, toast]);

  // Filtrar aspirantes por búsqueda
  const filteredAspirantes = aspirantes.filter(aspirante => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      aspirante.nombre.toLowerCase().includes(query) ||
      aspirante.cedula.toLowerCase().includes(query) ||
      (aspirante.plaza_deseada && aspirante.plaza_deseada.toLowerCase().includes(query))
    );
  });

  // Cargamos datos al iniciar
  useEffect(() => {
    loadAspirantes();
    loadPlazas();
  }, [loadAspirantes, loadPlazas]);

  // Calculamos ocupación cuando cambian los datos
  useEffect(() => {
    calculatePlazaOcupacion();
  }, [aspirantes, calculatePlazaOcupacion]);

  return {
    aspirantes,
    filteredAspirantes,
    plazas,
    currentAspirante,
    loading,
    searchQuery,
    setSearchQuery,
    savePrioridades,
    resetAllPlazas,
    updateAspirantePuesto,
    refreshData: loadAspirantes
  };
};
