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
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

const API = "https://p01--psicodaily-api--zfhqcbxfx5v8.code.run";

export default function Login({ navigation }) {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [carregando, setCarregando] = useState(false);

    const realizarLogin = async () => {
        if (!email.trim() || !senha) {
            Alert.alert(
                "Atenção",
                "Preencha seu e-mail e sua senha."
            );
            return;
        }

        try {
            setCarregando(true);

            console.log(
                "Tentando conectar em:",
                `${API}/api/auth/login_mobile`
            );

            const resposta = await fetch(
                `${API}/api/auth/login_mobile`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        senha: senha,
                    }),
                }
            );

            const texto = await resposta.text();

            console.log("Status HTTP:", resposta.status);
            console.log("Resposta do servidor:", texto);

            let dados = {};

            try {
                dados = texto ? JSON.parse(texto) : {};
            } catch (error) {
                console.log(
                    "Erro ao converter JSON:",
                    error
                );

                Alert.alert(
                    "Erro no servidor",
                    "O servidor retornou uma resposta que não é um JSON válido."
                );

                return;
            }

            console.log("Dados recebidos:", dados);

            // Verifica se o servidor retornou erro HTTP
            if (!resposta.ok) {
                Alert.alert(
                    "Não foi possível entrar",
                    dados.error ||
                    dados.message ||
                    "Verifique seu e-mail e sua senha."
                );

                return;
            }

            // O token vem dentro de dados.usuario
            const token = dados.usuario?.token;

            if (!token) {
                console.log(
                    "Resposta sem token:",
                    dados
                );

                Alert.alert(
                    "Erro no login",
                    "O servidor respondeu corretamente, mas não enviou o token de acesso."
                );

                return;
            }

            // Salva o token
            await AsyncStorage.setItem(
                "@psicodaily_token",
                token
            );

            // Salva os dados do usuário
            if (dados.usuario) {
                await AsyncStorage.setItem(
                    "@psicodaily_usuario",
                    JSON.stringify(dados.usuario)
                );

                if (dados.usuario.id_usuario) {
                    await AsyncStorage.setItem(
                        "@psicodaily_id_usuario",
                        String(dados.usuario.id_usuario)
                    );
                }

                if (dados.usuario.nome) {
                    await AsyncStorage.setItem(
                        "@psicodaily_nome",
                        dados.usuario.nome
                    );
                }

                if (dados.usuario.email) {
                    await AsyncStorage.setItem(
                        "@psicodaily_email",
                        dados.usuario.email
                    );
                }

                if (dados.usuario.tipo_usuario) {
                    await AsyncStorage.setItem(
                        "@psicodaily_tipo_usuario",
                        dados.usuario.tipo_usuario
                    );
                }
            }

            console.log(
                "Login realizado com sucesso."
            );

            console.log(
                "Usuário:",
                dados.usuario
            );

            // Vai para o Dashboard
            navigation.replace("AppTabs", { screen: "Dashboard" });

        } catch (error) {
            console.log(
                "Erro de conexão:",
                error
            );

            Alert.alert(
                "Erro de conexão",
                "Não foi possível conectar ao servidor. Verifique sua conexão com a internet."
            );
        } finally {
            setCarregando(false);
        }
    };



    const biometria = async () => {
        try {
            const temBiometria =
                await LocalAuthentication.hasHardwareAsync();

            if (!temBiometria) {
                Alert.alert(
                    "Biometria indisponível",
                    "Este aparelho não possui suporte à biometria."
                );
                return;
            }

            const cadastrada =
                await LocalAuthentication.isEnrolledAsync();

            if (!cadastrada) {
                Alert.alert(
                    "Biometria não cadastrada",
                    "Cadastre sua digital ou Face ID nas configurações do aparelho."
                );
                return;
            }

            const resultado =
                await LocalAuthentication.authenticateAsync({
                    promptMessage: "Entrar no Psicodaily",
                    fallbackLabel: "Usar senha",
                    cancelLabel: "Cancelar",
                });

            if (!resultado.success) {
                return;
            }

            const token =
                await AsyncStorage.getItem(
                    "@psicodaily_token"
                );

            if (!token) {
                Alert.alert(
                    "Faça login primeiro",
                    "Entre com seu e-mail e senha pelo menos uma vez para ativar o acesso por biometria."
                );
                return;
            }

            navigation.replace("AppTabs", { screen: "Dashboard" });

        } catch (error) {
            console.log("Erro biometria:", error);

            Alert.alert(
                "Erro",
                "Não foi possível realizar a autenticação."
            );
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
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.logoContainer}>
                    <Image
                        source={require("../assets/Logo.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <Text style={styles.titulo}>
                    Bem-vindo ao PSICOdaily
                </Text>

                <Text style={styles.subtitulo}>
                    Cuide da sua mente todos os dias.
                </Text>

                <View style={styles.formulario}>
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

                    <Text style={styles.label}>
                        Senha
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Digite sua senha"
                        placeholderTextColor="#999"
                        value={senha}
                        onChangeText={setSenha}
                        secureTextEntry
                    />

                    <Pressable
                        style={styles.esqueci}
                        onPress={() =>
                            navigation.navigate(
                                "EsqueciSenha"
                            )
                        }
                    >
                        <Text style={styles.esqueciTexto}>
                            Esqueci minha senha
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[
                            styles.botao,
                            carregando &&
                            styles.botaoDesativado,
                        ]}
                        onPress={realizarLogin}
                        disabled={carregando}
                    >
                        <Text style={styles.botaoTexto}>
                            {carregando
                                ? "Entrando..."
                                : "Entrar"}
                        </Text>
                    </Pressable>

                    <Pressable
                        style={styles.botaoBiometria}
                        onPress={biometria}
                    >
                        <Text style={styles.biometriaTexto}>
                            Entrar com biometria
                        </Text>
                    </Pressable>

                    <View style={styles.cadastroContainer}>
                        <Text style={styles.cadastroTexto}>
                            Ainda não possui uma conta?
                        </Text>

                        <Pressable
                            onPress={() =>
                                navigation.navigate(
                                    "Cadastro"
                                )
                            }
                        >
                            <Text style={styles.cadastroLink}>
                                Cadastre-se
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
        justifyContent: "center",
        padding: 25,
    },

    logoContainer: {
        alignItems: "center",
        marginBottom: 15,
    },

    logo: {
        width: 150,
        height: 100,
    },

    titulo: {
        fontSize: 25,
        fontWeight: "700",
        color: "#004BAD",
        textAlign: "center",
        marginBottom: 8,
    },

    subtitulo: {
        fontSize: 15,
        color: "#666",
        textAlign: "center",
        marginBottom: 30,
    },

    formulario: {
        width: "100%",
    },

    label: {
        fontSize: 15,
        fontWeight: "600",
        color: "#004BAD",
        marginBottom: 7,
    },

    input: {
        width: "100%",
        height: 52,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 15,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: "#004BAD",
    },

    esqueci: {
        alignItems: "flex-end",
        marginBottom: 20,
    },

    esqueciTexto: {
        color: "#004BAD",
        fontSize: 14,
        fontWeight: "600",
    },

    botao: {
        width: "100%",
        height: 52,
        borderRadius: 12,
        backgroundColor: "#004BAD",
        alignItems: "center",
        justifyContent: "center",
    },

    botaoDesativado: {
        opacity: 0.6,
    },

    botaoTexto: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },

    botaoBiometria: {
        width: "100%",
        height: 52,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#004BAD",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 12,
    },

    biometriaTexto: {
        color: "#004BAD",
        fontSize: 15,
        fontWeight: "600",
    },

    cadastroContainer: {
        alignItems: "center",
        marginTop: 25,
    },

    cadastroTexto: {
        color: "#666",
        fontSize: 14,
    },

    cadastroLink: {
        color: "#004BAD",
        fontSize: 14,
        fontWeight: "700",
        marginTop: 5,
    },
});