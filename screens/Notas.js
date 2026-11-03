import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Plus, RefreshCw } from "lucide-react-native";

const API_URL = "https://p01--psicodaily-api--zfhqcbxfx5v8.code.run";

function extrairRegistros(dados) {
    if (Array.isArray(dados)) return dados;
    const lista = dados?.registros || dados?.entradas || dados?.diarios || dados?.diario || dados?.data || dados?.results;
    if (Array.isArray(lista)) return lista;
    if (lista && typeof lista === "object") {
        if (lista.id_registro || lista.id_diario || lista.id || lista.texto || lista.conteudo || lista.registro) return [lista];
        return extrairRegistros(lista);
    }
    const registro = dados?.registro || dados?.entrada || dados?.data?.registro || lista;
    return registro && typeof registro === "object" ? [registro] : [];
}

function dataDoRegistro(registro) {
    const valor = registro.data_hora || registro.criado_em || registro.data_registro || registro.data || registro.created_at;
    if (!valor) return null;
    const texto = String(valor).trim();
    const brasileira = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})(.*)$/);
    const iso = brasileira ? `${brasileira[3]}-${brasileira[2]}-${brasileira[1]}${brasileira[4]}` : texto;
    const data = new Date(iso);
    return Number.isNaN(data.getTime()) ? null : data;
}

function idDoUsuario(registro) {
    return registro.id_usuario
        ?? registro.usuario_id
        ?? registro.paciente_id
        ?? registro.usuario?.id_usuario
        ?? registro.paciente?.id_usuario;
}

function textoRegistro(registro) {
    return registro.texto || registro.anotacoes || registro.anotação || registro.registro || registro.conteudo || registro.conteúdo || registro.descricao || registro.descrição || registro.anotacao || registro.observacao || "Sem descrição";
}

function humorDoRegistro(registro) {
    const humor = String(registro.humor || registro.emocao || registro.sentimento || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (humor.includes("feliz") || humor.includes("bem") || humor.includes("bom")) return { emoji: "☻", cor: "#DDF4E8", texto: "Bem" };
    if (humor.includes("trist") || humor.includes("mal") || humor.includes("ansios") || humor.includes("dific")) return { emoji: "☹", cor: "#FFE1E1", texto: "Difícil" };
    return { emoji: "●", cor: "#FFF0C7", texto: humor || "Neutro" };
}

function formatarData(data) {
    if (!data) return "Data não informada";
    const hoje = new Date();
    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);
    const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    if (data.toDateString() === hoje.toDateString()) return `Hoje, ${hora}`;
    if (data.toDateString() === ontem.toDateString()) return `Ontem, ${hora}`;
    return `${data.toLocaleDateString("pt-BR", { weekday: "long" })}, ${hora}`;
}

function RegistroCard({ registro }) {
    const data = dataDoRegistro(registro);
    const humor = humorDoRegistro(registro);
    const sono = registro.horas_sono || registro.sono || registro.duracao_sono;
    const atividade = registro.atividade || registro.atividade_fisica || registro.pratica;
    const alimentacao = Array.isArray(registro.alimentacao) ? registro.alimentacao.join(", ") : registro.alimentacao;

    return (
        <View style={styles.registro}>
            <View style={[styles.iconeHumor, { backgroundColor: humor.cor }]}>
                <Text style={styles.emojiHumor}>{humor.emoji}</Text>
            </View>
            <View style={styles.conteudoRegistro}>
                <Text style={styles.dataRegistro}>{formatarData(data)}</Text>
                <Text style={styles.textoRegistro} numberOfLines={2}>{textoRegistro(registro)}</Text>
                {(sono || atividade) ? (
                    <View style={styles.etiquetas}>
                        {sono ? <Text style={styles.etiqueta}>▤ {String(sono).includes("h") ? sono : `${sono}h`}</Text> : null}
                        {atividade ? <Text style={styles.etiqueta}>♟ {atividade}</Text> : null}
                        {registro.agua_suficiente ? <Text style={styles.etiqueta}>Água</Text> : null}
                        {alimentacao ? <Text style={styles.etiqueta}>{alimentacao}</Text> : null}
                    </View>
                ) : null}
            </View>
        </View>
    );
}

