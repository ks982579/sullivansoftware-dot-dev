---
title: "Backpropagation Algorithm"
topic: "Machine Learning"
subtopic: "Neural Networks"
date: "2025-01-15"
description: "Comprehensive guide to backpropagation in neural networks with mathematical derivations"
tags: ["deep-learning", "optimization", "gradient-descent"]
draft: false
---

# Backpropagation Algorithm

Backpropagation is the fundamental algorithm for training neural networks. It efficiently computes gradients of the loss function with respect to network weights.

## Mathematical Foundation

### Forward Pass

Given input $x$, the forward pass computes:

$$
z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}
$$

$$
a^{[l]} = \sigma(z^{[l]})
$$

where:
- $W^{[l]}$ is the weight matrix at layer $l$
- $b^{[l]}$ is the bias vector at layer $l$
- $\sigma$ is the activation function
- $a^{[0]} = x$ (input)

### Loss Function

For binary classification with sigmoid output:

$$
\mathcal{L}(y, \hat{y}) = -[y \log(\hat{y}) + (1-y) \log(1-\hat{y})]
$$

### Backward Pass

The gradient of the loss with respect to the output is:

$$
\frac{\partial \mathcal{L}}{\partial a^{[L]}} = -\frac{y}{a^{[L]}} + \frac{1-y}{1-a^{[L]}}
$$

For hidden layers, using the chain rule:

$$
\frac{\partial \mathcal{L}}{\partial W^{[l]}} = \frac{\partial \mathcal{L}}{\partial z^{[l]}} \cdot (a^{[l-1]})^T
$$

$$
\frac{\partial \mathcal{L}}{\partial b^{[l]}} = \frac{\partial \mathcal{L}}{\partial z^{[l]}}
$$

## Implementation Pseudocode

```python
def backpropagation(X, y, weights, biases, learning_rate):
    # Forward pass
    activations = forward_pass(X, weights, biases)

    # Compute loss
    loss = compute_loss(activations[-1], y)

    # Backward pass
    gradients = []
    delta = activations[-1] - y  # Output layer gradient

    for l in reversed(range(num_layers)):
        # Compute gradients
        dW = delta @ activations[l-1].T / m
        db = np.sum(delta, axis=1, keepdims=True) / m

        gradients.append((dW, db))

        # Propagate gradient to previous layer
        if l > 0:
            delta = weights[l].T @ delta * activation_derivative(activations[l-1])

    # Update weights
    for l in range(num_layers):
        weights[l] -= learning_rate * gradients[l][0]
        biases[l] -= learning_rate * gradients[l][1]

    return weights, biases, loss
```

## Key Insights

1. **Computational Efficiency**: Backprop reuses forward pass computations
2. **Gradient Flow**: Chain rule enables layer-by-layer gradient computation
3. **Vanishing Gradients**: Deep networks may suffer from vanishing gradients with sigmoid/tanh activations

## Common Activation Functions

| Function | Formula | Derivative |
|----------|---------|------------|
| Sigmoid | $\sigma(x) = \frac{1}{1+e^{-x}}$ | $\sigma'(x) = \sigma(x)(1-\sigma(x))$ |
| ReLU | $\text{ReLU}(x) = \max(0, x)$ | $\text{ReLU}'(x) = \begin{cases} 1 & x > 0 \\ 0 & x \leq 0 \end{cases}$ |
| Tanh | $\tanh(x) = \frac{e^x - e^{-x}}{e^x + e^{-x}}$ | $\tanh'(x) = 1 - \tanh^2(x)$ |

## References

- Rumelhart, D. E., Hinton, G. E., & Williams, R. J. (1986). Learning representations by back-propagating errors. *Nature*, 323(6088), 533-536.
- Goodfellow, I., Bengio, Y., & Courville, A. (2016). *Deep Learning*. MIT Press.
