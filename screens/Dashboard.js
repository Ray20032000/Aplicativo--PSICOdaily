import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    ActivityIndicator,
} from "react-native";

import {
    TrendingUp,
    CalendarDays,
    Brain,
    CheckCircle2,
    MessageCircle,
} from "lucide-react-native";

const API_URL = "https://api.psicodaily.tech";

function extrairConsultas(dados) {
    if (Array.isArray(dados)) return dados;
    return dados?.consultas || dados?.agendamentos || dados?.sessoes || dados?.data || dados?.resultados || [];
}

function extrairRegistrosDiario(dados) {
    if (Array.isArray(dados)) return dados;
    const lista = dados?.registros || dados?.entradas || dados?.diarios || dados?.diario || dados?.data || dados?.results;
    if (Array.isArray(lista)) return lista;
    if (lista && typeof lista === "object") {
        if (lista.id_registro || lista.id_diario || lista.id || lista.humor) return [lista];
        return extrairRegistrosDiario(lista);
    }
    return dados?.registro ? [dados.registro] : [];
}

function dataDoRegistro(registro) {
    const valor = registro.data_hora || registro.criado_em || registro.data_registro || registro.data || registro.created_at;
    if (!valor) return null;
    const texto = String(valor).trim();
    const brasileira = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})(.*)$/);
    let iso = brasileira ? `${brasileira[3]}-${brasileira[2]}-${brasileira[1]}${brasileira[4]}` : texto;
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) iso = `${iso}T12:00:00`;
    const data = new Date(iso);
    return Number.isNaN(data.getTime()) ? null : data;
}

function notaHumor(registro) {
    const valor = registro.humor ?? registro.emocao ?? registro.sentimento;
    if (typeof valor === "number") return Math.max(1, Math.min(5, valor));
    if (valor != null && valor !== "" && Number.isFinite(Number(valor))) return Math.max(1, Math.min(5, Number(valor)));
    const humor = String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (humor === "pessimo") return 1;
    if (humor === "ruim") return 2;
    if (humor === "bom") return 4;
    if (humor === "excelente") return 5;
    if (humor.includes("muito_mal") || humor.includes("muito mal")) return 1;
    if (humor === "mal" || humor.includes("dificil") || humor.includes("trist") || humor.includes("ansios")) return 2;
    if (humor.includes("neutro") || humor.includes("mais ou menos")) return 3;
    if (humor.includes("muito_bem") || humor.includes("muito bem")) return 5;
    if (humor === "bem" || humor.includes("feliz")) return 4;
    return null;
}

function montarGraficoHumor(registros) {
    const dias = Array.from({ length: 7 }, (_, indice) => {
        const data = new Date();
        data.setHours(12, 0, 0, 0);
        data.setDate(data.getDate() - (6 - indice));
        const notasDoDia = registros
            .filter((registro) => {
                const dataRegistro = dataDoRegistro(registro);
                return dataRegistro && dataRegistro.toDateString() === data.toDateString();
            })
            .map(notaHumor)
            .filter((nota) => nota != null);
        const media = notasDoDia.length
            ? notasDoDia.reduce((total, nota) => total + nota, 0) / notasDoDia.length
            : null;
        return {
            dia: data.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
            valor: media,
            altura: media == null ? 7 : 14 + (media / 5) * 82,
            temRegistro: media != null,
            destaque: data.toDateString() === new Date().toDateString(),
        };
    });
    const notas = dias.map((dia) => dia.valor).filter((nota) => nota != null);
    const mediaSemanal = notas.length ? notas.reduce((total, nota) => total + nota, 0) / notas.length : null;
    return { dias, mediaSemanal, quantidade: notas.length };
}

