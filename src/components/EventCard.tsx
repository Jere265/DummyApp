import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Evento } from '../types';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

interface EventCardProps {
  evento: Evento;
  onPress: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ evento, onPress }) => {
  const { esFavorito, toggleFavorito, rol } = useApp();
  const favorito = esFavorito(evento.id);

  // Precio mínimo a mostrar
  const precios = evento.tiposEntrada && evento.tiposEntrada.length > 0
    ? evento.tiposEntrada.map(t => Number(t.precio))
    : [];
  const precioMin = precios.length > 0 ? Math.min(...precios) : null;

  // Formato de fecha amigable
  const formatearFecha = (fechaStr: string) => {
    try {
      const d = new Date(fechaStr);
      return d.toLocaleDateString('es-AR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return fechaStr;
    }
  };

  const imagenUrl = evento.imagen || (evento.multimedia && evento.multimedia[0]) || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imagenUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{evento.categoria}</Text>
        </View>

        {rol === 'comprador' && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorito(evento.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.favoriteIcon}>{favorito ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {evento.nombre || evento.titulo}
        </Text>

        <Text style={styles.date}>
          📅 {formatearFecha(evento.fecha || evento.fechaEvento || '')}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {evento.descripcion}
        </Text>

        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>Desde</Text>
            <Text style={styles.priceValue}>
              {precioMin !== null ? `$${precioMin.toLocaleString('es-AR')}` : 'Consultar'}
            </Text>
          </View>

          <View style={styles.actionBtn}>
            <Text style={styles.actionText}>Ver Entradas →</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
    backgroundColor: Colors.background,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  date: {
    fontSize: 13,
    color: Colors.primaryDark,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  priceLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  priceValue: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  actionBtn: {
    backgroundColor: Colors.primaryUltraLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionText: {
    color: Colors.primaryDark,
    fontSize: 13,
    fontWeight: '700',
  },
});
