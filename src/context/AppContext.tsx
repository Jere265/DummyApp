import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFavoritos, apiDemo, getApiBaseUrl, setApiBaseUrl } from '../services/api';

interface AppContextProps {
  rol: 'comprador' | 'organizador';
  setRol: (rol: 'comprador' | 'organizador') => void;
  compradorId: number;
  organizadorId: number;
  favoritos: number[];
  esFavorito: (eventoId: number) => boolean;
  toggleFavorito: (eventoId: number) => Promise<void>;
  refreshKey: number;
  triggerRefresh: () => void;
  serverUrl: string;
  updateServerUrl: (url: string) => void;
  backendConectado: boolean;
  checkConexion: () => Promise<void>,
  loggedIn: boolean,
  setLoggedIn: (value: boolean) => void
}

const AppContext = createContext<AppContextProps>({} as AppContextProps);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rol, setRol] = useState<'comprador' | 'organizador'>('comprador');
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [compradorId] = useState<number>(1); // Jeremías por defecto
  const [organizadorId] = useState<number>(1); // Rock & Pop por defecto
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [serverUrl, setServerUrlState] = useState<string>(getApiBaseUrl());
  const [backendConectado, setBackendConectado] = useState<boolean>(false);

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  const updateServerUrl = (url: string) => {
    setApiBaseUrl(url);
    setServerUrlState(url);
    checkConexion();
  };

  const checkConexion = async () => {
    const res = await apiDemo.verificarSalud();
    setBackendConectado(Boolean(res.exito && res.datos?.status === 'OK'));
  };

  const cargarFavoritos = async () => {
    if (loggedIn && rol === 'comprador') {
      const res = await apiFavoritos.obtener(compradorId);
      if (res.exito && Array.isArray(res.datos)) {
        setFavoritos(res.datos);
      }
    }
  };

  useEffect(() => {
    checkConexion();
    cargarFavoritos();
  }, [rol, loggedIn, refreshKey]);

  const esFavorito = (eventoId: number) => favoritos.includes(eventoId);

  const toggleFavorito = async (eventoId: number) => {
    if (esFavorito(eventoId)) {
      setFavoritos(prev => prev.filter(id => id !== eventoId));
      await apiFavoritos.remover(compradorId, eventoId);
    } else {
      setFavoritos(prev => [...prev, eventoId]);
      await apiFavoritos.agregar(compradorId, eventoId);
    }
  };

  return (
    <AppContext.Provider
      value={{
        rol,
        setRol,
        compradorId,
        organizadorId,
        favoritos,
        esFavorito,
        toggleFavorito,
        refreshKey,
        triggerRefresh,
        serverUrl,
        updateServerUrl,
        backendConectado,
        checkConexion,
        loggedIn,
        setLoggedIn,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
