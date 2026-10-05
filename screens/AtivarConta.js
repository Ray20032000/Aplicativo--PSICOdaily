import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";

import { useState } from "react";

const API = "https://p01--psicodaily-api--zfhqcbxfx5v8.code.run";

export default function AtivarConta({ navigation }) {
    const [email, setEmail] = useState("");
    const [codigo, setCodigo] = useState("");
    const [carregando, setCarregando] = useState(false);

    const ativarConta = async () => {
        if (!email.trim() || !codigo.trim()) {
            Alert.alert(
                "Atenção",
                "Preencha seu e-mail e o código de ativação."
            );
            return;
        }

        try {
            setCarregando(true);

            console.log(
                "Enviando ativação para:",
                `${API}/api/auth/verificar_codigo`
            );

            const resposta = await fetch(
                `${API}/api/auth/verificar_codigo`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        codigo: codigo.trim(),
                    }),
                }
            );

            const texto = await resposta.text();

            console.log("Status:", resposta.status);
            console.log(
                "Resposta do Python:",
                texto
            );

            let dados = {};

            try {
                dados = texto
                    ? JSON.parse(texto)
                    : {};
            } catch {
                Alert.alert(
                    "Erro no servidor",
                    "O servidor não retornou uma resposta válida."
                );
                return;
            }

            if (!resposta.ok) {
                Alert.alert(
                    "Não foi possível ativar",
                    dados.error ||
                    dados.message ||
                    "Código inválido ou expirado."
                );
                return;
            }

            Alert.alert(
                "Conta ativada!",
                dados.message ||
                "Sua conta foi ativada com sucesso.",
                [
                    {
                        text: "Entrar",
                        onPress: () =>
                            navigation.navigate(
                                "Login"
                            ),
                    },
                ]
            );

        } catch (error) {
            console.log(
                "Erro de conexão:",
                error
            );

            Alert.alert(
                "Erro de conexão",
                "Não foi possível conectar ao servidor."
            );

        } finally {
            setCarregando(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={
                Platform.OS === "ios"
                    ? "padding"
                    : undefined
            }
        >
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>

                    <Image
                        source={require("../assets/Logo.png")}
                        style={styles.logo}
                    />

                    <View style={styles.linha} />

                    <View style={styles.formulario}>

                        <Text style={styles.titulo}>
                            Ativar conta
                        </Text>

                        <Text style={styles.subtitulo}>
                            Digite o e-mail e o código enviado para você
                        </Text>

                        <View style={styles.campo}>

                            <Text style={styles.label}>
                                E-mail
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Digite seu e-mail"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                        </View>

                        <View style={styles.campo}>

                            <Text style={styles.label}>
                                Código
                            </Text>

                            <TextInput
                                style={[
                                    styles.input,
                                    styles.inputCodigo,
                                ]}
                                placeholder="Digite o código"
                                placeholderTextColor="#9BA7B4"
                                keyboardType="number-pad"
                                value={codigo}
                                onChangeText={setCodigo}
                                maxLength={6}
                            />

                        </View>

                        <Pressable
                            style={[
                                styles.botaoLogin,
                                carregando &&
                                styles.botaoDesativado,
                            ]}
                            onPress={ativarConta}
                            disabled={carregando}
                        >
                            <Text style={styles.textoLogin}>
                                {carregando
                                    ? "Ativando..."
                                    : "Ativar"}
                            </Text>
                        </Pressable>

                        <Text style={styles.textoCadastro}>
                            Não tem uma conta?
                        </Text>

                        <Pressable
                            onPress={() =>
                                navigation.navigate(
                                    "Cadastro"
                                )
                            }
                        >
                            <Text style={styles.linkCadastro}>
                                Cadastre-se!
                            </Text>
                        </Pressable>

                    </View>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E1F3FF",
    },

    scroll: {
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
        paddingVertical: 30,
    },

    card: {
        width: "100%",
        maxWidth: 380,
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
        height: 45,
        borderWidth: 1,
        borderColor: "#004BAD",
        borderRadius: 22,
        paddingHorizontal: 14,
        fontFamily: "Poppins",
        fontSize: 13,
        color: "#333333",
        backgroundColor: "#F8FBFF",
    },

    inputCodigo: {
        textAlign: "center",
        letterSpacing: 3,
    },

    botaoLogin: {
        height: 45,
        backgroundColor: "#0D7CC4",
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 33,
    },

    botaoDesativado: {
        opacity: 0.6,
    },

    textoLogin: {
        color: "#FFFFFF",
        fontFamily: "Poppins",
        fontSize: 17,
        fontWeight: "bold",
    },

    textoCadastro: {
        color: "#333333",
        fontFamily: "Poppins",
        fontSize: 11,
        fontWeight: "600",
        textAlign: "center",
        marginTop: 20,
    },

    linkCadastro: {
        color: "#004BAD",
        fontFamily: "Poppins",
        fontSize: 11,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 1,
    },
});