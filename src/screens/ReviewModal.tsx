import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Compra } from '../types';
import { apiResenas } from '../services/api';
import { Colors } from '../theme/colors';
import { StarRating } from '../components/StarRating';
import { useApp } from '../context/AppContext';

interface ReviewModalProps {
  visible: boolean;
  compra: Compra | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  compra,
  onClose,
  onSuccess,
}) => {
  const { compradorId, triggerRefresh } = useApp();
  const [puntuacion, setPuntuacion] = useState<number>(5);
  const [comentario, setComentario] = useState<string>('');
  const [enviando, setEnviando] = useState<boolean>(false);

  if (!compra) return null;

  const handleEnviarResena = async () => {
    if (!comentario.trim()) {
      Alert.alert('Comentario requerido', 'Por favor escribí un breve comentario sobre tu experiencia.');
      return;
    }

    try {
      setEnviando(true);
      const res = await apiResenas.crear({
        compraId: compra.id,
        compradorId,
        eventoId: compra.eventoId,
        puntuacion,
        detalle: comentario.trim(),
      });

      if (res.exito) {
        triggerRefresh();
        Alert.alert('¡Gracias por tu opinión!', 'Tu reseña fue publicada con éxito.');
        setComentario('');
        setPuntuacion(5);
        onSuccess();
      } else {
        Alert.alert('Error', res.error || 'No se pudo enviar la reseña.');
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Calificar Experiencia</Text>
          <Text style={styles.modalSubtitle}>
            {compra.evento ? (compra.evento.nombre || compra.evento.titulo) : `Evento #${compra.eventoId}`}
          </Text>

          <Text style={styles.ratingInstruction}>¿Cómo calificarías el espectáculo?</Text>
          <View style={styles.starContainer}>
            <StarRating
              rating={puntuacion}
              size={36}
              interactive
              onRatingChange={setPuntuacion}
            />
            <Text style={styles.ratingScore}>{puntuacion} de 5 estrellas</Text>
          </View>

          <Text style={styles.commentLabel}>Tu comentario:</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Contá cómo estuvo el sonido, la puntualidad, el acceso al predio..."
            placeholderTextColor={Colors.textMuted}
            value={comentario}
            onChangeText={setComentario}
            multiline
            numberOfLines={4}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={enviando}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, enviando && styles.submitBtnDisabled]}
              onPress={handleEnviarResena}
              disabled={enviando}
            >
              {enviando ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Publicar Reseña</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  ratingInstruction: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  starContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  ratingScore: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    marginTop: 6,
  },
  commentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  commentInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    height: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  submitBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
