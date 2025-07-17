const rollDice = function (numDados, ladosDado) {
    const resultados = []

    for (let i = 0; i < numDados; i++) {
        resultados.push(parseInt(Math.random() * ladosDado) + 1)
    }

    return resultados
}

const formatRolls = function (rolls, ladosDado) {
    const formattedRolls = rolls.map((roll) => {
        // Destacar valores máximos e mínimos em negrito
        if (roll === ladosDado || roll === 1) {
            return `**${roll}**`
        }
        return roll.toString()
    })

    return `(${formattedRolls.join("+")})`
}

const processaSingleRoll = function (
    numDados,
    ladosDado,
    modificador,
    rollCommand,
    playerName,
    numeroRolagem = null,
    textoAdicional = null,
    cdValue = null
) {
    // Rolar os dados
    const resultados = rollDice(numDados, ladosDado)

    // Calcular soma dos dados
    const somaDados = resultados.reduce((acc, val) => acc + val, 0)

    // Soma final incluindo modificador
    const somaFinal = somaDados + modificador

    // Formatar resultado
    let titulo = `${playerName} rolou ${rollCommand}`
    if (textoAdicional) {
        titulo += ` - ${textoAdicional}`
    }
    if (numeroRolagem) {
        titulo += ` (Rolagem ${numeroRolagem})`
    }

    let resultado = `${titulo}\nResultado: ${somaFinal}\n`

    if (modificador === 0) {
        resultado += formatRolls(resultados, ladosDado)
    } else {
        const sinalModificador = modificador > 0 ? " + " : " - "
        const valorModificador = Math.abs(modificador)
        resultado += `${formatRolls(resultados, ladosDado)}${sinalModificador}${valorModificador}`
    }

    // Verificar críticos para 1d20
    if (numDados === 1 && ladosDado === 20) {
        if (resultados[0] === 1) {
            resultado += "\n**FALHA CRÍTICA!!!**"
        } else if (resultados[0] === 20) {
            resultado += "\n**CRITÃOOOOOOO**"
        }
    }

    // Verificar CD se especificado
    if (cdValue !== null) {
        if (somaFinal >= cdValue) {
            resultado += "\n**SUCESSO!!!!!!!!!**"
        } else {
            resultado += "\n**FALHA**"
        }
    }

    return resultado
}

const processMessage = function (messageText, playerName) {
    // Normalizar a mensagem: adicionar "1" antes de "d" quando necessário
    let normalizedMessage = messageText

    // Se começa com "d" (exemplo: "d20+3")
    if (normalizedMessage.match(/^d\d/)) {
        normalizedMessage = "1" + normalizedMessage
    }

    // Se "d" está imediatamente após "#" (exemplo: "3#d20+1")
    normalizedMessage = normalizedMessage.replace(/#d(\d)/g, "#1d$1")

    // Regex para identificar rolagens múltiplas: opcional(número#) + 1-3 dígitos + "d" + 2-100 + modificador opcional + opcional (espaço + texto)
    const rollRegex = /^(\d+#)?(\d{1,3})d(\d{1,3})([+-]\d+)?(\s.*)?$/

    const match = normalizedMessage.match(rollRegex)

    if (!match) {
        return "" // Não é uma rolagem válida
    }

    const numRolagens = match[1] ? parseInt(match[1].replace("#", "")) : 1
    const numDados = parseInt(match[2])
    const ladosDado = parseInt(match[3])
    const modificador = match[4] ? parseInt(match[4]) : 0
    let textoAdicional = match[5] ? match[5].trim() : null

    // Extrair CD do texto adicional
    let cdValue = null
    if (textoAdicional) {
        const cdMatch = textoAdicional.match(/\bCD\s?(\d{1,3})\b/i)
        if (cdMatch) {
            cdValue = parseInt(cdMatch[1])
            // Manter o texto original com CD para exibição
        }
    }

    // Validações
    if (numRolagens < 1 || numRolagens > 50) {
        return "" // Número de rolagens inválido (máximo 50)
    }

    if (numDados < 1 || numDados > 999) {
        return "" // Número de dados inválido
    }

    if (ladosDado < 2 || ladosDado > 100) {
        return "" // Número de lados inválido
    }

    // Extrair apenas a parte da rolagem (sem texto adicional)
    let rollCommand = `${numDados}d${ladosDado}`
    if (modificador !== 0) {
        rollCommand += (modificador > 0 ? "+" : "") + modificador
    }

    // Se é apenas uma rolagem, usar formato original
    if (numRolagens === 1) {
        return processaSingleRoll(numDados, ladosDado, modificador, rollCommand, playerName, null, textoAdicional, cdValue)
    }

    // Múltiplas rolagens
    const resultados = []
    for (let i = 1; i <= numRolagens; i++) {
        const resultado = processaSingleRoll(numDados, ladosDado, modificador, rollCommand, playerName, i, textoAdicional, cdValue)
        resultados.push(resultado)
    }

    return resultados.join("\n-----\n")
}

module.exports = { processMessage }
