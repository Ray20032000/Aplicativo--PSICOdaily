import React from "react";

import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
} from "react-native";

import {
    TrendingUp,
    CalendarDays,
    Brain,
    CheckCircle2,
    MessageCircle,
} from "lucide-react-native";


export default function Dashboard() {

    return (
        <View style={styles.container}>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.conteudo}
            >


                <View style={styles.boasVindas}>

                    <View style={styles.avatar}>
                        <Text style={styles.avatarTexto}>
                            M
                        </Text>
                    </View>

                    <View>
                        <Text style={styles.bomDia}>
                            Bom dia,
                        </Text>

                        <Text style={styles.nome}>
                            Mariana
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

                <View style={styles.proximaSessao}>

                    <View>

                        <Text style={styles.label}>
                            PRÓXIMA SESSÃO
                        </Text>

                        <Text style={styles.data}>
                            Amanhã, às 14:30
                        </Text>

                        <Text style={styles.profissional}>
                            ♡ Com Dra. Andreia Silva
                        </Text>

                    </View>

                    <View style={styles.iconeCalendario}>

                        <CalendarDays
                            size={21}
                            color="#FFFFFF"
                        />

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
                                Humor médio: Estável
                            </Text>

                        </View>

                        <TrendingUp
                            size={17}
                            color="#70B8F0"
                        />

                    </View>


                    {/* GRÁFICO */}

                    <View style={styles.grafico}>

                        <Barra altura={25} dia="S" />
                        <Barra altura={35} dia="T" />
                        <Barra altura={30} dia="Q" />
                        <Barra
                            altura={55}
                            dia="Q"
                            destaque
                        />
                        <Barra altura={40} dia="S" />
                        <Barra altura={33} dia="S" />
                        <Barra altura={38} dia="D" />

                    </View>

                </View>


                {/* ========================= */}
                {/* RESUMO */}
                {/* ========================= */}

                <View style={styles.resumo}>

                    {/* DICA */}

                    <View style={styles.cardResumo}>

                        <Brain
                            size={15}
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
                                size={15}
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

            <Pressable style={styles.chat}>

                <MessageCircle
                    size={19}
                    color="#FFFFFF"
                />

            </Pressable>

        </View>
    );
}


/* ========================================= */
/* BARRA DO GRÁFICO */
/* ========================================= */

