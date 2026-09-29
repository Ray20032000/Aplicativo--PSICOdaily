
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
    Dimensions,
    TextInput,
} from "react-native";

const { width } = Dimensions.get("window");

export default function Login({ navigation }) {
    return (
        <View style={styles.container}>


            <View style={styles.card}>


                <Image
                    source={require("../assets/Logo.png")}
                    style={styles.logo}
                />


                <View style={styles.linha} />


                <View style={styles.formulario}>

                    <Text style={styles.titulo}>
                        Bem-vindo de volta
                    </Text>

                    <Text style={styles.subtitulo}>
                        Acesse sua conta para continuar
                    </Text>


                    <View style={styles.campo}>
                        <Text style={styles.label}>
                            E-mail
                        </Text>

                        <TextInput
                            style={styles.input}
                            inputMode="email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>


                    <View style={styles.campo}>
                        <Text style={styles.label}>
                            Senha
                        </Text>

                        <TextInput
                            style={styles.input}
                            secureTextEntry={true}
                        />
                    </View>


                    <Pressable
                        style={styles.botaoLogin}
                        onPress={() => {

                        }}
                    >
                        <Text style={styles.textoLogin}>
                            Login
                        </Text>
                    </Pressable>


                    <Text style={styles.textoCadastro}>
                        Não tem uma conta?
                    </Text>

                    <Pressable
                        onPress={() => navigation.navigate("Cadastro")}
                    >
                        <Text style={styles.linkCadastro}>
                            Cadastre-se!
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => navigation.navigate("EsqueciSenha")}
                    >
                        <Text style={styles.linkEsqueci}>
                            Esqueci Minha Senha
                        </Text>
                    </Pressable>

                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#E1F3FF",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
    },

    card: {
        width: "100%",
        maxWidth: 380,
        minHeight: 575,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 25,


        elevation: 5,


        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },

    logo: {
        width: "75%",
        height: 48,
        resizeMode: "contain",
        alignSelf: "center",
    },

    linha: {
        height: 1,
        backgroundColor: "#004BAD",
        width: "85%",
        alignSelf: "center",
        marginTop: 8,
        marginBottom: 34,
    },

    formulario: {
        borderWidth: 1,
        borderColor: "#004BAD",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingTop: 40,
        paddingBottom: 58,
        minHeight: 448,
    },

    titulo: {
        fontFamily: "Poppins",
        fontSize: 20,
        fontWeight: "bold",
        color: "#20232B",
        textAlign: "center",
    },

    subtitulo: {
        fontFamily: "Poppins",
        fontSize: 12,
        color: "#414158",
        textAlign: "center",
        marginTop: 4,
        marginBottom: 29,
    },

    campo: {
        marginBottom: 11,
    },

    label: {
        fontFamily: "Poppins",
        fontSize: 14,
        fontWeight: "600",
        color: "#333333",
        marginLeft: 2,
        marginBottom: 5,
    },

    input: {
        height: 38,
        borderWidth: 1,
        borderColor: "#004BAD",
        borderRadius: 22,
        paddingHorizontal: 14,
        fontFamily: "Poppins",
        fontSize: 13,
        color: "#333333",
    },

    botaoLogin: {
        height: 41,
        backgroundColor: "#004BAD",
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 33,
    },

    textoLogin: {
        color: "#FFFFFF",
        fontFamily: "Poppins",
        fontSize: 20,
        fontWeight: "bold",
    },

    textoCadastro: {
        color: "#333333",
        fontFamily: "Poppins",
        fontSize: 11,
        fontWeight: "600",
        textAlign: "center",
        marginTop: 11,
    },

    linkCadastro: {
        color: "#004BAD",
        fontFamily: "Poppins",
        fontSize: 11,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 1,
    },

    linkEsqueci: {
        color: "#A8A8A8",
        fontFamily: "Poppins",
        fontSize: 11,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 1,
        textDecorationLine: "underline",
    }

});