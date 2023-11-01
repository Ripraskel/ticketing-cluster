import Link from 'next/link';

const LandingPage = ({ currentUser, tickets }) => {

    return (
        <div>
            <h1>Landing Page</h1>
            <p>{currentUser ? `user email: ${currentUser.email}` : "You are not signed in"}</p>
            {tickets.map((ticket) => {
                return (
                    <div key={ticket.id}>
                    <Link href={`/tickets/${ticket.id}`}  >
                        {ticket.title}: £{ticket.price}
                    </Link>

                    </div>
                )
            })}
        </div>
    )
}

LandingPage.getInitialProps = async (context, client, currentUser) => {
    const { data } = await client.get('/api/tickets');
    console.log("Server")
    return { tickets: data, currentUser }
}

export default LandingPage;