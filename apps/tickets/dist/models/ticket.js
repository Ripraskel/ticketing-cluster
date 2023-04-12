"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
;
;
var TicketSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret.__v;
            delete ret._id;
        },
    }
});
TicketSchema.statics.build = function (attrs) {
    return new Ticket(attrs);
};
var Ticket = mongoose_1.default.model('Ticket', TicketSchema);
exports.Ticket = Ticket;
