import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
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

export default function Cadastro({ navigation }) {
    const [fotoPerfil, setFotoPerfil] = useState(null);

    const escolherFoto = async () => {
        const resultado = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!resultado.canceled) {
            setFotoPerfil(resultado.assets[0].uri);
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
                        Seja nosso paciente
                    </Text>

                    <Text style={styles.subtitulo}>
                        Preencha seus dados para criar sua conta
                    </Text>

                    <Text style={styles.subtitulo}>
                        profissional no PsicoDaily.
                    </Text>


                    <View style={styles.campo}>
                        <Text style={styles.label}>Nome:</Text>
                        <TextInput
                            style={styles.input}
                            inputMode="text"
                        />
                    </View>


                    <View style={styles.campo}>
                        <Text style={styles.label}>E-mail:</Text>
                        <TextInput
                            style={styles.input}
                            inputMode="email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>


                    <View style={styles.campo}>
                        <Text style={styles.label}>Telefone:</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="phone-pad"
                        />
                    </View>


                    <View style={styles.campo}>
                        <Text style={styles.label}>CPF:</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                        />
                    </View>


                    <View style={styles.campo}>
                        <Text style={styles.label}>Senha:</Text>
                        <TextInput
                            style={styles.input}
                            secureTextEntry={true}
                        />
                    </View>


                    <View style={styles.campo}>
                        <Text style={styles.label}>
                            Confirmar senha:
                        </Text>

                        <TextInput
                            style={styles.input}
                            secureTextEntry={true}
                        />
                    </View>


                    <View style={styles.fotoContainer}>

                        <Pressable
                            style={styles.botaoFoto}
                            onPress={escolherFoto}
                        >
                            <Text style={styles.textoFoto}>
                                Fazer upload da foto de perfil
                            </Text>
                        </Pressable>

                        {fotoPerfil ? (
                            <Image
                                source={{ uri: fotoPerfil }}
                                style={styles.fotoCirculo}
                            />
                        ) : (
                            <View style={styles.fotoCirculo}>
                                <Text style={styles.fotoIcone}>●</Text>
                            </View>
                        )}

                    </View>


                    <Pressable
                        style={styles.botaoCadastrar}
                        onPress={() => navigation.navigate("AtivarConta")}
                    >
                        <Text style={styles.textoCadastrar}>
                            Cadastrar
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
        paddingHorizontal: 5,
        height: "100%"
    },

    card: {
        width: "100%",
        minWidth: 370,
        maxWidth: 405,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingTop: 12,
        paddingBottom: 8,

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
        height: 45,
        resizeMode: "contain",
        alignSelf: "center",
    },

    linha: {
        height: 1,
        backgroundColor: "#004BAD",
        width: "70%",
        alignSelf: "center",
        marginTop: 5,
        marginBottom: 10,
    },

    formulario: {
        borderWidth: 1,
        borderColor: "#004BAD",
        borderRadius: 10,
        paddingHorizontal: 7,
        paddingTop: 12,
        paddingBottom: 8,
        position: "relative",
        alignItems: "center",
    },

    titulo: {
        fontFamily: "Poppins",
        fontSize: 13,
        fontWeight: "bold",
        color: "#20232B",
        textAlign: "center",
        marginBottom: 3,
    },

    subtitulo: {
        fontFamily: "Poppins",
        fontSize: 8,
        color: "#858B9B",
        textAlign: "center",
        lineHeight: 12,
    },

    campo: {
        marginTop: 7,
        width: 300,
    },

    label: {
        fontFamily: "Poppins",
        fontSize: 11,
        fontWeight: "700",
        color: "#333333",
        marginLeft: 2,
        marginBottom: 2,
    },

    input: {
        height: 38,
        width: 300,

        borderWidth: 1,
        borderColor: "#1764D1",
        borderRadius: 20,

        paddingHorizontal: 12,
        paddingVertical: 0,

        fontFamily: "Poppins",
        fontSize: 13,
        color: "#333333",

        textAlignVertical: "center",
        includeFontPadding: false,
    },

    fotoContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 9,
        paddingHorizontal: 4,
    },

    botaoFoto: {
        backgroundColor: "#0055B8",
        borderRadius: 15,
        paddingHorizontal: 8,
        height: 30,
        justifyContent: "center",
        marginRight: 6
    },

    textoFoto: {
        color: "#FFFFFF",
        fontFamily: "Poppins",
        fontSize: 10,
        fontWeight: "bold",
    },

    fotoCirculo: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
        height: 30,
        width: "70%",
        alignSelf: "center",
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
    },

    textoCadastrar: {
        color: "#FFFFFF",
        fontFamily: "Poppins",
        fontSize: 14,
        fontWeight: "bold",
    },

});