function listServers(client) {
    const servers = []

    client.guilds.cache.forEach((guild) => {
        servers.push({
            name: guild.name,
            id: guild.id,
            memberCount: guild.memberCount
        })
    })

    return servers
}

module.exports = { listServers }
