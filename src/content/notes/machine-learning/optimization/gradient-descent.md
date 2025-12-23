---
title: "Gradient Descent Optimization"
topic: "Machine Learning"
subtopic: "Optimization"
date: "2025-01-14"
description: "Understanding gradient descent and its variants for neural network training"
tags: ["optimization", "algorithms", "training"]
draft: false
---

# Gradient Descent Optimization

Gradient descent is an iterative optimization algorithm for finding local minima of differentiable functions.

## Basic Gradient Descent

The update rule for gradient descent is:

$$
\theta_{t+1} = \theta_t - \alpha \nabla_\theta J(\theta_t)
$$

where:
- $\theta$ represents the parameters
- $\alpha$ is the learning rate
- $\nabla_\theta J(\theta)$ is the gradient of the cost function

## Variants

### Batch Gradient Descent

Computes the gradient using the entire dataset:

$$
\theta = \theta - \alpha \frac{1}{m} \sum_{i=1}^m \nabla_\theta J(\theta; x^{(i)}, y^{(i)})
$$

**Pros**: Stable convergence, guaranteed to find global minimum for convex functions
**Cons**: Slow for large datasets, requires all data in memory

### Stochastic Gradient Descent (SGD)

Updates parameters using one sample at a time:

$$
\theta = \theta - \alpha \nabla_\theta J(\theta; x^{(i)}, y^{(i)})
$$

**Pros**: Fast updates, can escape local minima
**Cons**: High variance, noisy convergence

### Mini-Batch Gradient Descent

Compromise between batch and stochastic:

$$
\theta = \theta - \alpha \frac{1}{b} \sum_{i=k}^{k+b} \nabla_\theta J(\theta; x^{(i)}, y^{(i)})
$$

where $b$ is the batch size (typically 32, 64, 128, or 256).

## Momentum

Adds a velocity term to accelerate convergence:

$$
v_t = \beta v_{t-1} + \alpha \nabla_\theta J(\theta_t)
$$

$$
\theta_{t+1} = \theta_t - v_t
$$

Common choice: $\beta = 0.9$

## Implementation

```python
def gradient_descent(X, y, learning_rate=0.01, epochs=1000):
    m, n = X.shape
    theta = np.zeros(n)

    for epoch in range(epochs):
        # Compute predictions
        predictions = X @ theta

        # Compute gradient
        gradient = (1/m) * X.T @ (predictions - y)

        # Update parameters
        theta -= learning_rate * gradient

        # Optional: compute loss for monitoring
        if epoch % 100 == 0:
            loss = np.mean((predictions - y) ** 2)
            print(f"Epoch {epoch}: Loss = {loss}")

    return theta
```

## Learning Rate Selection

The learning rate $\alpha$ is crucial:

- **Too large**: Divergence or oscillation
- **Too small**: Slow convergence
- **Adaptive methods**: Adam, RMSprop adjust learning rate automatically

## Convergence Criteria

Stop when:
1. Gradient magnitude is small: $\|\nabla_\theta J(\theta)\| < \epsilon$
2. Parameter change is small: $\|\theta_{t+1} - \theta_t\| < \epsilon$
3. Loss improvement is negligible: $|J(\theta_{t+1}) - J(\theta_t)| < \epsilon$
