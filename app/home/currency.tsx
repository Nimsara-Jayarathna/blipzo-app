import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { SectionHeader } from '@/components/home/layout/SectionHeader';
import { useAppTheme } from '@/context/ThemeContext';

export default function CurrencySettingsScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.pageBg }]}>
            <View style={styles.headerWrapper}>
                <SectionHeader
                    title="Currency setting"
                    onBack={() => router.navigate('/home/profile')}
                    accessibilityLabel="Back to profile"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerWrapper: {
        paddingHorizontal: 0, // SectionHeader might handle its own padding or we adjusting layout wrapper
    },
});
