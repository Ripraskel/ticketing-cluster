Steps:
- Install skaffold (https://skaffold.dev/docs/install/)
- Run up Kubernetes
- Set jwt-secret by running: `kubectl create secret generic jwt-secret --from-literal=JWT_KEY=%MY_KEY%`
- Install ingress-nginx (https://kubernetes.github.io/ingress-nginx/deploy/#quick-start)
- Add `127.0.0.1 ticketing.dev` to etc/host file
- Open terminal and run: `skaffold dev`

