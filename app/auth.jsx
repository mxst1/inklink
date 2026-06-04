import { useState, useEffect } from "react";
import { Link } from "expo-router";
import {
	View,
	Text,
	TextInput,
	Pressable,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
	StatusBar,
	useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	interpolate,
} from "react-native-reanimated";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "../src/services/supabase/auth.js";
import { useAuth } from "../src/lib/AuthProvider.js";

const ROSE = "#E8779A";
const BG = "#0F0C12";
const SURFACE = "#1A1620";
const BORDER = "#2A2232";
const MUTED = "#7A6880";
const TEXT = "#F0EAF5";

export default function AuthScreen() {
	const { user, loading } = useAuth();

	useEffect(() => {
		if (loading) return;
		if (user) {
			router.replace("/dashboard");
		}
	}, [user, loading]);

	if (loading) {
		return (
			<View style={{ flex: 1, backgroundColor: BG, alignItems: "center", justifyContent: "center" }}>
				<Text style={{ color: TEXT, fontSize: 18, fontWeight: "600" }}>
					Loading...
				</Text>
			</View>
		);
	}

	const insets = useSafeAreaInsets();
	const { width } = useWindowDimensions();

	const isWeb = Platform.OS === "web";
	const isWide = width >= 768;

	const { mode } = useLocalSearchParams();

	const startLogin = mode == "login";

	const [isLogin, setIsLogin] = useState(startLogin);

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const rotation = useSharedValue(startLogin ? 0 : 180);
	const sliderX = useSharedValue(startLogin ? 0 : 1.6167);

	const switchMode = () => {
		const next = !isLogin;

		setIsLogin(next);

		sliderX.value = withTiming(next ? 0 : 1.6167, {
			duration: 350,
		});

		rotation.value = withTiming(next ? 0 : 180, {
			duration: 700,
		});

		setTimeout(() => {
			router.replace({
				pathname: "/auth",
				params: {
					mode: next ? "login" : "signup",
				},
			});
		}, 700);
	};

	const sliderStyle = useAnimatedStyle(() => ({
		transform: [
			{
				translateX: interpolate(sliderX.value, [0, 1], [0, 130]),
			},
		],
	}));

	const loginStyle = useAnimatedStyle(() => {
		const opacity = interpolate(rotation.value, [0, 80, 100], [1, 0, 0]);
		const scale = interpolate(rotation.value, [0, 90, 180], [1, 0.95, 1]);

		return {
			opacity,
			transform: [
				{ perspective: 1200 },
				{ rotateY: `${rotation.value}deg` },
				{ scale },
			],
		};
	});

	const signupStyle = useAnimatedStyle(() => {
		const opacity = interpolate(rotation.value, [80, 100, 180], [0, 0, 1]);
		const scale = interpolate(rotation.value, [0, 90, 180], [1, 0.95, 1]);

		return {
			opacity,
			position: "absolute",
			width: "100%",
			transform: [
				{ perspective: 1200 },
				{ rotateY: `${rotation.value + 180}deg` },
				{ scale },
			],
		};
	});

	const signIn = async () => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			alert(error.message);
			return;
		}

		router.replace("/dashboard");
	};

	const signUp = async () => {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					name,
				},
			},
		});

		if (error) {
			alert(error.message);
			return;
		}

		const userId = data?.user?.id;

		if (!userId) {
			alert("Signup succeeded but user is missing.");
			return;
		}

		const { error: profileError } = await supabase.from("profiles").insert({
			id: userId,
			name,
		});

		if (profileError) {
			console.log("Profile insert error:", profileError.message);
		}

		alert("Account created!");
		router.replace("/dashboard");
	};

	const loginForm = (
		<View>
			<Text style={styles.title}>Welcome back</Text>
			<Text style={styles.subtitle}>Sign in to continue collaborating.</Text>

			<View style={styles.field}>
				<Text style={styles.label}>Email</Text>
				<TextInput
					style={styles.input}
					placeholder="you@example.com"
					placeholderTextColor={MUTED}
					value={email}
					onChangeText={setEmail}
				/>
			</View>

			<View style={styles.field}>
				<Text style={styles.label}>Password</Text>
				<TextInput
					style={styles.input}
					placeholder="Password"
					placeholderTextColor={MUTED}
					secureTextEntry
					value={password}
					onChangeText={setPassword}
				/>
			</View>

			<Pressable style={styles.primaryButton} onPress={signIn}>
				<Text style={styles.primaryButtonText}>Log In</Text>
			</Pressable>
		</View>
	);

	const signupForm = (
		<View>
			<Text style={styles.title}>Create account</Text>
			<Text style={styles.subtitle}>
				Start drawing with friends and save your work.
			</Text>

			<View style={styles.field}>
				<Text style={styles.label}>Name</Text>
				<TextInput
					style={styles.input}
					placeholder="Your name"
					placeholderTextColor={MUTED}
					value={name}
					onChangeText={setName}
				/>
			</View>

			<View style={styles.field}>
				<Text style={styles.label}>Email</Text>
				<TextInput
					style={styles.input}
					placeholder="you@example.com"
					placeholderTextColor={MUTED}
					value={email}
					onChangeText={setEmail}
				/>
			</View>

			<View style={styles.field}>
				<Text style={styles.label}>Password</Text>
				<TextInput
					style={styles.input}
					placeholder="Create password"
					placeholderTextColor={MUTED}
					secureTextEntry
					value={password}
					onChangeText={setPassword}
				/>
			</View>

			<Pressable style={styles.primaryButton} onPress={signUp}>
				<Text style={styles.primaryButtonText}>Create Account</Text>
			</Pressable>
		</View>
	);

	const content = (
		<View style={styles.inner}>
			<Link href="/" asChild>
				<Pressable style={styles.backBtn}>
					<Text style={styles.backText}>← Home</Text>
				</Pressable>
			</Link>

			<View style={styles.toggle}>
				<Animated.View style={[styles.slider, sliderStyle]} />

				<Pressable style={styles.tab} onPress={() => isLogin || switchMode()}>
					<Text style={[styles.tabText, isLogin && styles.activeTabText]}>
						Login
					</Text>
				</Pressable>

				<Pressable style={styles.tab} onPress={() => !isLogin || switchMode()}>
					<Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
						Sign Up
					</Text>
				</Pressable>
			</View>

			<View style={styles.cardContainer}>
				<Animated.View
					pointerEvents={isLogin ? "auto" : "none"}
					style={[styles.card, loginStyle]}
				>
					{loginForm}
				</Animated.View>

				<Animated.View
					pointerEvents={!isLogin ? "auto" : "none"}
					style={[styles.card, signupStyle]}
				>
					{signupForm}
				</Animated.View>
			</View>
		</View>
	);

	if (isWeb && isWide) {
		return (
			<View style={styles.root}>
				<View style={styles.webWrap}>
					<View style={styles.webCard}>{content}</View>
				</View>
			</View>
		);
	}

	return (
		<KeyboardAvoidingView
			style={styles.root}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<StatusBar barStyle="light-content" />
			<View
				style={[
					styles.mobileWrap,
					{
						paddingTop: insets.top + 16,
						paddingBottom: insets.bottom + 24,
					},
				]}
			>
				{content}
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: BG,
	},

	webWrap: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 40,
	},

	webCard: {
		width: "100%",
		maxWidth: 520,
		backgroundColor: SURFACE,
		borderRadius: 24,
		borderWidth: 1,
		borderColor: BORDER,
		padding: 40,
	},

	mobileWrap: {
		flex: 1,
		paddingHorizontal: 24,
	},

	inner: {
		flex: 1,
		justifyContent: "center",
	},

	backBtn: {
		alignSelf: "flex-start",
		width: 50,
	},
	backText: {
		color: MUTED,
		fontSize: 15,
		fontWeight: "600",
		marginBottom: 24,
	},

	toggle: {
		flexDirection: "row",
		backgroundColor: BG,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: BORDER,
		padding: 4,
		marginBottom: 28,
	},

	tab: {
		flex: 1,
		paddingVertical: 12,
		alignItems: "center",
		borderRadius: 8,
	},

	activeTab: {
		backgroundColor: ROSE,
	},

	tabText: {
		color: MUTED,
		fontWeight: "700",
	},

	activeTabText: {
		color: "#fff",
	},

	cardContainer: {
		height: 450,
		position: "relative",
	},

	card: {
		width: "100%",
		backfaceVisibility: "hidden",
	},

	title: {
		fontSize: 34,
		fontWeight: "800",
		color: TEXT,
		marginBottom: 8,
	},

	subtitle: {
		fontSize: 15,
		color: MUTED,
		lineHeight: 22,
		marginBottom: 24,
	},

	field: {
		marginBottom: 16,
	},

	label: {
		color: MUTED,
		fontSize: 13,
		fontWeight: "700",
		marginBottom: 8,
		textTransform: "uppercase",
	},

	input: {
		backgroundColor: BG,
		borderWidth: 1,
		borderColor: BORDER,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
		color: TEXT,
		fontSize: 16,
	},

	primaryButton: {
		backgroundColor: ROSE,
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: "center",
		marginTop: 8,
	},

	primaryButtonText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
	},
	slider: {
		position: "absolute",
		top: 4,
		bottom: 4,
		left: 4,
		width: "50%",
		backgroundColor: ROSE,
		borderRadius: 8,
	},
});
