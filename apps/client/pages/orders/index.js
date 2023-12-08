const order = ({orders}) => {
    const orderList = orders.map(order => {
        return (
            <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.status}</td>
                <td>
                    <div>{order.ticket.title}</div>
                    <div>£{order.ticket.price}</div>
                </td>
            </tr>
        )
    })
    
    return (
        <div>
            <h1>Orders</h1>
            <table className='table'>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Status</th>
                        <th>Ticket Details</th>
                    </tr>
                </thead>
                <tbody>
                    {orderList}
                </tbody>
            </table>
        </div>
    );
}

order.getInitialProps = async (context, client, currentUser) => {
    const orderResponse = await client.get(`/api/orders`);

    return { orders: orderResponse.data };
}

export default order;