import { BaseDispatchEvent } from '@core/events/base/base-dispatch-event'
import { APIMessage } from 'discord-api-types/v10'
export class MessageCreateEvent extends BaseDispatchEvent<'messageCreate', APIMessage> {
    constructor(data: APIMessage){
        super({
            op: 0,
            t: 'messageCreate',
            s: 0,
            d: data
        })
    }
}

