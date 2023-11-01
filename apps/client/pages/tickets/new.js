import { useEffect, useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const newTicket = () => {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const {sendRequest, errors} = useRequest({
        url: '/api/tickets',
        method: 'post',
        body: {
            title,
            price
        }, 
        // onSuccess: (ticket) => Router.push(`/tickets/${ticket.id}`)
        onSuccess: () => Router.push('/')
    });

    const onBlur = () => {
        const value = parseFloat(price);

        if (isNaN(value)) {
            return;
        }

        setPrice(value.toFixed(2));
    }

    const onSubmit = async (event) => {
        event.preventDefault();
        await sendRequest();
    };

    return (
        <form onSubmit={onSubmit}> 
            <h1>
                Create new ticket
            </h1>
            <div className="form-group">
                <label>Title</label>
                <input 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="form-control"
                />
            </div>
            <div className="form-group">
                <label>Price</label>
                <input 
                    value={price}
                    onBlur={() => onBlur()}
                    onChange={e => setPrice(e.target.value)}
                    type="number"
                    className="form-control"/>
            </div>
            {errors}
            <button className="btn btn-primary">Create</button>
        </form>
    );
}

export default newTicket;