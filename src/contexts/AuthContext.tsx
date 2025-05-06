
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { AuthUser } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (cedula: string, codigoOpec: string) => Promise<boolean>;
  loginAdmin: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('snr_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('snr_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (cedula: string, codigoOpec: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Verify OPEC code
      if (codigoOpec !== '205763') {
        toast({
          title: "Error de autenticación",
          description: "Código OPEC incorrecto.",
          variant: "destructive",
        });
        return false;
      }

      // Check if aspirante exists
      const { data: aspirante, error } = await supabase
        .from('aspirantes')
        .select('*')
        .eq('cedula', cedula)
        .single();

      if (error || !aspirante) {
        toast({
          title: "Error de autenticación",
          description: "No se encontró un aspirante con esa cédula.",
          variant: "destructive",
        });
        return false;
      }

      // Set user information
      const authUser: AuthUser = {
        id: aspirante.id,
        cedula: aspirante.cedula,
        role: 'aspirante',
        puesto: aspirante.puesto,
        nombre: aspirante.nombre
      };

      setUser(authUser);
      localStorage.setItem('snr_user', JSON.stringify(authUser));
      
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido/a, ${aspirante.nombre}`,
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error de autenticación",
        description: "Ha ocurrido un error al iniciar sesión.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Admin credentials verification
      if (username !== 'admin' || password !== '87453609') {
        toast({
          title: "Error de autenticación",
          description: "Credenciales de administrador incorrectas.",
          variant: "destructive",
        });
        return false;
      }

      // Set admin user
      const authUser: AuthUser = {
        id: 0,
        cedula: 'admin',
        role: 'admin'
      };

      setUser(authUser);
      localStorage.setItem('snr_user', JSON.stringify(authUser));
      
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido/a, Administrador",
      });
      
      return true;
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: "Error de autenticación",
        description: "Ha ocurrido un error al iniciar sesión.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    localStorage.removeItem('snr_user');
    toast({
      title: "Sesión cerrada",
      description: "Ha cerrado sesión correctamente.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
