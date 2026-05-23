import React from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

/**
 * PhotoViewer — tam ekran fotoğraf görüntüleyici.
 * Props:
 *   visible  {boolean} — Modal görünürlüğü
 *   uri      {string}  — Fotoğraf URL/URI
 *   onClose  {fn}      — Kapat callback'i
 */
export default function PhotoViewer({ visible, uri, onClose }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar backgroundColor="#000000" barStyle="light-content" />
      <View style={styles.container}>
        {uri ? (
          <Image
            source={{ uri }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : null}

        {/* Kapat butonu — sağ üst köşe */}
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.8}
          style={[styles.closeBtn, { top: insets.top + 12 }]}
        >
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
