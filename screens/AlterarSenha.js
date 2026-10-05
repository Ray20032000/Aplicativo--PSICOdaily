import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
    TextInput,
    Alert,
    ActivityIndicator,
} from "react-native";

import { useState } from "react";

const API_URL = "https://p01--psicodaily-api--zfhqcbxfx5v8.code.run";

export default function AlterarSenha({ navigation }) {

    const [email, setEmail] = useState("");
    const [codigo, setCodigo] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    const [carregando, setCarregando] = useState(false);

    const alterarSenha = async () => {

        if (
            !email.trim() ||
            !codigo.trim() ||
            !novaSenha ||
            !confirmarSenha
        ) {
            Alert.alert(
                "Atenção",
                "Preencha todos os campos."
            );

            return;
        }

        if (novaSenha !== confirmarSenha) {
            Alert.alert(
                "Senhas diferentes",
                "As senhas precisam ser iguais."
            );

            return;
        }

        if (novaSenha.length < 8 || novaSenha.length > 12) {
            Alert.alert(
                "Senha inválida",
                "A senha deve ter entre 8 e 12 caracteres."
            );

            return;
        }

        if (!/[A-Z]/.test(novaSenha)) {
            Alert.alert(
                "Senha inválida",
                "A senha precisa ter pelo menos uma letra maiúscula."
            );

            return;
        }

        if (!/[a-z]/.test(novaSenha)) {
            Alert.alert(
                "Senha inválida",
                "A senha precisa ter pelo menos uma letra minúscula."
            );

            return;
        }

        if (!/[0-9]/.test(novaSenha)) {
            Alert.alert(
                "Senha inválida",
                "A senha precisa ter pelo menos um número."
            );

            return;
        }

        if (!/[^A-Za-z0-9]/.test(novaSenha)) {
            Alert.alert(
                "Senha inválida",
                "A senha precisa ter pelo menos um caractere especial."
            );

            return;
        }

        try {

            setCarregando(true);

            const resposta = await fetch(
                `${API_URL}/api/auth/alterar_senha`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        codigo: codigo.trim(),
                        senha: novaSenha,
                    }),
                }
            );

            let dados = {};

            try {
                dados = await resposta.json();
            } catch (erro) {
                dados = {};
            }

            if (!resposta.ok) {
                throw new Error(
                    dados.error ||
                    dados.message ||
                    "Não foi possível alterar a senha."
                );
            }

            Alert.alert(
                "Senha alterada!",
                "Sua senha foi alterada com sucesso.",
                [
                    {
                        text: "Entrar",
                        onPress: () => navigation.navigate("Login"),
                    },
                ]
            );

        } catch (erro) {

            console.log(
                "ERRO AO ALTERAR SENHA:",
                erro
            );

            Alert.alert(
                "Erro",
                erro.message ||
                "Não foi possível conectar ao servidor."
            );

        } finally {

            setCarregando(false);

        }
    };

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
                        Alterar Senha
                    </Text>

                    <View style={styles.campo}>
                        <Text style={styles.label}>
                            E-mail
                        </Text>

                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            inputMode="email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            placeholder="Digite seu e-mail"
                            placeholderTextColor="#999999"
                        />
                    </View>

                    <View style={styles.campo}>
                        <Text style={styles.label}>
                            Código
                        </Text>

                        <TextInput
                            style={styles.input}
                            value={codigo}
                            onChangeText={setCodigo}
                            keyboardType="numeric"
                            maxLength={6}
                            placeholder="Digite o código recebido"
                            placeholderTextColor="#999999"
                        />
                    </View>

                    <View style={styles.campo}>
                        <Text style={styles.label}>
                            Nova Senha
                        </Text>

                        <TextInput
                            style={styles.input}
                            value={novaSenha}
                            onChangeText={setNovaSenha}
                            secureTextEntry={true}
                            autoCapitalize="none"
                            placeholder="Digite sua nova senha"
                            placeholderTextColor="#999999"
                        />
                    </View>

                    <View style={styles.campo}>
                        <Text style={styles.label}>
                            Confirmar Nova Senha
                        </Text>

                        <TextInput
                            style={styles.input}
                            value={confirmarSenha}
                            onChangeText={setConfirmarSenha}
                            secureTextEntry={true}
                            autoCapitalize="none"
                            placeholder="Confirme sua nova senha"
                            placeholderTextColor="#999999"
                        />
                    </View>

                    <Pressable
                        style={[
                            styles.botaoLogin,
                            carregando && styles.botaoDesabilitado,
                        ]}
                        onPress={alterarSenha}
                        disabled={carregando}
                    >

                        {carregando ? (

                            <ActivityIndicator
                                color="#FFFFFF"
                            />

                        ) : (

                            <Text style={styles.textoLogin}>
                                Alterar Senha
                            </Text>

                        )}

                    </Pressable>

                    <Text style={styles.textoCadastro}>
                        Não tem uma conta?
                    </Text>

                    <Pressable
                        onPress={() =>
                            navigation.navigate("Cadastro")
                        }
                    >

                        <Text style={styles.linkCadastro}>
                            Cadastre-se!
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
        backgroundColor: "#0D7CC4",
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 33,
    },

    botaoDesabilitado: {
        opacity: 0.6,
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

});