import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Search, UserRound } from "lucide-react-native";

const API_URL = "https://api.psicodaily.tech";

function extrairProfissionais(resposta) {
    if (Array.isArray(resposta)) return resposta;
    if (Array.isArray(resposta?.usuarios)) return resposta.usuarios;
    if (Array.isArray(resposta?.profissionais)) return resposta.profissionais;
    if (Array.isArray(resposta?.psicologos)) return resposta.psicologos;
    if (Array.isArray(resposta?.data)) return resposta.data;
    return [];
}

function ehPsicologo(usuario) {
    const tipo = String(usuario?.tipo_usuario || usuario?.tipo || usuario?.cargo || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    if (!tipo) {
        return Boolean(usuario?.crp || usuario?.especialidade || usuario?.especialidades);
    }
    return tipo.includes("psic") || tipo.includes("profissional");
}

function CardProfissional({ profissional, onPress }) {
    const nome = profissional.nome || profissional.nome_completo || "Psicólogo";
    const foto = profissional.foto_url || profissional.foto_perfil || profissional.foto || profissional.imagem || profissional.imagem_perfil;
    const especialidade = profissional.especialidade || profissional.especialidades || profissional.abordagem || profissional.conselho_numero;

    return (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressionado]}
        >
            {foto ? (
                <Image source={{ uri: foto }} style={styles.foto} />
            ) : (
                <View style={styles.fotoFallback}>
                    <UserRound color="#67718A" size={28} />
                </View>
            )}
            <View style={styles.dadosCard}>
                <Text style={styles.nomeProfissional} numberOfLines={1}>{nome}</Text>
                <Text style={styles.subtitulo} numberOfLines={1}>
                    {especialidade || profissional.crp || "Psicólogo(a)"}
                </Text>
                {profissional.cidade ? (
                    <Text style={styles.local} numberOfLines={1}>{profissional.cidade}</Text>
                ) : null}
            </View>
            <Text style={styles.seta}>›</Text>
        </Pressable>
    );
}

export default function Marketplace() {
    const navigation = useNavigation();
    const [busca, setBusca] = useState("");
    const [profissionais, setProfissionais] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const carregarProfissionais = useCallback(async () => {
        setCarregando(true);
        setErro("");
        try {
            const resposta = await fetch(`${API_URL}/api/profissionais/`, {
                headers: { Accept: "application/json" },
            });
            const texto = await resposta.text();
            let dados;
            try {
                dados = texto ? JSON.parse(texto) : [];
            } catch {
                throw new Error("O servidor retornou uma resposta inválida.");
            }
            if (!resposta.ok) {
                throw new Error(dados?.error || dados?.message || "Não foi possível carregar os profissionais.");
            }
            const lista = extrairProfissionais(dados).filter(ehPsicologo);
            setProfissionais(lista);
        } catch (error) {
            setErro(error.message || "Não foi possível carregar os profissionais.");
        } finally {
            setCarregando(false);
        }
    }, []);

    useFocusEffect(useCallback(() => {
        carregarProfissionais();
    }, [carregarProfissionais]));

    const profissionaisFiltrados = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase("pt-BR");
        if (!termo) return profissionais;
        return profissionais.filter((profissional) => {
            const texto = [
                profissional.nome,
                profissional.nome_completo,
                profissional.especialidade,
                profissional.especialidades,
                profissional.abordagem,
                profissional.crp,
                profissional.conselho_numero,
                profissional.cidade,
            ].filter(Boolean).join(" ").toLocaleLowerCase("pt-BR");
            return texto.includes(termo);
        });
    }, [busca, profissionais]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topo}>
                <Text style={styles.titulo}>Encontre seu psicólogo</Text>
                <Text style={styles.descricao}>Profissionais para acompanhar você</Text>
                <View style={styles.buscaContainer}>
                    <Search color="#777F8D" size={20} />
                    <TextInput
                        value={busca}
                        onChangeText={setBusca}
                        placeholder="Buscar por nome ou especialidade"
                        placeholderTextColor="#9298A4"
                        style={styles.inputBusca}
                        returnKeyType="search"
                        accessibilityLabel="Buscar profissionais"
                    />
                </View>
            </View>

            <FlatList
                data={profissionaisFiltrados}
                keyExtractor={(item, index) => String(item.id_usuario || item.id || item.email || index)}
                contentContainerStyle={styles.lista}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <CardProfissional
                        profissional={item}
                        onPress={() => navigation.navigate("DescricaoPsicologo", { psicologo: item })}
                    />
                )}
                ListEmptyComponent={(
                    <View style={styles.estadoVazio}>
                        {carregando ? (
                            <ActivityIndicator color="#5965A8" size="large" />
                        ) : (
                            <Text style={styles.mensagemEstado}>
                                {erro || (busca ? "Nenhum profissional encontrado para essa busca." : "Nenhum psicólogo encontrado.")}
                            </Text>
                        )}
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F6F8" },
    topo: { width: "100%", alignItems: "center", paddingHorizontal: 22, paddingTop: 22, paddingBottom: 18 },
    titulo: { color: "#252B3B", fontFamily: "Poppins", fontSize: 21, textAlign: "center" },
    descricao: { color: "#777F8D", fontFamily: "Poppins", fontSize: 13, marginTop: 3, textAlign: "center" },
    buscaContainer: {
        width: "100%", maxWidth: 520, minHeight: 50, marginTop: 20, paddingHorizontal: 15,
        flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF",
        borderRadius: 14, borderWidth: 1, borderColor: "#E3E5EA",
    },
    inputBusca: { flex: 1, color: "#252B3B", fontFamily: "Poppins", fontSize: 13, paddingVertical: 10 },
    lista: { width: "100%", maxWidth: 564, alignSelf: "center", paddingHorizontal: 22, paddingBottom: 24, gap: 12, flexGrow: 1 },
    card: {
        minHeight: 94, flexDirection: "row", alignItems: "center", padding: 14,
        backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1, borderColor: "#ECEEF2",
    },
    cardPressionado: { opacity: 0.78 },
    foto: { width: 62, height: 62, borderRadius: 31, backgroundColor: "#E8EAF0" },
    fotoFallback: { width: 62, height: 62, borderRadius: 31, backgroundColor: "#E8EAF0", alignItems: "center", justifyContent: "center" },
    dadosCard: { flex: 1, marginLeft: 14 },
    nomeProfissional: { color: "#252B3B", fontFamily: "Poppins", fontSize: 15 },
    subtitulo: { color: "#5965A8", fontFamily: "Poppins", fontSize: 12, marginTop: 3 },
    local: { color: "#777F8D", fontFamily: "Poppins", fontSize: 11, marginTop: 2 },
    seta: { color: "#8B91A0", fontSize: 28, marginLeft: 8 },
    estadoVazio: { flex: 1, minHeight: 180, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
    mensagemEstado: { color: "#777F8D", fontFamily: "Poppins", fontSize: 14, textAlign: "center" },
});
