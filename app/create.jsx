import { Link, router } from "expo-router";
import {
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
	StatusBar,
	Platform,
	useWindowDimensions,
	KeyboardAvoidingView,
} from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../src/services/supabase/auth";

const ROSE = "#E8779A";
const ROSE_DARK = "#C45578";
const BG = "#0F0C12";
const SURFACE = "#1A1620";
const BORDER = "#2A2232";
const MUTED = "#7A6880";
const TEXT = "#F0EAF5";

const PRESET_TITLES = [
	"Game night",
	"Brainstorm",
	"Just for fun",
	"Art session",
];

export default function CreateScreen() {
	const insets = useSafeAreaInsets();
	const { width } = useWindowDimensions();
	const isWeb = Platform.OS === "web";
	const isWide = width >= 768;
	const [title, setTitle] = useState("");

	const createDrawing = async (title) => {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) return;
		console.log({
			owner_id: user.id,
			name: title,
		});

		const { data: drawing, error: drawingError } = await supabase
			.from("drawings")
			.insert({
				owner_id: user.id,
				name: title,
			})
			.select()
			.single();

		if (drawingError) {
			console.log(JSON.stringify(drawingError, null, 2));
			return;
		}

		const { error: participantError } = await supabase
			.from("drawing_participants")
			.insert({
				drawing_id: drawing.id,
				user_id: user.id,
				role: "owner",
			});

		if (participantError) {
			console.error("Participant creation failed:", participantError);
			return;
		}

		router.push(`/canvas/${drawing.id}`);
	};

	const inner = (
		<View style={styles.inner}>
			{/* Back */}
			<Link href="/" asChild>
				<Pressable
					style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
				>
					<Text style={styles.backArrow}>←</Text>
					<Text style={styles.backLabel}>Home</Text>
				</Pressable>
			</Link>

			{/* Heading */}
			<View style={styles.heading}>
				<Text style={styles.title}>New canvas</Text>
				<Text style={styles.subtitle}>
					Give it a name, then share the link with whoever you want to draw
					with.
				</Text>
			</View>

			{/* Title input */}
			<View style={styles.field}>
				<Text style={styles.fieldLabel}>Canvas name</Text>
				<TextInput
					style={styles.input}
					placeholder="Untitled drawing"
					placeholderTextColor={MUTED}
					value={title}
					onChangeText={setTitle}
					maxLength={60}
					returnKeyType="done"
					selectionColor={ROSE}
				/>
				{/* Quick-pick presets */}
				<View style={styles.presets}>
					{PRESET_TITLES.map((p) => (
						<Pressable
							key={p}
							style={({ pressed }) => [
								styles.preset,
								pressed && styles.pressed,
							]}
							onPress={() => setTitle(p)}
						>
							<Text style={styles.presetText}>{p}</Text>
						</Pressable>
					))}
				</View>
			</View>

			{/* Info row */}
			<View style={styles.infoRow}>
				{["Up to 8 people", "Saves automatically", "Rejoins anytime"].map(
					(item) => (
						<View key={item} style={styles.infoItem}>
							<View style={styles.infoDot} />
							<Text style={styles.infoText}>{item}</Text>
						</View>
					),
				)}
			</View>

			{/* CTA */}
			<View style={styles.ctas}>
				<Pressable
					style={({ pressed }) => [
						styles.btnPrimary,
						pressed && styles.pressed,
					]}
					onPress={() => createDrawing(title)}
				>
					<Text style={styles.btnPrimaryText}>Create & get link →</Text>
				</Pressable>
			</View>
		</View>
	);

	// Web wide — centered card
	if (isWeb && isWide) {
		return (
			<View style={styles.root}>
				<View style={styles.webWrap}>
					<View style={styles.webCard}>{inner}</View>
				</View>
			</View>
		);
	}

	// Mobile / narrow web — full screen
	return (
		<KeyboardAvoidingView
			style={styles.root}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			{!isWeb && <StatusBar barStyle="light-content" />}
			<View
				style={[
					styles.mobileWrap,
					{
						paddingTop: isWeb ? 48 : insets.top + 16,
						paddingBottom: isWeb ? 48 : insets.bottom + 24,
					},
				]}
			>
				{inner}
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: BG,
	},

	// Web wide wrapper
	webWrap: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 40,
	},
	webCard: {
		backgroundColor: SURFACE,
		borderRadius: 24,
		borderWidth: 1,
		borderColor: BORDER,
		padding: 40,
		width: "100%",
		maxWidth: 520,
	},

	// Mobile wrapper
	mobileWrap: {
		flex: 1,
		paddingHorizontal: 24,
	},

	// Shared inner layout
	inner: {
		flex: 1,
		gap: 28,
		justifyContent: "space-between",
	},

	// Back button
	backBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		alignSelf: "flex-start",
	},
	backArrow: { fontSize: 18, color: MUTED },
	backLabel: { fontSize: 15, color: MUTED, fontWeight: "500" },

	// Heading
	heading: { gap: 8 },
	title: {
		fontSize: 34,
		fontWeight: "800",
		color: TEXT,
		letterSpacing: -1,
	},
	subtitle: {
		fontSize: 15,
		color: MUTED,
		lineHeight: 22,
	},

	// Input field
	field: { gap: 10 },
	fieldLabel: {
		fontSize: 13,
		fontWeight: "600",
		color: MUTED,
		textTransform: "uppercase",
		letterSpacing: 0.6,
	},
	input: {
		backgroundColor: BG,
		borderWidth: 1,
		borderColor: BORDER,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 17,
		color: TEXT,
		fontWeight: "500",
	},
	presets: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	preset: {
		backgroundColor: SURFACE,
		borderRadius: 20,
		paddingHorizontal: 14,
		paddingVertical: 7,
		borderWidth: 1,
		borderColor: BORDER,
	},
	presetText: {
		fontSize: 13,
		color: MUTED,
		fontWeight: "500",
	},

	// Info row
	infoRow: {
		gap: 10,
	},
	infoItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	infoDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: ROSE,
	},
	infoText: {
		fontSize: 14,
		color: MUTED,
	},

	// CTA
	ctas: { gap: 10 },
	btnPrimary: {
		backgroundColor: ROSE,
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: "center",
	},
	btnPrimaryText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "700",
	},

	pressed: { opacity: 0.65 },
});
