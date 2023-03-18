import mongoose from "mongoose";
import { Password } from "../services/password";

// build User interface 
interface BuildUserParams {
    email: string
    password: string
};

// User Model interface
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: BuildUserParams): UserDoc
};

// interface for User from Mongoose
interface UserDoc extends mongoose.Document {
    email: string
    password: string
};

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret.password;
            delete ret.__v;
            delete ret._id
        },
    }
});
userSchema.pre('save', async function(done) { // using function keyword instead of arrow function to maintain this scope
    if (this.isModified('password')) {
        const hash = await Password.toHash(this.get('password'));
        this.set('password', hash);
    }
    done();
})
userSchema.statics.build = (attrs: BuildUserParams) => {
    return new User(attrs);
}
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };