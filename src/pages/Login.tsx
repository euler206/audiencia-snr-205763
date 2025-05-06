
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const Login: React.FC = () => {
  const [cedula, setCedula] = useState('');
  const [codigoOpec, setCodigoOpec] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { login, loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleAspiranteLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(cedula, codigoOpec);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await loginAdmin(username, password);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdminMode = () => {
    setIsAdmin(!isAdmin);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img 
            src="https://www.supernotariado.gov.co/images/ImagenesAlianzas/Logo-SNR.png" 
            alt="SNR Logo" 
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-xl font-bold text-snr">SNR OPEC 205763</h1>
          <p className="text-sm text-gray-500 mt-2">Simulacro de Audiencia Pública para la Selección de Plazas</p>
        </div>

        {!isAdmin ? (
          <Card>
            <CardHeader>
              <CardTitle>Acceso Aspirantes</CardTitle>
              <CardDescription>
                Ingrese su numero de Identificacion y el numero OPEC para acceder al sistema.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAspiranteLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cedula">Numero de Identificacion</Label>
                  <Input
                    id="cedula"
                    type="text"
                    placeholder="Ingrese su número de de Identificacion"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigo-opec">Numero de OPEC</Label>
                  <Input
                    id="codigo-opec"
                    type="text"
                    placeholder="Ingrese su numero de OPEC"
                    value={codigoOpec}
                    onChange={(e) => setCodigoOpec(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-snr hover:bg-snr-dark"
                  disabled={isLoading}
                >
                  {isLoading ? 'Ingresando...' : 'Ingresar'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Acceso Administradores</CardTitle>
              <CardDescription>
                Ingrese sus credenciales de administrador.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAdminLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuario</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ingrese su usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-snr hover:bg-snr-dark"
                  disabled={isLoading}
                >
                  {isLoading ? 'Ingresando...' : 'Ingresar'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
        
        {/* Hidden button for admin access - only visible when clicking in a specific area */}
        <div className="mt-8 text-center">
          <button 
            onClick={toggleAdminMode} 
            className="text-transparent hover:text-transparent focus:outline-none cursor-default" 
            aria-hidden="true"
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
