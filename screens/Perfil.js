import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    TextInput,
    Alert,
} from "react-native";
import { ArrowLeft, KeyRound, Pencil, UserRound, LogOut } from "lucide-react-native";

const API_URL = "https://p01--psicodaily-api--zfhqcbxfx5v8.code.run";

function extrairUsuarios(dados) {
    if (Array.isArray(dados)) return dados;
    const lista = dados?.usuarios || dados?.data || dados?.results;
    if (Array.isArray(lista)) return lista;
    const usuario = dados?.usuario || dados?.data?.usuario || lista;
    if (usuario && typeof usuario === "object") return [usuario];
    if (dados && typeof dados === "object" && (dados.id_usuario || dados.id || dados.email)) return [dados];
    return [];
}

export default function Perfil() {
    const navigation = useNavigation();
    const [usuario, setUsuario] = useState({});
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [editando, setEditando] = useState(false);
    const [rascunho, setRascunho] = useState({});
    const [salvando, setSalvando] = useState(false);

    const salvarPerfil = async () => {
        try {
            setSalvando(true);
            const token = await AsyncStorage.getItem("@psicodaily_token");
            const response = await fetch(`${API_URL}/api/usuarios/me`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ nome: rascunho.nome, email: rascunho.email, telefone: rascunho.telefone }),
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(payload.error || "Não foi possível atualizar o perfil.");
            const atualizado = { ...usuario, ...rascunho };
            setUsuario(atualizado);
            await AsyncStorage.setItem("@psicodaily_usuario", JSON.stringify(atualizado));
            if (atualizado.nome) await AsyncStorage.setItem("@psicodaily_nome", atualizado.nome);
            if (atualizado.email) await AsyncStorage.setItem("@psicodaily_email", atualizado.email);
            setEditando(false);
            Alert.alert("Perfil atualizado", "Seus dados foram salvos.");
        } catch (error) { Alert.alert("Não foi possível salvar", error.message); }
        finally { setSalvando(false); }
    };

    const sair = async () => {
        try {
            const token = await AsyncStorage.getItem("@psicodaily_token");
            await fetch(`${API_URL}/api/usuarios/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        } catch { /* O encerramento local continua mesmo sem rede. */ }
        await AsyncStorage.multiRemove([
            "@psicodaily_token", "@psicodaily_usuario", "@psicodaily_id_usuario",
            "@psicodaily_nome", "@psicodaily_email", "@psicodaily_tipo_usuario",
        ]);
        navigation.getParent()?.getParent()?.reset({ index: 0, routes: [{ name: "Login" }] });
    };

    useFocusEffect(
        useCallback(() => {
            let ativo = true;

            const carregarUsuario = async () => {
                try {
                    const [usuarioSalvo, nomeSalvo, emailSalvo, idSalvo, token] = await Promise.all([
                        AsyncStorage.getItem("@psicodaily_usuario"),
                        AsyncStorage.getItem("@psicodaily_nome"),
                        AsyncStorage.getItem("@psicodaily_email"),
                        AsyncStorage.getItem("@psicodaily_id_usuario"),
                        AsyncStorage.getItem("@psicodaily_token"),
                    ]);
                    let dados = usuarioSalvo ? JSON.parse(usuarioSalvo) : {};
                    const email = dados.email || emailSalvo;
                    const idUsuario = dados.id_usuario || dados.id || idSalvo;

                    if (ativo) {
                        setUsuario({
                            ...dados,
                            nome: dados.nome || nomeSalvo || "Usuário",
                            email: email || "Não informado",
                        });
                    }

                    if (token && idUsuario) {
                        const resposta = await fetch(`${API_URL}/api/usuarios/me`, {
                            headers: {
                                Accept: "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        const texto = await resposta.text();
                        let payload = {};
                        try {
                            payload = texto ? JSON.parse(texto) : {};
                        } catch {
                            throw new Error("A API retornou dados de perfil inválidos.");
                        }
                        if (!resposta.ok) {
                            throw new Error(payload.error || payload.message || "Não foi possível atualizar os dados do perfil.");
                        }

                        const registro = extrairUsuarios(payload).find((item) =>
                            String(item.id_usuario || item.id) === String(idUsuario)
                            || String(item.email || "").toLowerCase() === String(email || "").toLowerCase()
                        );
                        if (registro) {
                            dados = { ...dados, ...registro };
                            await AsyncStorage.setItem("@psicodaily_usuario", JSON.stringify(dados));
                            if (dados.nome) await AsyncStorage.setItem("@psicodaily_nome", dados.nome);
                            if (dados.email) await AsyncStorage.setItem("@psicodaily_email", dados.email);
                            if (ativo) { setUsuario(dados); setRascunho(dados); }
                        }
                    }
                } catch (error) {
                    console.warn("Não foi possível carregar o perfil:", error);
                    if (ativo) setErro(error.message || "Não foi possível atualizar os dados do perfil.");
                } finally {
                    if (ativo) setCarregando(false);
                }
            };

            setCarregando(true);
            setErro("");
            carregarUsuario();
            return () => { ativo = false; };
        }, [])
    );

    const imagem = usuario.foto_perfil || usuario.foto || usuario.imagem_perfil || usuario.imagem || usuario.foto_url;
    const foto = typeof imagem === "string" ? imagem : imagem?.uri;
    const inicial = (usuario.nome || "U").trim().charAt(0).toUpperCase();
    const informacoes = [
        ["E-mail", usuario.email],
        ["Telefone", usuario.telefone],
        ["CPF", usuario.cpf],
        ["Data de nascimento", usuario.data_nascimento || usuario.nascimento],
        ["Endereço", usuario.endereco],
        ["Cidade", usuario.cidade],
        ["Estado", usuario.estado],
        ["CEP", usuario.cep],
        ["Tipo de conta", usuario.tipo_usuario || usuario.tipo],
    ].filter(([, valor]) => valor != null && String(valor).trim() !== "");

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.conteudo}>
                <View style={styles.cartao}>
                    <View style={styles.fotoContainer}>
                        {foto ? (
                            <Image source={{ uri: foto }} style={styles.foto} />
                        ) : (
                            <View style={styles.fotoFallback}>
                                {usuario.nome ? (
                                    <Text style={styles.inicial}>{inicial}</Text>
                                ) : (
                                    <UserRound color="#6B7280" size={48} />
                                )}
                            </View>
                        )}
                    </View>

                    <Text style={styles.titulo}>Meu perfil</Text>
                    <Text style={styles.nome}>{usuario.nome || "Usuário"}</Text>

                    {carregando ? (
                        <View style={styles.estadoCarregamento}>
                            <ActivityIndicator color="#5965A8" size="small" />
                            <Text style={styles.mensagemEstado}>Carregando dados do paciente...</Text>
                        </View>
                    ) : null}
                    {erro ? <Text style={styles.erro}>{erro}</Text> : null}

                    <View style={styles.divisor} />
                    {editando ? <View style={{ width: "100%", gap: 10, marginTop: 14 }}>
                        {[["Nome", "nome"], ["E-mail", "email"], ["Telefone", "telefone"]].map(([rotulo, campo]) => <View key={campo} style={styles.infoGrupo}>
                            <Text style={styles.rotulo}>{rotulo}</Text>
                            <TextInput value={String(rascunho[campo] || "")} onChangeText={(valor) => setRascunho((atual) => ({ ...atual, [campo]: valor }))} style={styles.campoEdicao} autoCapitalize={campo === "email" ? "none" : "words"} keyboardType={campo === "email" ? "email-address" : campo === "telefone" ? "phone-pad" : "default"} />
                        </View>)}
                    </View> : null}
                    {informacoes.map(([rotulo, valor]) => (
                        <View style={styles.infoGrupo} key={rotulo}>
                            <Text style={styles.rotulo}>{rotulo}</Text>
                            <Text style={styles.valor}>{String(valor)}</Text>
                        </View>
                    ))}

                    <View style={styles.acoes}>
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => navigation.goBack()}
                            style={({ pressed }) => [styles.botao, styles.botaoVoltar, pressed && styles.pressionado]}
                        >
                            <ArrowLeft color="#374151" size={19} />
                            <Text style={styles.textoVoltar}>Voltar</Text>
                        </Pressable>
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => { setRascunho(usuario); setEditando((atual) => !atual); }}
                            style={({ pressed }) => [styles.botao, styles.botaoEditar, pressed && styles.pressionado]}
                        >
                            <Pencil color="#FFFFFF" size={18} />
                            <Text style={styles.textoEditar}>{editando ? "Cancelar" : "Editar"}</Text>
                        </Pressable>
                    </View>
                    {editando ? <Pressable accessibilityRole="button" onPress={salvarPerfil} disabled={salvando} style={[styles.botaoSenha, { backgroundColor: "#0875C9" }]}><Text style={[styles.textoBotaoSenha, { color: "white" }]}>{salvando ? "Salvando..." : "Salvar alterações"}</Text></Pressable> : null}
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => navigation.navigate("EsqueciSenha", { email: usuario.email === "Não informado" ? "" : usuario.email })}
                        style={({ pressed }) => [styles.botaoSenha, pressed && styles.pressionado]}
                    >
                        <KeyRound color="#5965A8" size={18} />
                        <Text style={styles.textoBotaoSenha}>Mudar senha</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" onPress={sair} style={({ pressed }) => [styles.botaoSenha, pressed && styles.pressionado]}>
                        <LogOut color="#B42318" size={18} />
                        <Text style={[styles.textoBotaoSenha, { color: "#B42318" }]}>Sair da conta</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F4F6",
    },
    conteudo: {
        flexGrow: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        paddingHorizontal: 22,
        paddingTop: 28,
        paddingBottom: 28,
    },
    cartao: {
        width: "100%",
        maxWidth: 480,
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 24,
        alignItems: "center",
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
    },
    fotoContainer: {
        width: 112,
        height: 112,
        borderRadius: 56,
        overflow: "hidden",
        marginBottom: 18,
        backgroundColor: "#E5E7EB",
    },
    foto: {
        width: "100%",
        height: "100%",
    },
    fotoFallback: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E8EAF0",
    },
    inicial: {
        color: "#536078",
        fontFamily: "Poppins",
        fontSize: 42,
    },
    titulo: {
        color: "#6B7280",
        fontFamily: "Poppins",
        fontSize: 14,
        marginBottom: 2,
    },
    nome: {
        color: "#202638",
        fontFamily: "Poppins",
        fontSize: 22,
        textAlign: "center",
    },
    divisor: {
        width: "100%",
        height: 1,
        backgroundColor: "#E5E7EB",
        marginVertical: 22,
    },
    infoGrupo: {
        width: "100%",
        marginBottom: 16,
    },
    estadoCarregamento: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 12,
    },
    mensagemEstado: {
        color: "#777F8D",
        fontFamily: "Poppins",
        fontSize: 12,
    },
    erro: {
        color: "#B45309",
        fontFamily: "Poppins",
        fontSize: 11,
        textAlign: "center",
        marginTop: 10,
    },
    rotulo: {
        color: "#777F8D",
        fontFamily: "Poppins",
        fontSize: 12,
        marginBottom: 3,
    },
    valor: {
        color: "#252B3B",
        fontFamily: "Poppins",
        fontSize: 15,
    },
    campoEdicao: {
        minHeight: 44,
        borderWidth: 1,
        borderColor: "#D5E1EA",
        borderRadius: 10,
        paddingHorizontal: 12,
        color: "#252B3B",
        fontFamily: "Poppins",
        fontSize: 14,
        backgroundColor: "#FFFFFF",
    },
    acoes: {
        width: "100%",
        flexDirection: "row",
        gap: 12,
        marginTop: 12,
    },
    botao: {
        minHeight: 48,
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 12,
    },
    botaoVoltar: {
        backgroundColor: "#F3F4F6",
    },
    botaoEditar: {
        backgroundColor: "#5965A8",
    },
    textoVoltar: {
        color: "#374151",
        fontFamily: "Poppins",
        fontSize: 14,
    },
    textoEditar: {
        color: "#FFFFFF",
        fontFamily: "Poppins",
        fontSize: 14,
    },
    botaoSenha: {
        width: "100%",
        minHeight: 48,
        marginTop: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderWidth: 1,
        borderColor: "#5965A8",
        borderRadius: 12,
    },
    textoBotaoSenha: {
        color: "#5965A8",
        fontFamily: "Poppins",
        fontSize: 14,
    },
    pressionado: {
        opacity: 0.78,
    },
});
