const { ChannelType } = require("discord.js")

async function listMessages(client, serverId, channelName, messageCount = 50) {
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

        let allMessages = []
        let lastMessageId = null
        let remainingMessages = messageCount

        console.log(`Fetching ${messageCount} messages from #${channel.name}...`)

        // Busca mensagens em lotes de 100 (limite máximo da API)
        while (remainingMessages > 0) {
            const batchSize = Math.min(100, remainingMessages)

            const fetchOptions = { limit: batchSize }
            if (lastMessageId) {
                fetchOptions.before = lastMessageId
            }

            const messagesBatch = await channel.messages.fetch(fetchOptions)

            if (messagesBatch.size === 0) {
                // Não há mais mensagens
                break
            }

            // Adiciona as mensagens do lote ao array total
            allMessages.push(...Array.from(messagesBatch.values()))

            // Atualiza o ID da última mensagem para a próxima iteração
            const sortedBatch = Array.from(messagesBatch.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp)
            lastMessageId = sortedBatch[0].id

            remainingMessages -= messagesBatch.size

            console.log(`Fetched ${messagesBatch.size} messages... Total: ${allMessages.length}`)

            // Pequena pausa para evitar rate limiting
            if (remainingMessages > 0) {
                await new Promise((resolve) => setTimeout(resolve, 100))
            }
        }

        if (allMessages.length === 0) {
            return {
                success: true,
                messages: [],
                channelInfo: {
                    name: channel.name,
                    id: channel.id,
                    serverName: guild.name,
                    serverId: guild.id
                }
            }
        }

        // Ordena todas as mensagens por data decrescente (mais recentes primeiro)
        const sortedMessages = allMessages
            .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
            .map((message) => ({
                id: message.id,
                content: message.content,
                author: {
                    id: message.author.id,
                    username: message.author.username,
                    displayName: message.author.displayName
                },
                timestamp: message.createdAt,
                attachments:
                    message.attachments.size > 0
                        ? Array.from(message.attachments.values()).map((att) => ({
                              name: att.name,
                              url: att.url,
                              size: att.size
                          }))
                        : [],
                embeds: message.embeds.length > 0 ? message.embeds : []
            }))

        console.log(`Successfully fetched ${sortedMessages.length} messages`)

        return {
            success: true,
            messages: sortedMessages,
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
            error: `Error fetching messages: ${error.message}`
        }
    }
}

module.exports = { listMessages }
