import { Client } from 'rpc-websockets'
import { configDotenv } from 'dotenv'
import { KuberService } from './KuberService'
import { Rpc } from './Rpc'
import { handleIncomingMessage } from './client'

configDotenv()

const wsUrl = process.env.WS_URL || ''
const agentId = process.env.AGENT_ID || ''

export const client = new Client(`${wsUrl}?socket_id=${agentId}`, {
    autoconnect: true,
    reconnect: true,
    reconnect_interval: 10000,
})

const readyClientWebSocket = new Promise((resolve) => {
    client.on('open', resolve)
})

const rpc = new Rpc(client)
export const kuberService = new KuberService(rpc, agentId)

async function connectToManagerWebSocket() {
    await readyClientWebSocket
    try {
        await client.subscribe('message')
        await client.subscribe('test')

        const subtractResult = await client.call('subtract', [10, 3])
        console.log('Subtract result:', subtractResult) // Output: Subtract result: 7

        client.on('message', async (data) => {
            handleIncomingMessage(data)
        })

        client.on('error', (error) => {
            console.error('WebSocket Error:', error)
        })
    } catch (error) {
        console.log(`RPC error is ${JSON.stringify(error)}.`)
    }
}

connectToManagerWebSocket().then(() =>
    console.log('connected to the manager ...')
)

// import WebSocket from 'ws'
// import { setInterval } from 'timers'
// import { handleIncomingMessage } from './client'
//
// import { configDotenv } from 'dotenv'
//
// configDotenv()
// // Define the WebSocket URL and agent ID
// const wsUrl = process.env.WS_URL || '' // Use WS_URL if provided, otherwise use default
// const agentId = process.env.AGENT_ID || '' // Retrieve agent ID from environment variable
// // Check if agent ID is provided
// if (!agentId) {
//     console.error('Agent ID is required as an argument')
//     process.exit(1)
// }
//
// let ws: WebSocket | null = null
// let reconnectAttempts = 0
// const maxReconnectAttempts = 3
// let isReconnecting = false
//
// function connectToManagerWebSocket() {
//     let interval: NodeJS.Timeout
//     // Create a new WebSocket client connection
//     ws = new WebSocket(`${wsUrl}/${agentId}`)
//     // Event listener for the connection opening
//     ws.on('open', () => {
//         console.log('Connected to the server.')
//         reconnectAttempts = 0
//         isReconnecting = false
//         // Send a "Ping" message to the server every 10 seconds
//         interval = setInterval(() => {
//             ws?.send('Ping')
//         }, 10000)
//     })
//
//     // Event listener for incoming messages
//     ws.on('message', (data) => {
//         handleIncomingMessage(data)
//     })
//
//     // Event listener for the connection closing
//     ws.on('close', (code, reason) => {
//         attemptReconnect()
//         console.log(
//             `Disconnected from the server (code: ${code}, reason: ${reason}).`
//         )
//         clearInterval(interval)
//     })
//
//     // Event listener for any errors
//     ws.on('error', (er) => {
//         console.error('WebSocket error', er)
//         attemptReconnect()
//         clearInterval(interval)
//     })
// }
//
// function attemptReconnect() {
//     if (maxReconnectAttempts >= reconnectAttempts) {
//         if (isReconnecting) {
//             return
//         }
//         isReconnecting = true
//         reconnectAttempts++
//         console.log(
//             `Attempting to reconnect... (${reconnectAttempts}/${maxReconnectAttempts})`
//         )
//         console.log('Waiting for 10 seconds before reconnecting')
//         setTimeout(() => {
//             connectToManagerWebSocket()
//             isReconnecting = false
//         }, 10000) // Wait 10 seconds before attempting to reconnect
//     } else {
//         console.error('Max reconnect attempts reached. Exiting application.')
//         process.exit(1) // Exit the application after max attempts
//     }
// }
//
export const sendDataToWebSocket: typeof WebSocket.prototype.send = async (
    action
) => {
    const response = await client.call('handle_transactions', [action, agentId])
    console.log('Response after calling handle_transactions is : ', response)
}
//
// connectToManagerWebSocket()
