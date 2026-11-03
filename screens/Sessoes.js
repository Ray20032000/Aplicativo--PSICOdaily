import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { CalendarPlus, Video, Star } from "lucide-react-native";

const API_URL = "https://p01--psicodaily-api--zfhqcbxfx5v8.code.run";

function extrairConsultas(dados) {
    if (Array.isArray(dados)) return dados;
    const lista = dados?.consultas || dados?.agendamentos || dados?.sessoes || dados?.data || dados?.resultados;
    if (Array.isArray(lista)) return lista;
    if (lista && typeof lista === "object") return extrairConsultas(lista);
    const consulta = dados?.consulta || dados?.data?.consulta || lista;
    return consulta && typeof consulta === "object" ? [consulta] : [];
}

function dataDaConsulta(consulta) {
    const data = consulta.data_hora_inicio || consulta.data_consulta || consulta.data_agendamento || consulta.data || consulta.data_hora || consulta.datetime || consulta.inicio;
    if (!data) return null;

    let dataTexto = String(data).trim();
    const hora = consulta.horario_consulta || consulta.hora_consulta || consulta.horario || consulta.hora || consulta.hora_inicio;
    const brasileira = dataTexto.match(/^(\d{2})\/(\d{2})\/(\d{4})(.*)$/);
    if (brasileira) {
        const [, dia, mes, ano, restante] = brasileira;
        dataTexto = `${ano}-${mes}-${dia}${restante}`;
    }
    if (hora && !/[T ]\d{2}:\d{2}/.test(dataTexto)) {
        dataTexto = `${dataTexto.slice(0, 10)}T${String(hora).slice(0, 5)}:00`;
    }

    const dataConvertida = new Date(dataTexto);
    return Number.isNaN(dataConvertida.getTime()) ? null : dataConvertida;
}

function pertenceAoUsuario(consulta, idUsuario) {
    const idPaciente = consulta.id_usuario
        ?? consulta.usuario_id
        ?? consulta.id_paciente
        ?? consulta.paciente_id
        ?? consulta.usuario?.id_usuario
        ?? consulta.paciente?.id_usuario
        ?? consulta.cliente?.id_usuario;
    return idUsuario == null || idPaciente == null || String(idPaciente) === String(idUsuario);
}

function foiCancelada(consulta) {
    const status = String(consulta.status || consulta.estado || consulta.status_consulta || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return status.includes("cancel") || status.includes("exclu");
}

function nomeDoProfissional(consulta) {
    return consulta.psicologo?.nome
        || consulta.profissional?.nome
        || consulta.profissional_nome
        || consulta.nome_psicologo
        || consulta.nome_profissional
        || consulta.psicologo_nome
        || "Profissional não informado";
}

function linkDaConsulta(consulta) {
    return consulta.link_reuniao || consulta.meet_url || consulta.url_sessao || consulta.link_consulta || consulta.link;
}

function formatarDia(data) {
    return data.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
    });
}

function SessaoCard({ consulta, onEntrar, onCancelar, onAvaliar }) {
    const data = dataDaConsulta(consulta);
    const hoje = data.toDateString() === new Date().toDateString();
    const link = linkDaConsulta(consulta);
    const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const statusOriginal = String(consulta.status || consulta.estado || "");
    const status = statusOriginal.toUpperCase();
    const podeCancelar = !["CANCELADO", "REALIZADO"].includes(status) && data.getTime() - Date.now() > 15 * 60 * 1000;
    const podeEntrar = hoje && link && Date.now() >= data.getTime() - 15 * 60 * 1000 && status !== "CANCELADO";

    return (
        <View style={[styles.cardSessao, hoje && styles.cardHoje]}>
            <View style={styles.dadosSessao}>
                <Text style={styles.tituloSessao}>{hoje ? "Sessão hoje" : "Sessão marcada"}</Text>
                <Text style={styles.textoSessao}>{formatarDia(data)}</Text>
                <Text style={styles.textoSessao}>{hora}</Text>
                <Text style={styles.textoSessao} numberOfLines={1}>{nomeDoProfissional(consulta)}</Text>
                {status && status !== "AGENDADA" ? (
                    <Text style={styles.statusSessao}>{statusOriginal}</Text>
                ) : null}
            </View>
            {podeEntrar ? (
                <Pressable onPress={() => onEntrar(link)} style={styles.botaoEntrar} accessibilityRole="button">
                    <Video color="#FFFFFF" size={15} />
                    <Text style={styles.textoEntrar}>Entrar agora</Text>
                </Pressable>
            ) : null}
            {podeCancelar || (status === "REALIZADO" && consulta.nota_avaliacao == null) ? <View style={styles.acoesSessao}>
                {podeCancelar ? <Pressable onPress={() => onCancelar(consulta)} style={styles.botaoSecundario}><Text style={styles.textoAcao}>Cancelar</Text></Pressable> : null}
                {status === "REALIZADO" && consulta.nota_avaliacao == null ? <Pressable onPress={() => onAvaliar(consulta)} style={styles.botaoSecundario}><Star size={13} color="#0875C9" /><Text style={styles.textoAcao}>Avaliar</Text></Pressable> : null}
            </View> : null}
        </View>
    );
}

