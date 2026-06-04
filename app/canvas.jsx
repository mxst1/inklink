import { Link } from "expo-router";
import {
	View,
	Text,
	Pressable,
	StyleSheet,
	StatusBar,
	Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ROSE = "#E8779A";
const ROSE_DARK = "#C45578";
const BG = "#0F0C12";
const SURFACE = "#1A1620";
const BORDER = "#2A2232";
const MUTED = "#7A6880";
const TEXT = "#F0EAF5";

export default function CanvasScreen() {
	const insets = useSafeAreaInsets();

	return (
		<View
			style={[
				styles.root,
				{
					paddingTop: Platform.OS === "web" ? 24 : insets.top,
					paddingBottom: Platform.OS === "web" ? 24 : insets.bottom,
				},
			]}
		>
			<StatusBar barStyle="light-content" />

			{/* Header */}
			<View style={styles.header}>
				<Link href="/" asChild>
					<Pressable style={styles.backBtn}>
						<Text style={styles.backText}>← Home</Text>
					</Pressable>
				</Link>

				<Pressable style={styles.shareBtn}>
					<Text style={styles.shareText}>Share</Text>
				</Pressable>
			</View>

			{/* Canvas Info */}
			<View style={styles.info}>
				<Text style={styles.title}>Untitled Drawing</Text>
				<Text style={styles.subtitle}>3 people connected</Text>
			</View>

			{/* Drawing Surface */}
			<View style={styles.canvas}>
				<Text style={styles.canvasHint}>
					Your collaborative canvas goes here
				</Text>
			</View>

			{/* Toolbar */}
			<View style={styles.toolbar}>
				<Pressable style={styles.tool}>
					<Text style={styles.toolIcon}>✏️</Text>
				</Pressable>

				<Pressable style={styles.tool}>
					<Text style={styles.toolIcon}>🖍️</Text>
				</Pressable>

				<Pressable style={styles.tool}>
					<Text style={styles.toolIcon}>🧽</Text>
				</Pressable>

				<Pressable style={styles.tool}>
					<Text style={styles.toolIcon}>↶</Text>
				</Pressable>

				<Pressable style={styles.tool}>
					<Text style={styles.toolIcon}>↷</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: BG,
		paddingHorizontal: 20,
	},

	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 24,
	},

	backBtn: {
		paddingVertical: 8,
	},

	backText: {
		color: MUTED,
		fontSize: 15,
		fontWeight: "600",
	},

	shareBtn: {
		backgroundColor: ROSE,
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 10,
	},

	shareText: {
		color: "#fff",
		fontWeight: "700",
	},

	info: {
		marginBottom: 20,
	},

	title: {
		color: TEXT,
		fontSize: 28,
		fontWeight: "800",
		marginBottom: 4,
	},

	subtitle: {
		color: MUTED,
		fontSize: 14,
	},

	canvas: {
		flex: 1,
		backgroundColor: SURFACE,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: BORDER,
		justifyContent: "center",
		alignItems: "center",
	},

	canvasHint: {
		color: MUTED,
		fontSize: 16,
	},

	toolbar: {
		marginTop: 20,
		flexDirection: "row",
		justifyContent: "space-between",
		backgroundColor: SURFACE,
		borderWidth: 1,
		borderColor: BORDER,
		borderRadius: 16,
		padding: 12,
	},

	tool: {
		width: 52,
		height: 52,
		borderRadius: 12,
		backgroundColor: BG,
		alignItems: "center",
		justifyContent: "center",
	},

	toolIcon: {
		fontSize: 22,
	},
});