import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export default function LoginScreen() {
  const { setRol, setLoggedIn } = useApp();

  const handleLogin = (role: 'comprador' | 'organizador') => {
    setRol(role);
    setLoggedIn(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ticket It</Text>
      <Text style={styles.subtitle}>Selecciona tu rol para continuar</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleLogin('comprador')}
      >
        <Text style={styles.buttonText}>Iniciar como Comprador</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleLogin('organizador')}
      >
        <Text style={styles.buttonText}>Iniciar como Organizador</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});