export default function Sessoes() {
    const navigation = useNavigation();
    const [sessoes, setSessoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [, setSalvandoAcao] = useState(false);

    useFocusEffect(useCallback(() => {
        let ativo = true;

        const carregarSessoes = async () => {
            try {
                const [token, usuarioSalvo, idSalvo] = await Promise.all([
                    AsyncStorage.getItem("@psicodaily_token"),
                    AsyncStorage.getItem("@psicodaily_usuario"),
                    AsyncStorage.getItem("@psicodaily_id_usuario"),
                ]);
                if (!token) throw new Error("Entre na sua conta para ver suas sessões.");

                const usuario = usuarioSalvo ? JSON.parse(usuarioSalvo) : {};
                const resposta = await fetch(`${API_URL}/api/consultas/`, {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                const texto = await resposta.text();
                let payload;
                try {
                    payload = texto ? JSON.parse(texto) : [];
                } catch {
                    throw new Error("O servidor retornou uma resposta inválida ao carregar as sessões.");
                }
                if (!resposta.ok) {
                    throw new Error(payload?.error || payload?.message || "Não foi possível carregar suas sessões.");
                }

                const lista = extrairConsultas(payload);
                if (!Array.isArray(lista)) throw new Error("O formato da lista de sessões retornada pelo servidor é inválido.");
                const idUsuario = usuario.id_usuario ?? usuario.id ?? idSalvo;
                const resultado = lista
                    .filter((consulta) => pertenceAoUsuario(consulta, idUsuario) && dataDaConsulta(consulta))
                    .sort((a, b) => {
                        const agora = new Date();
                        const dataA = dataDaConsulta(a);
                        const dataB = dataDaConsulta(b);
                        const futuraA = dataA >= agora;
                        const futuraB = dataB >= agora;
                        if (futuraA !== futuraB) return futuraA ? -1 : 1;
                        return futuraA ? dataA - dataB : dataB - dataA;
                    });

                if (ativo) {
                    setSessoes(resultado);
                    setErro("");
                }
            } catch (error) {
                if (ativo) {
                    setSessoes([]);
                    setErro(error.message || "Não foi possível carregar suas sessões.");
                }
            } finally {
                if (ativo) setCarregando(false);
            }
        };

        setCarregando(true);
        carregarSessoes();
        return () => { ativo = false; };
    }, [refreshKey]));

    const entrarNaSessao = async (link) => {
        try {
            await Linking.openURL(link);
        } catch {
            Alert.alert("Link indisponível", "Não foi possível abrir o link desta sessão.");
        }
    };

    const cancelarSessao = (consulta) => Alert.alert("Cancelar sessão?", "A política de reembolso depende do horário do atendimento.", [
        { text: "Manter sessão", style: "cancel" },
        { text: "Cancelar", style: "destructive", onPress: async () => {
            try {
                setSalvandoAcao(true);
                const token = await AsyncStorage.getItem("@psicodaily_token");
                const id = consulta.sessao_id || consulta.id_sessao || consulta.id_consulta || consulta.id;
                const response = await fetch(`${API_URL}/api/consultas/${id}/cancelar`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
                const payload = await response.json();
                if (!response.ok) throw new Error(payload.error || "Não foi possível cancelar a sessão.");
                Alert.alert("Sessão cancelada", payload.reembolso_centavos ? `A equipe processará o reembolso de ${(payload.reembolso_centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.` : "Sua sessão foi cancelada.");
                setRefreshKey((value) => value + 1);
            } catch (error) { Alert.alert("Cancelamento não concluído", error.message); }
            finally { setSalvandoAcao(false); }
        } },
    ]);

    const avaliarSessao = (consulta) => Alert.alert("Como foi sua sessão?", "Escolha uma nota de 1 a 5 estrelas.", [1, 2, 3, 4, 5].map((nota) => ({ text: `${"★".repeat(nota)}`, onPress: async () => {
        try {
            setSalvandoAcao(true);
            const token = await AsyncStorage.getItem("@psicodaily_token");
            const id = consulta.sessao_id || consulta.id_sessao || consulta.id_consulta || consulta.id;
            const response = await fetch(`${API_URL}/api/consultas/${id}/avaliacao`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ nota }) });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload.error || "Não foi possível enviar sua avaliação.");
            Alert.alert("Obrigado pela avaliação", "Sua opinião ajuda outros pacientes.");
            setRefreshKey((value) => value + 1);
        } catch (error) { Alert.alert("Avaliação não enviada", error.message); }
        finally { setSalvandoAcao(false); }
    } })),
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.pagina}>
                <Text style={styles.tituloPagina}>Minhas sessões</Text>
                <Text style={styles.subtituloPagina}>Consulte seus atendimentos agendados</Text>

                {carregando ? (
                    <View style={styles.estado}>
                        <ActivityIndicator color="#0875C9" size="large" />
                        <Text style={styles.mensagemEstado}>Carregando sessões...</Text>
                    </View>
                ) : erro ? (
                    <Pressable onPress={() => setRefreshKey((atual) => atual + 1)} style={styles.estado} accessibilityRole="button">
                        <Text style={styles.mensagemErro}>{erro}</Text>
                        <Text style={styles.textoTentar}>Toque para tentar novamente</Text>
                    </Pressable>
                ) : (
                    <FlatList
                        data={sessoes}
                        keyExtractor={(item, index) => String(item.sessao_id || item.id_consulta || item.id_sessao || item.id || `${dataDaConsulta(item)?.toISOString()}-${index}`)}
                        renderItem={({ item }) => <SessaoCard consulta={item} onEntrar={entrarNaSessao} onCancelar={cancelarSessao} onAvaliar={avaliarSessao} />}
                        contentContainerStyle={sessoes.length ? styles.lista : styles.listaVazia}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={<Text style={styles.mensagemEstado}>Você ainda não tem sessões agendadas.</Text>}
                    />
                )}

                <Pressable
                    onPress={() => navigation.navigate("Profissionais")}
                    style={({ pressed }) => [styles.botaoMarcar, pressed && styles.pressionado]}
                    accessibilityRole="button"
                >
                    <Text style={styles.textoMarcar}>Marcar sessão</Text>
                    <CalendarPlus color="#FFFFFF" size={19} />
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#E1F3FF" },
    pagina: { flex: 1, margin: 9, marginBottom: 12, padding: 10, backgroundColor: "#FFFFFF", borderRadius: 14, elevation: 3 },
    tituloPagina: { color: "#0875C9", fontFamily: "Poppins", fontSize: 19, marginHorizontal: 2, marginTop: 2 },
    subtituloPagina: { color: "#667085", fontFamily: "Poppins", fontSize: 11, marginHorizontal: 2, marginBottom: 10 },
    lista: { gap: 7, paddingBottom: 10 },
    listaVazia: { flexGrow: 1, alignItems: "center", justifyContent: "center", paddingBottom: 30 },
    cardSessao: { minHeight: 74, flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: "#49A5FF", borderRadius: 12, backgroundColor: "#FFFFFF" },
    cardHoje: { backgroundColor: "#DCEEFF", borderColor: "#2484D1" },
    dadosSessao: { flex: 1, paddingRight: 8 },
    tituloSessao: { color: "#0068C9", fontFamily: "Poppins", fontSize: 13 },
    textoSessao: { color: "#222222", fontFamily: "Poppins", fontSize: 10, lineHeight: 13 },
    statusSessao: { color: "#667085", fontFamily: "Poppins", fontSize: 9, marginTop: 2, textTransform: "capitalize" },
    botaoEntrar: { minHeight: 34, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingHorizontal: 8, backgroundColor: "#2474B5", borderRadius: 7 },
    textoEntrar: { color: "#FFFFFF", fontFamily: "Poppins", fontSize: 10 },
    acoesSessao: { width: "100%", flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 8 },
    botaoSecundario: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 6, paddingHorizontal: 9, backgroundColor: "#EAF5FC", borderRadius: 8 },
    textoAcao: { color: "#315B7A", fontSize: 10, fontFamily: "Poppins" },
    estado: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
    mensagemEstado: { color: "#667085", fontFamily: "Poppins", fontSize: 13, textAlign: "center" },
    mensagemErro: { color: "#A33D3D", fontFamily: "Poppins", fontSize: 12, textAlign: "center" },
    textoTentar: { color: "#0875C9", fontFamily: "Poppins", fontSize: 11, marginTop: 8 },
    botaoMarcar: { minHeight: 43, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 9, paddingHorizontal: 14, backgroundColor: "#0757B5", borderRadius: 8, alignSelf: "flex-start" },
    textoMarcar: { color: "#FFFFFF", fontFamily: "Poppins", fontSize: 14 },
    pressionado: { opacity: 0.78 },
});
