import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Evento, Categoria } from '../types';
import { apiEventos, apiCategorias } from '../services/api';
import { EventCard } from '../components/EventCard';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

interface ExploreScreenProps {
  onSelectEvent: (eventoId: number) => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ onSelectEvent }) => {
  const { refreshKey } = useApp();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('Todas');
  const [criterio, setCriterio] = useState<string>('');
  const [ordenarPor, setOrdenarPor] = useState<'precio' | 'fecha' | 'puntaje'>('fecha');
  const [direccion, setDireccion] = useState<'asc' | 'desc'>('asc');
  const [cargando, setCargando] = useState<boolean>(true);
  const [refrescando, setRefrescando] = useState<boolean>(false);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [resCat, resEv] = await Promise.all([
        apiCategorias.listar(),
        apiEventos.listar({
          criterio,
          categoria: categoriaSeleccionada,
          ordenarPor,
          direccion,
        }),
      ]);

      if (resCat.exito && resCat.datos) {
        setCategorias(resCat.datos);
      }
      if (resEv.exito && resEv.datos) {
        setEventos(resEv.datos);
      }
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [categoriaSeleccionada, ordenarPor, direccion, refreshKey]);

  // Búsqueda textual: se dispara al dejar de escribir (400 ms) para no consultar en cada tecla
  const primeraCarga = useRef(true);
  useEffect(() => {
    if (primeraCarga.current) {
      primeraCarga.current = false;
      return;
    }
    const timer = setTimeout(cargarDatos, 400);
    return () => clearTimeout(timer);
  }, [criterio]);

  // Búsqueda con debounce al tipear
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarDatos();
    }, 300);
    return () => clearTimeout(timer);
  }, [criterio]);

  const onRefresh = () => {
    setRefrescando(true);
    cargarDatos();
  };

  return (
    <View style={styles.container}>
      {/* Barra de Búsqueda */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar recital, obra, festival..."
            placeholderTextColor={Colors.textMuted}
            value={criterio}
            onChangeText={setCriterio}
            returnKeyType="search"
            onSubmitEditing={cargarDatos}
          />
          {criterio.length > 0 && (
            <TouchableOpacity onPress={() => setCriterio('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros de Categorías */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          <TouchableOpacity
            style={[styles.categoryPill, categoriaSeleccionada === 'Todas' && styles.categoryPillActive]}
            onPress={() => setCategoriaSeleccionada('Todas')}
          >
            <Text style={[styles.categoryPillText, categoriaSeleccionada === 'Todas' && styles.categoryPillTextActive]}>
              ✨ Todas
            </Text>
          </TouchableOpacity>

          {categorias.map(cat => {
            const isActive = categoriaSeleccionada === cat.nombre;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => setCategoriaSeleccionada(cat.nombre)}
              >
                <Text style={[styles.categoryPillText, isActive && styles.categoryPillTextActive]}>
                  {cat.nombre}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Barra de Ordenamiento (CU 11) */}
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Ordenar por:</Text>
          <View style={styles.sortButtons}>
            <TouchableOpacity
              style={[styles.sortBtn, ordenarPor === 'precio' && styles.sortBtnActive]}
              onPress={() => {
                if (ordenarPor === 'precio') {
                  setDireccion(prev => prev === 'asc' ? 'desc' : 'asc');
                } else {
                  setOrdenarPor('precio');
                  setDireccion('asc');
                }
              }}
            >
              <Text style={[styles.sortBtnText, ordenarPor === 'precio' && styles.sortBtnTextActive]}>
                💵 Precio {ordenarPor === 'precio' ? (direccion === 'asc' ? '↑' : '↓') : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortBtn, ordenarPor === 'fecha' && styles.sortBtnActive]}
              onPress={() => {
                if (ordenarPor === 'fecha') {
                  setDireccion(prev => prev === 'asc' ? 'desc' : 'asc');
                } else {
                  setOrdenarPor('fecha');
                  setDireccion('asc');
                }
              }}
            >
              <Text style={[styles.sortBtnText, ordenarPor === 'fecha' && styles.sortBtnTextActive]}>
                📅 Fecha {ordenarPor === 'fecha' ? (direccion === 'asc' ? '↑' : '↓') : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortBtn, ordenarPor === 'puntaje' && styles.sortBtnActive]}
              onPress={() => {
                setOrdenarPor('puntaje');
                setDireccion('desc');
              }}
            >
              <Text style={[styles.sortBtnText, ordenarPor === 'puntaje' && styles.sortBtnTextActive]}>
                ⭐ Reputación
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Listado de Eventos */}
      {cargando && !refrescando ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Buscando espectáculos...</Text>
        </View>
      ) : eventos.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>🎟️</Text>
          <Text style={styles.emptyTitle}>No se encontraron eventos</Text>
          <Text style={styles.emptySubtitle}>
            Probá ajustando los términos de búsqueda o seleccionando otra categoría.
          </Text>
        </View>
      ) : (
        <FlatList
          data={eventos}
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
  searchSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  clearIcon: {
    fontSize: 14,
    color: Colors.textMuted,
    padding: 4,
  },
  categoriesScroll: {
    marginVertical: 10,
  },
  categoriesContent: {
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  sortLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortBtnActive: {
    backgroundColor: Colors.primaryUltraLight,
    borderColor: Colors.primary,
  },
  sortBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sortBtnTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
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
    lineHeight: 18,
  },
});
