import { useEffect } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const signout = () => {
    const {sendRequest, errors} = useRequest({
        url: '/api/users/signout',
        method: 'post', 
        onSuccess: () => Router.push('/')
    });

    useEffect(() => {
        sendRequest();
    })

    return <div>Signin out....</div>
}

export default signout;