import { useEffect, useState } from 'react';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import CheckoutForm from '../../components/stripeCheckoutForm';

const stripePromise = loadStripe(process.env.STRIPE_KEY);

const order = ({order, paymentData}) => {
    const [secondsLeftToPurchase, setSecondsLeftToPurchase] = useState(0);

    const options = {
        clientSecret: paymentData?.clientSecret, 
        appearance: {
            theme: 'stripe'
        }
    }

    const findTimeLeft = () => {
        const msLeft = new Date(order.expiresAt) - new Date();
        setSecondsLeftToPurchase(Math.round(msLeft/1000));
    }
    useEffect(() => {
        findTimeLeft();
        const timerId = setInterval(findTimeLeft, 1000);

        return () => {
            clearInterval(timerId);
        }
    });
    

    const getCountDownMessage = () => {
        if (secondsLeftToPurchase > 0) {
           return (
                <div>
                    <p>You have {secondsLeftToPurchase} seconds to complete the purchase</p>
                    <Elements stripe={stripePromise} options={options}>
                        <CheckoutForm paymentId={paymentData?.paymentId}/>
                    </Elements>
                    <p>Payment secret: {paymentData?.clientSecret}</p>
                </div>
           )
        } else {
            return <p>Order has expired</p>
        }
    }
    return (
        <div>
            <h1>
                {order.ticket.title}
            </h1>
            <h4>Price: £{order.ticket.price}</h4>
            {getCountDownMessage()}
        </div>
    );
}

order.getInitialProps = async (context, client, currentUser) => {
    const { orderId } = context.query;
    const orderResponse = await client.get(`/api/orders/${orderId}`);
    let paymentResponse = {
        data: undefined
    };
    try {
        paymentResponse = await client.post('/api/payments/intent', {
            orderId
        });
        console.log("PaymentResponse", paymentResponse)

    } catch (err) {
        console.log("payment Res error")
    }

    return { order: orderResponse.data, paymentData: paymentResponse.data };
}

export default order;