export default function Notas() {
    const navigation = useNavigation();
    const [registros, setRegistros] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [atualizacao, setAtualizacao] = useState(0);

    useFocusEffect(useCallback(() => {
        let ativo = true;
        const carregarRegistros = async () => {
            try {
                const [token, usuarioSalvo, idSalvo] = await Promise.all([
                    AsyncStorage.getItem("@psicodaily_token"),
                    AsyncStorage.getItem("@psicodaily_usuario"),
                    AsyncStorage.getItem("@psicodaily_id_usuario"),
                ]);
                if (!token) throw new Error("Entre na sua conta para ver os registros do diário.");
                const usuario = usuarioSalvo ? JSON.parse(usuarioSalvo) : {};
                const resposta = await fetch(`${API_URL}/api/diario/`, {
                    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
                });
                const texto = await resposta.text();
                let payload;
                try {
                    payload = texto ? JSON.parse(texto) : [];
                } catch {
                    throw new Error("O servidor retornou uma resposta inválida ao carregar o diário.");
                }
                if (!resposta.ok) throw new Error(payload?.error || payload?.message || "Não foi possível carregar os registros do diário.");

                const lista = extrairRegistros(payload);
                if (!Array.isArray(lista)) throw new Error("O formato dos registros do diário retornado pelo servidor é inválido.");
                const idUsuario = usuario.id_usuario ?? usuario.id ?? idSalvo;
                const resultado = lista
                    .filter((registro) => {
                        const idRegistro = idDoUsuario(registro);
                        return idUsuario == null || idRegistro == null || String(idRegistro) === String(idUsuario);
                    })
                    .sort((a, b) => (dataDoRegistro(b)?.getTime() || 0) - (dataDoRegistro(a)?.getTime() || 0));

                if (ativo) {
                    setRegistros(resultado);
                    setErro("");
                }
            } catch (error) {
                if (ativo) {
                    setRegistros([]);
                    setErro(error.message || "Não foi possível carregar os registros do diário.");
                }
            } finally {
                if (ativo) setCarregando(false);
            }
        };

        setCarregando(true);
        carregarRegistros();
        return () => { ativo = false; };
    }, [atualizacao]));

    return (
        <SafeAreaView style={styles.tela}>
            <View style={styles.cartao}>
                <View style={styles.cabecalho}>
                    <Text style={styles.titulo}>Diário</Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Adicionar registro ao diário"
                        onPress={() => navigation.navigate("Diario")}
                        style={({ pressed }) => [styles.botaoAdicionar, pressed && styles.pressionado]}
                    >
                        <Plus color="#333333" size={21} />
                    </Pressable>
                </View>

                {carregando ? (
                    <View style={styles.estado}><ActivityIndicator color="#53C68C" /><Text style={styles.mensagem}>Carregando registros...</Text></View>
                ) : erro ? (
                    <Pressable onPress={() => setAtualizacao((valor) => valor + 1)} style={styles.estado} accessibilityRole="button">
                        <Text style={styles.erro}>{erro}</Text>
                        <View style={styles.tentarNovamente}><RefreshCw color="#0875C9" size={14} /><Text style={styles.linkTentar}>Tentar novamente</Text></View>
                    </Pressable>
                ) : (
                    <FlatList
                        data={registros}
                        keyExtractor={(item, index) => String(item.id_registro || item.id_diario || item.id || `${dataDoRegistro(item)?.toISOString()}-${index}`)}
                        renderItem={({ item }) => <RegistroCard registro={item} />}
                        ItemSeparatorComponent={() => <View style={styles.separador} />}
                        contentContainerStyle={registros.length ? styles.lista : styles.listaVazia}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={<Text style={styles.mensagem}>Ainda não há registros no diário. Toque em + para criar o primeiro.</Text>}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    tela: { flex: 1, backgroundColor: "#E1F3FF", paddingHorizontal: 11, paddingTop: 33 },
    cartao: { width: "100%", maxWidth: 560, maxHeight: "82%", alignSelf: "center", paddingHorizontal: 12, paddingTop: 7, paddingBottom: 8, backgroundColor: "#FFFFFF", borderRadius: 11 },
    cabecalho: { minHeight: 38, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    titulo: { color: "#1F2937", fontFamily: "Poppins", fontSize: 18 },
    botaoAdicionar: { width: 34, height: 34, alignItems: "center", justifyContent: "center", borderRadius: 17 },
    lista: { paddingBottom: 5 },
    listaVazia: { flexGrow: 1, minHeight: 140, justifyContent: "center", paddingHorizontal: 10 },
    registro: { minHeight: 58, flexDirection: "row", alignItems: "flex-start", paddingVertical: 7 },
    iconeHumor: { width: 31, height: 31, borderRadius: 16, alignItems: "center", justifyContent: "center", marginRight: 12, marginTop: 2 },
    emojiHumor: { color: "#55BD8A", fontFamily: "Poppins", fontSize: 16 },
    conteudoRegistro: { flex: 1 },
    dataRegistro: { color: "#263244", fontFamily: "Poppins", fontSize: 11 },
    textoRegistro: { color: "#6B7280", fontFamily: "Poppins", fontSize: 11, lineHeight: 16, marginTop: 1 },
    etiquetas: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 4 },
    etiqueta: { overflow: "hidden", color: "#4B5563", backgroundColor: "#F1F4F7", fontFamily: "Poppins", fontSize: 9, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9 },
    separador: { height: 1, backgroundColor: "#E8F0F7" },
    estado: { minHeight: 130, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
    mensagem: { color: "#6B7280", fontFamily: "Poppins", fontSize: 12, textAlign: "center" },
    erro: { color: "#A33D3D", fontFamily: "Poppins", fontSize: 11, textAlign: "center" },
    tentarNovamente: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
    linkTentar: { color: "#0875C9", fontFamily: "Poppins", fontSize: 11 },
    pressionado: { opacity: 0.7 },
});
