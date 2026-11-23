import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import { Header } from './src/components/Header';
import { TabBar } from './src/components/TabBar';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { EventDetailScreen } from './src/screens/EventDetailScreen';
import { MyPurchasesScreen } from './src/screens/MyPurchasesScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { ReviewModal } from './src/screens/ReviewModal';
import { OrganizerReviewsScreen } from './src/screens/OrganizerReviewsScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { OrganizerDashboardScreen } from './src/screens/OrganizerDashboardScreen';
import LoginScreen from './src/screens/LoginScreen';
import { Colors } from './src/theme/colors';
import { Compra } from './src/types';

const MainNavigation = () => {
  const { rol, serverUrl, updateServerUrl, loggedIn } = useApp();

  // Pestaña inicial de cada rol: el comprador explora el catálogo, el organizador gestiona sus eventos
  const tabInicial = (r: 'comprador' | 'organizador') => (r === 'organizador' ? 'org_events' : 'explore');

  // Navegación de Pestañas
  const [currentTab, setCurrentTab] = useState<string>(tabInicial(rol));

  // Navegación de Stack (pantallas modales/profundas)
  const [stackScreen, setStackScreen] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedCompraId, setSelectedCompraId] = useState<number | null>(null);
  const [selectedOrganizerId, setSelectedOrganizerId] = useState<number | null>(null);

  // Modal para Calificar (CU 9)
  const [reviewModalCompra, setReviewModalCompra] = useState<Compra | null>(null);

  // Modal de Configuración de IP / Servidor
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
  const [ipInput, setIpInput] = useState<string>(serverUrl);

  const navigateToEventDetail = (id: number) => {
    setSelectedEventId(id);
    setStackScreen('event_detail');
  };

  const navigateToChat = (compraId: number) => {
    setSelectedCompraId(compraId);
    setStackScreen('chat');
  };

  const navigateToOrganizerReviews = (orgId: number) => {
    setSelectedOrganizerId(orgId);
    setStackScreen('organizer_reviews');
  };

  const goBack = () => {
    setStackScreen(null);
  };

  // Al iniciar o cerrar sesión (o cambiar de rol) se vuelve a la pantalla inicial de ese rol
  useEffect(() => {
    setStackScreen(null);
    setReviewModalCompra(null);
    setCurrentTab(tabInicial(rol));
  }, [rol, loggedIn]);

  // Renderizador de pantallas según estado de navegación
  const renderScreen = () => {
    if (!loggedIn) {
      return <LoginScreen />;
    }
    // 1. Pantallas de Stack
    if (stackScreen === 'chat' && selectedCompraId) {
      // El chat lo usan ambos roles: el comprador consulta y el organizador responde
      return <ChatScreen compraId={selectedCompraId} onBack={goBack} />;
    }

    // 2. Pantallas del Organizador: gestiona sus eventos, no compra entradas
    if (rol === 'organizador') {
      return (
        <OrganizerDashboardScreen
          seccion={currentTab === 'org_create' ? 'crear' : 'ventas'}
          onOpenChat={navigateToChat}
          onEventoCreado={() => setCurrentTab('org_events')}
        />
      );
    }

    // 3. Pantallas del Comprador
    if (stackScreen === 'event_detail' && selectedEventId) {
      return (
        <EventDetailScreen
          eventoId={selectedEventId}
          onBack={goBack}
          onViewOrganizerReviews={navigateToOrganizerReviews}
          onPurchaseSuccess={() => {
            goBack();
            setCurrentTab('purchases');
          }}
        />
      );
    }

    if (stackScreen === 'organizer_reviews' && selectedOrganizerId) {
      return <OrganizerReviewsScreen organizadorId={selectedOrganizerId} onBack={goBack} />;
    }

    if (currentTab === 'purchases') {
      return (
        <MyPurchasesScreen
          onOpenChat={navigateToChat}
          onOpenReview={compra => setReviewModalCompra(compra)}
        />
      );
    }

    if (currentTab === 'favorites') {
      return <FavoritesScreen onSelectEvent={navigateToEventDetail} />;
    }

    // Por defecto: Catálogo / Explorar
    return <ExploreScreen onSelectEvent={navigateToEventDetail} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* Cabecera superior interactiva */}
      {loggedIn && !stackScreen && (
        <Header onOpenSettings={() => setSettingsVisible(true)} />
      )}

      {/* Pantalla Activa */}
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Barra de pestañas inferior (solo visible cuando no hay pantalla de stack) */}
      {loggedIn && !stackScreen && (
        <TabBar currentTab={currentTab} onTabChange={setCurrentTab} />
      )}

      {/* Modal para Calificar (CU 9) */}
      <ReviewModal
        visible={Boolean(reviewModalCompra)}
        compra={reviewModalCompra}
        onClose={() => setReviewModalCompra(null)}
        onSuccess={() => setReviewModalCompra(null)}
      />

      {/* Modal de Configuración de Conexión */}
      <Modal visible={settingsVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.settingsCard}>
            <Text style={styles.settingsTitle}>⚙️ Configuración del Backend</Text>
            <Text style={styles.settingsDesc}>
              Ajustá la URL del servidor según dónde ejecutes tu app:
            </Text>

            <TextInput
              style={styles.settingsInput}
              value={ipInput}
              onChangeText={setIpInput}
              placeholder="http://10.0.2.2:3001/api"
            />

            <View style={styles.hintBox}>
              <Text style={styles.hintText}>• Emulador Android: http://10.0.2.2:3001/api</Text>
              <Text style={styles.hintText}>• Web / iOS: http://localhost:3001/api</Text>
              <Text style={styles.hintText}>• Celular / Expo: http://&lt;TU_IP&gt;:3001/api</Text>
            </View>

            <View style={styles.settingsActions}>
              <TouchableOpacity
                style={styles.settingsBtnClose}
                onPress={() => setSettingsVisible(false)}
              >
                <Text style={styles.settingsBtnCloseText}>Cerrar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingsBtnSave}
                onPress={() => {
                  updateServerUrl(ipInput);
                  setSettingsVisible(false);
                }}
              >
                <Text style={styles.settingsBtnSaveText}>Guardar y Probar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainNavigation />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  settingsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  settingsDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  settingsInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  hintBox: {
    backgroundColor: Colors.borderLight,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  hintText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 3,
  },
  settingsActions: {
    flexDirection: 'row',
    gap: 10,
  },
  settingsBtnClose: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  settingsBtnCloseText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  settingsBtnSave: {
    flex: 2,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  settingsBtnSaveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
