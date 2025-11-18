import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

interface RippleProps extends ViewProps {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  foregroundColor?: string;
  maskColors?: string[];
}

export const Ripple = React.memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  foregroundColor = '#000000',
  maskColors = ['rgba(255,255,255,1)', 'rgba(255,255,255,0)'],
  style,
  ...props
}: RippleProps) {
  const circles = React.useMemo(() => {
    return Array.from({ length: numCircles }, (_, i) => {
      const size = mainCircleSize + i * 80;
      const opacity = mainCircleOpacity - i * 0.03;
      const animationDelay = i * 60; // en millisecondes
      const borderOpacity = (5 + i * 5) / 100;
      const isLastCircle = i === numCircles - 1;

      return {
        key: i,
        size,
        opacity,
        animationDelay,
        borderStyle: isLastCircle ? 'dashed' : 'solid',
        borderOpacity,
      };
    });
  }, [mainCircleSize, mainCircleOpacity, numCircles]);

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.container, style]} {...props}>
      <LinearGradient
        //@ts-ignore
        colors={maskColors}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none">
        <View style={styles.circlesContainer}>
          {circles.map((circle) => (
            <MotiView
              key={circle.key}
              from={{
                scale: 0,
                opacity: 0,
              }}
              animate={{
                scale: [
                  { value: 0, type: 'timing', duration: 0 },
                  { value: 1.2, type: 'timing', duration: 2000 },
                  { value: 1.5, type: 'timing', duration: 1500 },
                ],
                opacity: [
                  { value: 0, type: 'timing', duration: 300 },
                  { value: circle.opacity, type: 'timing', duration: 1000 },
                  { value: circle.opacity * 0.8, type: 'timing', duration: 1000 },
                  { value: 0, type: 'timing', duration: 700 },
                ],
              }}
              transition={{
                delay: circle.animationDelay,
                loop: true,
                repeatReverse: false,
              }}
              style={[
                styles.circle,
                {
                  width: circle.size,
                  height: circle.size,
                  borderWidth: 1,
                  borderColor: `${foregroundColor}${Math.round(circle.borderOpacity * 255)
                    .toString(16)
                    .padStart(2, '0')}`,
                  borderStyle: circle.borderStyle as any,
                  backgroundColor: `${foregroundColor}40`, // équivalent à 25% d'opacité
                  marginLeft: -circle.size / 2,
                  marginTop: -circle.size / 2,
                },
              ]}
            />
          ))}
        </View>
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    pointerEvents: 'none',
  },
  circlesContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    left: '50%',
    top: '45%',
    // Ombres pour iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    // Ombre pour Android
    elevation: 10,
  },
});

Ripple.displayName = 'Ripple';
