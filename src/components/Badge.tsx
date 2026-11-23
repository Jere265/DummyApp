import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { EstadoCompraTipo } from '../types';

interface BadgeProps {
  estado?: EstadoCompraTipo | string;
  texto?: string;
  color?: string;
  diasRestantes?: number | null;
}

export const Badge: React.FC<BadgeProps> = ({ estado, texto, color, diasRestantes }) => {
  let bgColor = Colors.primaryLight;
  let textColor = Colors.primaryDark;
  let label = texto || estado || '';

  if (estado === 'CONFIRMADA') {
    bgColor = Colors.primaryLight;
    textColor = Colors.primaryDark;
    label = 'Confirmada';
  } else if (estado === 'UTILIZADA') {
    bgColor = '#EEF2FF';
    textColor = Colors.secondary;
    label = 'Utilizada';
  } else if (estado === 'CANCELADA') {
    bgColor = '#FEE2E2';
    textColor = Colors.danger;
    label = 'Cancelada';
  } else if (estado === 'REEMBOLSADA') {
    bgColor = '#F3E8FF';
    textColor = Colors.estadoReembolsada;
    label = 'Reembolsada';
  } else if (estado === 'PENDIENTE' || estado === 'PENDIENTE_PAGO') {
    bgColor = '#FEF3C7';
    textColor = '#B45309';
    label = 'Pendiente de pago';
  }

  if (color) {
    bgColor = `${color}20`;
    textColor = color;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: bgColor }]}>
        <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
      </View>

      {diasRestantes !== null && diasRestantes !== undefined && estado === 'CONFIRMADA' && (
        <View style={styles.diasBadge}>
          <Text style={styles.diasText}>
            ⏱️ {diasRestantes > 0 ? `Faltan ${diasRestantes} días` : diasRestantes === 0 ? '¡Es hoy!' : 'Evento finalizado'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  diasBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  diasText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
  },
});
