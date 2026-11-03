import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import {
    Check,
    ChevronDown,
    Dumbbell,
    Moon,
    NotebookPen,
    Salad,
    UsersRound,
} from "lucide-react-native";

const API_URL = "https://p01--psicodaily-api--zfhqcbxfx5v8.code.run";
const HUMORES = [
    { valor: "muito_mal", titulo: "Muito Mal", emoji: "😞", cor: "#F5A3A8" },
    { valor: "mal", titulo: "Mal", emoji: "🙁", cor: "#F4C680" },
    { valor: "neutro", titulo: "Neutro", emoji: "😐", cor: "#69B5F5" },
    { valor: "bem", titulo: "Bem", emoji: "🙂", cor: "#80CBA3" },
    { valor: "muito_bem", titulo: "Muito bem", emoji: "😄", cor: "#80CBA3" },
];
const QUALIDADES_SONO = ["Ruim", "Médio", "Boa"];
const ALIMENTOS = ["Café da manhã", "Almoço", "Jantar", "Lanche"];
const ATIVIDADES = ["Meditação", "Caminhada", "Exercício", "Yoga", "Outra", "Nenhuma"];
const INTERACOES = ["Família", "Amigos", "Trabalho", "Ninguém", "Parceiro(a)"];

function alternarNaLista(lista, valor, atualizar) {
    atualizar(lista.includes(valor) ? lista.filter((item) => item !== valor) : [...lista, valor]);
}

