import { AuthProvider, useAuth } from "./src/lib/AuthProvider";
import Dashboard from "./app/dashboard";
import Landing from "./app/landing";
import { View, Text } from "react-native";

const BG = "#0F0C12";
const TEXT = "#F0EAF5";

function AppContent() {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<View
				style={{
					flex: 1,
					backgroundColor: BG,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<Text style={{ color: TEXT, fontSize: 18, fontWeight: "600" }}>
					Loading...
				</Text>
			</View>
		);
	}

	return user ? <Dashboard /> : <Landing />;
}

export default function App() {
	return <AppContent />;
}
