const LandingPage = (props) => {
    // console.log(props.hi)
    return (
        <div>
            <h1>Landing Page</h1>
            <p>{props.currentUser ? `user email: ${props.currentUser.email}`: "You are not signed in"}</p>
        </div>
    )
}

// export async function getServerSideProps(context) {
//     return {
//         props: { hi: "Hello from server" }, // will be passed to the page component as props
//     }
// }

export default LandingPage;