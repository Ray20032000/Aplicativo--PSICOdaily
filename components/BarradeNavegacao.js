import { View, Text, Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ABAS = {
    Procurar: { icone: "magnify", texto: "Procurar profissional" },
    Sessoes: { icone: "view-quilt-outline", texto: "Sessões" },
    Perfil: { icone: "account-box-outline", texto: "Perfil" },
    Home: { icone: "home-outline", texto: "Home" },
    Diario: { icone: "clipboard-text-outline", texto: "Diário" },
};

export default function BarraNavegacao({ state, navigation }) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.barra, { paddingBottom: insets.bottom + 6 }]}>
            {state.routes.map((route, index) => {
                const aba = ABAS[route.name];
                if (!aba) return null;

                const focado = state.index === index;

                const aoPressionar = () => {
                    const evento = navigation.emit({
                        type: "tabPress",
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!focado && !evento.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <Pressable
                        key={route.key}
                        style={styles.item}
                        onPress={aoPressionar}
                    >
                        <MaterialCommunityIcons
                            name={aba.icone}
                            size={30}
                            color="#FFFFFF"
                            style={{ opacity: focado ? 1 : 0.7 }}
                        />

                        <Text
                            style={[
                                styles.texto,
                                { opacity: focado ? 1 : 0.7 },
                            ]}
                            numberOfLines={2}
                        >
                            {aba.texto}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    barra: {
        flexDirection: "row",
        backgroundColor: "#8E8E8E",
        paddingTop: 8,
        paddingHorizontal: 4,
    },

    item: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
    },

    texto: {
        fontFamily: "Poppins",
        fontSize: 10,
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "center",
        marginTop: 2,
        lineHeight: 12,
    },
});