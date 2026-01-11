import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

import { changePassword } from '@/api/auth';
import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/context/ThemeContext';

interface ChangePasswordSheetProps {
    visible: boolean;
    onClose: () => void;
}

export function ChangePasswordSheet({ visible, onClose }: ChangePasswordSheetProps) {
    const { colors } = useAppTheme();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            Alert.alert('Success', 'Password changed. Please check your email for confirmation.');
            onClose();
            setCurrentPassword('');
            setNewPassword('');
        },
        onError: () => {
            setErrorMessage('Failed to change password. Check your current password.');
        },
    });

    const handleSave = () => {
        if (!currentPassword || !newPassword) {
            setErrorMessage('Both fields are required.');
            return;
        }
        if (newPassword.length < 6) {
            setErrorMessage('New password must be at least 6 characters.');
            return;
        }
        setErrorMessage(null);
        mutation.mutate({ currentPassword, newPassword });
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <Pressable style={styles.backdrop} onPress={onClose} />
                <View style={[styles.sheet, { backgroundColor: colors.surface1 }]}>

                    <View style={styles.header}>
                        <ThemedText style={[styles.title, { color: colors.textMain }]}>Change Password</ThemedText>
                        <Pressable onPress={onClose} style={styles.closeBtn}>
                            <MaterialIcons name="close" size={24} color={colors.textMuted} />
                        </Pressable>
                    </View>

                    {errorMessage && (
                        <ThemedText style={{ color: '#ef4444', marginBottom: 16 }}>{errorMessage}</ThemedText>
                    )}

                    <View style={styles.field}>
                        <ThemedText style={[styles.label, { color: colors.textSubtle }]}>Current Password</ThemedText>
                        <TextInput
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry
                            style={[styles.input, { color: colors.textMain, backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                        />
                    </View>
                    <View style={styles.field}>
                        <ThemedText style={[styles.label, { color: colors.textSubtle }]}>New Password</ThemedText>
                        <TextInput
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            style={[styles.input, { color: colors.textMain, backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                        />
                    </View>

                    <Pressable
                        onPress={handleSave}
                        disabled={mutation.isPending}
                        style={({ pressed }) => [
                            styles.saveBtn,
                            { backgroundColor: colors.primaryAccent },
                            pressed && { opacity: 0.8 },
                        ]}
                    >
                        {mutation.isPending ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Update Password</ThemedText>
                        )}
                    </Pressable>

                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
    sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 20, fontWeight: 'bold' },
    closeBtn: { padding: 4 },
    field: { marginBottom: 20 },
    label: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
    input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, fontSize: 16 },
    saveBtn: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
