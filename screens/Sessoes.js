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
import { CalendarPlus, Video } from "lucide-react-native";

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
    const data = consulta.data_consulta || consulta.data_agendamento || consulta.data || consulta.data_hora || consulta.datetime || consulta.inicio;
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

function SessaoCard({ consulta, onEntrar }) {
    const data = dataDaConsulta(consulta);
    const hoje = data.toDateString() === new Date().toDateString();
    const link = linkDaConsulta(consulta);
    const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const status = String(consulta.status || consulta.estado || "").toLowerCase();

    return (
        <View style={[styles.cardSessao, hoje && styles.cardHoje]}>
            <View style={styles.dadosSessao}>
                <Text style={styles.tituloSessao}>{hoje ? "Sessão hoje" : "Sessão marcada"}</Text>
                <Text style={styles.textoSessao}>{formatarDia(data)}</Text>
                <Text style={styles.textoSessao}>{hora}</Text>
                <Text style={styles.textoSessao} numberOfLines={1}>{nomeDoProfissional(consulta)}</Text>
                {status && !["agendada", "marcada", "confirmada"].includes(status) ? (
                    <Text style={styles.statusSessao}>{consulta.status || consulta.estado}</Text>
                ) : null}
            </View>
            {hoje && link ? (
                <Pressable onPress={() => onEntrar(link)} style={styles.botaoEntrar} accessibilityRole="button">
                    <Video color="#FFFFFF" size={15} />
                    <Text style={styles.textoEntrar}>Entrar agora</Text>
                </Pressable>
            ) : null}
        </View>
    );
}

export default function Sessoes() {
    const navigation = useNavigation();
    const [sessoes, setSessoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

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
                    .filter((consulta) => !foiCancelada(consulta) && pertenceAoUsuario(consulta, idUsuario) && dataDaConsulta(consulta))
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
                        keyExtractor={(item, index) => String(item.id_consulta || item.id_sessao || item.id || `${dataDaConsulta(item)?.toISOString()}-${index}`)}
                        renderItem={({ item }) => <SessaoCard consulta={item} onEntrar={entrarNaSessao} />}
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
    cardSessao: { minHeight: 74, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: "#49A5FF", borderRadius: 12, backgroundColor: "#FFFFFF" },
    cardHoje: { backgroundColor: "#DCEEFF", borderColor: "#2484D1" },
    dadosSessao: { flex: 1, paddingRight: 8 },
    tituloSessao: { color: "#0068C9", fontFamily: "Poppins", fontSize: 13 },
    textoSessao: { color: "#222222", fontFamily: "Poppins", fontSize: 10, lineHeight: 13 },
    statusSessao: { color: "#667085", fontFamily: "Poppins", fontSize: 9, marginTop: 2, textTransform: "capitalize" },
    botaoEntrar: { minHeight: 34, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingHorizontal: 8, backgroundColor: "#2474B5", borderRadius: 7 },
    textoEntrar: { color: "#FFFFFF", fontFamily: "Poppins", fontSize: 10 },
    estado: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
    mensagemEstado: { color: "#667085", fontFamily: "Poppins", fontSize: 13, textAlign: "center" },
    mensagemErro: { color: "#A33D3D", fontFamily: "Poppins", fontSize: 12, textAlign: "center" },
    textoTentar: { color: "#0875C9", fontFamily: "Poppins", fontSize: 11, marginTop: 8 },
    botaoMarcar: { minHeight: 43, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, marginTop: 9, paddingHorizontal: 14, backgroundColor: "#0757B5", borderRadius: 8, alignSelf: "flex-start" },
    textoMarcar: { color: "#FFFFFF", fontFamily: "Poppins", fontSize: 14 },
    pressionado: { opacity: 0.78 },
});
