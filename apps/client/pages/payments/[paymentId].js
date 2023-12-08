
const payment = ({orderId, amount, status}) => {
    return (
        <div>
            <h1>
                Receipt
            </h1>
            <h4>Order ID: {orderId}</h4>
            <h4>Amount: £{amount/100}</h4> {/* convert from pence*/}
            <h4>Status: {status}</h4>
        </div>
    );
}

payment.getInitialProps = async (context, client, currentUser) => {
    const { paymentId } = context.query;
    const paymentResponse = await client.post(`/api/payments/complete`, {
        paymentId
    });

    return paymentResponse.data;
}

export default payment;