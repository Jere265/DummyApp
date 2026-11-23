import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
  showValue?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 18,
  interactive = false,
  onRatingChange,
  showValue = false,
}) => {
  const stars = [];

  for (let i = 1; i <= maxRating; i++) {
    const isFilled = i <= Math.round(rating);
    const starElement = (
      <Text key={i} style={[styles.star, { fontSize: size }]}>
        {isFilled ? '★' : '☆'}
      </Text>
    );

    if (interactive && onRatingChange) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => onRatingChange(i)} activeOpacity={0.7}>
          {starElement}
        </TouchableOpacity>
      );
    } else {
      stars.push(starElement);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.starsRow}>{stars}</View>
      {showValue && (
        <Text style={styles.ratingText}>
          {rating > 0 ? rating.toFixed(1) : 'Sin calificar'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  star: {
    color: '#F59E0B',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
});
