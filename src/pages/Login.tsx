
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
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Check if login is for admin (special credentials)
      if (cedula === 'admin' && codigoOpec === '87453609') {
        const success = await loginAdmin(cedula, codigoOpec);
        if (success) {
          navigate('/dashboard');
        }
      } else {
        // Regular aspirante login
        const success = await login(cedula, codigoOpec);
        if (success) {
          navigate('/seleccion');
        }
      }
    } finally {
      setIsLoading(false);
    }
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

        <Card>
          <CardHeader>
            <CardTitle>Acceso Aspirantes</CardTitle>
            <CardDescription>
              Sistema de Selección de Plazas
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
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
      </div>
    </div>
  );
};

export default Login;
