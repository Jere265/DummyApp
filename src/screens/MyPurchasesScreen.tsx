import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Compra } from '../types';
import { apiCompras, apiEventos } from '../services/api';
import { TicketCard } from '../components/TicketCard';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

interface MyPurchasesScreenProps {
  onOpenChat: (compraId: number) => void;
  onOpenReview: (compra: Compra) => void;
}

export const MyPurchasesScreen: React.FC<MyPurchasesScreenProps> = ({
  onOpenChat,
  onOpenReview,
}) => {
  const { compradorId, refreshKey, triggerRefresh } = useApp();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [refrescando, setRefrescando] = useState<boolean>(false);

  const cargarCompras = async () => {
    try {
      setCargando(true);
      const res = await apiCompras.obtenerPorComprador(compradorId);
      if (res.exito && res.datos) {
        // Enriquecer cada compra con datos del evento si no están presentes
        const comprasConEvento = await Promise.all(
          res.datos.map(async (c) => {
            if (!c.evento) {
              const evRes = await apiEventos.obtenerPorId(c.eventoId);
              if (evRes.exito && evRes.datos) {
                c.evento = evRes.datos;
              }
            }
            return c;
          })
        );
        setCompras(comprasConEvento);
      }
    } finally {
      setCargando(false);
      setRefrescando(false);
    }

  };

  useEffect(() => {
    cargarCompras();
  }, [compradorId, refreshKey]);

  const onRefresh = () => {
    setRefrescando(true);
    cargarCompras();
  };

  const handleCancelar = (compra: Compra) => {
    Alert.alert(
      'Cancelar Compra',
      '¿Confirmás que querés cancelar esta compra y recibir el reembolso de tus entradas?',
      [
        { text: 'No, mantener ticket', style: 'cancel' },
        {
          text: 'Sí, cancelar y reembolsar',
          style: 'destructive',
          onPress: async () => {
            const res = await apiCompras.cancelar(compra.id, compradorId);
            if (res.exito) {
              triggerRefresh();
              Alert.alert('Reembolso Procesado', 'Tu compra ha sido cancelada y se liberaron los cupos correspondientes.');
            } else {
              Alert.alert('No se pudo cancelar', res.error || 'La compra no puede cancelarse.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>Mis Entradas y Tickets</Text>
        <Text style={styles.headerSubtitle}>
          Seguimiento de compras, días restantes y acceso al evento.
        </Text>
      </View>

      {cargando && !refrescando ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : compras.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>🎟️</Text>
          <Text style={styles.emptyTitle}>Todavía no tenés tickets</Text>
          <Text style={styles.emptySubtitle}>
            Explorá el catálogo de recitales y obras para conseguir tus entradas.
          </Text>
        </View>
      ) : (
        <FlatList
          data={compras}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TicketCard
              compra={item}
              onOpenChat={() => onOpenChat(item.id)}
              onCancel={() => handleCancelar(item)}
              onReview={() => onOpenReview(item)}
            />
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
