import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Mensaje } from '../types';
import { apiChat } from '../services/api';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

interface ChatScreenProps {
  compraId: number;
  onBack: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ compraId, onBack }) => {
  const { rol, compradorId, organizadorId } = useApp();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(true);
  const [enviando, setEnviando] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);

  const cargarMensajes = async () => {
    try {
      const res = await apiChat.obtenerMensajes(compraId);
      if (res.exito && res.datos) {
        setMensajes(res.datos);
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMensajes();
    // Poll cada 4 segundos para actualización fluida del chat
    const interval = setInterval(cargarMensajes, 4000);
    return () => clearInterval(interval);
  }, [compraId]);

  const handleEnviar = async () => {
    if (!nuevoMensaje.trim() || enviando) return;

    const texto = nuevoMensaje.trim();
    setNuevoMensaje('');
    setEnviando(true);

    try {
      const res = await apiChat.enviarMensaje(compraId, {
        mensaje: texto,
        remitente: rol === 'organizador' ? 'organizador' : 'comprador',
        usuarioId: rol === 'organizador' ? organizadorId : compradorId,
      });

      if (res.exito && res.datos) {
        setMensajes(prev => [...prev, res.datos!]);
      } else {
        // Si el backend rechaza el mensaje, se devuelve el texto al campo para no perderlo
        setNuevoMensaje(texto);
        Alert.alert('No se pudo enviar', res.error || 'Intentá de nuevo.');
      }
    } finally {
      setEnviando(false);
    }
  };

  const formatearHora = (fechaStr: string) => {
    try {
      const d = new Date(fechaStr);
      return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Cabecera del Chat */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Chat de la Compra #{compraId}</Text>
          <Text style={styles.headerSubtitle}>
            Enviando como: <Text style={styles.roleHighlight}>{rol.toUpperCase()}</Text>
          </Text>
        </View>
      </View>

      {/* Lista de Mensajes */}
      {cargando ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : mensajes.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>
            {rol === 'organizador' ? 'Chat directo con el comprador' : 'Chat directo con el organizador'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {rol === 'organizador'
              ? 'Todavía no hay consultas. Podés escribirle para avisar cambios de fecha o de acceso.'
              : 'Escribí una consulta sobre acceso, puertas, estacionamiento o cambios.'}
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={mensajes}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => {
            const esMio = item.remitente === rol;
            return (
              <View style={[styles.messageRow, esMio ? styles.messageRowMe : styles.messageRowOther]}>
                <View style={[styles.bubble, esMio ? styles.bubbleMe : styles.bubbleOther]}>
                  <Text style={[styles.senderLabel, esMio ? styles.senderMe : styles.senderOther]}>
                    {item.remitente === 'organizador' ? 'Organizador' : 'Comprador'}
                  </Text>
                  <Text style={[styles.messageText, esMio ? styles.messageTextMe : styles.messageTextOther]}>
                    {item.contenido || item.mensaje}
                  </Text>
                  <Text style={[styles.timeText, esMio ? styles.timeTextMe : styles.timeTextOther]}>
                    {formatearHora(item.fechaHora || item.enviado || '')}
                  </Text>
                </View>
              </View>
            );
          }}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Input de Mensaje */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Escribí tu mensaje..."
          placeholderTextColor={Colors.textMuted}
          value={nuevoMensaje}
          onChangeText={setNuevoMensaje}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!nuevoMensaje.trim() || enviando) && styles.sendBtnDisabled]}
          onPress={handleEnviar}
          disabled={!nuevoMensaje.trim() || enviando}
        >
          {enviando ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.sendBtnText}>Enviar</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  roleHighlight: {
    color: Colors.primaryDark,
    fontWeight: '800',
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
  messagesList: {
    padding: 16,
    gap: 10,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  bubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  senderMe: {
    color: '#D1FAE5',
  },
  senderOther: {
    color: Colors.secondary,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextMe: {
    color: '#FFFFFF',
  },
  messageTextOther: {
    color: Colors.textPrimary,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeTextMe: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  timeTextOther: {
    color: Colors.textMuted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
