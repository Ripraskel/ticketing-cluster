import 'bootstrap/dist/css/bootstrap.css';
import buildServerClient from "../api/build-server-client";
import Header from '../components/header';

const AppComponent = ({ Component, pageProps}) => {
    console.log(pageProps);
    return (
        <div>
            <Header currentUser={pageProps.currentUser}/>
            <Component {...pageProps} />
        </div>
    )
};

AppComponent.getInitialProps = async (appContext) => {
    const { data } = await buildServerClient(appContext.ctx).get('/api/users/currentuser');

    return {
        pageProps: { currentUser: data.currentUser }, // will be passed to the page component as props
    }
}

export default AppComponent;