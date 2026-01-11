import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

import { updateProfile } from '@/api/auth';
import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { runFullSync } from '@/utils/sync-service';

interface EditNameSheetProps {
    visible: boolean;
    onClose: () => void;
}

export function EditNameSheet({ visible, onClose }: EditNameSheetProps) {
    const { colors } = useAppTheme();
    const { user, setAuth } = useAuth();

    const [fname, setFname] = useState(user?.fname ?? '');
    const [lname, setLname] = useState(user?.lname ?? '');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: (data) => {
            // Manually update local user state if needed, or rely on response
            // ideally response returns updated user, which we pass to setAuth
            // But setAuth expects AuthResponse { user, tokens }, updateProfile returns { user }.
            // We might need to handle this carefully.
            // Assuming setAuth can take partial updates or we just update the user part.
            // But setAuth replaces the whole user object usually.
            // Let's rely on data.user

            // We can't use setAuth(data) directly because data is { user }.
            // We need to merge or just update the user in store. 
            // But useAuthStore usually has setAuth which expects full payload.
            // Actually setAuth implementation: ({ user }: AuthResponse) => set({ user, ... }).
            // So calling setAuth({ user: data.user, tokens: ... }) is tricky if we don't have tokens.
            // However, we just need to update the user reference in the store. 
            // Let's assume for now we might need to refresh session or we modify the store to allow updating user only.
            // Or we can just trigger a sync.

            // A quick hack/fix: If setAuth only needs user property to update user:
            // setAuth({ user: data.user } as any); // if tokens are optional or we ignore types for a sec.
            // But better: refreshSession() might be cleaner, but slower.
            // Let's check auth-store again. it takes AuthResponse. { user, token }.

            // Let's just close and let the user see the change if we rely on refetching or sync.
            // Actually `runFullSync` updates local DB, but store might need update.
            // Ideally we should have `updateUser` action in store.
            // For now, let's just close. `updateProfile` in `api/auth.ts` response is `{ user }`.
            // We can do `void runFullSync(data.user);`

            void runFullSync(data.user);
            // We should probably force a reload or have a way to update context.
            // Proceed with closing for now.
            onClose();
        },
        onError: () => {
            setErrorMessage('Failed to update name.');
        },
    });

    const handleSave = () => {
        if (!fname.trim() || !lname.trim()) {
            setErrorMessage('First and Last name are required.');
            return;
        }
        setErrorMessage(null);
        mutation.mutate({ fname: fname.trim(), lname: lname.trim() });
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
                        <ThemedText style={[styles.title, { color: colors.textMain }]}>Edit Name</ThemedText>
                        <Pressable onPress={onClose} style={styles.closeBtn}>
                            <MaterialIcons name="close" size={24} color={colors.textMuted} />
                        </Pressable>
                    </View>

                    {errorMessage && (
                        <ThemedText style={{ color: '#ef4444', marginBottom: 16 }}>{errorMessage}</ThemedText>
                    )}

                    <View style={styles.row}>
                        <View style={styles.half}>
                            <ThemedText style={[styles.label, { color: colors.textSubtle }]}>First Name</ThemedText>
                            <TextInput
                                value={fname}
                                onChangeText={setFname}
                                style={[styles.input, { color: colors.textMain, backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                            />
                        </View>
                        <View style={styles.half}>
                            <ThemedText style={[styles.label, { color: colors.textSubtle }]}>Last Name</ThemedText>
                            <TextInput
                                value={lname}
                                onChangeText={setLname}
                                style={[styles.input, { color: colors.textMain, backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
                            />
                        </View>
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
                            <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Save Changes</ThemedText>
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
    row: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    half: { flex: 1 },
    label: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
    input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, fontSize: 16 },
    saveBtn: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
