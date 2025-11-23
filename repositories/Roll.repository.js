const { PrismaClient } = require("../generated/prisma")

class RollRepository {
    constructor() {
        this.prisma = new PrismaClient()
    }

    /**
     * Creates a new roll record with initial data (before rolling dice)
     * @param {Object} rollData - Initial roll information
     * @param {string} rollData.tenant - The tenant (DISCORD, TELEGRAM, etc.)
     * @param {string} rollData.playerName - Player's display name
     * @param {string} rollData.playerId - Player's ID in the specific tenant
     * @param {string} rollData.rollCommand - The dice command (e.g., "1d20+3")
     * @param {string} [rollData.textoAdicional] - Additional text/description
     * @param {string} [rollData.numeroRolagem] - Roll number for multiple rolls
     * @param {string} [rollData.cdValue] - Challenge Difficulty value
     * @returns {Promise<Object>} Created Roll object with ID
     */
    async createRoll(rollData) {
        const { tenant, playerName, playerId, rollCommand, textoAdicional = null, numeroRolagem = null, cdValue = null } = rollData

        console.log(`\n\n\n`)
        console.log({ rollData })
        console.log(`\n\n\n`)

        try {
            const roll = await this.prisma.roll.create({
                data: {
                    tenant,
                    playerName,
                    playerId,
                    rollCommand,
                    textoAdicional,
                    numeroRolagem,
                    cdValue,
                    // resultMessage will be null initially
                    resultMessage: null
                }
            })

            return roll
        } catch (error) {
            console.error("Error creating roll:", error)
            throw error
        }
    }

    /**
     * Updates a roll record with the result message after dice are rolled
     * @param {string} rollId - The ID of the roll to update
     * @param {string} resultMessage - The formatted result message
     * @param {string} [numeroRolagem] - Sum of random dice values (excluding fixed modifiers)
     * @returns {Promise<Object>} Updated Roll object
     */
    async updateRollResult(rollId, resultMessage, numeroRolagem = null) {
        try {
            const updateData = { resultMessage }
            if (numeroRolagem !== null) {
                updateData.numeroRolagem = numeroRolagem.toString()
            }

            const updatedRoll = await this.prisma.roll.update({
                where: { id: rollId },
                data: updateData
            })

            return updatedRoll
        } catch (error) {
            console.error("Error updating roll result:", error)
            throw error
        }
    }

    /**
     * Gets a roll by ID
     * @param {string} rollId - The roll ID
     * @returns {Promise<Object|null>} Roll object or null if not found
     */
    async getRollById(rollId) {
        try {
            const roll = await this.prisma.roll.findUnique({
                where: { id: rollId }
            })

            return roll
        } catch (error) {
            console.error("Error getting roll by ID:", error)
            throw error
        }
    }

    /**
     * Gets rolls for a specific player
     * @param {string} playerId - The player's ID in their tenant
     * @param {string} tenant - The tenant type
     * @param {number} [limit=50] - Maximum number of rolls to return
     * @returns {Promise<Array>} Array of Roll objects
     */
    async getRollsByPlayer(playerId, tenant, limit = 50) {
        try {
            const rolls = await this.prisma.roll.findMany({
                where: {
                    playerId,
                    tenant
                },
                orderBy: {
                    createdAt: "desc"
                },
                take: limit
            })

            return rolls
        } catch (error) {
            console.error("Error getting rolls by player:", error)
            throw error
        }
    }

    /**
     * Closes the Prisma connection
     */
    async disconnect() {
        await this.prisma.$disconnect()
    }
}

module.exports = RollRepository
