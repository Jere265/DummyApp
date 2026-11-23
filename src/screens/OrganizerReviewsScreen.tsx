import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Resena } from '../types';
import { apiResenas } from '../services/api';
import { Colors } from '../theme/colors';
import { StarRating } from '../components/StarRating';

interface OrganizerReviewsScreenProps {
  organizadorId: number;
  onBack: () => void;
}

export const OrganizerReviewsScreen: React.FC<OrganizerReviewsScreenProps> = ({
  organizadorId,
  onBack,
}) => {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [puntajePromedio, setPuntajePromedio] = useState<number | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  useEffect(() => {
    const cargarResenas = async () => {
      try {
        setCargando(true);
        const res = await apiResenas.obtenerPorOrganizador(organizadorId);
        if (res.exito && res.datos) {
          setResenas(res.datos.datos || []);
          setPuntajePromedio(res.datos.puntajePromedio);
        }
      } finally {
        setCargando(false);
      }
    };

    cargarResenas();
  }, [organizadorId]);

  const formatearFecha = (fechaStr: string) => {
    try {
      const d = new Date(fechaStr);
      return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* Cabecera */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reputación del Organizador</Text>
      </View>

      {/* Tarjeta de Resumen de Puntaje */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryScore}>
          {puntajePromedio !== null ? puntajePromedio.toFixed(1) : '-'}
        </Text>
        <StarRating rating={puntajePromedio || 0} size={22} />
        <Text style={styles.summaryCount}>
          Basado en {resenas.length} {resenas.length === 1 ? 'opinión verificada' : 'opiniones verificadas'}
        </Text>
      </View>

      {/* Lista de Reseñas de Eventos Anteriores (CU 10) */}
      <Text style={styles.listSectionTitle}>Opiniones de Espectadores Previos</Text>

      {cargando ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : resenas.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.emptyTitle}>Aún no tiene opiniones</Text>
          <Text style={styles.emptySubtitle}>
            Este organizador no registra reseñas de eventos anteriores todavía.
          </Text>
        </View>
      ) : (
        <FlatList
          data={resenas}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.buyerRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>C{item.compradorId}</Text>
                  </View>
                  <Text style={styles.buyerName}>Comprador #{item.compradorId}</Text>
                </View>
                <StarRating rating={item.puntaje || item.puntuacion || 0} size={14} />
              </View>

              <Text style={styles.comment}>{item.comentario || item.detalle}</Text>

              <Text style={styles.date}>{formatearFecha(item.fecha)}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  backBtn: {
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    margin: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryScore: {
    fontSize: 42,
    fontWeight: '900',
    color: '#D97706',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  listSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  buyerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  buyerName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  comment: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
    marginBottom: 6,
  },
  date: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
