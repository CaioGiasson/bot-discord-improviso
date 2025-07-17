const { ChannelType } = require("discord.js")

async function countMessages(client, serverId, channelName) {
    try {
        const guild = client.guilds.cache.get(serverId)

        if (!guild) {
            return {
                success: false,
                error: `Server with ID ${serverId} not found`
            }
        }

        // Procura o canal pelo nome (sem o #)
        const channel = guild.channels.cache.find(
            (ch) => ch.type === ChannelType.GuildText && ch.name.toLowerCase() === channelName.toLowerCase()
        )

        if (!channel) {
            return {
                success: false,
                error: `Text channel "${channelName}" not found in server "${guild.name}"`
            }
        }

        let totalMessages = 0
        let lastMessageId = null
        let batchCount = 0

        console.log(`Counting messages in #${channel.name}...`)

        // Conta mensagens em lotes de 100 (limite máximo da API)
        while (true) {
            const fetchOptions = { limit: 100 }
            if (lastMessageId) {
                fetchOptions.before = lastMessageId
            }

            const messagesBatch = await channel.messages.fetch(fetchOptions)

            if (messagesBatch.size === 0) {
                // Não há mais mensagens
                break
            }

            totalMessages += messagesBatch.size
            batchCount++

            // Atualiza o ID da última mensagem para a próxima iteração
            const sortedBatch = Array.from(messagesBatch.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp)
            lastMessageId = sortedBatch[0].id

            console.log(`Batch ${batchCount}: Found ${messagesBatch.size} messages... Total: ${totalMessages}`)

            // Pequena pausa para evitar rate limiting
            await new Promise((resolve) => setTimeout(resolve, 100))
        }

        console.log(`Finished counting: ${totalMessages} total messages`)

        return {
            success: true,
            totalMessages: totalMessages,
            batchesProcessed: batchCount,
            channelInfo: {
                name: channel.name,
                id: channel.id,
                serverName: guild.name,
                serverId: guild.id
            }
        }
    } catch (error) {
        return {
            success: false,
            error: `Error counting messages: ${error.message}`
        }
    }
}

module.exports = { countMessages }
