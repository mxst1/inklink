import { useState, useEffect } from "react";
import {
	View,
	Text,
	Pressable,
	StyleSheet,
	FlatList,
	useWindowDimensions,
	Platform,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../src/services/supabase/auth";
import { useAuth } from "../src/lib/AuthProvider";

const ROSE = "#E8779A";
const BG = "#0F0C12";
const SURFACE = "#1A1620";
const BORDER = "#2A2232";
const MUTED = "#7A6880";
const TEXT = "#F0EAF5";

export default function DashboardScreen() {
	const { width } = useWindowDimensions();

	const columns = width > 1400 ? 4 : width > 1000 ? 3 : width > 650 ? 2 : 1;
	const { user, loading: userLoading } = useAuth();

	useEffect(() => {
		if (userLoading) return;
		if (!user) {
			router.replace("/auth");
		}
	}, [user, userLoading]);

	if (userLoading) {
		return (
			<View style={{ flex: 1, backgroundColor: BG, alignItems: "center", justifyContent: "center" }}>
				<Text style={{ color: TEXT, fontSize: 18, fontWeight: "600" }}>
					Loading...
				</Text>
			</View>
		);
	}

	// Replace with Supabase data later
	const [drawings, setDrawings] = useState([]);
	const [loading, setLoading] = useState(true);

	const loadDrawings = async () => {
		try {
			setLoading(true);

			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				setLoading(false);
				return;
			}

			const { data, error } = await supabase
				.from("drawings")
				.select(
					`
		*,
		participants:drawing_participants (
			user_id,
			role
		)
	`,
				)
				.order("updated_at", {
					ascending: false,
				});

			if (error) {
				console.error(error);
				setLoading(false);
				return;
			}

			setDrawings(data ?? []);
			setLoading(false);
		} catch (err) {
			console.error("Failed to load drawings:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadDrawings();
	}, []);

	const DrawingCard = ({ drawing }) => {
		const [hovered, setHovered] = useState(false);

		return (
			<Pressable
				style={styles.card}
				onPress={() => router.push(`/canvas?id=${drawing.id}`)}
				onHoverIn={() => setHovered(true)}
				onHoverOut={() => setHovered(false)}
			>
				<View style={styles.thumbnail} />

				<View style={styles.cardContent}>
					<Text style={styles.cardTitle}>{drawing.name}</Text>

					<Text style={styles.cardTime}>
						Edited: {new Date(drawing.updated_at).toLocaleDateString()}
					</Text>

					<View style={styles.participantRow}>
						<Pressable style={styles.participantBadge}>
							<Text style={styles.participantText}>
								👥 {drawing.participants.length}
							</Text>
						</Pressable>

						{Platform.OS === "web" && hovered && (
							<View style={styles.tooltip}>
								{drawing.participants.map((person) => (
									<Text key={person.user_id} style={styles.tooltipText}>
										{person.user_id}
									</Text>
								))}
							</View>
						)}
					</View>
				</View>
			</Pressable>
		);
	};

	const EmptyState = () => (
		<View style={styles.emptyState}>
			<Text style={styles.emptyIcon}>🎨</Text>

			<Text style={styles.emptyTitle}>Create your first drawing</Text>

			<Text style={styles.emptyText}>
				Start a shared canvas and invite your friends.
			</Text>

			<Pressable
				style={styles.primaryButton}
				onPress={() => router.push("/create")}
			>
				<Text style={styles.primaryButtonText}>New Drawing</Text>
			</Pressable>
		</View>
	);

	return (
		<View style={styles.root}>
			<View style={styles.nav}>
				<Text style={styles.logo}>InkLink</Text>

				<View style={styles.navRight}>
					<Pressable
						style={styles.newButton}
						onPress={() => router.push("/create")}
					>
						<Text style={styles.newButtonText}>+ New</Text>
					</Pressable>

					<Pressable style={styles.avatar}>
						<Text style={styles.avatarText}>K</Text>
					</Pressable>
				</View>
			</View>

			<View style={styles.content}>
				{drawings.length === 0 ? (
					<EmptyState />
				) : (
					<FlatList
						data={drawings}
						key={columns}
						numColumns={columns}
						contentContainerStyle={styles.grid}
						columnWrapperStyle={columns > 1 ? styles.columnWrapper : undefined}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => <DrawingCard drawing={item} />}
					/>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: BG,
	},

	nav: {
		height: 82,
		backgroundColor: SURFACE,
		borderBottomWidth: 1,
		borderBottomColor: BORDER,
		paddingHorizontal: 32,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},

	logo: {
		color: TEXT,
		fontSize: 32,
		fontWeight: "800",
	},

	navRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
	},

	newButton: {
		backgroundColor: ROSE,
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 12,
	},

	newButtonText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 15,
	},

	avatar: {
		width: 46,
		height: 46,
		borderRadius: 23,
		backgroundColor: "#241D2C",
		borderWidth: 1,
		borderColor: BORDER,
		alignItems: "center",
		justifyContent: "center",
	},

	avatarText: {
		color: TEXT,
		fontWeight: "700",
		fontSize: 18,
	},

	content: {
		flex: 1,
		padding: 32,
	},

	grid: {
		paddingBottom: 40,
	},

	columnWrapper: {
		gap: 24,
		marginBottom: 24,
	},

	card: {
		flex: 1,
		backgroundColor: SURFACE,
		borderRadius: 18,
		borderWidth: 1,
		borderColor: BORDER,
		overflow: "hidden",
		maxWidth: 420,
	},

	thumbnail: {
		height: 180,
		backgroundColor: "#241D2C",
	},

	cardContent: {
		padding: 16,
	},

	cardTitle: {
		color: TEXT,
		fontSize: 18,
		fontWeight: "700",
	},

	cardTime: {
		color: MUTED,
		fontSize: 13,
		marginTop: 4,
	},

	participantRow: {
		marginTop: 14,
		alignSelf: "flex-start",
		position: "relative",
	},

	participantBadge: {
		backgroundColor: BG,
		borderWidth: 1,
		borderColor: BORDER,
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 20,
	},

	participantText: {
		color: TEXT,
		fontSize: 12,
		fontWeight: "600",
	},

	tooltip: {
		position: "absolute",
		top: 40,
		left: 0,
		backgroundColor: SURFACE,
		borderWidth: 1,
		borderColor: BORDER,
		borderRadius: 10,
		padding: 10,
		minWidth: 120,
		zIndex: 999,
	},

	tooltipText: {
		color: TEXT,
		marginBottom: 4,
	},

	emptyState: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},

	emptyIcon: {
		fontSize: 60,
		marginBottom: 12,
	},

	emptyTitle: {
		color: TEXT,
		fontSize: 30,
		fontWeight: "800",
		marginBottom: 8,
	},

	emptyText: {
		color: MUTED,
		fontSize: 16,
		marginBottom: 24,
		textAlign: "center",
	},

	primaryButton: {
		backgroundColor: ROSE,
		paddingHorizontal: 24,
		paddingVertical: 14,
		borderRadius: 12,
	},

	primaryButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "700",
	},
});