function Barra({ altura, dia, destaque }) {

    return (
        <View style={styles.barraArea}>

            <View
                style={[
                    styles.barra,
                    {
                        height: altura,
                    },
                    destaque && styles.barraDestaque,
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
        paddingHorizontal: 20,
        paddingTop: 44,
        paddingBottom: 25,
    },


    /* ========================= */
    /* SAUDAÇÃO */
    /* ========================= */

    boasVindas: {
        height: 43,

        backgroundColor: "#F7F8FC",

        marginHorizontal: -10,

        paddingHorizontal: 16,

        flexDirection: "row",
        alignItems: "center",
    },

    avatar: {
        width: 28,
        height: 28,

        borderRadius: 14,

        backgroundColor: "#D6D6D6",

        justifyContent: "center",
        alignItems: "center",

        marginRight: 8,
    },

    avatarTexto: {
        fontSize: 12,
        color: "#555",
        fontWeight: "600",
    },

    bomDia: {
        fontFamily: "Poppins",
        fontSize: 8,
        color: "#555",
    },

    nome: {
        fontFamily: "Poppins",
        fontSize: 12,
        fontWeight: "600",
        color: "#19699D",
    },


    /* ========================= */
    /* PERGUNTA */
    /* ========================= */

    pergunta: {
        fontFamily: "Poppins",
        fontSize: 17,
        fontWeight: "600",

        color: "#202A38",

        marginTop: 12,
        marginBottom: 10,
    },


    /* ========================= */
    /* PRÓXIMA SESSÃO */
    /* ========================= */

    proximaSessao: {
        height: 58,

        backgroundColor: "#2873AA",

        borderRadius: 7,

        paddingHorizontal: 11,

        flexDirection: "row",

        alignItems: "center",
        justifyContent: "space-between",
    },

    label: {
        fontFamily: "Poppins",
        fontSize: 6,

        color: "#DCEFFF",

        marginBottom: 1,
    },

    data: {
        fontFamily: "Poppins",
        fontSize: 13,

        fontWeight: "600",

        color: "#FFFFFF",
    },

    profissional: {
        fontFamily: "Poppins",
        fontSize: 7,

        color: "#FFFFFF",

        marginTop: 1,
    },

    iconeCalendario: {
        width: 30,
        height: 30,

        borderRadius: 5,

        backgroundColor: "rgba(255,255,255,0.14)",

        alignItems: "center",
        justifyContent: "center",
    },


    /* ========================= */
    /* GRÁFICO */
    /* ========================= */

    cardGrafico: {
        height: 116,

        backgroundColor: "#FFFFFF",

        borderRadius: 7,

        marginTop: 13,

        paddingHorizontal: 11,
        paddingTop: 11,
    },

    topoGrafico: {
        flexDirection: "row",

        justifyContent: "space-between",
    },

    tituloGrafico: {
        fontFamily: "Poppins",
        fontSize: 9,

        color: "#39424D",
    },

    subtituloGrafico: {
        fontFamily: "Poppins",
        fontSize: 6,

        color: "#777",

        marginTop: 1,
    },

    grafico: {
        height: 67,

        marginTop: 6,

        flexDirection: "row",

        justifyContent: "space-around",
        alignItems: "flex-end",
    },

    barraArea: {
        height: 60,

        alignItems: "center",
        justifyContent: "flex-end",
    },

    barra: {
        width: 17,

        backgroundColor: "#E6F3FD",

        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },

    barraDestaque: {
        backgroundColor: "#78BDF2",
    },

    dia: {
        fontFamily: "Poppins",
        fontSize: 5,

        color: "#777",

        marginTop: 2,
    },


    /* ========================= */
    /* CARDS RESUMO */
    /* ========================= */

    resumo: {
        flexDirection: "row",

        gap: 9,

        marginTop: 10,
    },

    cardResumo: {
        flex: 1,

        height: 63,

        backgroundColor: "#FFFFFF",

        borderRadius: 7,

        padding: 9,
    },

    tituloResumo: {
        fontFamily: "Poppins",

        fontSize: 8,

        fontWeight: "600",

        color: "#30343A",

        marginTop: 2,
    },

    textoResumo: {
        fontFamily: "Poppins",

        fontSize: 6.5,

        lineHeight: 9,

        color: "#555",
    },

    linhaSessoes: {
        flexDirection: "row",
        alignItems: "center",
    },

    numero: {
        fontFamily: "Poppins",

        fontSize: 15,

        fontWeight: "600",

        color: "#30343A",

        marginLeft: 4,
    },


    /* ========================= */
    /* RELAXAR */
    /* ========================= */

    relaxarTitulo: {
        fontFamily: "Poppins",

        fontSize: 10,

        color: "#3F464E",

        marginTop: 21,
        marginBottom: 7,
    },

    cardMeditacao: {
        height: 101,

        borderRadius: 7,

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

        height: 55,

        backgroundColor: "rgba(0,0,0,0.38)",
    },

    infoMeditacao: {
        position: "absolute",

        left: 9,
        right: 9,
        bottom: 8,
    },

    linhaMeditacao: {
        flexDirection: "row",

        alignItems: "center",
    },

    tag: {
        backgroundColor: "#166690",

        color: "#FFFFFF",

        fontFamily: "Poppins",

        fontSize: 5,

        fontWeight: "600",

        paddingHorizontal: 4,
        paddingVertical: 2,

        borderRadius: 2,
    },

    tempo: {
        color: "#FFFFFF",

        fontFamily: "Poppins",

        fontSize: 6,

        marginLeft: 5,
    },

    tituloMeditacao: {
        color: "#FFFFFF",

        fontFamily: "Poppins",

        fontSize: 10,

        fontWeight: "600",

        marginTop: 3,
    },


    /* ========================= */
    /* CHAT */
    /* ========================= */

    chat: {
        position: "absolute",

        right: 18,
        bottom: 50,

        width: 32,
        height: 32,

        borderRadius: 16,

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