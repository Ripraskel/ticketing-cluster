import Link from 'next/link';

const LandingPage = ({ currentUser, tickets }) => {
    const ticketList = tickets.map(ticket => {
        return (
            <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>£{parseFloat(ticket.price).toFixed(2)}</td>
                <td>
                    <Link href='/tickets/[ticketId]' as={`/tickets/${ticket.id}`}>
                        View
                    </Link>
                </td>
            </tr>
        )
    })
    return (
        <div>
            <h1>Tickets</h1>
            <table className='table'>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {ticketList}
                    <tr>
                        <td>
                            <Link href='/tickets/new'>
                                Sell New Ticket
                            </Link>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

LandingPage.getInitialProps = async (context, client, currentUser) => {
    const { data } = await client.get('/api/tickets');
    console.log("Server")
    return { tickets: data }
}

export default LandingPage;