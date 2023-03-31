import axios from "axios"

export default ({ req }) => {
    if (typeof window === 'undefined') {
        // We are on the server
        return axios.create({
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers
        })
    } else {
        // We must be on the client browser
        console.log("Client side request");
        return axios.create({
            baseURL: '/'
        })
    }

}