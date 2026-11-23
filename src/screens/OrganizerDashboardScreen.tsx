import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Evento, VentasEventoReporte, Categoria, Compra } from '../types';
import { apiEventos, apiCategorias, apiDemo, apiCompras } from '../services/api';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/Badge';

interface OrganizerDashboardScreenProps {
  /** 'ventas': mis eventos, compras y disponibilidad (CU 2). 'crear': publicar evento (CU 4). */
  seccion: 'ventas' | 'crear';
  /** Abre el chat de una compra para responder al comprador (CU 6). */
  onOpenChat: (compraId: number) => void;
  /** Se llama luego de publicar un evento con éxito. */
  onEventoCreado?: () => void;
}

export const OrganizerDashboardScreen: React.FC<OrganizerDashboardScreenProps> = ({
  seccion,
  onOpenChat,
  onEventoCreado,
}) => {
  const { organizadorId, refreshKey, triggerRefresh } = useApp();

  // Estado para reporte de ventas
  const [misEventos, setMisEventos] = useState<Evento[]>([]);
  const [eventoSeleccionadoId, setEventoSeleccionadoId] = useState<number | null>(null);
  const [reporteVentas, setReporteVentas] = useState<VentasEventoReporte | null>(null);
  const [cargandoReporte, setCargandoReporte] = useState<boolean>(false);

  // Estado para creación de evento (CU 4)
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nombre, setNombre] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('Música');
  const [fecha, setFecha] = useState<string>('2027-02-15');
  const [multimedia, setMultimedia] = useState<string>('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800');
  const [tiposEntrada, setTiposEntrada] = useState<
    { nombre: string; precio: string; cupoTotal: string; descripcion: string }[]
  >([
    { nombre: 'General', precio: '6000', cupoTotal: '150', descripcion: 'Acceso general' },
    { nombre: 'VIP', precio: '14000', cupoTotal: '50', descripcion: 'Sector preferencial' },
  ]);
  const [creando, setCreando] = useState<boolean>(false);

  // Cargar eventos del organizador
  useEffect(() => {
    const cargarEventosYCategorias = async () => {
      const [resEv, resCat] = await Promise.all([
        apiEventos.listarPorOrganizador(organizadorId),
        apiCategorias.listar(),
      ]);

      if (resEv.exito && resEv.datos) {
        const delOrg = resEv.datos;
        setMisEventos(delOrg);
        // Mantener la selección si el evento sigue existiendo (p. ej. tras un reset de demo)
        setEventoSeleccionadoId(prev =>
          prev && delOrg.some(e => e.id === prev) ? prev : delOrg.length > 0 ? delOrg[0].id : null
        );
      }

      if (resCat.exito && resCat.datos) {
        setCategorias(resCat.datos);
      }
    };

    cargarEventosYCategorias();
  }, [organizadorId, refreshKey]);

  // Cargar reporte de ventas cuando cambia el evento seleccionado (CU 2)
  useEffect(() => {
    if (eventoSeleccionadoId) {
      const cargarReporte = async () => {
        setCargandoReporte(true);
        try {
          const res = await apiEventos.obtenerVentas(eventoSeleccionadoId, organizadorId);
          if (res.exito && res.datos) {
            setReporteVentas(res.datos);
          } else {
            setReporteVentas(null);
          }
        } finally {
          setCargandoReporte(false);
        }
      };
      cargarReporte();
    }
  }, [eventoSeleccionadoId, organizadorId, refreshKey]);

  // Funciones para tipos de entrada en el formulario
  const agregarTipoEntrada = () => {
    setTiposEntrada(prev => [
      ...prev,
      { nombre: '', precio: '', cupoTotal: '', descripcion: '' },
    ]);
  };

  const actualizarTipo = (index: number, campo: string, valor: string) => {
    setTiposEntrada(prev => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [campo]: valor };
      return copia;
    });
  };

  const eliminarTipo = (index: number) => {
    if (tiposEntrada.length > 1) {
      setTiposEntrada(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleCrearEvento = async () => {
    if (!nombre.trim() || !descripcion.trim()) {
      Alert.alert('Campos obligatorios', 'Completá el nombre y la descripción del evento.');
      return;
    }

    const fechaEvento = new Date(`${fecha}T21:00:00`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || isNaN(fechaEvento.getTime())) {
      Alert.alert('Fecha inválida', 'Ingresá la fecha con el formato AAAA-MM-DD.');
      return;
    }
    if (fechaEvento.getTime() <= Date.now()) {
      Alert.alert('Fecha inválida', 'La fecha del evento tiene que ser futura.');
      return;
    }

    const tiposMapeados = tiposEntrada.map(t => ({
      nombre: t.nombre.trim(),
      precio: Number(t.precio) || 0,
      cupoTotal: Number(t.cupoTotal) || 0,
      descripcion: t.descripcion.trim(),
    }));

    const invalido = tiposMapeados.some(t => !t.nombre || t.precio < 0 || t.cupoTotal <= 0);
    if (invalido) {
      Alert.alert('Tipos de entrada inválidos', 'Cada tipo debe tener nombre, precio >= 0 y cupo mayor a cero.');
      return;
    }

    try {
      setCreando(true);
      const res = await apiEventos.crear({
        organizadorId,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        categoria,
        fecha: fechaEvento.toISOString(),
        multimedia: [multimedia.trim()],
        tiposEntrada: tiposMapeados,
      });

      if (res.exito && res.datos) {
        Alert.alert('¡Evento Publicado!', 'Tu espectáculo ya está publicado y disponible para compras en el catálogo.');
        triggerRefresh();
        setNombre('');
        setDescripcion('');
        setEventoSeleccionadoId(res.datos.evento.id);
        onEventoCreado?.();
      } else {
        Alert.alert('Error al publicar', res.error || 'Verificá los datos ingresados.');
      }
    } finally {
      setCreando(false);
    }
  };

  // Validar ingreso en la puerta: la entrada pasa a UTILIZADA y el comprador puede calificar (CU 9)
  const handleValidarIngreso = (compra: Compra) => {
    Alert.alert(
      'Validar ingreso',
      `¿Confirmás el ingreso de ${compra.compradorNombre || 'este comprador'} (${compra.cantidad || compra.cantidadEntradas} ${
        (compra.cantidad || compra.cantidadEntradas) === 1 ? 'entrada' : 'entradas'
      })?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Validar',
          onPress: async () => {
            const res = await apiCompras.utilizar(compra.id, organizadorId);
            if (res.exito) {
              triggerRefresh();
              Alert.alert('Ingreso validado', 'La entrada quedó marcada como utilizada.');
            } else {
              Alert.alert('No se pudo validar', res.error || 'Intentá de nuevo.');
            }
          },
        },
      ]
    );
  };

  const handleResetDemoData = async () => {
    Alert.alert(
      'Reiniciar Datos de Prueba',
      '¿Deseás recargar los eventos y compras iniciales de muestra?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, recargar demo',
          onPress: async () => {
            const res = await apiDemo.resetearDatos();
            if (res.exito) {
              triggerRefresh();
              Alert.alert('Datos Recargados', 'El lote de datos iniciales ha sido restaurado con éxito.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {seccion === 'ventas' ? (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>Tus Eventos Publicados</Text>
              <TouchableOpacity onPress={handleResetDemoData} style={styles.resetBtn}>
                <Text style={styles.resetBtnText}>🔄 Reset Demo</Text>
              </TouchableOpacity>
            </View>

            {/* Selector de Evento */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventPicker}>
              {misEventos.map(ev => {
                const isSelected = eventoSeleccionadoId === ev.id;
                return (
                  <TouchableOpacity
                    key={ev.id}
                    style={[styles.eventPill, isSelected && styles.eventPillActive]}
                    onPress={() => setEventoSeleccionadoId(ev.id)}
                  >
                    <Text style={[styles.eventPillText, isSelected && styles.eventPillTextActive]}>
                      {ev.nombre || ev.titulo}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {misEventos.length === 0 && (
              <Text style={styles.emptyText}>
                Todavía no publicaste eventos. Usá la pestaña "Publicar" para crear el primero.
              </Text>
            )}

            {cargandoReporte ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 24 }} />
            ) : reporteVentas ? (
              <View>
                {/* Métricas Principales */}
                <View style={styles.statsCard}>
                  <Text style={styles.statsTitle}>Entradas Totales Vendidas</Text>
                  <Text style={styles.statsValue}>{reporteVentas.totalEntradasVendidas}</Text>
                  <Text style={styles.statsSubtitle}>
                    Compras registradas: {reporteVentas.compras.length}
                  </Text>
                </View>

                {/* Disponibilidad por Tipo de Entrada (CU 2) */}
                <Text style={styles.subSectionTitle}>Disponibilidad por Tipo de Entrada</Text>
                {reporteVentas.disponibilidadPorTipo.map(tipo => (
                  <View key={tipo.tipoEntradaId} style={styles.ticketReportCard}>
                    <View style={styles.ticketReportHeader}>
                      <Text style={styles.ticketReportName}>{tipo.nombre}</Text>
                      <Text style={styles.ticketReportPrice}>${tipo.precio.toLocaleString('es-AR')}</Text>
                    </View>

                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${Math.min(100, (tipo.entradasVendidas / tipo.cupoTotal) * 100)}%`,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.ticketReportFooter}>
                      <Text style={styles.stockText}>
                        🟢 Quedan <Text style={{ fontWeight: '800' }}>{tipo.cupoDisponible}</Text> disponibles
                      </Text>
                      <Text style={styles.soldText}>
                        Vendidas: {tipo.entradasVendidas} de {tipo.cupoTotal}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Compras Asociadas y su Estado */}
                <Text style={styles.subSectionTitle}>Compras Asociadas por Estado</Text>
                <View style={styles.statesBreakdown}>
                  <View style={styles.stateItem}>
                    <Text style={styles.stateNumber}>
                      {reporteVentas.comprasPorEstado.PENDIENTE?.length || 0}
                    </Text>
                    <Text style={[styles.stateLabel, { color: Colors.textSecondary }]}>Pendientes</Text>
                  </View>
                  <View style={styles.stateItem}>
                    <Text style={styles.stateNumber}>
                      {reporteVentas.comprasPorEstado.CONFIRMADA?.length || 0}
                    </Text>
                    <Text style={[styles.stateLabel, { color: Colors.primaryDark }]}>Confirmadas</Text>
                  </View>

                  <View style={styles.stateItem}>
                    <Text style={styles.stateNumber}>
                      {reporteVentas.comprasPorEstado.UTILIZADA?.length || 0}
                    </Text>
                    <Text style={[styles.stateLabel, { color: Colors.secondary }]}>Utilizadas</Text>
                  </View>

                  <View style={styles.stateItem}>
                    <Text style={styles.stateNumber}>
                      {reporteVentas.comprasPorEstado.CANCELADA?.length || 0}
                    </Text>
                    <Text style={[styles.stateLabel, { color: Colors.danger }]}>Canceladas</Text>
                  </View>

                  <View style={styles.stateItem}>
                    <Text style={styles.stateNumber}>
                      {reporteVentas.comprasPorEstado.REEMBOLSADA?.length || 0}
                    </Text>
                    <Text style={[styles.stateLabel, { color: Colors.estadoReembolsada }]}>Reembolsadas</Text>
                  </View>
                </View>

                {/* Detalle de cada compra: estado, chat con el comprador y validación de ingreso */}
                <Text style={[styles.subSectionTitle, { marginTop: 16 }]}>Detalle de Compras</Text>
                {reporteVentas.compras.length === 0 ? (
                  <Text style={styles.emptyText}>Este evento todavía no tiene compras.</Text>
                ) : (
                  reporteVentas.compras.map(compra => {
                    const cantidad = compra.cantidad || compra.cantidadEntradas || 0;
                    return (
                      <View key={compra.id} style={styles.compraCard}>
                        <View style={styles.compraHeader}>
                          <Text style={styles.compraTitulo}>
                            #{compra.id} · {compra.compradorNombre || `Comprador #${compra.compradorId}`}
                          </Text>
                          <Badge estado={compra.estado} />
                        </View>
                        <Text style={styles.compraDetalle}>
                          {cantidad} × {compra.tipoEntradaNombre || 'Entrada'} · ${(compra.total || 0).toLocaleString('es-AR')}
                        </Text>
                        <View style={styles.compraAcciones}>
                          <TouchableOpacity style={styles.chatBtn} onPress={() => onOpenChat(compra.id)}>
                            <Text style={styles.chatBtnText}>💬 Chat</Text>
                          </TouchableOpacity>
                          {compra.estado === 'CONFIRMADA' && (
                            <TouchableOpacity style={styles.validarBtn} onPress={() => handleValidarIngreso(compra)}>
                              <Text style={styles.validarBtnText}>✅ Validar ingreso</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            ) : null}
          </View>
        ) : (
          /* Formulario de Creación de Evento (CU 4) */
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Publicar Nuevo Espectáculo</Text>

            <Text style={styles.inputLabel}>Título del Evento *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Lollapalooza 2027"
              placeholderTextColor={Colors.textMuted}
              value={nombre}
              onChangeText={setNombre}
            />

            <Text style={styles.inputLabel}>Descripción Detallada *</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Detallá bandas, acceso, horarios..."
              placeholderTextColor={Colors.textMuted}
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
            />

            <Text style={styles.inputLabel}>Categoría</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {categorias.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catPickPill, categoria === cat.nombre && styles.catPickPillActive]}
                  onPress={() => setCategoria(cat.nombre)}
                >
                  <Text style={[styles.catPickText, categoria === cat.nombre && styles.catPickTextActive]}>
                    {cat.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Fecha de Realización (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={fecha}
              onChangeText={setFecha}
              placeholder="2027-02-15"
              placeholderTextColor={Colors.textMuted}
            />

            {/* Tipos de Entrada Dinámicos */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.subSectionTitle}>Tipos de Entrada Disponibles</Text>
              <TouchableOpacity onPress={agregarTipoEntrada}>
                <Text style={styles.addTypeLink}>+ Agregar Tipo</Text>
              </TouchableOpacity>
            </View>

            {tiposEntrada.map((t, idx) => (
              <View key={idx} style={styles.ticketTypeBox}>
                <View style={styles.ticketTypeBoxHeader}>
                  <Text style={styles.ticketBoxIndex}>Entrada #{idx + 1}</Text>
                  {tiposEntrada.length > 1 && (
                    <TouchableOpacity onPress={() => eliminarTipo(idx)}>
                      <Text style={styles.deleteType}>Eliminar</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TextInput
                  style={[styles.input, { marginBottom: 6 }]}
                  placeholder="Nombre (ej: Platea Baja, General)"
                  placeholderTextColor={Colors.textMuted}
                  value={t.nombre}
                  onChangeText={v => actualizarTipo(idx, 'nombre', v)}
                />

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniLabel}>Precio ($)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="5000"
                      keyboardType="numeric"
                      placeholderTextColor={Colors.textMuted}
                      value={t.precio}
                      onChangeText={v => actualizarTipo(idx, 'precio', v)}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniLabel}>Cupo Total</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="100"
                      keyboardType="numeric"
                      placeholderTextColor={Colors.textMuted}
                      value={t.cupoTotal}
                      onChangeText={v => actualizarTipo(idx, 'cupoTotal', v)}
                    />
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.publishBtn, creando && styles.publishBtnDisabled]}
              onPress={handleCrearEvento}
              disabled={creando}
            >
              {creando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.publishBtnText}>Publicar Evento en Catálogo →</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  resetBtn: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  eventPicker: {
    marginBottom: 16,
  },
  eventPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  eventPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  eventPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statsCard: {
    backgroundColor: Colors.primaryUltraLight,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    marginBottom: 16,
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  statsValue: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.primaryDark,
    marginVertical: 4,
  },
  statsSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  ticketReportCard: {
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ticketReportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ticketReportName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  ticketReportPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  ticketReportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stockText: {
    fontSize: 12,
    color: Colors.primaryDark,
  },
  soldText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  statesBreakdown: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'space-between',
  },
  stateItem: {
    alignItems: 'center',
    flex: 1,
  },
  stateNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  stateLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  compraCard: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  compraTitulo: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  compraDetalle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  compraAcciones: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  chatBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chatBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  validarBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  validarBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  formCard: {
    backgroundColor: Colors.surface,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  catPickPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background,
    marginRight: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catPickPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catPickText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  catPickTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  addTypeLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
  },
  ticketTypeBox: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ticketTypeBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ticketBoxIndex: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  deleteType: {
    fontSize: 11,
    color: Colors.danger,
    fontWeight: '700',
  },
  miniLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  publishBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  publishBtnDisabled: {
    opacity: 0.6,
  },
  publishBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
