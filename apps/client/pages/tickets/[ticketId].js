import { useEffect, useState } from 'react';
import Router, { useRouter } from 'next/router';
import useRequest from '../../hooks/use-request';

const ticket = () => {
    const route = useRouter();
    const [ticket, setTicket] = useState({});
    const getTicket = useRequest({
        url: `/api/tickets/${route.query.ticketId}`,
        method: 'get', 
        onSuccess: (data) => {setTicket(data)}
    });
    const {sendRequest, errors} = useRequest({
        url: '/api/orders',
        method: 'post',
        body: {
            ticketId: ticket.id,
        }, 
        onSuccess: () => route.push('/')
    });

    const onSubmit = async (event) => {
        event.preventDefault();
        await sendRequest();
    };

    useEffect(async () => {
        await getTicket.sendRequest();
    }, [])

    return (
        <form onSubmit={onSubmit}> 
            <h1>
                Create new ticket
            </h1>
            <div className="form-group">
                <label>Title: {ticket.title}</label>
            </div>
            <div className="form-group">
                <label>Price: £{ticket.price}</label>
            </div>
            {errors}
            <button className="btn btn-primary">Buy</button>
        </form>
    );
}

export default ticket;