import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    Search,
    LayoutDashboard,
    UserSquare2,
    House,
    ClipboardList,
} from "lucide-react-native";

function AppTabs() {
    const insets = useSafeAreaInsets();

    const icones = {
        Profissionais: Search,
        Sessões: LayoutDashboard,
        Perfil: UserSquare2,
        Dashboard: House,
        Diário: ClipboardList,
    };

    return (
        <Tab.Navigator
            initialRouteName="Dashboard"
            screenOptions={({ route }) => ({
                headerShown: false,

                tabBarStyle: {
                    height: 75 + insets.bottom,
                    paddingTop: 8,
                    paddingBottom: 6 + insets.bottom,
                    backgroundColor: "#8B8B8B",
                    borderTopWidth: 0,
                },

                tabBarActiveTintColor: "#FFFFFF",
                tabBarInactiveTintColor: "rgba(255,255,255,0.65)",

                tabBarLabelStyle: {
                    fontFamily: "Poppins",
                    fontSize: 10,
                    fontWeight: "bold",
                    textAlign: "center",
                },

                tabBarIcon: ({ color }) => {
                    const Icone = icones[route.name];
                    return <Icone color={color} size={28} strokeWidth={2.2} />;
                },
            })}
        >
            <Tab.Screen
                name="Profissionais"
                component={Profissionais}
                options={{ tabBarLabel: "Procurar profissional" }}
            />
            <Tab.Screen name="Sessões" component={Sessoes} />
            <Tab.Screen name="Perfil" component={Perfil} />
            <Tab.Screen
                name="Dashboard"
                component={Dashboard}
                options={{ tabBarLabel: "Home" }}
            />
            <Tab.Screen name="Diário" component={Diario} />
        </Tab.Navigator>
    );
}