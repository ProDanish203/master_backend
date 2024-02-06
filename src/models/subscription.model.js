import { Schema, model } from "mongoose"

const subscriptionSchema = new Schema({
    channel: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
}, 
{ timestamps: true }
);

export const Subscription = model("Subscription", subscriptionSchema)