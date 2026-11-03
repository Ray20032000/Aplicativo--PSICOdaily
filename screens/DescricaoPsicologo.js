import { useMemo, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { ArrowLeft, CalendarPlus, UserRound } from "lucide-react-native";

const HORARIOS_SEMANA = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const HORARIOS_SABADO = ["08:00", "09:00", "10:00", "11:00"];

function dataLocal(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function moeda(valor) {
    const numero = Number(valor);
    return Number.isFinite(numero)
        ? numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : "R$ 160,00";
}

export default function DescricaoPsicologo() {
    const navigation = useNavigation();
    const route = useRoute();
    const psicologo = route.params?.psicologo || {};
    const nome = psicologo.nome || psicologo.nome_completo || "Psicólogo";
    const foto = psicologo.foto_perfil || psicologo.foto || psicologo.imagem || psicologo.imagem_perfil;
    const especialidade = psicologo.especialidade || psicologo.especialidades || psicologo.abordagem || "Atendimento psicológico";
    const descricao = psicologo.descricao || psicologo.bio || psicologo.sobre || psicologo.apresentacao;
    const valor = Number(psicologo.valor_consulta || psicologo.preco || psicologo.valor || 160);
    const [dataSelecionada, setDataSelecionada] = useState(null);
    const [horarioSelecionado, setHorarioSelecionado] = useState(null);
    const [mostrarHorarios, setMostrarHorarios] = useState(false);

    const diasDisponiveis = useMemo(() => Array.from({ length: 14 }, (_, indice) => {
        const data = new Date();
        data.setHours(12, 0, 0, 0);
        data.setDate(data.getDate() + indice + 1);
        return data;
    }).filter((data) => data.getDay() !== 0), []);

    const horarios = dataSelecionada
        ? (new Date(`${dataSelecionada}T12:00:00`).getDay() === 6 ? HORARIOS_SABADO : HORARIOS_SEMANA)
        : [];
    const dataFormatada = dataSelecionada
        ? new Date(`${dataSelecionada}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
        : "";

    const irParaPagamento = () => {
        if (!dataSelecionada || !horarioSelecionado) {
            setMostrarHorarios(true);
            return;
        }
        navigation.navigate("Pagamento", {
            psicologo,
            dataConsulta: dataSelecionada,
            horarioConsulta: horarioSelecionado,
            valorConsulta: valor,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
                <Pressable onPress={() => navigation.goBack()} style={styles.voltar} accessibilityRole="button">
                    <ArrowLeft color="#374151" size={20} />
                    <Text style={styles.textoVoltar}>Voltar</Text>
                </Pressable>

                <View style={styles.cartao}>
                    <View style={styles.cabecalhoPerfil}>
                        {foto ? <Image source={{ uri: foto }} style={styles.foto} /> : (
                            <View style={styles.fotoFallback}><UserRound color="#67718A" size={42} /></View>
                        )}
                        <View style={styles.dadosPerfil}>
                            <Text style={styles.nome}>{nome}</Text>
                            <Text style={styles.avaliacao}>☆☆☆☆☆</Text>
                            <Text style={styles.especialidade}>Especialidades: {especialidade}</Text>
                        </View>
                        <View style={styles.notaBox}>
                            <Text style={styles.nota}>☆ {psicologo.nota || psicologo.avaliacao || "5"}</Text>
                            <Text style={styles.avaliacoes}>{psicologo.total_avaliacoes || 0} avaliações</Text>
                        </View>
                    </View>

                    <View style={styles.divisor} />
                    <Text style={styles.tituloSecao}>Sobre o profissional</Text>
                    <Text style={styles.descricao}>{descricao || "Este profissional ainda não adicionou uma descrição."}</Text>
                    {psicologo.crp ? <Text style={styles.detalhe}>CRP: {psicologo.crp}</Text> : null}
                    {psicologo.anos_experiencia ? <Text style={styles.detalhe}>• {psicologo.anos_experiencia} anos de experiência</Text> : null}

                    <View style={styles.secaoAgenda}>
                        <View style={styles.tituloAgendaLinha}>
                            <CalendarPlus color="#1683C4" size={19} />
                            <Text style={styles.tituloSecao}>Agende sua consulta</Text>
                        </View>
                        <Text style={styles.instrucao}>Escolha uma data disponível:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.diasLista}>
                            {diasDisponiveis.map((dia) => {
                                const chave = dataLocal(dia);
                                const selecionado = dataSelecionada === chave;
                                return (
                                    <Pressable
                                        key={chave}
                                        onPress={() => { setDataSelecionada(chave); setHorarioSelecionado(null); }}
                                        style={[styles.diaBotao, selecionado && styles.opcaoSelecionada]}
                                    >
                                        <Text style={[styles.diaSemana, selecionado && styles.textoSelecionado]}>
                                            {dia.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
                                        </Text>
                                        <Text style={[styles.diaNumero, selecionado && styles.textoSelecionado]}>{dia.getDate()}</Text>
                                        <Text style={[styles.diaMes, selecionado && styles.textoSelecionado]}>
                                            {dia.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>

                        {dataSelecionada ? (
                            <>
                                <Text style={styles.instrucao}>Horários para {dataFormatada}:</Text>
                                <View style={styles.horariosLista}>
                                    {horarios.map((horario) => {
                                        const selecionado = horarioSelecionado === horario;
                                        return (
                                            <Pressable
                                                key={horario}
                                                onPress={() => setHorarioSelecionado(horario)}
                                                style={[styles.horarioBotao, selecionado && styles.opcaoSelecionada]}
                                            >
                                                <Text style={[styles.textoHorario, selecionado && styles.textoSelecionado]}>{horario}</Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </>
                        ) : null}
                        {mostrarHorarios && (!dataSelecionada || !horarioSelecionado) ? (
                            <Text style={styles.avisoSelecao}>Selecione a data e o horário antes de continuar.</Text>
                        ) : null}
                    </View>

                    <View style={styles.rodapeCartao}>
                        <Text style={styles.preco}>{moeda(valor)} / hora</Text>
                        {dataSelecionada && horarioSelecionado ? (
                            <Text style={styles.resumoSelecao}>{dataFormatada} às {horarioSelecionado}</Text>
                        ) : null}
                        <Pressable
                            onPress={irParaPagamento}
                            style={({ pressed }) => [styles.botaoAgendar, pressed && styles.pressionado]}
                            accessibilityRole="button"
                        >
                            <Text style={styles.textoAgendar}>{dataSelecionada && horarioSelecionado ? "Ir para pagamento" : "Escolha data e horário"}</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#E3F4FC" },
    conteudo: { flexGrow: 1, alignItems: "center", paddingHorizontal: 12, paddingTop: 10, paddingBottom: 24 },
    voltar: { width: "100%", maxWidth: 720, flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 },
    textoVoltar: { color: "#374151", fontFamily: "Poppins", fontSize: 14 },
    cartao: { width: "100%", maxWidth: 720, padding: 16, backgroundColor: "#FFFFFF", borderRadius: 18, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.16, shadowRadius: 5 },
    cabecalhoPerfil: { width: "100%", flexDirection: "row", alignItems: "flex-start", gap: 12 },
    foto: { width: 128, height: 150, borderRadius: 16, backgroundColor: "#E8EAF0" },
    fotoFallback: { width: 128, height: 150, borderRadius: 16, backgroundColor: "#E8EAF0", alignItems: "center", justifyContent: "center" },
    dadosPerfil: { flex: 1 },
    nome: { color: "#686868", fontFamily: "Poppins", fontSize: 17 },
    avaliacao: { color: "#888888", fontSize: 18, letterSpacing: -1, marginTop: -5 },
    especialidade: { color: "#686868", fontFamily: "Poppins", fontSize: 14, lineHeight: 21, marginTop: 12 },
    notaBox: { alignItems: "flex-end" },
    nota: { color: "#333333", fontFamily: "Poppins", fontSize: 13 },
    avaliacoes: { color: "#777777", fontFamily: "Poppins", fontSize: 10 },
    divisor: { height: 1, backgroundColor: "#E8E8E8", marginVertical: 17 },
    tituloSecao: { color: "#5D5D5D", fontFamily: "Poppins", fontSize: 15 },
    descricao: { color: "#686868", fontFamily: "Poppins", fontSize: 14, lineHeight: 21, marginTop: 7 },
    detalhe: { color: "#686868", fontFamily: "Poppins", fontSize: 13, marginTop: 9 },
    secaoAgenda: { marginTop: 21, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#E8E8E8" },
    tituloAgendaLinha: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    instrucao: { color: "#686868", fontFamily: "Poppins", fontSize: 12, marginTop: 8, marginBottom: 8 },
    diasLista: { gap: 8, paddingBottom: 4 },
    diaBotao: { width: 58, minHeight: 73, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#D7DCE3", borderRadius: 11, backgroundColor: "#FFFFFF" },
    diaSemana: { color: "#777F8D", fontFamily: "Poppins", fontSize: 10, textTransform: "capitalize" },
    diaNumero: { color: "#343A46", fontFamily: "Poppins", fontSize: 16 },
    diaMes: { color: "#777F8D", fontFamily: "Poppins", fontSize: 10, textTransform: "capitalize" },
    opcaoSelecionada: { backgroundColor: "#1683C4", borderColor: "#1683C4" },
    textoSelecionado: { color: "#FFFFFF" },
    horariosLista: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    horarioBotao: { minWidth: 67, minHeight: 38, justifyContent: "center", alignItems: "center", paddingHorizontal: 10, borderWidth: 1, borderColor: "#D7DCE3", borderRadius: 9 },
    textoHorario: { color: "#454B57", fontFamily: "Poppins", fontSize: 12 },
    avisoSelecao: { color: "#B45309", fontFamily: "Poppins", fontSize: 12, marginTop: 10 },
    rodapeCartao: { marginTop: 22, alignItems: "center" },
    preco: { color: "#5D5D5D", fontFamily: "Poppins", fontSize: 16 },
    resumoSelecao: { color: "#777F8D", fontFamily: "Poppins", fontSize: 12, marginTop: 3, textTransform: "capitalize" },
    botaoAgendar: { width: "100%", minHeight: 48, marginTop: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#1384C6", borderRadius: 11 },
    textoAgendar: { color: "#FFFFFF", fontFamily: "Poppins", fontSize: 15 },
    pressionado: { opacity: 0.8 },
});
