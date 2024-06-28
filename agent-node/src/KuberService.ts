import { Rpc } from './Rpc'

export class KuberService {
    rpc: Rpc
    agentId: string

    constructor(rpc: Rpc, agentId: string) {
        this.rpc = rpc
        this.agentId = agentId
    }

    async buildTx(txBuilderJson: string, function_name: string) {
        console.log(
            `Initiating building transactions for agent ${this.agentId} with function ${function_name} and txBuilderJson as ${txBuilderJson}`
        )
        switch (function_name) {
            case 'SendAda Token':
            case 'Register Stake':
            case 'Abstain Delegation':
            case 'Drep deRegistration':
            case 'Info Action Proposal':
            case 'Proposal New Constitution':
            case 'Drep Registration':
                this.rpc.callMethod('handle_transactions', [
                    txBuilderJson,
                    this.agentId,
                ])
                break
                break
            case 'Delegation':
                break
            case 'Vote':
                this.rpc.callMethod('handle_transactions', [
                    txBuilderJson,
                    this.agentId,
                ])
                break
            default:
                return
        }
    }

    submitTx() {}
}
