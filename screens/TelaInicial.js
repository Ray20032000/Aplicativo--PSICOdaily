import { useNavigation } from "@react-navigation/native";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
    Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

export default function TelaInicial() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>


            <Image
                source={require("../assets/Logo.png")}
                style={styles.logo}
            />


            <Text style={styles.titulo}>
                Cuidar da sua mente
            </Text>

            <Text style={styles.subtitulo}>
                Nunca foi tão simples
            </Text>


            <Text style={styles.textinho}>
                Conectamos você a psicólogos{"\n"}
                especializados para te acompanhar{"\n"}
                em cada passo da sua jornada.
            </Text>


            <Image
                source={require("../assets/Banner.png")}
                style={styles.banner}
            />


            <View style={styles.segurancas}>

                <View style={styles.beneficio}>
                    <Image
                        source={require("../assets/Seguro.png")}
                        style={styles.icone}
                    />

                    <Text style={styles.textoBeneficio}>
                        Ambiente seguro{"\n"}
                        e confidencial
                    </Text>
                </View>

                <View style={styles.beneficio}>
                    <Image
                        source={require("../assets/agende.png")}
                        style={styles.icone}
                    />

                    <Text style={styles.textoBeneficio}>
                        Agende suas{"\n"}
                        consultas
                    </Text>
                </View>

                <View style={styles.beneficio}>
                    <Image
                        source={require("../assets/Evolucao.png")}
                        style={styles.icone}
                    />

                    <Text style={styles.textoBeneficio}>
                        Acompanhe sua{"\n"}
                        evolução
                    </Text>
                </View>

            </View>


            <View style={styles.botoes}>

                <Pressable
                    style={styles.botaoEntrar}
                    onPress={() => navigation.navigate("Login")}
                >
                    <Text style={styles.textoEntrar}>
                        Entrar
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.botaoCriar}
                    onPress={() => navigation.navigate("Cadastro")}
                >
                    <Text style={styles.textoCriar}>
                        Criar conta
                    </Text>
                </Pressable>

            </View>

            <View style={styles.termos}>
                <Text style={styles.textoTermos}>
                    Ao continuar, você concorda com nossos
                </Text>

                <Text style={styles.textoPolitica}>
                    Termos de Uso e Política de Privacidade
                </Text>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#E1F3FF",
        alignItems: "center",
        paddingHorizontal: 20,
    },

    logo: {
        width: width * 0.65,
        height: 90,
        resizeMode: "contain",
        marginTop: 50,
        marginBottom: 5,
    },

    titulo: {
        fontFamily: "Poppins",
        color: "#06275C",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 25,
    },

    subtitulo: {
        fontFamily: "ReenieBeanie",
        fontSize: 28,
        color: "#4A8492",
        textAlign: "center",
        marginTop: -2,
    },

    textinho: {
        color: "#414158",
        fontSize: 11,
        textAlign: "center",
        lineHeight: 13,
        marginTop: 12,
        marginBottom: 8,
        paddingTop: 25,
    },

    banner: {
        width: 400,
        height: 300,
        resizeMode: "contain",
        marginTop: 0,
        marginBottom: -5,
    },

    segurancas: {
        width: "100%",
        height: 100,
        backgroundColor: "#FFFFFF",
        borderRadius: 7,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 5,
        marginTop: -2,
        position: "relative",
        bottom: 10
    },

    beneficio: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",

    },

    icone: {
        width: 40,
        height: 40,
        resizeMode: "contain",
        marginBottom: 4,
    },

    textoBeneficio: {
        textAlign: "center",
        lineHeight: 13,
        color: "#004BAD",
        fontSize: 11
    },

    botoes: {
        width: "90%",
        marginTop: 15,
        gap: 10,
    },

    botaoEntrar: {
        backgroundColor: "#0055B8",
        height: 50,
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
    },

    textoEntrar: {
        color: "#FFFFFF",
        fontSize: 18,
        fontFamily: "Poppins",
    },

    botaoCriar: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#0055B8",
        height: 50,
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
    },

    textoCriar: {
        color: "#0055B8",
        fontSize: 12,
        fontFamily: "Poppins",
    },

    termos: {
        alignItems: "center",
        marginTop: "auto",
        marginBottom: 15,
    },

    textoTermos: {
        color: "#414158",
        fontSize: 9,
        textAlign: "center",
    },

    textoPolitica: {
        color: "#0055B8",
        fontSize: 9,
        textAlign: "center",
        marginTop: 3,
    },

});