function Seletor({ valores, selecionados, aoSelecionar }) {
    return (
        <View style={styles.opcoesLinha}>
            {valores.map((valor) => {
                const selecionado = selecionados.includes(valor);
                return (
                    <Pressable
                        key={valor}
                        onPress={() => aoSelecionar(valor)}
                        style={[styles.chip, selecionado && styles.chipAtivo]}
                    >
                        <Text style={[styles.textoChip, selecionado && styles.textoChipAtivo]}>{valor}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

function TituloSecao({ Icone, children }) {
    return (
        <View style={styles.tituloSecaoLinha}>
            <Icone size={16} color="#559EE0" />
            <Text style={styles.tituloSecao}>{children}</Text>
        </View>
    );
}

export default function Diario() {
    const navigation = useNavigation();
    const [humor, setHumor] = useState(null);
    const [qualidadeSono, setQualidadeSono] = useState("Médio");
    const [aguaSuficiente, setAguaSuficiente] = useState(false);
    const [horasSono, setHorasSono] = useState(7);
    const [alimentacao, setAlimentacao] = useState([]);
    const [atividade, setAtividade] = useState("");
    const [mostrarAtividades, setMostrarAtividades] = useState(false);
    const [duracaoAtividade, setDuracaoAtividade] = useState("");
    const [interacoes, setInteracoes] = useState([]);
    const [anotacoes, setAnotacoes] = useState("");
    const [salvando, setSalvando] = useState(false);

    const salvarRegistro = async () => {
        if (!humor) {
            Alert.alert("Falta escolher o humor", "Selecione uma opção em Humor do dia.");
            return;
        }

        try {
            setSalvando(true);
            const [token, usuarioSalvo, idSalvo] = await Promise.all([
                AsyncStorage.getItem("@psicodaily_token"),
                AsyncStorage.getItem("@psicodaily_usuario"),
                AsyncStorage.getItem("@psicodaily_id_usuario"),
            ]);
            if (!token) throw new Error("Entre na sua conta para salvar um registro no diário.");
            const usuario = usuarioSalvo ? JSON.parse(usuarioSalvo) : {};
            const corpo = {
                id_usuario: usuario.id_usuario ?? usuario.id ?? idSalvo,
                humor,
                qualidade_sono: qualidadeSono,
                agua_suficiente: aguaSuficiente,
                horas_sono: horasSono,
                alimentacao,
                atividade_fisica: atividade || null,
                duracao_atividade: atividade && atividade !== "Nenhuma" ? Number(duracaoAtividade) || 0 : 0,
                socializacao: interacoes,
                anotacoes: anotacoes.trim(),
                texto: anotacoes.trim(),
                data_hora: new Date().toISOString(),
            };

            const resposta = await fetch(`${API_URL}/api/diario/`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(corpo),
            });
            const textoResposta = await resposta.text();
            let dados = {};
            try {
                dados = textoResposta ? JSON.parse(textoResposta) : {};
            } catch {
                if (!resposta.ok) throw new Error("O servidor retornou uma resposta inválida ao salvar o registro.");
            }
            if (!resposta.ok) throw new Error(dados.error || dados.message || "Não foi possível salvar o registro.");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Não foi possível salvar", error.message || "Tente novamente mais tarde.");
        } finally {
            setSalvando(false);
        }
    };

    return (
        <SafeAreaView style={styles.tela}>
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <View style={styles.cartao}>
                        <View style={styles.secaoHumor}>
                            <Text style={styles.tituloHumor}>Humor do dia</Text>
                            <Text style={styles.ajudaHumor}>Selecione uma opção</Text>
                            <View style={styles.humores}>
                                {HUMORES.map((opcao) => {
                                    const selecionado = humor === opcao.valor;
                                    return (
                                        <Pressable
                                            key={opcao.valor}
                                            onPress={() => setHumor(opcao.valor)}
                                            style={[styles.opcaoHumor, selecionado && { backgroundColor: opcao.cor, borderColor: opcao.cor }]}
                                        >
                                            <Text style={styles.emojiHumor}>{opcao.emoji}</Text>
                                            <Text style={[styles.nomeHumor, selecionado && styles.nomeHumorAtivo]}>{opcao.titulo}</Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={styles.secaoDuasColunas}>
                            <View style={styles.blocoSono}>
                                <TituloSecao Icone={Moon}>Sono</TituloSecao>
                                <Text style={styles.rotuloPequeno}>Qualidade</Text>
                                <View style={styles.qualidadeSono}>
                                    {QUALIDADES_SONO.map((qualidade) => (
                                        <Pressable key={qualidade} onPress={() => setQualidadeSono(qualidade)} style={[styles.qualidadeBotao, qualidadeSono === qualidade && styles.qualidadeAtiva]}>
                                            <Text style={[styles.qualidadeTexto, qualidadeSono === qualidade && styles.textoChipAtivo]}>{qualidade}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                                <Text style={styles.rotuloPequeno}>Horas dormidas</Text>
                                <View style={styles.horasSonoLinha}>
                                    <Pressable onPress={() => setHorasSono((horas) => Math.max(0, horas - 0.5))} style={styles.ajusteHoras}><Text style={styles.sinalHoras}>−</Text></Pressable>
                                    <Text style={styles.valorHoras}>{String(horasSono).replace(".", ",")}h</Text>
                                    <Pressable onPress={() => setHorasSono((horas) => Math.min(14, horas + 0.5))} style={styles.ajusteHoras}><Text style={styles.sinalHoras}>+</Text></Pressable>
                                </View>
                            </View>

                            <View style={styles.blocoAtividade}>
                                <Pressable onPress={() => setAguaSuficiente((valor) => !valor)} style={styles.suficienteLinha}>
                                    <Text style={styles.textoSuficiente}>Bebeu água suficiente?</Text>
                                    <View style={[styles.checkbox, aguaSuficiente && styles.checkboxAtivo]}>{aguaSuficiente ? <Check color="#FFFFFF" size={12} /> : null}</View>
                                </Pressable>
                                <TituloSecao Icone={Dumbbell}>Atividade Física</TituloSecao>
                                <Pressable onPress={() => setMostrarAtividades((valor) => !valor)} style={styles.seletorAtividade}>
                                    <Text style={atividade ? styles.textoAtividade : styles.placeholder}>{atividade || "Tipo de atividade..."}</Text>
                                    <ChevronDown color="#6B7280" size={15} />
                                </Pressable>
                                {mostrarAtividades ? (
                                    <View style={styles.listaAtividades}>
                                        {ATIVIDADES.map((opcao) => (
                                            <Pressable key={opcao} onPress={() => { setAtividade(opcao); setMostrarAtividades(false); }} style={styles.itemAtividade}>
                                                <Text style={styles.textoAtividade}>{opcao}</Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                ) : null}
                                <View style={styles.duracaoLinha}>
                                    <Text style={styles.rotuloPequeno}>Duração:</Text>
                                    <TextInput
                                        value={duracaoAtividade}
                                        onChangeText={(valor) => setDuracaoAtividade(valor.replace(/\D/g, "").slice(0, 3))}
                                        keyboardType="number-pad"
                                        placeholder="min"
                                        placeholderTextColor="#7A8492"
                                        style={styles.campoDuracao}
                                        editable={atividade !== "" && atividade !== "Nenhuma"}
                                    />
                                    <Text style={styles.rotuloPequeno}>minutos</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.secao}>
                            <TituloSecao Icone={Salad}>Alimentação</TituloSecao>
                            <View style={styles.alimentacaoGrid}>
                                {ALIMENTOS.map((opcao) => {
                                    const selecionado = alimentacao.includes(opcao);
                                    return (
                                        <Pressable key={opcao} onPress={() => alternarNaLista(alimentacao, opcao, setAlimentacao)} style={[styles.alimentacaoItem, selecionado && styles.itemMarcado]}>
                                            <View style={[styles.checkboxPequeno, selecionado && styles.checkboxAtivo]}>{selecionado ? <Check color="#FFFFFF" size={10} /> : null}</View>
                                            <Text style={styles.textoAlimentacao}>{opcao}</Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={styles.secao}>
                            <TituloSecao Icone={UsersRound}>Socialização</TituloSecao>
                            <Text style={styles.pergunta}>Com quem você interagiu hoje?</Text>
                            <Seletor valores={INTERACOES} selecionados={interacoes} aoSelecionar={(valor) => alternarNaLista(interacoes, valor, setInteracoes)} />
                        </View>

                        <View style={styles.secaoAnotacoes}>
                            <TituloSecao Icone={NotebookPen}>Anotações Livres</TituloSecao>
                            <TextInput
                                value={anotacoes}
                                onChangeText={setAnotacoes}
                                placeholder="Como foi o seu dia? Quais pensamentos ou sentimentos você gostaria de registrar?"
                                placeholderTextColor="#818B98"
                                multiline
                                textAlignVertical="top"
                                maxLength={2000}
                                style={styles.campoAnotacoes}
                            />
                        </View>

                        <View style={styles.acoes}>
                            <Pressable onPress={() => navigation.goBack()} disabled={salvando} style={styles.botaoDescartar}>
                                <Text style={styles.textoDescartar}>Descartar</Text>
                            </Pressable>
                            <Pressable onPress={salvarRegistro} disabled={salvando} style={[styles.botaoSalvar, salvando && styles.desabilitado]}>
                                {salvando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.textoSalvar}>Salvar Registro</Text>}
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    tela: { flex: 1, backgroundColor: "#E1F3FF" },
    flex: { flex: 1 },
    conteudo: { flexGrow: 1, alignItems: "center", paddingHorizontal: 12, paddingTop: 14, paddingBottom: 28 },
    cartao: { width: "100%", maxWidth: 640, flexGrow: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 18, backgroundColor: "#FFFFFF", borderRadius: 16, elevation: 3 },
    secaoHumor: { backgroundColor: "#F0F8FC", borderRadius: 11, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12 },
    tituloHumor: { color: "#3B8FD3", fontFamily: "Poppins", fontSize: 15 },
    ajudaHumor: { color: "#8993A0", fontFamily: "Poppins", fontSize: 10, marginTop: 1 },
    humores: { flexDirection: "row", justifyContent: "space-between", gap: 6, marginTop: 10 },
    opcaoHumor: { flex: 1, minHeight: 64, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E0E6EC", borderRadius: 10, backgroundColor: "#FFFFFF" },
    emojiHumor: { fontSize: 20 },
    nomeHumor: { color: "#697586", fontFamily: "Poppins", fontSize: 9, marginTop: 3 },
    nomeHumorAtivo: { color: "#FFFFFF" },
    secaoDuasColunas: { flexDirection: "row", gap: 10, marginTop: 10 },
    blocoSono: { flex: 1, paddingHorizontal: 10, paddingVertical: 10, borderWidth: 1, borderColor: "#E3EDF5", borderRadius: 11 },
    blocoAtividade: { position: "relative", flex: 1.5, minHeight: 155, paddingHorizontal: 10, paddingVertical: 10, borderWidth: 1, borderColor: "#E3EDF5", borderRadius: 11 },
    tituloSecaoLinha: { minHeight: 28, flexDirection: "row", alignItems: "center", gap: 7 },
    tituloSecao: { color: "#344054", fontFamily: "Poppins", fontSize: 13 },
    rotuloPequeno: { color: "#7A8492", fontFamily: "Poppins", fontSize: 10 },
    qualidadeSono: { flexDirection: "row", gap: 4, marginTop: 5 },
    qualidadeBotao: { flex: 1, minHeight: 30, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E1E6EC", borderRadius: 8 },
    qualidadeAtiva: { backgroundColor: "#DDEEFF", borderColor: "#75B5EE" },
    qualidadeTexto: { color: "#687385", fontFamily: "Poppins", fontSize: 9 },
    textoChipAtivo: { color: "#1474C2" },
    horasSonoLinha: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
    ajusteHoras: { width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#F0F3F6" },
    sinalHoras: { color: "#607084", fontSize: 20 },
    valorHoras: { color: "#2A82CE", fontFamily: "Poppins", fontSize: 16 },
    suficienteLinha: { minHeight: 30, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    textoSuficiente: { color: "#738093", fontFamily: "Poppins", fontSize: 9 },
    checkbox: { width: 19, height: 19, borderWidth: 1, borderColor: "#D7E1EA", borderRadius: 5, alignItems: "center", justifyContent: "center" },
    checkboxAtivo: { backgroundColor: "#3186C5", borderColor: "#3186C5" },
    seletorAtividade: { minHeight: 40, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 10, marginTop: 6, borderWidth: 1, borderColor: "#E1E6EC", borderRadius: 8, backgroundColor: "#F8FAFC" },
    textoAtividade: { color: "#586475", fontFamily: "Poppins", fontSize: 11 },
    placeholder: { color: "#8A94A3", fontFamily: "Poppins", fontSize: 11 },
    listaAtividades: { position: "absolute", zIndex: 5, top: 90, left: 10, right: 10, padding: 6, borderWidth: 1, borderColor: "#DDE5EC", borderRadius: 8, backgroundColor: "#FFFFFF", elevation: 4 },
    itemAtividade: { paddingVertical: 8, paddingHorizontal: 8 },
    duracaoLinha: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 6, marginTop: 9 },
    campoDuracao: { width: 54, height: 34, paddingHorizontal: 6, borderWidth: 1, borderColor: "#E1E6EC", borderRadius: 7, textAlign: "center", color: "#586475", fontFamily: "Poppins", fontSize: 11 },
    secao: { marginTop: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: "#E3EDF5", borderRadius: 11 },
    alimentacaoGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 8, marginTop: 8 },
    alimentacaoItem: { width: "48.5%", minHeight: 40, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: "#E5EBF0", borderRadius: 8 },
    itemMarcado: { backgroundColor: "#F0F8FC", borderColor: "#A5D3F3" },
    checkboxPequeno: { width: 17, height: 17, borderWidth: 1, borderColor: "#D6E0E9", borderRadius: 4, alignItems: "center", justifyContent: "center" },
    textoAlimentacao: { color: "#586475", fontFamily: "Poppins", fontSize: 10 },
    pergunta: { color: "#748094", fontFamily: "Poppins", fontSize: 11, marginTop: 10, marginBottom: 8 },
    opcoesLinha: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
    chip: { minHeight: 34, justifyContent: "center", paddingHorizontal: 13, borderWidth: 1, borderColor: "#E3EAF0", borderRadius: 17, backgroundColor: "#FFFFFF" },
    chipAtivo: { backgroundColor: "#E8F4FC", borderColor: "#9CCDF0" },
    textoChip: { color: "#586475", fontFamily: "Poppins", fontSize: 10 },
    secaoAnotacoes: { marginTop: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: "#E3EDF5", borderRadius: 11 },
    campoAnotacoes: { minHeight: 140, marginTop: 9, padding: 13, color: "#4B5563", fontFamily: "Poppins", fontSize: 12, lineHeight: 19, borderWidth: 1, borderColor: "#E8EDF2", borderRadius: 9, backgroundColor: "#FAFBFC" },
    acoes: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 12, marginTop: 14, paddingHorizontal: 4 },
    botaoDescartar: { minWidth: 100, minHeight: 48, alignItems: "center", justifyContent: "center" },
    textoDescartar: { color: "#222222", fontFamily: "Poppins", fontSize: 12 },
    botaoSalvar: { minWidth: 145, minHeight: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, backgroundColor: "#286B9D", borderRadius: 9 },
    textoSalvar: { color: "#FFFFFF", fontFamily: "Poppins", fontSize: 12 },
    desabilitado: { opacity: 0.65 },
});
