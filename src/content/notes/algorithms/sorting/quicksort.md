---
title: "QuickSort Algorithm"
topic: "Algorithms"
subtopic: "Sorting"
date: "2025-01-13"
description: "Divide-and-conquer sorting algorithm with average O(n log n) complexity"
tags: ["sorting", "divide-and-conquer", "algorithms"]
draft: false
---

# QuickSort Algorithm

QuickSort is an efficient, in-place sorting algorithm that uses divide-and-conquer strategy.

## Algorithm Overview

1. **Partition**: Choose a pivot element and partition the array into two sub-arrays:
   - Elements less than pivot
   - Elements greater than pivot
2. **Recursively** sort the sub-arrays
3. **Combine**: No explicit combining needed (in-place sorting)

## Time Complexity

- **Best Case**: $O(n \log n)$ - balanced partitions
- **Average Case**: $O(n \log n)$ - random pivots
- **Worst Case**: $O(n^2)$ - already sorted with poor pivot selection

## Space Complexity

- $O(\log n)$ for recursive call stack
- In-place sorting (no additional data structures)

## Implementation

```python
def quicksort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1

    if low < high:
        # Partition the array
        pivot_index = partition(arr, low, high)

        # Recursively sort left and right sub-arrays
        quicksort(arr, low, pivot_index - 1)
        quicksort(arr, pivot_index + 1, high)

    return arr

def partition(arr, low, high):
    # Choose rightmost element as pivot
    pivot = arr[high]
    i = low - 1

    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]

    # Place pivot in correct position
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1
```

## Pivot Selection Strategies

| Strategy | Description | Pros | Cons |
|----------|-------------|------|------|
| First element | `pivot = arr[low]` | Simple | Worst case on sorted data |
| Last element | `pivot = arr[high]` | Simple | Worst case on sorted data |
| Random element | Random index | Avoids worst case | Requires randomness |
| Median-of-three | Median of first, middle, last | Good balance | Extra comparisons |

## Optimization: Three-Way Partitioning

For arrays with many duplicate values:

```python
def three_way_partition(arr, low, high):
    pivot = arr[low]
    i = low
    j = low
    k = high

    while j <= k:
        if arr[j] < pivot:
            arr[i], arr[j] = arr[j], arr[i]
            i += 1
            j += 1
        elif arr[j] > pivot:
            arr[j], arr[k] = arr[k], arr[j]
            k -= 1
        else:
            j += 1

    return i, k
```

## Comparison with Other Sorting Algorithms

- **vs MergeSort**: QuickSort is in-place, MergeSort has guaranteed $O(n \log n)$
- **vs HeapSort**: QuickSort has better cache locality
- **vs InsertionSort**: QuickSort faster for large datasets, InsertionSort better for small/nearly sorted

## When to Use QuickSort

✅ **Use when**:
- Large datasets requiring in-place sorting
- Average case performance is acceptable
- Cache-friendly performance is important

❌ **Avoid when**:
- Worst-case guarantees are critical (use MergeSort or HeapSort)
- Stability is required (QuickSort is unstable)
- Working with linked lists (MergeSort is better)
