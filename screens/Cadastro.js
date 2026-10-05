import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";

import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";

const API_URL = "https://p01--psicodaily-api--zfhqcbfx5v8.code.run";

export default function Cadastro({ navigation }) {

    const [fotoPerfil, setFotoPerfil] = useState(null);

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");
    const [cpf, setCpf] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

    const [carregando, setCarregando] = useState(false);

    const formatarCPF = (texto) => {
        const numeros = texto.replace(/\D/g, "").slice(0, 11);

        if (numeros.length <= 3) {
            return numeros;
        }

        if (numeros.length <= 6) {
            return numeros.replace(
                /(\d{3})(\d+)/,
                "$1.$2"
            );
        }

        if (numeros.length <= 9) {
            return numeros.replace(
                /(\d{3})(\d{3})(\d+)/,
                "$1.$2.$3"
            );
        }

        return numeros.replace(
            /(\d{3})(\d{3})(\d{3})(\d{2})/,
            "$1.$2.$3-$4"
        );
    };

    const formatarTelefone = (texto) => {
        const numeros = texto.replace(/\D/g, "").slice(0, 11);

        if (numeros.length <= 2) {
            return numeros;
        }

        if (numeros.length <= 7) {
            return numeros.replace(
                /(\d{2})(\d+)/,
                "($1) $2"
            );
        }

        return numeros.replace(
            /(\d{2})(\d{5})(\d+)/,
            "($1) $2-$3"
        );
    };

    const senhaTem8Caracteres =
        senha.length >= 8 && senha.length <= 12;

    const senhaTemMaiuscula =
        /[A-Z]/.test(senha);

    const senhaTemMinuscula =
        /[a-z]/.test(senha);

    const senhaTemNumero =
        /[0-9]/.test(senha);

    const senhaTemEspecial =
        /[^A-Za-z0-9]/.test(senha);

    const senhaValida =
        senhaTem8Caracteres &&
        senhaTemMaiuscula &&
        senhaTemMinuscula &&
        senhaTemNumero &&
        senhaTemEspecial;

    const senhasIguais =
        senha.length > 0 &&
        confirmarSenha.length > 0 &&
        senha === confirmarSenha;

    const escolherFoto = async () => {

        try {

            const permissao =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissao.granted) {

                Alert.alert(
                    "Permissão necessária",
                    "Precisamos de acesso às suas fotos para escolher uma foto de perfil."
                );

                return;
            }

            const resultado =
                await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ["images"],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                });

            if (!resultado.canceled) {

                setFotoPerfil(
                    resultado.assets[0].uri
                );

            }

        } catch (error) {

            console.log(
                "Erro ao escolher foto:",
                error
            );

            Alert.alert(
                "Erro",
                "Não foi possível selecionar a foto."
            );
        }
    };

    const cadastrar = async () => {

        if (
            !nome.trim() ||
            !email.trim() ||
            !telefone.trim() ||
            !cpf.trim() ||
            !senha ||
            !confirmarSenha
        ) {

            Alert.alert(
                "Atenção",
                "Preencha todos os campos."
            );

            return;
        }

        const telefoneNumeros =
            telefone.replace(/\D/g, "");

        if (telefoneNumeros.length !== 11) {

            Alert.alert(
                "Telefone inválido",
                "Digite um telefone válido com DDD."
            );

            return;
        }

        const cpfNumeros =
            cpf.replace(/\D/g, "");

        if (cpfNumeros.length !== 11) {

            Alert.alert(
                "CPF inválido",
                "Digite um CPF válido."
            );

            return;
        }

        if (!senhaValida) {

            Alert.alert(
                "Senha inválida",
                "Sua senha não atende a todos os requisitos."
            );

            return;
        }

        if (senha !== confirmarSenha) {

            Alert.alert(
                "Senhas diferentes",
                "As senhas precisam ser iguais."
            );

            return;
        }

        try {

            setCarregando(true);

            const formData = new FormData();

            formData.append(
                "nome",
                nome.trim()
            );

            formData.append(
                "email",
                email.trim()
            );

            formData.append(
                "telefone",
                telefoneNumeros
            );

            formData.append(
                "cpf",
                cpfNumeros
            );

            formData.append(
                "senha",
                senha
            );

            formData.append(
                "confirmar_senha",
                confirmarSenha
            );

            if (fotoPerfil) {

                formData.append(
                    "imagem",
                    {
                        uri: fotoPerfil,
                        name: "perfil.jpg",
                        type: "image/jpeg",
                    }
                );
            }

            console.log(
                "Enviando cadastro para:",
                API_URL
            );

            const resposta = await fetch(
                `${API_URL}/api/usuarios/`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const texto =
                await resposta.text();

            console.log(
                "Status cadastro:",
                resposta.status
            );

            console.log(
                "Resposta do Python:",
                texto
            );

            let dados = {};

            try {

                dados = JSON.parse(texto);

            } catch {

                console.log(
                    "O Python não retornou JSON."
                );
            }

            if (!resposta.ok) {

                Alert.alert(
                    "Erro no cadastro",
                    dados.error ||
                    dados.message ||
                    "Não foi possível realizar o cadastro."
                );

                return;
            }

            await AsyncStorage.setItem(
                "@psicodaily_email_cadastro",
                email.trim()
            );

            Alert.alert(
                "Cadastro realizado!",
                "Enviamos um código de verificação para o seu e-mail.",
                [
                    {
                        text: "Continuar",

                        onPress: () => {

                            navigation.navigate(
                                "AtivarConta",
                                {
                                    email: email.trim(),
                                }
                            );
                        },
                    },
                ]
            );

        } catch (erro) {

            console.log(
                "ERRO NO CADASTRO:",
                erro
            );

            Alert.alert(
                "Erro de conexão",
                "Não foi possível conectar ao servidor Python."
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
                            Seja nosso paciente
                        </Text>

                        <Text style={styles.subtitulo}>
                            Preencha seus dados para criar sua conta
                        </Text>

                        <Text style={styles.subtitulo}>
                            no PSICOdaily.
                        </Text>

                        <View style={styles.campo}>

                            <Text style={styles.label}>
                                Nome:
                            </Text>

                            <TextInput
                                style={styles.input}
                                value={nome}
                                onChangeText={setNome}
                                inputMode="text"
                                autoCapitalize="words"
                                placeholder="Digite seu nome"
                                placeholderTextColor="#999"
                            />

                        </View>

                        <View style={styles.campo}>

                            <Text style={styles.label}>
                                E-mail:
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
                                placeholderTextColor="#999"
                            />

                        </View>

                        <View style={styles.campo}>

                            <Text style={styles.label}>
                                Telefone:
                            </Text>

                            <TextInput
                                style={styles.input}
                                value={telefone}
                                onChangeText={(texto) =>
                                    setTelefone(
                                        formatarTelefone(texto)
                                    )
                                }
                                keyboardType="phone-pad"
                                maxLength={15}
                                placeholder="(00) 00000-0000"
                                placeholderTextColor="#999"
                            />

                        </View>

                        <View style={styles.campo}>

                            <Text style={styles.label}>
                                CPF:
                            </Text>

                            <TextInput
                                style={styles.input}
                                value={cpf}
                                onChangeText={(texto) =>
                                    setCpf(
                                        formatarCPF(texto)
                                    )
                                }
                                keyboardType="numeric"
                                maxLength={14}
                                placeholder="000.000.000-00"
                                placeholderTextColor="#999"
                            />

                        </View>

                        <View style={styles.campo}>

                            <Text style={styles.label}>
                                Senha:
                            </Text>

                            <View style={styles.inputSenha}>

                                <TextInput
                                    style={styles.inputSenhaTexto}
                                    value={senha}
                                    onChangeText={setSenha}
                                    secureTextEntry={
                                        !mostrarSenha
                                    }
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    maxLength={12}
                                    placeholder="Digite sua senha"
                                    placeholderTextColor="#999"
                                />

                                <Pressable
                                    onPress={() =>
                                        setMostrarSenha(
                                            !mostrarSenha
                                        )
                                    }
                                >

                                    <Text style={styles.olho}>
                                        {mostrarSenha
                                            ? "Ocultar"
                                            : "Mostrar"}
                                    </Text>

                                </Pressable>

                            </View>

                        </View>

                        <View style={styles.requisitos}>

                            <Text style={styles.tituloRequisitos}>
                                Sua senha deve ter:
                            </Text>

                            <Text
                                style={[
                                    styles.requisito,
                                    senhaTem8Caracteres &&
                                    styles.requisitoOk,
                                ]}
                            >
                                {senhaTem8Caracteres
                                    ? "✓"
                                    : "○"}{" "}
                                Entre 8 e 12 caracteres
                            </Text>

                            <Text
                                style={[
                                    styles.requisito,
                                    senhaTemMaiuscula &&
                                    styles.requisitoOk,
                                ]}
                            >
                                {senhaTemMaiuscula
                                    ? "✓"
                                    : "○"}{" "}
                                Uma letra maiúscula
                            </Text>

                            <Text
                                style={[
                                    styles.requisito,
                                    senhaTemMinuscula &&
                                    styles.requisitoOk,
                                ]}
                            >
                                {senhaTemMinuscula
                                    ? "✓"
                                    : "○"}{" "}
                                Uma letra minúscula
                            </Text>

                            <Text
                                style={[
                                    styles.requisito,
                                    senhaTemNumero &&
                                    styles.requisitoOk,
                                ]}
                            >
                                {senhaTemNumero
                                    ? "✓"
                                    : "○"}{" "}
                                Um número
                            </Text>

                            <Text
                                style={[
                                    styles.requisito,
                                    senhaTemEspecial &&
                                    styles.requisitoOk,
                                ]}
                            >
                                {senhaTemEspecial
                                    ? "✓"
                                    : "○"}{" "}
                                Um caractere especial
                            </Text>

                        </View>

                        <View style={styles.campo}>

                            <Text style={styles.label}>
                                Confirmar senha:
                            </Text>

                            <View
                                style={[
                                    styles.inputSenha,
                                    confirmarSenha.length > 0 &&
                                    !senhasIguais &&
                                    styles.inputErro,
                                    senhasIguais &&
                                    styles.inputCorreto,
                                ]}
                            >

                                <TextInput
                                    style={styles.inputSenhaTexto}
                                    value={confirmarSenha}
                                    onChangeText={setConfirmarSenha}
                                    secureTextEntry={
                                        !mostrarConfirmarSenha
                                    }
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    maxLength={12}
                                    placeholder="Confirme sua senha"
                                    placeholderTextColor="#999"
                                />

                                <Pressable
                                    onPress={() =>
                                        setMostrarConfirmarSenha(
                                            !mostrarConfirmarSenha
                                        )
                                    }
                                >

                                    <Text style={styles.olho}>
                                        {mostrarConfirmarSenha
                                            ? "Ocultar"
                                            : "Mostrar"}
                                    </Text>

                                </Pressable>

                            </View>

                            {confirmarSenha.length > 0 && (

                                <Text
                                    style={
                                        senhasIguais
                                            ? styles.mensagemSenhaOk
                                            : styles.mensagemSenhaErro
                                    }
                                >
                                    {senhasIguais
                                        ? "✓ As senhas são iguais"
                                        : "✕ As senhas não são iguais"}
                                </Text>

                            )}

                        </View>

                        <View style={styles.fotoContainer}>

                            <Pressable
                                style={styles.botaoFoto}
                                onPress={escolherFoto}
                            >

                                <Text style={styles.textoFoto}>
                                    Fazer upload da foto
                                </Text>

                            </Pressable>

                            {fotoPerfil ? (

                                <Image
                                    source={{
                                        uri: fotoPerfil,
                                    }}
                                    style={styles.fotoCirculo}
                                />

                            ) : (

                                <View style={styles.fotoCirculo}>
                                    <Text style={styles.fotoIcone}>
                                        ●
                                    </Text>
                                </View>

                            )}

                        </View>

                        <Pressable
                            style={[
                                styles.botaoCadastrar,
                                carregando &&
                                styles.botaoDesabilitado,
                            ]}
                            onPress={cadastrar}
                            disabled={carregando}
                        >

                            {carregando ? (

                                <ActivityIndicator
                                    color="#FFFFFF"
                                />

                            ) : (

                                <Text style={styles.textoCadastrar}>
                                    Cadastrar
                                </Text>

                            )}

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
        paddingVertical: 20,
    },

    card: {
        width: "100%",
        maxWidth: 405,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 15,

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
        width: "60%",
        height: 48,
        resizeMode: "contain",
        alignSelf: "center",
    },

    linha: {
        height: 1,
        backgroundColor: "#004BAD",
        width: "70%",
        alignSelf: "center",
        marginTop: 6,
        marginBottom: 15,
    },

    formulario: {
        borderWidth: 1,
        borderColor: "#004BAD",
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingTop: 18,
        paddingBottom: 20,
        alignItems: "center",
    },

    titulo: {
        fontFamily: "Poppins",
        fontSize: 18,
        fontWeight: "bold",
        color: "#20232B",
        textAlign: "center",
        marginBottom: 4,
    },

    subtitulo: {
        fontFamily: "Poppins",
        fontSize: 10,
        color: "#858B9B",
        textAlign: "center",
        lineHeight: 15,
    },

    campo: {
        width: "100%",
        marginTop: 12,
    },

    label: {
        fontFamily: "Poppins",
        fontSize: 12,
        fontWeight: "700",
        color: "#333333",
        marginBottom: 5,
        width: "100%",
    },

    input: {
        height: 44,
        width: "100%",
        borderWidth: 1,
        borderColor: "#1764D1",
        borderRadius: 22,
        paddingHorizontal: 15,
        fontFamily: "Poppins",
        fontSize: 13,
        color: "#333333",
        backgroundColor: "#FFFFFF",
    },

    inputSenha: {
        height: 44,
        width: "100%",
        borderWidth: 1,
        borderColor: "#1764D1",
        borderRadius: 22,
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 15,
        paddingRight: 12,
        backgroundColor: "#FFFFFF",
    },

    inputSenhaTexto: {
        flex: 1,
        height: 44,
        fontFamily: "Poppins",
        fontSize: 13,
        color: "#333333",
        paddingVertical: 0,
    },

    olho: {
        fontFamily: "Poppins",
        fontSize: 10,
        fontWeight: "bold",
        color: "#0055B8",
    },

    inputErro: {
        borderColor: "#D9534F",
    },

    inputCorreto: {
        borderColor: "#28A745",
    },

    requisitos: {
        width: "100%",
        backgroundColor: "#F4FAFF",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginTop: 8,
        borderWidth: 1,
        borderColor: "#D8EAF7",
    },

    tituloRequisitos: {
        fontFamily: "Poppins",
        fontSize: 10,
        fontWeight: "bold",
        color: "#333333",
        marginBottom: 4,
    },

    requisito: {
        fontFamily: "Poppins",
        fontSize: 9,
        color: "#858B9B",
        lineHeight: 15,
    },

    requisitoOk: {
        color: "#209447",
        fontWeight: "bold",
    },

    mensagemSenhaOk: {
        fontFamily: "Poppins",
        fontSize: 9,
        color: "#209447",
        marginTop: 4,
        width: "100%",
    },

    mensagemSenhaErro: {
        fontFamily: "Poppins",
        fontSize: 9,
        color: "#D9534F",
        marginTop: 4,
        width: "100%",
    },

    fotoContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 16,
        paddingHorizontal: 2,
    },

    botaoFoto: {
        backgroundColor: "#0055B8",
        borderRadius: 20,
        paddingHorizontal: 15,
        height: 40,
        justifyContent: "center",
        marginRight: 10,
    },

    textoFoto: {
        color: "#FFFFFF",
        fontFamily: "Poppins",
        fontSize: 11,
        fontWeight: "bold",
    },

    fotoCirculo: {
        width: 45,
        height: 45,
        borderRadius: 23,
        backgroundColor: "#B0B0B0",
        alignItems: "center",
        justifyContent: "center",
    },

    fotoIcone: {
        color: "#E8E8E8",
        fontSize: 1,
    },

    botaoCadastrar: {
        backgroundColor: "#1288C9",
        height: 44,
        width: "75%",
        alignSelf: "center",
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },

    botaoDesabilitado: {
        opacity: 0.6,
    },

    textoCadastrar: {
        color: "#FFFFFF",
        fontFamily: "Poppins",
        fontSize: 15,
        fontWeight: "bold",
    },

});
