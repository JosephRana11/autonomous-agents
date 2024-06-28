import { globalState } from './global'
import cron, { ScheduledTask } from 'node-cron'
import { kuberService } from '.'
import kuberServiceBuilder from './transaction-service'
import { configDotenv } from 'dotenv'

configDotenv()

// Define the types for the action parameter and action
export interface ActionParameter {
    name: string
    value: string
}

export interface Action {
    parameter: ActionParameter[]
    function_name: string
}

export interface Data {
    frequency: string
    probability: number
}

export interface Configuration {
    id: string
    type: string
    data: Data
    action: Action
}

let scheduledTasks: ScheduledTask[] = []

function clearScheduledTasks() {
    scheduledTasks.forEach((task) => {
        task.stop()
    })

    scheduledTasks = []
}

type TriggerType = 'MANUAL' | 'EVENT' | 'CRON'

function sendActionToManager(
    action: Action,
    trigger: boolean,
    payload: any = null,
    triggerType: TriggerType = 'CRON'
) {
    const actionWithTrigInfo = {
        action,
        messageType: 'action',
        trigger: trigger.toString(),
        payload,
        triggerType: triggerType,
    }
    kuberService.buildTx(
        JSON.stringify(actionWithTrigInfo),
        action.function_name
    )
    // sendDataToWebSocket(JSON.stringify(actionWithTrigInfo))
}

function getParameterValue(
    parameters: ActionParameter[] = [],
    name: string
): string {
    const param = parameters.find((param) => param.name === name)
    return param ? param.value : ''
}

function createTask(action: Action, frequency: string, probability: number) {
    return cron.schedule(frequency, () => {
        triggerAction(action, probability, 'CRON')
    })
}

export async function triggerAction(
    action: Action,
    probability: number,
    triggerType: TriggerType
) {
    if (Math.random() > probability || !globalState.agentWalletDetails) {
        sendActionToManager(action, false)
    } else {
        const agentAddress = globalState.agentWalletDetails?.agent_address || ''
        let payload
        switch (action.function_name) {
            case 'SendAda Token':
                payload = kuberServiceBuilder.transferADA(
                    [getParameterValue(action.parameter, 'Receiver Address')],
                    10,
                    globalState.agentWalletDetails.agent_address,
                    globalState.agentWalletDetails.payment_signing_key
                )
                break
            case 'Delegation':
                payload = kuberServiceBuilder.stakeDelegation(
                    agentAddress,
                    globalState.agentWalletDetails.payment_signing_key,
                    globalState.agentWalletDetails.stake_signing_key,
                    globalState.agentWalletDetails.stake_verification_key_hash,
                    getParameterValue(action.parameter, 'drep') || 'abstain'
                )
                break
            case 'Vote':
                payload = kuberServiceBuilder.voteOnProposal(
                    agentAddress,
                    globalState.agentWalletDetails.payment_signing_key,
                    globalState.agentWalletDetails.drep_id,
                    globalState.agentWalletDetails.stake_signing_key,
                    getParameterValue(action.parameter, 'proposal') || '',
                    getParameterValue(action.parameter, 'anchorUrl') || '',
                    getParameterValue(action.parameter, 'anchorHash') || ''
                )
                break
            case 'Info Action Proposal':
                payload = kuberServiceBuilder.createInfoGovAction(
                    agentAddress,
                    globalState.agentWalletDetails.payment_signing_key,
                    getParameterValue(action.parameter, 'anchor_url'),
                    getParameterValue(action.parameter, 'anchor_datahash'),
                    globalState.agentWalletDetails.stake_verification_key_hash
                )
                break
            case 'Proposal New Constitution':
                payload = kuberServiceBuilder.proposeNewConstitution(
                    agentAddress,
                    globalState.agentWalletDetails.payment_signing_key,
                    globalState.agentWalletDetails.stake_signing_key,
                    globalState.agentWalletDetails.stake_verification_key_hash,
                    getParameterValue(action.parameter, 'anchor_url'),
                    getParameterValue(action.parameter, 'anchor_dataHash'),
                    getParameterValue(action.parameter, 'newConstitution_url'),
                    getParameterValue(
                        action.parameter,
                        'newConstitution_dataHash'
                    )
                )
                break
            case 'Drep Registration':
                payload = kuberServiceBuilder.dRepRegistration(
                    globalState.agentWalletDetails.stake_signing_key,
                    globalState.agentWalletDetails.stake_verification_key_hash,
                    agentAddress,
                    globalState.agentWalletDetails.payment_signing_key
                )
                break
            case 'Drep deRegistration':
                payload = kuberServiceBuilder.dRepDeRegistration(
                    agentAddress,
                    globalState.agentWalletDetails.payment_signing_key,
                    globalState.agentWalletDetails.stake_signing_key,
                    globalState.agentWalletDetails.stake_verification_key_hash
                )
                break
            case 'Register Stake':
                payload = kuberServiceBuilder.registerStake(
                    globalState.agentWalletDetails.stake_signing_key,
                    globalState.agentWalletDetails.stake_verification_key_hash,
                    globalState.agentWalletDetails.payment_signing_key,
                    agentAddress
                )
                break
            case 'Abstain Delegation':
                payload = kuberServiceBuilder.abstainDelegations(
                    [globalState.agentWalletDetails.stake_signing_key],
                    [
                        globalState.agentWalletDetails
                            .stake_verification_key_hash,
                    ],
                    agentAddress,
                    globalState.agentWalletDetails.payment_signing_key
                )
                break
            default:
                return
        }
        sendActionToManager(action, true, payload, triggerType)
    }
}

export async function scheduleFunctions(configurations: Configuration[]) {
    clearScheduledTasks()

    configurations.forEach((config) => {
        const { data, action, type } = config
        if (action && type === 'CRON') {
            const { frequency, probability } = data
            const task = createTask(action, frequency, probability)
            scheduledTasks.push(task)
        }
    })
}
