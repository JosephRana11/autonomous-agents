import axios from 'axios'
import { parseRawBlockBody } from 'libcardano/cardano/ledger-serialization/transaction'
import { createInMemoryClientWithPeer } from 'libcardano/src/helper'
import { InmemoryBlockchain } from 'libcardano/src/InmemoryBlockchain'
import { BlockEvent } from 'libcardano/src/types'
import { fetchAgentConfiguration } from '../repository/agent_manager_repository'
import { Server } from 'rpc-websockets'

const bigIntReplacer = (key: any, value: any) => {
    if (typeof value === 'bigint') {
        return value.toString()
    }
    return value
}

class WebSocketConnectionManager {
    activeConnections: { [key: string]: Server } = {}
    blockchain: InmemoryBlockchain

    constructor() {
        this.blockchain = createInMemoryClientWithPeer(
            process.env['CARDANO_NODE_URL'],
            4,
            'Latest'
        )

        this.blockchain.pipeline('extendBlock', (block, cb) => {
            this.sendNewBlockToActiveAgents(block, cb)
        })
    }

    async sendAgentKeys(
        websocketAgentId: string,
        websocket: Server
    ): Promise<void> {
        this.activeConnections[websocketAgentId] = websocket
        const addressApiUrl = `${process.env.API_SERVER}/api/agent/${websocketAgentId}/keys`
        const addressResponse = await axios.get(addressApiUrl)
        websocket.emit(
            'message',
            JSON.stringify({
                message: 'agent_keys',
                payload: addressResponse.data,
                timeStamp: new Date().toISOString(),
            })
        )
    }

    async disconnectWebSocket(websocketAgentId: string): Promise<void> {
        // Disconnect WebSocket connection of agent
        const existingWebSocket = this.activeConnections[websocketAgentId]
        if (existingWebSocket) {
            // delete this.activeConnections[websocketAgentId]
            await existingWebSocket.close()
            this.activeConnections[websocketAgentId].emit(
                'message',
                `Agent with ${websocketAgentId} is closed ...`
            )
        }
    }

    async sendToWebSocket(
        websocketAgentId: string,
        message: any
    ): Promise<void> {
        // Send message to WebSocket connection of agent
        const agent_active = await this.checkIfAgentActive(websocketAgentId)
        if (agent_active) {
            const websocket = this.activeConnections[websocketAgentId]
            if (websocket) {
                try {
                    if (message.message === 'config_updated') {
                        // Fetch updated configuration
                        const { instanceCount, configurations } =
                            await fetchAgentConfiguration(websocketAgentId)
                        const updatedMessage = {
                            message: 'config_updated',
                            instance_count: Number(instanceCount),
                            configurations,
                        }
                        websocket.emit(
                            'message',
                            JSON.stringify(updatedMessage)
                        )
                    } else {
                        websocket.emit('message', JSON.stringify(message))
                    }
                } catch (error) {
                    console.log(
                        `Error sending message to agent ${websocketAgentId}: ${error}`
                    )
                }
            } else {
                console.log(`Agent ${websocketAgentId} is not connected`)
            }
        }
    }

    async checkIfAgentActive(websocketAgentId: string): Promise<boolean> {
        // Check if agent is active
        return !!this.activeConnections[websocketAgentId]
    }

    async removePreviousAgentConnectionIfExists(
        websocketAgentId: string
    ): Promise<void> {
        // Remove previous WebSocket connection of agent if exists
        const existingWebSocket = this.activeConnections[websocketAgentId]
        if (existingWebSocket) {
            existingWebSocket.emit(
                'message',
                `Agent with ${websocketAgentId} is already connected.`
            )
            // delete this.activeConnections[websocketAgentId]
            // await existingWebSocket.close(1000, 'Establishing a new connection')
        }
    }

    sendNewBlockToActiveAgents(block: BlockEvent, cb: (error: any) => void) {
        const transactions = parseRawBlockBody(block.body)
        console.log(
            'blockNo:',
            block.blockNo,
            'slotNo:',
            block.slotNo,
            'txCount:',
            transactions.length
        )
        transactions.forEach((tx) => {
            console.log(' New Tx is : ', tx.hash.toString('hex'), tx.body)
        })
        setImmediate(cb)
        const data = {
            'New Block hash': block.headerHash.toString('hex'),
            blockNo: block.blockNo,
            slotNo: block.slotNo,
        }
        Object.values(this.activeConnections).forEach((websocket) => {
            websocket.emit('message', JSON.stringify(data))
        })

        transactions.length &&
            Object.values(this.activeConnections).forEach((websocket) => {
                websocket.emit(
                    'message',
                    JSON.stringify(
                        { message: 'on_chain_tx', transactions },
                        bigIntReplacer
                    )
                )
            })
    }
}

const manager = new WebSocketConnectionManager()
export default manager