function dataDaConsulta(consulta) {
    const data = consulta.data_hora_inicio || consulta.data_consulta || consulta.data_agendamento || consulta.data || consulta.data_hora || consulta.datetime || consulta.inicio;
    if (!data) return null;

    const stringData = String(data).trim();
    const hora = consulta.horario_consulta || consulta.hora_consulta || consulta.horario || consulta.hora || consulta.hora_inicio;
    let dataComHora = stringData;

    const dataBrasileira = stringData.match(/^(\d{2})\/(\d{2})\/(\d{4})(.*)$/);
    if (dataBrasileira) {
        const [, dia, mes, ano, restante] = dataBrasileira;
        dataComHora = `${ano}-${mes}-${dia}${restante}`;
    }
    if (hora && !/[T ]\d{2}:\d{2}/.test(dataComHora)) {
        dataComHora = `${dataComHora.slice(0, 10)}T${String(hora).slice(0, 5)}:00`;
    }

    const resultado = new Date(dataComHora);
    return Number.isNaN(resultado.getTime()) ? null : resultado;
}

function statusCanceladoOuFinalizado(consulta) {
    const status = String(consulta.status || consulta.estado || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return status.includes("cancel") || status.includes("conclu") || status.includes("realizad") || status.includes("finaliz");
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

function formatarDataConsulta(data) {
    return data.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
}

export default function Dashboard() {
    const navigation = useNavigation();
    const [usuario, setUsuario] = useState({ nome: "", foto: null });
    const [proximaConsulta, setProximaConsulta] = useState(null);
    const [carregandoConsulta, setCarregandoConsulta] = useState(true);
    const [erroConsulta, setErroConsulta] = useState("");
    const [graficoHumor, setGraficoHumor] = useState(() => montarGraficoHumor([]));
    const [carregandoGrafico, setCarregandoGrafico] = useState(true);
    const [erroGrafico, setErroGrafico] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    useFocusEffect(
        useCallback(() => {
            let ativo = true;

            const carregarDados = async () => {
                try {
                    const [usuarioSalvo, nomeSalvo, idSalvo, token] = await Promise.all([
                        AsyncStorage.getItem("@psicodaily_usuario"),
                        AsyncStorage.getItem("@psicodaily_nome"),
                        AsyncStorage.getItem("@psicodaily_id_usuario"),
                        AsyncStorage.getItem("@psicodaily_token"),
                    ]);
                    const dados = usuarioSalvo ? JSON.parse(usuarioSalvo) : {};
                    const foto = dados.foto_perfil || dados.imagem_perfil || dados.foto || dados.imagem || dados.url_foto || dados.foto_url;

                    if (ativo) {
                        setUsuario({
                            nome: dados.nome || nomeSalvo || "Usuário",
                            foto: typeof foto === "string" ? foto : foto?.uri || null,
                        });
                    }

                    if (!token) {
                        if (ativo) {
                            setGraficoHumor(montarGraficoHumor([]));
                            setErroGrafico("Entre na sua conta para ver o gráfico do diário.");
                        }
                        throw new Error("Entre na sua conta para carregar suas consultas.");
                    }

                    const idUsuario = dados.id_usuario ?? dados.id ?? idSalvo;
                    try {
                        const respostaDiario = await fetch(`${API_URL}/api/registros/`, {
                            headers: {
                                Accept: "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                        });
                        const textoDiario = await respostaDiario.text();
                        let payloadDiario;
                        try {
                            payloadDiario = textoDiario ? JSON.parse(textoDiario) : [];
                        } catch {
                            throw new Error("A API retornou registros do diário inválidos.");
                        }
                        if (!respostaDiario.ok) {
                            throw new Error(payloadDiario?.error || payloadDiario?.message || "Não foi possível carregar o diário.");
                        }
                        const registros = extrairRegistrosDiario(payloadDiario);
                        if (!Array.isArray(registros)) throw new Error("O formato dos registros do diário é inválido.");
                        const registrosDoUsuario = registros.filter((registro) => {
                            const idRegistro = registro.id_usuario
                                ?? registro.usuario_id
                                ?? registro.paciente_id
                                ?? registro.usuario?.id_usuario
                                ?? registro.paciente?.id_usuario;
                            return idUsuario == null || idRegistro == null || String(idRegistro) === String(idUsuario);
                        });
                        if (ativo) {
                            setGraficoHumor(montarGraficoHumor(registrosDoUsuario));
                            setErroGrafico("");
                            setCarregandoGrafico(false);
                        }
                    } catch (errorDiario) {
                        console.warn("Não foi possível carregar registros do diário para o gráfico:", errorDiario);
                        if (ativo) {
                            setGraficoHumor(montarGraficoHumor([]));
                            setErroGrafico(errorDiario.message || "Não foi possível carregar os registros do diário.");
                            setCarregandoGrafico(false);
                        }
                    }

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
                        throw new Error("O servidor retornou uma resposta inválida ao carregar as consultas.");
                    }
                    if (!resposta.ok) {
                        throw new Error(payload?.error || payload?.message || "Não foi possível carregar suas consultas.");
                    }
                    const consultas = extrairConsultas(payload);
                    if (!Array.isArray(consultas)) {
                        throw new Error("O formato da lista de consultas retornada pelo servidor é inválido.");
                    }

                    const agora = new Date();
                    const consultaSeguinte = consultas
                        .filter((consulta) => {
                            if (statusCanceladoOuFinalizado(consulta)) return false;
                            const idDoPaciente = consulta.id_usuario
                                ?? consulta.usuario_id
                                ?? consulta.id_paciente
                                ?? consulta.paciente_id
                                ?? consulta.usuario?.id_usuario
                                ?? consulta.paciente?.id_usuario
                                ?? consulta.cliente?.id_usuario;
                            if (idUsuario != null && idDoPaciente != null && String(idDoPaciente) !== String(idUsuario)) return false;
                            const data = dataDaConsulta(consulta);
                            return data && data >= agora;
                        })
                        .sort((a, b) => dataDaConsulta(a) - dataDaConsulta(b))[0] || null;

                    if (ativo) {
                        setProximaConsulta(consultaSeguinte);
                        setErroConsulta("");
                    }
                } catch (error) {
                    console.warn("Não foi possível carregar o usuário da Dashboard:", error);
                    if (ativo) {
                        setProximaConsulta(null);
                        setErroConsulta(error.message || "Não foi possível carregar sua próxima consulta.");
                    }
                } finally {
                    if (ativo) {
                        setCarregandoConsulta(false);
                        setCarregandoGrafico(false);
                    }
                }
            };

            setCarregandoConsulta(true);
            setCarregandoGrafico(true);
            carregarDados();
            return () => { ativo = false; };
        }, [refreshKey])
    );

    return (
        <View style={styles.container}>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.conteudo}
            >


                <View style={styles.boasVindas}>

                    <View style={styles.avatar}>
                        {usuario.foto ? (
                            <Image source={{ uri: usuario.foto }} style={styles.avatarFoto} />
                        ) : (
                            <Text style={styles.avatarTexto}>
                                {(usuario.nome || "U").trim().charAt(0).toUpperCase()}
                            </Text>
                        )}
                    </View>

                    <View>
                        <Text style={styles.bomDia}>
                            Bom dia,
                        </Text>

                        <Text style={styles.nome}>
                            {usuario.nome}
                        </Text>
                    </View>

                </View>


                {/* ========================= */}
                {/* TÍTULO */}
                {/* ========================= */}

                <Text style={styles.pergunta}>
                    Como está hoje?
                </Text>


                {/* ========================= */}
                {/* PRÓXIMA SESSÃO */}
                {/* ========================= */}

                <Pressable style={styles.recursos} onPress={() => navigation.navigate("Portal")}>
                    <Text style={styles.recursosTexto}>Ver todos os recursos do Psicodaily  ›</Text>
                </Pressable>

                <View style={styles.proximaSessao}>
                    <View style={styles.dadosConsulta}>
                        <Text style={styles.label}>PRÓXIMA CONSULTA</Text>
                        {carregandoConsulta ? (
                            <View style={styles.estadoConsulta}>
                                <ActivityIndicator size="small" color="#FFFFFF" />
                                <Text style={styles.profissional}>Carregando consultas...</Text>
                            </View>
                        ) : erroConsulta ? (
                            <Pressable onPress={() => setRefreshKey((atual) => atual + 1)} accessibilityRole="button">
                                <Text style={styles.data}>Não foi possível carregar</Text>
                                <Text style={styles.profissional}>{erroConsulta} Toque para tentar novamente.</Text>
                            </Pressable>
                        ) : proximaConsulta ? (
                            <>
                                <Text style={styles.data}>
                                    {formatarDataConsulta(dataDaConsulta(proximaConsulta))} às {dataDaConsulta(proximaConsulta).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                </Text>
                                <Text style={styles.profissional}>Com {nomeDoProfissional(proximaConsulta)}</Text>
                            </>
                        ) : (
                            <Text style={styles.data}>Você não tem consultas agendadas</Text>
                        )}
                    </View>
                    <View style={styles.iconeCalendario}>
                        <CalendarDays size={21} color="#FFFFFF" />
                    </View>
                </View>


                {/* ========================= */}
                {/* EVOLUÇÃO SEMANAL */}
                {/* ========================= */}

                <View style={styles.cardGrafico}>

                    <View style={styles.topoGrafico}>

                        <View>

                            <Text style={styles.tituloGrafico}>
                                Evolução Semanal
                            </Text>

                            <Text style={styles.subtituloGrafico}>
                                {carregandoGrafico
                                    ? "Carregando registros do diário..."
                                    : erroGrafico
                                        ? "Não foi possível carregar o diário"
                                        : graficoHumor.mediaSemanal == null
                                            ? "Registre seu humor para acompanhar a semana"
                                            : `Humor médio: ${graficoHumor.mediaSemanal.toFixed(1).replace(".", ",")} / 5`}
                            </Text>

                        </View>

                        <TrendingUp
                            size={23}
                            color="#70B8F0"
                        />

                    </View>


                    {/* GRÁFICO */}

                    <View style={styles.grafico}>
                        {graficoHumor.dias.map((dia, indice) => (
                            <Barra key={`${dia.dia}-${indice}`} {...dia} />
                        ))}
                    </View>

                </View>


                {/* ========================= */}
                {/* RESUMO */}
                {/* ========================= */}

                <View style={styles.resumo}>

                    {/* DICA */}

                    <View style={styles.cardResumo}>

                        <Brain
                            size={21}
                            color="#8C6B20"
                        />

                        <Text style={styles.tituloResumo}>
                            Dica de hoje
                        </Text>

                        <Text style={styles.textoResumo}>
                            Pratique 5 min de
                            {"\n"}
                            respiração.
                        </Text>

                    </View>


                    {/* SESSÕES */}

                    <View style={styles.cardResumo}>

                        <View style={styles.linhaSessoes}>

                            <CheckCircle2
                                size={21}
                                color="#43B889"
                            />

                            <Text style={styles.numero}>
                                12
                            </Text>

                        </View>

                        <Text style={styles.textoResumo}>
                            Sessões
                            {"\n"}
                            concluídas este
                            {"\n"}
                            mês.
                        </Text>

                    </View>

                </View>


                {/* ========================= */}
                {/* RELAXAR */}
                {/* ========================= */}

                <Text style={styles.relaxarTitulo}>
                    Para você relaxar
                </Text>


                <Pressable style={styles.cardMeditacao}>

                    <Image
                        source={require("../assets/relaxar.png")}
                        style={styles.imagemMeditacao}
                    />

                    <View style={styles.sombra} />

                    <View style={styles.infoMeditacao}>

                        <View style={styles.linhaMeditacao}>

                            <Text style={styles.tag}>
                                MEDITAÇÃO
                            </Text>

                            <Text style={styles.tempo}>
                                10 min
                            </Text>

                        </View>

                        <Text style={styles.tituloMeditacao}>
                            Paz Interior e Equilíbrio
                        </Text>

                    </View>

                </Pressable>

            </ScrollView>


            {/* ========================= */}
            {/* BOTÃO FLUTUANTE */}
            {/* ========================= */}

            <Pressable style={styles.chat} onPress={() => navigation.navigate("Mensagens")} accessibilityRole="button" accessibilityLabel="Abrir mensagens">

                <MessageCircle
                    size={24}
                    color="#FFFFFF"
                />

            </Pressable>

        </View>
    );
}


/* ========================================= */
/* BARRA DO GRÁFICO */
/* ========================================= */

function Barra({ altura, dia, destaque, valor, temRegistro }) {

    return (
        <View style={styles.barraArea} accessibilityLabel={temRegistro ? `${dia}: humor ${valor.toFixed(1)} de 5` : `${dia}: sem registro`}>

            <Text style={styles.valorBarra}>
                {temRegistro ? valor.toFixed(1).replace(".", ",") : "—"}
            </Text>

            <View
                style={[
                    styles.barra,
                    {
                        height: altura,
                    },
                    !temRegistro && styles.barraSemRegistro,
                    destaque && temRegistro && styles.barraDestaque,
                ]}
            />

            <Text style={styles.dia}>
                {dia}
            </Text>

        </View>
    );
}


/* ========================================= */
/* ESTILOS */
/* ========================================= */

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#E1F3FF",
    },

    conteudo: {
        paddingHorizontal: 22,
        paddingTop: 24,
        paddingBottom: 32,
    },


    /* ========================= */
    /* SAUDAÇÃO */
    /* ========================= */

    boasVindas: {
        minHeight: 68,

        backgroundColor: "#F7F8FC",

        marginHorizontal: -10,

        paddingHorizontal: 18,

        flexDirection: "row",
        alignItems: "center",
    },

    avatar: {
        width: 48,
        height: 48,

        borderRadius: 24,

        backgroundColor: "#D6D6D6",

        justifyContent: "center",
        alignItems: "center",

        marginRight: 12,
    },

    avatarTexto: {
        fontSize: 18,
        color: "#555",
        fontWeight: "600",
    },

    avatarFoto: {
        width: "100%",
        height: "100%",
        borderRadius: 24,
    },

    bomDia: {
        fontFamily: "Poppins",
        fontSize: 12,
        color: "#555",
    },

    nome: {
        fontFamily: "Poppins",
        fontSize: 17,
        fontWeight: "600",
        color: "#19699D",
    },


    /* ========================= */
    /* PERGUNTA */
    /* ========================= */

    recursos: {
        backgroundColor: "#FFFFFF",
        borderRadius: 11,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 14,
    },
    recursosTexto: {
        color: "#0875C9",
        fontFamily: "Poppins",
        fontSize: 12,
    },
    pergunta: {
        fontFamily: "Poppins",
        fontSize: 24,
        fontWeight: "600",

        color: "#202A38",

        marginTop: 20,
        marginBottom: 14,
    },


    /* ========================= */
    /* PRÓXIMA SESSÃO */
    /* ========================= */

    proximaSessao: {
        minHeight: 92,

        backgroundColor: "#2873AA",

        borderRadius: 12,

        paddingHorizontal: 16,
        paddingVertical: 13,

        flexDirection: "row",

        alignItems: "center",
        justifyContent: "space-between",
    },

    label: {
        fontFamily: "Poppins",
        fontSize: 10,

        color: "#DCEFFF",

        marginBottom: 1,
    },

    data: {
        fontFamily: "Poppins",
        fontSize: 16,

        fontWeight: "600",

        color: "#FFFFFF",
    },

    profissional: {
        fontFamily: "Poppins",
        fontSize: 11,

        color: "#FFFFFF",

        marginTop: 1,
    },

    dadosConsulta: {
        flex: 1,
        paddingRight: 8,
    },

    estadoConsulta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 4,
    },

    iconeCalendario: {
        width: 46,
        height: 46,

        borderRadius: 10,

        backgroundColor: "rgba(255,255,255,0.14)",

        alignItems: "center",
        justifyContent: "center",
    },


    /* ========================= */
    /* GRÁFICO */
    /* ========================= */

    cardGrafico: {
        minHeight: 225,

        backgroundColor: "#FFFFFF",

        borderRadius: 12,

        marginTop: 16,

        paddingHorizontal: 16,
        paddingTop: 15,
        paddingBottom: 14,
    },

    topoGrafico: {
        flexDirection: "row",

        justifyContent: "space-between",
    },

    tituloGrafico: {
        fontFamily: "Poppins",
        fontSize: 16,

        color: "#39424D",
    },

    subtituloGrafico: {
        fontFamily: "Poppins",
        fontSize: 11,

        color: "#777",

        marginTop: 3,
    },

    grafico: {
        height: 145,

        marginTop: 12,

        flexDirection: "row",

        justifyContent: "space-around",
        alignItems: "flex-end",
    },

    barraArea: {
        flex: 1,
        height: 135,

        alignItems: "center",
        justifyContent: "flex-end",
    },

    valorBarra: {
        fontFamily: "Poppins",
        fontSize: 10,
        color: "#617084",
        marginBottom: 5,
    },

    barra: {
        width: 25,

        backgroundColor: "#87C1EF",

        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },

    barraDestaque: {
        backgroundColor: "#358BCB",
    },

    barraSemRegistro: {
        backgroundColor: "#E4EAF0",
    },

    dia: {
        fontFamily: "Poppins",
        fontSize: 10,

        color: "#777",

        marginTop: 5,
    },


    /* ========================= */
    /* CARDS RESUMO */
    /* ========================= */

    resumo: {
        flexDirection: "row",

        gap: 12,

        marginTop: 14,
    },

    cardResumo: {
        flex: 1,

        minHeight: 125,

        backgroundColor: "#FFFFFF",

        borderRadius: 12,

        padding: 14,
    },

    tituloResumo: {
        fontFamily: "Poppins",

        fontSize: 13,

        fontWeight: "600",

        color: "#30343A",

        marginTop: 5,
    },

    textoResumo: {
        fontFamily: "Poppins",

        fontSize: 11,

        lineHeight: 17,

        color: "#555",
    },

    linhaSessoes: {
        flexDirection: "row",
        alignItems: "center",
    },

    numero: {
        fontFamily: "Poppins",

        fontSize: 22,

        fontWeight: "600",

        color: "#30343A",

        marginLeft: 6,
    },


    /* ========================= */
    /* RELAXAR */
    /* ========================= */

    relaxarTitulo: {
        fontFamily: "Poppins",

        fontSize: 17,

        color: "#3F464E",

        marginTop: 26,
        marginBottom: 10,
    },

    cardMeditacao: {
        height: 165,

        borderRadius: 12,

        overflow: "hidden",

        position: "relative",
    },

    imagemMeditacao: {
        position: "absolute",

        width: "100%",
        height: "100%",

        resizeMode: "cover",
    },

    sombra: {
        position: "absolute",

        left: 0,
        right: 0,
        bottom: 0,

        height: 78,

        backgroundColor: "rgba(0,0,0,0.38)",
    },

    infoMeditacao: {
        position: "absolute",

        left: 14,
        right: 14,
        bottom: 13,
    },

    linhaMeditacao: {
        flexDirection: "row",

        alignItems: "center",
    },

    tag: {
        backgroundColor: "#166690",

        color: "#FFFFFF",

        fontFamily: "Poppins",

        fontSize: 9,

        fontWeight: "600",

        paddingHorizontal: 7,
        paddingVertical: 4,

        borderRadius: 2,
    },

    tempo: {
        color: "#FFFFFF",

        fontFamily: "Poppins",

        fontSize: 10,

        marginLeft: 8,
    },

    tituloMeditacao: {
        color: "#FFFFFF",

        fontFamily: "Poppins",

        fontSize: 16,

        fontWeight: "600",

        marginTop: 6,
    },


    /* ========================= */
    /* CHAT */
    /* ========================= */

    chat: {
        position: "absolute",

        right: 22,
        bottom: 28,

        width: 52,
        height: 52,

        borderRadius: 26,

        backgroundColor: "#196A9D",

        alignItems: "center",
        justifyContent: "center",

        elevation: 5,

        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 2,
        },
    },

});
