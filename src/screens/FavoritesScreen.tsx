import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Evento } from '../types';
import { apiEventos } from '../services/api';
import { EventCard } from '../components/EventCard';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

interface FavoritesScreenProps {
  onSelectEvent: (eventoId: number) => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ onSelectEvent }) => {
  const { favoritos, refreshKey } = useApp();
  const [eventosFavoritos, setEventosFavoritos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [refrescando, setRefrescando] = useState<boolean>(false);

  const cargarFavoritos = async () => {
    try {
      setCargando(true);
      const res = await apiEventos.listar();
      if (res.exito && res.datos) {
        const filtrados = res.datos.filter(e => favoritos.includes(e.id));
        setEventosFavoritos(filtrados);
      }
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useEffect(() => {
    cargarFavoritos();
  }, [favoritos, refreshKey]);

  const onRefresh = () => {
    setRefrescando(true);
    cargarFavoritos();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>Mis Eventos Favoritos ❤️</Text>
        <Text style={styles.headerSubtitle}>
          Guardados para comprar más tarde o seguir su fecha.
        </Text>
      </View>

      {cargando && !refrescando ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : eventosFavoritos.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>🤍</Text>
          <Text style={styles.emptyTitle}>No tenés favoritos guardados</Text>
          <Text style={styles.emptySubtitle}>
            Presioná el corazón en cualquier evento del catálogo para guardarlo acá.
          </Text>
        </View>
      ) : (
        <FlatList
          data={eventosFavoritos}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <EventCard evento={item} onPress={() => onSelectEvent(item.id)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerInfo: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
