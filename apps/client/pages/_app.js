import 'bootstrap/dist/css/bootstrap.css';
import buildServerClient from "../api/build-server-client";
import Header from '../components/header';

const AppComponent = ({ Component, pageProps }) => {
    console.log(pageProps);
    return (
        <div>
            <Header currentUser={pageProps.currentUser} />
            <div className='container'>
                <Component {...pageProps} />
            </div>
        </div>
    )
};

AppComponent.getInitialProps = async (appContext) => {
    const client = buildServerClient(appContext.ctx);
    const { data } = await client.get('/api/users/currentuser');

    let pageProps = {};
    if (appContext.Component.getInitialProps) {
        pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser)
    }
    return {
        pageProps,
        ...data
    }
}

export default AppComponent;