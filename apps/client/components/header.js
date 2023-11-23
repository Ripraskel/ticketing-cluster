import Link from 'next/link';

export default ({currentUser}) => {
    console.log(currentUser)
    const authLinks = [
        !currentUser && { label: 'Sign Up', href: '/auth/signup'},
        !currentUser && { label: 'Sign In', href: '/auth/signin'},
        currentUser && { label: 'Sell Ticket', href: '/tickets/new'},
        currentUser && { label: 'My Orders', href: '/orders'},
        currentUser && { label: 'Sign Out', href: '/auth/signout'}
    ]
        .filter(authLinks => authLinks)
        .map(({label, href}) => {
            return (
                <li className="nav-item" key={label}>
                    <Link href={href} className="nav-link" >
                        {label}
                    </Link>
                </li>
            )
        });
    
    return (
        <nav className='navbar navbar-light bg-light'>
            <Link href="/" className='navbar-brand'>
                GitTix
            </Link>

            <div className='d-flex justify-content-end'>
                <ul className='nav d-flex align-items-center'>
                    {authLinks}
                </ul>
            </div>
        </nav>
    )
}