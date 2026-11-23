export const Colors = {
  // Primarios - Verde esmeralda moderno inspirado en el logo del PDF
  primary: '#10B981',
  primaryDark: '#059669',
  primaryLight: '#D1FAE5',
  primaryUltraLight: '#ECFDF5',

  // Acento / Secundario
  secondary: '#6366F1',
  secondaryLight: '#EEF2FF',

  // Neutros / Fondos
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Textos
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textLight: '#F8FAFC',

  // Bordes y separadores
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Estados de Compra
  estadoConfirmada: '#10B981',
  estadoPendiente: '#F59E0B',
  estadoUtilizada: '#6366F1',
  estadoCancelada: '#EF4444',
  estadoReembolsada: '#8B5CF6',

  // Feedback
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Overlay / Sombra
  overlay: 'rgba(15, 23, 42, 0.5)',
  shadow: '#0F172A',
};

export const Typography = {
  fontFamily: undefined, // Default system font
  h1: { fontSize: 24, fontWeight: '700' as const, color: Colors.textPrimary },
  h2: { fontSize: 20, fontWeight: '700' as const, color: Colors.textPrimary },
  h3: { fontSize: 16, fontWeight: '600' as const, color: Colors.textPrimary },
  body: { fontSize: 14, fontWeight: '400' as const, color: Colors.textPrimary },
  caption: { fontSize: 12, fontWeight: '400' as const, color: Colors.textSecondary },
  button: { fontSize: 15, fontWeight: '600' as const },
};
