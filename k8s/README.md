# Local Kubernetes Setup for Kluster

This directory contains Kubernetes manifests for deploying Kluster locally.

## Prerequisites

- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [minikube](https://minikube.sigs.k8s.io/docs/start/) or [kind](https://kind.sigs.k8s.io/docs/user/quick-start/)
- Docker

## Quick Start with Minikube

1. Start minikube:
```bash
minikube start --driver=docker --cpus=4 --memory=4096
```

2. Enable ingress addon:
```bash
minikube addons enable ingress
```

3. Apply the manifests:
```bash
kubectl apply -k .
```

4. Wait for deployments:
```bash
kubectl wait --for=condition=ready pod -l app=postgres -n kluster --timeout=120s
kubectl wait --for=condition=ready pod -l app=kluster -n kluster --timeout=120s
```

5. Access the application:
```bash
minikube service kluster-service -n kluster --url
```

## Quick Start with Kind

1. Create cluster:
```bash
cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
- role: worker
EOF
```

2. Install NGINX ingress:
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
```

3. Apply manifests:
```bash
kubectl apply -k .
```

4. Access at http://kluster.local

## Configuration

Update secrets before deploying:
```bash
kubectl create secret generic kluster-secrets \
  --from-literal=database-url='postgresql://kluster:password@postgres:5432/kluster' \
  --from-literal=clerk-publishable-key='YOUR_KEY' \
  --from-literal=clerk-secret-key='YOUR_SECRET' \
  --from-literal=openai-key='YOUR_KEY' \
  --namespace kluster
```

## Useful Commands

View logs:
```bash
kubectl logs -f deployment/kluster-app -n kluster
```

Scale up:
```bash
kubectl scale deployment kluster-app --replicas=3 -n kluster
```

Port forward for local development:
```bash
kubectl port-forward svc/kluster-service 3000:80 -n kluster
```

Delete everything:
```bash
kubectl delete -k .
```
