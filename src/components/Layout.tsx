
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg text-snr">
            <img 
              src="https://www.supernotariado.gov.co/images/ImagenesAlianzas/Logo-SNR.png" 
              alt="SNR Logo" 
              className="h-10"
            />
            <span className="hidden md:inline">SUPERINTENDENCIA DE NOTARIADO Y REGISTRO - OPEC 205763</span>
            <span className="inline md:hidden">SNR - OPEC 205763</span>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-snr" />
                <span className="text-sm font-medium">
                  {user.role === 'admin' ? 'Administrador' : user.nombre}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5 text-snr" />
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 container py-6">
        {children}
      </main>

      <footer className="border-t py-4 bg-muted/50">
        <div className="container flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© 2025 Superintendencia de Notariado y Registro</p>
          <p>Convocatoria OPEC 205763</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
