import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Compra } from '../types';
import { Colors } from '../theme/colors';
import { Badge } from './Badge';

interface TicketCardProps {
  compra: Compra;
  onOpenChat: () => void;
  onCancel: () => void;
  onReview: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  compra,
  onOpenChat,
  onCancel,
  onReview,
}) => {
  const formatearFecha = (fechaStr: string) => {
    try {
      const d = new Date(fechaStr);
      return d.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return fechaStr;
    }
  };

  const esConfirmada = compra.estado === 'CONFIRMADA';
  const esUtilizada = compra.estado === 'UTILIZADA';

  return (
    <View style={styles.card}>
      {/* Cabecera del Ticket */}
      <View style={styles.header}>
        <View style={styles.ticketBadge}>
          <Text style={styles.ticketBadgeText}>TICKET #{compra.id}</Text>
        </View>
        <Badge estado={compra.estado} diasRestantes={compra.diasRestantes} />
      </View>

      {/* Cuerpo principal del ticket */}
      <View style={styles.body}>
        <Text style={styles.eventTitle}>
          {compra.evento ? (compra.evento.nombre || compra.evento.titulo) : `Evento #${compra.eventoId}`}
        </Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>CANTIDAD</Text>
            <Text style={styles.infoValue}>
              {compra.cantidad || compra.cantidadEntradas} {compra.cantidad === 1 ? 'entrada' : 'entradas'}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>FECHA DE COMPRA</Text>
            <Text style={styles.infoValue}>{formatearFecha(compra.fechaCompra)}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>TOTAL ABONADO</Text>
            <Text style={styles.infoTotal}>
              ${(compra.total || 0).toLocaleString('es-AR')}
            </Text>
          </View>
        </View>
      </View>

      {/* Línea punteada de corte de ticket */}
      <View style={styles.perforation}>
        <View style={styles.circleLeft} />
        <View style={styles.dashedLine} />
        <View style={styles.circleRight} />
      </View>

      {/* Acciones del Ticket según estado */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.chatButton} onPress={onOpenChat}>
          <Text style={styles.chatButtonText}>💬 Chat</Text>
        </TouchableOpacity>

        {/* El ingreso lo valida el organizador en la puerta; el comprador solo puede cancelar */}
        {esConfirmada && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}

        {esUtilizada && (
          <TouchableOpacity style={styles.reviewButton} onPress={onReview}>
            <Text style={styles.reviewButtonText}>⭐ Calificar Show</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    backgroundColor: Colors.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  ticketBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ticketBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  body: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.borderLight,
    padding: 12,
    borderRadius: 10,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  infoTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  perforation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    height: 16,
    position: 'relative',
  },
  circleLeft: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.background,
    marginLeft: -8,
  },
  dashedLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    borderStyle: 'dashed',
  },
  circleRight: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.background,
    marginRight: -8,
  },
  actionsRow: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'flex-end',
  },
  chatButton: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chatButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cancelButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.danger,
  },
  reviewButton: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  reviewButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
});
