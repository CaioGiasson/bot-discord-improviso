const doRoll = function (dado, sinal = `+`) {
    const s = sinal == `+` ? 1 : -1
    if (typeof dado != `string`) return dado * s
    if (dado.indexOf(`d`) == -1) return dado * s

    const [n, d] = dado.split(`d`)
    const resultados = []

    for (i = 0; i < n; i++) resultados.push(s * (parseInt(Math.random() * d) + 1))

    if (d == 20 && resultados.length == 1) global.d20 = resultados[0]
    else global.d20 = 0

    return resultados
}

const theRolls = function (rolls) {
    var result = ``
    for (i in rolls) result += rolls[i] < 0 ? rolls[i] : `+${rolls[i]}`
    result = result.substring(1)
    return `(${result})`
}

const processRoll = function (comando, playerName) {
    if (comando.indexOf(`roll `) > -1) comando = comando.replace(/roll /g, ``)
    if (comando.indexOf(`roll`) > -1) comando = comando.replace(/roll/g, ``)
    if (comando.indexOf(`r `) > -1) comando = comando.replace(/r /g, ``)
    if (comando.indexOf(`r`) > -1) comando = comando.replace(/r/g, ``)

    if (comando.indexOf(` `) > 0) comando = comando.split(` `)[0]

    const dados = comando.split(/[+-]/g)
    const sinais = comando.match(/[+-]/g)

    var rolagens = doRoll(dados[0])

    for (k = 1; k < dados.length; k++) rolagens = rolagens.concat(doRoll(dados[k], sinais[k - 1]))

    var soma = 0
    for (i in rolagens) soma += rolagens[i]

    const resultado = `${playerName} rolou ${comando}\nResultado: ${soma} ${theRolls(rolagens)}`

    return resultado
}

module.exports = { processRoll }
