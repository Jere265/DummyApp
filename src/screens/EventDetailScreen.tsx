import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Evento, TipoEntrada } from '../types';
import { apiEventos, apiCompras, apiResenas } from '../services/api';
import { Colors } from '../theme/colors';
import { StarRating } from '../components/StarRating';
import { useApp } from '../context/AppContext';

interface EventDetailScreenProps {
  eventoId: number;
  onBack: () => void;
  onViewOrganizerReviews: (organizadorId: number) => void;
  onPurchaseSuccess: () => void;
}

export const EventDetailScreen: React.FC<EventDetailScreenProps> = ({
  eventoId,
  onBack,
  onViewOrganizerReviews,
  onPurchaseSuccess,
}) => {
  const { rol, compradorId, triggerRefresh } = useApp();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [tiposEntrada, setTiposEntrada] = useState<TipoEntrada[]>([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoEntrada | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [reputacionOrg, setReputacionOrg] = useState<number | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [procesandoCompra, setProcesandoCompra] = useState<boolean>(false);

  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        setCargando(true);
        const res = await apiEventos.obtenerPorId(eventoId);
        if (res.exito && res.datos) {
          setEvento(res.datos);
          const tipos = res.datos.tiposEntrada || [];
          setTiposEntrada(tipos);
          // Preseleccionar el primer tipo que todavía tenga cupo
          const conCupo = tipos.find(t => t.cupoDisponible > 0);
          if (conCupo) {
            setTipoSeleccionado(conCupo);
          }

          // Cargar reputación del organizador
          if (res.datos.organizadorId) {
            const resOrg = await apiResenas.obtenerPorOrganizador(res.datos.organizadorId);
            if (resOrg.exito && resOrg.datos) {
              setReputacionOrg(resOrg.datos.puntajePromedio);
            }
          }
        }
      } finally {
        setCargando(false);
      }
    };

    cargarDetalle();
  }, [eventoId]);

  const incrementarCantidad = () => {
    if (tipoSeleccionado && cantidad < tipoSeleccionado.cupoDisponible) {
      setCantidad(prev => prev + 1);
    } else {
      Alert.alert('Cupo máximo alcanzado', 'No podés superar la cantidad de entradas disponibles.');
    }
  };

  const decrementarCantidad = () => {
    if (cantidad > 1) {
      setCantidad(prev => prev - 1);
    }
  };

  const totalCalculado = tipoSeleccionado ? tipoSeleccionado.precio * cantidad : 0;

  const handleComprar = async () => {
    if (!puedeComprar) {
      return;
    }

    if (!tipoSeleccionado) {
      Alert.alert('Atención', 'Por favor seleccioná un tipo de entrada.');
      return;
    }

    if (tipoSeleccionado.cupoDisponible < cantidad) {
      Alert.alert('Error', 'Cupo insuficiente para la cantidad solicitada.');
      return;
    }

    try {
      setProcesandoCompra(true);
      const res = await apiCompras.crear({
        compradorId,
        eventoId,
        tipoEntradaId: tipoSeleccionado.id,
        cantidad,
      });

      if (res.exito && res.datos) {
        triggerRefresh();
        Alert.alert(
          '¡Compra Exitosa!',
          `Adquiriste ${cantidad} ${cantidad === 1 ? 'entrada' : 'entradas'} por un total de $${totalCalculado.toLocaleString('es-AR')}. Tu ticket ya está disponible en "Mis Tickets".`,
          [{ text: 'Ver Mis Tickets', onPress: onPurchaseSuccess }]
        );
      } else {
        Alert.alert('Error al comprar', res.error || 'No se pudo procesar la compra.');
      }
    } finally {
      setProcesandoCompra(false);
    }
  };

  if (cargando || !evento) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Solo el comprador compra, y solo mientras el evento no se haya realizado
  const eventoFinalizado = new Date(evento.fecha || evento.fechaEvento || '').getTime() < Date.now();
  const puedeComprar = rol === 'comprador' && !eventoFinalizado;
  const motivoSinCompra = eventoFinalizado ? 'Evento finalizado' : 'Solo compradores';

  const imagenUrl = evento.imagen || (evento.multimedia && evento.multimedia[0]) || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cabecera con Imagen y Botón Volver */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imagenUrl }} style={styles.image} resizeMode="cover" />
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{evento.categoria}</Text>
          </View>
        </View>

        {/* Información del Evento */}
        <View style={styles.content}>
          <Text style={styles.title}>{evento.nombre || evento.titulo}</Text>

          {/* Fila del Organizador y su Reputación */}
          <TouchableOpacity
            style={styles.organizerRow}
            onPress={() => onViewOrganizerReviews(evento.organizadorId)}
            activeOpacity={0.7}
          >
            <View>
              <Text style={styles.organizerLabel}>Organizado por</Text>
              <Text style={styles.organizerName}>
                {evento.organizadorNombre || `Organizador #${evento.organizadorId}`}
              </Text>
            </View>

            <View style={styles.ratingBadge}>
              <StarRating rating={reputacionOrg || 0} size={14} />
              <Text style={styles.ratingText}>
                {typeof reputacionOrg === 'number' ? `${reputacionOrg.toFixed(1)} ★` : 'Nuevo'}
              </Text>
              <Text style={styles.seeReviewsLink}>Ver reseñas ›</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Fecha y Descripción */}
          <Text style={styles.sectionTitle}>Acerca del Evento</Text>
          <Text style={styles.description}>{evento.descripcion}</Text>

          <View style={styles.divider} />

          {/* Selección de Tipo de Entrada (CU 12) */}
          <Text style={styles.sectionTitle}>Seleccioná tu Entrada</Text>
          {tiposEntrada.map(tipo => {
            const isSelected = tipoSeleccionado?.id === tipo.id;
            const sinCupo = tipo.cupoDisponible === 0;

            return (
              <TouchableOpacity
                key={tipo.id}
                style={[
                  styles.ticketTypeCard,
                  isSelected && styles.ticketTypeCardSelected,
                  sinCupo && styles.ticketTypeCardDisabled,
                ]}
                onPress={() => {
                  if (!sinCupo) {
                    setTipoSeleccionado(tipo);
                    setCantidad(1);
                  }
                }}
                disabled={sinCupo}
              >
                <View style={styles.ticketTypeInfo}>
                  <Text style={styles.ticketTypeName}>{tipo.nombre}</Text>
                  {tipo.descripcion ? (
                    <Text style={styles.ticketTypeDesc}>{tipo.descripcion}</Text>
                  ) : null}
                  <Text style={[styles.ticketStock, sinCupo && styles.ticketStockEmpty]}>
                    {sinCupo ? 'Agotado' : `Quedan ${tipo.cupoDisponible} disponibles`}
                  </Text>
                </View>

                <View style={styles.ticketTypePriceCol}>
                  <Text style={styles.ticketTypePrice}>
                    ${tipo.precio.toLocaleString('es-AR')}
                  </Text>
                  <View style={[styles.radio, isSelected && styles.radioActive]} />
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Selector de Cantidad */}
          {tipoSeleccionado && (
            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Cantidad de Entradas</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={[styles.qtyBtn, cantidad <= 1 && styles.qtyBtnDisabled]}
                  onPress={decrementarCantidad}
                  disabled={cantidad <= 1}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.qtyText}>{cantidad}</Text>

                <TouchableOpacity
                  style={[
                    styles.qtyBtn,
                    cantidad >= (tipoSeleccionado?.cupoDisponible || 0) && styles.qtyBtnDisabled,
                  ]}
                  onPress={incrementarCantidad}
                  disabled={cantidad >= (tipoSeleccionado?.cupoDisponible || 0)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer Fijo de Compra */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Total a pagar</Text>
          <Text style={styles.totalValue}>
            ${totalCalculado.toLocaleString('es-AR')}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.buyButton, (procesandoCompra || !puedeComprar) && styles.buyButtonDisabled]}
          onPress={handleComprar}
          disabled={procesandoCompra || !puedeComprar}
        >
          {procesandoCompra ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buyButtonText}>
              {puedeComprar ? 'Comprar Entradas →' : motivoSinCompra}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: 240,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  organizerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  organizerLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  organizerName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  ratingBadge: {
    alignItems: 'flex-end',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
    marginTop: 2,
  },
  seeReviewsLink: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  ticketTypeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  ticketTypeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryUltraLight,
  },
  ticketTypeCardDisabled: {
    opacity: 0.5,
  },
  ticketTypeInfo: {
    flex: 1,
    paddingRight: 10,
  },
  ticketTypeName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  ticketTypeDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ticketStock: {
    fontSize: 11,
    color: Colors.primaryDark,
    fontWeight: '600',
    marginTop: 4,
  },
  ticketStockEmpty: {
    color: Colors.danger,
  },
  ticketTypePriceCol: {
    alignItems: 'flex-end',
    gap: 8,
  },
  ticketTypePrice: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  radioActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qtyBtnDisabled: {
    opacity: 0.4,
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    minWidth: 20,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 10,
  },
  totalLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  buyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buyButtonDisabled: {
    opacity: 0.7,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
