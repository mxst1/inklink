import { Link } from "expo-router";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
    StatusBar,
    Platform,
    useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ROSE = "#E8779A";
const ROSE_DARK = "#C45578";
const BG = "#0F0C12";
const SURFACE = "#1A1620";
const BORDER = "#2A2232";
const MUTED = "#7A6880";
const TEXT = "#F0EAF5";

export default function landing() {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === "web";
    const isWide = width >= 768;

    return (
        <View style={styles.root}>
            {!isWeb && <StatusBar barStyle="light-content" />}

            {/* ── Web wide: split layout ── */}
            {isWeb && isWide ? (
                <View style={styles.webWide}>
                    {/* Left — branding */}
                    <View style={styles.webLeft}>
                        <View style={styles.logoRow}>
                            <View style={styles.logoMark}>
                                <Text style={styles.logoEmoji}>✏️</Text>
                            </View>
                            <Text style={styles.appName}>InkLink</Text>
                        </View>
                        <Text style={styles.headlineWide}>
                            Draw with{"\n"}your friends.
                        </Text>
                        <Text style={styles.bodyWide}>
                            Share a link. Everyone joins the same canvas and draws together,
                            live.
                        </Text>
                    </View>

                    {/* Right — actions card */}
                    <View style={styles.webRight}>
                        <View style={styles.webCard}>
                            <Text style={styles.cardTitle}>Get started</Text>
                            <Text style={styles.cardSub}>
                                Free to use, no credit card needed.
                            </Text>
                            <View style={styles.cardActions}>
                                <Link href="/auth?mode=signup" asChild>
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.btnPrimary,
                                            pressed && styles.pressed,
                                        ]}
                                    >
                                        <Text style={styles.btnPrimaryText}>Create account</Text>
                                    </Pressable>
                                </Link>
                                <Link href="/auth?mode=login" asChild>
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.btnSecondary,
                                            pressed && styles.pressed,
                                        ]}
                                    >
                                        <Text style={styles.btnSecondaryText}>Sign in</Text>
                                    </Pressable>
                                </Link>
                                <View style={styles.dividerRow}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>or</Text>
                                    <View style={styles.dividerLine} />
                                </View>
                                <Link href="/create" asChild>
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.btnGhost,
                                            pressed && styles.pressed,
                                        ]}
                                    >
                                        <Text style={styles.btnGhostText}>Jump straight in →</Text>
                                    </Pressable>
                                </Link>
                            </View>
                        </View>
                    </View>
                </View>
            ) : (
                /* ── Mobile / web narrow: stacked layout ── */
                <View
                    style={[
                        styles.stack,
                        {
                            paddingTop: isWeb ? 48 : insets.top + 20,
                            paddingBottom: isWeb ? 48 : insets.bottom + 24,
                        },
                    ]}
                >
                    <View style={styles.logoRow}>
                        <View style={styles.logoMark}>
                            <Text style={styles.logoEmoji}>✏️</Text>
                        </View>
                        <Text style={styles.appName}>InkLink</Text>
                    </View>

                    <View style={styles.middle}>
                        <Text style={styles.headline}>Draw with{"\n"}your friends.</Text>
                        <Text style={styles.body}>
                            Share a link. Everyone joins the same canvas and draws together,
                            live.
                        </Text>
                    </View>

                    <View style={styles.actions}>
                        <Link href="/auth?mode=signup" asChild>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.btnPrimary,
                                    pressed && styles.pressed,
                                ]}
                            >
                                <Text style={styles.btnPrimaryText}>Create account</Text>
                            </Pressable>
                        </Link>
                        <Link href="/auth?mode=login" asChild>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.btnSecondary,
                                    pressed && styles.pressed,
                                ]}
                            >
                                <Text style={styles.btnSecondaryText}>Sign in</Text>
                            </Pressable>
                        </Link>
                        <Link href="/create" asChild>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.btnGhost,
                                    pressed && styles.pressed,
                                ]}
                            >
                                <Text style={styles.btnGhostText}>Jump straight in →</Text>
                            </Pressable>
                        </Link>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: BG,
    },

    // ── Web wide ──────────────────────────────
    webWide: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 80,
        gap: 80,
    },
    webLeft: {
        flex: 1,
        maxWidth: 480,
        gap: 24,
    },
    headlineWide: {
        fontSize: 64,
        fontWeight: "800",
        color: TEXT,
        letterSpacing: -2.5,
        lineHeight: 72,
    },
    bodyWide: {
        fontSize: 18,
        color: MUTED,
        lineHeight: 28,
    },
    webRight: {
        width: 360,
    },
    webCard: {
        backgroundColor: SURFACE,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: BORDER,
        padding: 32,
        gap: 8,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: TEXT,
        marginBottom: 2,
    },
    cardSub: {
        fontSize: 14,
        color: MUTED,
        marginBottom: 12,
    },
    cardActions: { gap: 10 },
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginVertical: 2,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: BORDER,
    },
    dividerText: {
        fontSize: 13,
        color: MUTED,
    },

    // ── Mobile / narrow ───────────────────────
    stack: {
        flex: 1,
        paddingHorizontal: 28,
        justifyContent: "space-between",
    },
    middle: { gap: 16 },
    headline: {
        fontSize: 52,
        fontWeight: "800",
        color: TEXT,
        letterSpacing: -2,
        lineHeight: 58,
    },
    body: {
        fontSize: 16,
        color: MUTED,
        lineHeight: 26,
    },
    actions: { gap: 10 },

    // ── Shared ────────────────────────────────
    logoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    logoMark: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: ROSE,
        justifyContent: "center",
        alignItems: "center",
    },
    logoEmoji: { fontSize: 18 },
    appName: {
        fontSize: 18,
        fontWeight: "700",
        color: TEXT,
        letterSpacing: -0.3,
    },
    btnPrimary: {
        backgroundColor: ROSE,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
    },
    btnPrimaryText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },
    btnSecondary: {
        backgroundColor: "transparent",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: BORDER,
    },
    btnSecondaryText: {
        color: TEXT,
        fontSize: 15,
        fontWeight: "600",
    },
    btnGhost: {
        paddingVertical: 12,
        alignItems: "center",
    },
    btnGhostText: {
        color: ROSE_DARK,
        fontSize: 14,
        fontWeight: "500",
    },
    pressed: { opacity: 0.65 },
});
