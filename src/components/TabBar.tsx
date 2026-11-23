import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

interface TabBarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

interface TabItem {
  key: string;
  label: string;
  icon: string;
  badge?: number;
}

export const TabBar: React.FC<TabBarProps> = ({ currentTab, onTabChange }) => {
  const { rol, favoritos } = useApp();

  const tabsComprador: TabItem[] = [
    { key: 'explore', label: 'Explorar', icon: '🔍' },
    { key: 'purchases', label: 'Mis Tickets', icon: '🎟️' },
    { key: 'favorites', label: 'Favoritos', icon: '❤️', badge: favoritos.length > 0 ? favoritos.length : undefined },
  ];

  // El organizador no compra: gestiona sus eventos y publica nuevos
  const tabsOrganizador: TabItem[] = [
    { key: 'org_events', label: 'Mis Eventos', icon: '📈' },
    { key: 'org_create', label: 'Publicar', icon: '➕' },
  ];

  const tabs = rol === 'comprador' ? tabsComprador : tabsOrganizador;

  return (
    <View style={styles.container}>
      {tabs.map(tab => {
        const isActive = currentTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{tab.icon}</Text>
              {tab.badge !== undefined && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: 16,
    paddingTop: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 4,
  },
  iconContainer: {
    position: 'relative',
  },
  icon: {
    fontSize: 22,
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  labelActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 24,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: Colors.danger,
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
