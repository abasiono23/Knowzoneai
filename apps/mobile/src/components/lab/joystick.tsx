import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, type GestureResponderEvent } from 'react-native';

/**
 * A round on-screen joystick. Reports a direction (each axis -1..1) while held, and {0, 0} when let go.
 */
export function Joystick({ size = 120, onMove }: { size?: number; onMove: (v: { x: number; y: number }) => void }) {
  const { t } = useTranslation('lab');
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const centre = useRef({ x: 0, y: 0 });
  const r = size / 2;

  const update = (e: GestureResponderEvent) => {
    const dx = e.nativeEvent.pageX - centre.current.x;
    const dy = e.nativeEvent.pageY - centre.current.y;
    const len = Math.hypot(dx, dy);
    const max = r * 0.6;
    const k = len > max ? max / len : 1;
    setKnob({ x: dx * k, y: dy * k });
    onMove({ x: (dx * k) / max, y: (dy * k) / max });
  };
  const release = () => {
    setKnob({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  };

  return (
    <View
      accessibilityLabel={t('hall.joystick')}
      style={[styles.base, { width: size, height: size, borderRadius: r }]}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={(e) => {
        const { pageX, pageY, locationX, locationY } = e.nativeEvent;
        // The centre on screen, from where the touch landed inside the base.
        centre.current = { x: pageX - locationX + r, y: pageY - locationY + r };
        update(e);
      }}
      onResponderMove={update}
      onResponderRelease={release}
      onResponderTerminate={release}>
      <View
        pointerEvents="none"
        style={[
          styles.knob,
          {
            width: size * 0.42,
            height: size * 0.42,
            borderRadius: size * 0.21,
            transform: [{ translateX: knob.x }, { translateY: knob.y }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16,20,48,0.55)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  knob: { backgroundColor: 'rgba(124,92,255,0.85)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)' },
});
