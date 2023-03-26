import axios from "axios"

export default ({req}) => {
    return axios.create({
        baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
        headers: req.headers
    })
}