import { Stack } from "expo-router";
import { Text, View } from "react-native";
import { useAuth, AuthProvider } from "../src/lib/AuthProvider";

export default function RootLayout() {
	return (
		<AuthProvider>
			<RootLayoutContent />
		</AuthProvider>
	);
}

	function RootLayoutContent() {
	const { user, loading } = useAuth();

	return (
		<>
			{loading ? (
				<View
					style={{
						flex: 1,
						backgroundColor: "#12061f",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Text style={{ color: "#F0EAF5", fontSize: 18, fontWeight: "600" }}>
						Loading...
					</Text>
				</View>
			) : (
				<Stack
					screenOptions={{
						headerShown: false,
						contentStyle: { backgroundColor: "#12061f" },
					}}
				>
					<Stack.Screen name="index" />
					<Stack.Screen name="auth" />
					<Stack.Screen name="dashboard" />
					<Stack.Screen name="create" />
					<Stack.Screen name="canvas" />
					<Stack.Screen name="landing" />
				</Stack>
			)}
		</>
	);
}
