import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {
    View, Text, Animated, TouchableOpacity, StyleSheet, PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationsAPI } from '../../services/api';
import { navigationRef } from '../../navigation/navigationRef';

const SWIPE_THRESHOLD = 60;  // |dx| bu değeri geçerse swipe ile kapat
const AUTO_DISMISS_MS = 2500; // Her bildirim 2.5s görünür

export default function NotificationToast() {
    const { user } = useContext(AuthContext);
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    // FIFO queue: [{ id, title, message }, ...]
    const queueRef = useRef([]);
    const [current, setCurrent] = useState(null);
    const isShowingRef = useRef(false);
    const lastMaxIdRef = useRef(null);

    // Animasyon değerleri
    const translateY = useRef(new Animated.Value(-160)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const timerRef = useRef(null);

    // Bir sonraki bildirimi göster (queue'dan al)
    const showNext = useCallback(() => {
        if (queueRef.current.length === 0) {
            isShowingRef.current = false;
            setCurrent(null);
            return;
        }
        const next = queueRef.current.shift();
        setCurrent(next);
        isShowingRef.current = true;
        translateX.setValue(0);
        translateY.setValue(-160);

        // Yukarıdan aşağı slide-in
        Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            speed: 14,
            bounciness: 4,
        }).start();

        // Auto-dismiss
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => dismissCurrent(0), AUTO_DISMISS_MS);
    }, [translateY, translateX]);

    // Kapatma: yön (dx) verilirse o yöne kayarak çıkar, aksi halde yukarı
    const dismissCurrent = useCallback((dx = 0) => {
        clearTimeout(timerRef.current);
        const exitX = dx !== 0 ? (dx > 0 ? 400 : -400) : 0;
        const exitY = dx !== 0 ? 0 : -160;

        Animated.parallel([
            Animated.timing(translateX, {
                toValue: exitX,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: exitY,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setCurrent(null);
            isShowingRef.current = false;
            // Kısa gecikme ile sıradakini göster
            setTimeout(showNext, 150);
        });
    }, [translateX, translateY, showNext]);

    // Bildirimleri kuyruğa ekle ve gerekirse gösterime başla
    const enqueue = useCallback((notifs) => {
        notifs.forEach(n => queueRef.current.push(n));
        if (!isShowingRef.current) {
            showNext();
        }
    }, [showNext]);

    // PanResponder — sola/sağa swipe için
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy),
            onPanResponderMove: (_, gs) => {
                translateX.setValue(gs.dx);
            },
            onPanResponderRelease: (_, gs) => {
                if (Math.abs(gs.dx) > SWIPE_THRESHOLD) {
                    dismissCurrent(gs.dx);
                } else {
                    // Geri yerine getir
                    Animated.spring(translateX, {
                        toValue: 0,
                        useNativeDriver: true,
                        speed: 18,
                        bounciness: 6,
                    }).start();
                }
            },
        })
    ).current;

    // Bildirim polling
    useEffect(() => {
        if (!user?.id) return;

        const check = async () => {
            try {
                const res = await notificationsAPI.getAll(user.id);
                const arr = Array.isArray(res.data) ? res.data : [];
                if (arr.length === 0) return;

                const maxId = arr[0].id; // Backend desc sıralı — en yeni önce

                if (lastMaxIdRef.current === null) {
                    lastMaxIdRef.current = maxId;
                    return;
                }

                if (maxId > lastMaxIdRef.current) {
                    const newOnes = arr.filter(n => n.id > lastMaxIdRef.current && !n.is_read);
                    lastMaxIdRef.current = maxId;
                    if (newOnes.length > 0) {
                        // Eski → yeni sıralaması için ters çevir
                        enqueue([...newOnes].reverse());
                    }
                }
            } catch {}
        };

        check();
        const interval = setInterval(check, 10000);
        return () => {
            clearInterval(interval);
            clearTimeout(timerRef.current);
        };
    }, [user?.id, enqueue]);

    if (!current) return null;

    const iconName = current.type === 'message' ? 'chatbubble-ellipses' : 'notifications-outline';

    const handlePress = () => {
        // Bildirimi okundu işaretle
        notificationsAPI.markRead(current.id).catch(() => {});
        dismissCurrent(0);
        // İlgili ekrana yönlendir
        if (!navigationRef.isReady()) return;
        if (current.type === 'message' && current.related_user_id) {
            navigationRef.navigate('ChatScreen', {
                contactId: current.related_user_id,
                contactName: current.title,
            });
        } else if (current.type === 'task') {
            navigationRef.navigate('AppTabs', { screen: 'Tasks' });
        } else {
            navigationRef.navigate('Notifications');
        }
    };

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={[
                styles.banner,
                {
                    backgroundColor: colors.surface,
                    paddingTop: (insets.top || 0) + 12,
                    borderBottomColor: colors.primary,
                    transform: [{ translateY }, { translateX }],
                },
            ]}
        >
            <TouchableOpacity
                style={styles.pressArea}
                onPress={handlePress}
                activeOpacity={0.75}
            >
                <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft || colors.surface2 }]}>
                    <Ionicons name={iconName} size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
                        {current.title}
                    </Text>
                    <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>
                        {current.message}
                    </Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => dismissCurrent(0)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    banner: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 14,
        borderBottomWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 12,
    },
    pressArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrap: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontWeight: '700',
        fontSize: 13,
        marginBottom: 2,
    },
    message: {
        fontSize: 12,
        lineHeight: 16,
    },
    closeBtn: {
        padding: 6,
        marginLeft: 4,
    },
});

