import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const ticket = ({ticket}) => {
    const {sendRequest, errors} = useRequest({
        url: '/api/orders',
        method: 'post',
        body: {
            ticketId: ticket.id,
        }, 
        onSuccess: (order) => { 
            Router.push(`/orders/${order.id}`)
        }
    });

    const onSubmit = async (event) => {
        event.preventDefault();
        await sendRequest();
    };

    return (
        <form onSubmit={onSubmit}> 
            <h1>
                {ticket.title}
            </h1>
            <h4>Price: £{ticket.price}</h4>
            {errors}
            <button 
                type='submit'
                className="btn btn-primary"
            >
                Purchase
            </button>
        </form>
    );
}

ticket.getInitialProps = async (context, client, currentUser) => {
    const { ticketId } = context.query;
    const { data } = await client.get(`/api/tickets/${ticketId}`);

    return { ticket: data };
}

export default ticket;