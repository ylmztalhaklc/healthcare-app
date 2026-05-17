import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationsAPI } from '../../services/api';

export default function NotificationToast() {
    const { user } = useContext(AuthContext);
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    const [banner, setBanner] = useState(null); // { title, message }
    const translateY = useRef(new Animated.Value(-160)).current;
    const lastMaxIdRef = useRef(null);
    const timerRef = useRef(null);
    const isShowingRef = useRef(false);

    const hideBanner = () => {
        Animated.timing(translateY, {
            toValue: -160,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setBanner(null);
            isShowingRef.current = false;
        });
    };

    const showBanner = (notif) => {
        setBanner({ title: notif.title || 'Bildirim', message: notif.message });
        isShowingRef.current = true;
        // Reset position before animating in (handles case where previous was dismissing)
        translateY.setValue(-160);
        Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            speed: 14,
            bounciness: 4,
        }).start();
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(hideBanner, 4500);
    };

    useEffect(() => {
        if (!user?.id) return;

        const check = async () => {
            try {
                const res = await notificationsAPI.getAll(user.id);
                const arr = Array.isArray(res.data) ? res.data : [];
                if (arr.length === 0) return;

                // Backend returns sorted desc — arr[0] is newest
                const maxId = arr[0].id;

                if (lastMaxIdRef.current === null) {
                    // First load — remember current state, don't show banner for existing notifications
                    lastMaxIdRef.current = maxId;
                    return;
                }

                if (maxId > lastMaxIdRef.current) {
                    // New notifications arrived since last check
                    const newOnes = arr.filter(n => n.id > lastMaxIdRef.current && !n.is_read);
                    lastMaxIdRef.current = maxId;
                    if (newOnes.length > 0) {
                        showBanner(newOnes[0]);
                    }
                }
            } catch {}
        };

        // Check immediately, then every 10 seconds
        check();
        const interval = setInterval(check, 10000);
        return () => {
            clearInterval(interval);
            clearTimeout(timerRef.current);
        };
    }, [user?.id]);

    if (!banner) return null;

    return (
        <Animated.View
            style={[
                styles.banner,
                {
                    backgroundColor: colors.surface,
                    paddingTop: (insets.top || 0) + 12,
                    borderBottomColor: colors.primary,
                    transform: [{ translateY }],
                },
            ]}
        >
            <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft || colors.surface2 }]}>
                <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
                    {banner.title}
                </Text>
                <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>
                    {banner.message}
                </Text>
            </View>
            <TouchableOpacity onPress={hideBanner} style={styles.closeBtn}>
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
