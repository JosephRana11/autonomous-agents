import { Client } from 'rpc-websockets'

type rpcMethodName = 'handle_transactions' | ''

export class Rpc {
    client: Client

    constructor(client: Client) {
        this.client = client
    }

    callMethod(methodName: rpcMethodName, params: any): void {
        this.client
            .notify(methodName, params)
            .then((res) => console.log('Response after call Method is :', res))
    }

    async callAndWait(methodName: rpcMethodName, params: any): Promise<any> {
        return this.client.call(methodName, params)
    }
}
