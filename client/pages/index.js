import buildServerClient from "../api/build-server-client";
const getEmail = (user) => {
    return user.email;
}
const LandingPage = (props) => {
    return (
        <div>
            <h1>Landing Page</h1>
            <p>{`user email: ${props.currentUser.email}`}</p>
        </div>
    )
}

export async function getServerSideProps(context) {
    const { data } = await buildServerClient(context).get('/api/users/currentuser');
    console.log(data);
    return {
        props: { currentUser: data.currentUser }, // will be passed to the page component as props
    }
}

export default LandingPage;