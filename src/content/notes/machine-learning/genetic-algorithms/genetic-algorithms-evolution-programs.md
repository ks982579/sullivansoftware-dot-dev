---
title: "Genetic Algorithms to Evolution Programs"
topic: "Machine Learning"
subtopic: "Evolution Programs"
date: "2025-04-09"
description: "Book review of 'Genetic Algorithms + Data Structures = Evolution Programs'"
tags: ["deep-learning", "genetic-algorithms", "evolution-programs"]
draft: false
---

# Genetic Algorithms + Data Structures = Evolution Programs

**Author:** Zbigniew Michalewicz — *Third, Revised and Extended Edition*

This book argues that classical genetic algorithms (binary-string, two-operator GAs) are too domain-independent for many real-world problems, and proposes **Evolution Programs (EPs)** as a unifying framework: population-based search that uses *natural* data structures and *problem-specific* genetic operators instead of forcing every problem into a binary representation. The progression across the three parts is GA theory → numerical optimisation → combinatorial and discrete applications.

---

# Introduction

The book opens by defining the structure common to all evolution programs:

```
procedure evolution program
begin
  t ← 0
  initialize P(t)
  evaluate P(t)
  while (not termination-condition) do
    t ← t + 1
    select P(t) from P(t − 1)
    alter P(t)
    evaluate P(t)
end
```

**Key distinction:** Classical GAs transform the *problem* to fit the algorithm (binary strings + two operators). Evolution Programs transform the *algorithm* to fit the problem (rich data structures + bespoke operators). The motto: *"If the mountain will not come to Mohammed, then Mohammed will go to the mountain."*

Unary operators (mutation type $m_i : S \to S$) create an offspring from a single parent. Higher-order operators (crossover type $c_j : S \times \dots \times S \to S$) combine parts from multiple parents. The **domain independence** of classical GAs, while theoretically appealing, becomes a weakness in the presence of non-trivial constraints, because any reasonable constraint-handling mechanism (penalty, decoder, repair) is inherently problem-specific anyway.

---

# Part I. Genetic Algorithms

Part I covers classical GA theory: what GAs are, how they work step by step, why they work (Schema Theorem), and selected practical topics.

## 1. GAs: What Are They?

GAs are stochastic search algorithms that model natural selection. They maintain a population $P(t) = \{x_1^t, \dots, x_n^t\}$ where each individual represents a candidate solution. At each generation: evaluate fitness, select the fitter individuals, apply crossover and mutation, repeat.

A GA for a given problem requires five components:
1. A genetic representation of solutions
2. A method to create an initial population
3. An evaluation (fitness) function
4. Genetic operators
5. Parameter values (population size, operator probabilities, etc.)

### 1.1. Optimization of a Simple Function

**Problem:** maximise $f(x) = x \cdot \sin(10\pi x) + 1.0$ for $x \in [-1, 2]$.

#### 1.1.1. Representation

A 22-bit binary vector encodes $x$. Six decimal places of precision require at least $3 \times 10^6$ equal-size ranges; since $2^{21} < 3{,}000{,}000 < 2^{22}$, 22 bits suffice. Decoding:

$$x = -1.0 + \text{decimal}(b_{21}b_{20}\dots b_0) \cdot \frac{3}{2^{22} - 1}$$

#### 1.1.2. Initial Population

All 22 bits of each chromosome are initialised randomly.

#### 1.1.3. Evaluation Function

$$\text{eval}(v) = f(x)$$

where $v$ is the binary chromosome and $x$ is its decoded real value. The function rates each potential solution.

#### 1.1.4. Genetic Operators

**Mutation:** a single bit is flipped with probability $p_m$. **Crossover:** two parents are cut at a random position and their tails swapped, producing two offspring.

#### 1.1.5. Parameters

Population size $pop\_size = 50$, crossover probability $p_c = 0.25$, mutation probability $p_m = 0.01$.

#### 1.1.6. Experimental Results

After 150 generations, the best chromosome was `(1111001101000100000101)`, corresponding to $x_{max} \approx 1.850773$, confirming the expected maximum near $x = 1.85 + \varepsilon_{19}$ with $f(x_{max}) \approx 2.85$.

### 1.2. The Prisoner's Dilemma

Two isolated prisoners choose independently to defect or cooperate. The GA maintains a population of *strategies*, each encoded as a 70-bit string (64 bits for moves in every possible 3-move history, plus 6 bits for initial conditions). Axelrod's experiments starting from a random population evolved populations whose median strategy matched the best known heuristic. Dominant behavioural patterns that emerged: cooperate after mutual cooperation, retaliate against defection, accept an apology, and defect after sustained mutual defection.

#### 1.2.1. Representing a Strategy
A strategy specifying a move (D/C) for each of the 64 possible 3-move histories uses 64 bits, plus 6 bits for initial premises = 70 loci per chromosome.

#### 1.2.2. Outline of the Genetic Algorithm
Select initial population randomly → evaluate each player via round-robin games → select players for mating by performance (±1 std dev from average) → crossover and mutation to produce offspring.

#### 1.2.3. Experimental Results
Emergent cooperative strategies: Don't Rock the Boat, Be Provokable, Accept an Apology, Forget, and Don't Get Stuck in a Rut.

### 1.3. Traveling Salesman Problem

The TSP requires finding the minimum-cost Hamiltonian cycle over $n$ cities. Binary representation fails because crossover produces duplicate cities and invalid tours. Integer *path representation* $v = (i_1 i_2 \dots i_n)$ is used instead, and the OX (Order Crossover) operator preserves subsequence order from one parent while maintaining relative city order from the other. Results on 100 cities: ~9.4% above optimum after 20,000 generations.

### 1.4. Hill Climbing, Simulated Annealing, and Genetic Algorithms

Illustrative function: $f(v) = |11 \cdot \text{one}(v) - 150|$ for 30-bit strings, with a global maximum at all-1s (value 180) and a local maximum at all-0s (value 150). Hill climbing gets trapped at the local optimum if fewer than 14 ones are in the start string. Simulated annealing escapes by accepting worse moves with probability $p = e^{\Delta f / T}$. The GA sidesteps this by combining two mediocre strings through crossover:

$$v_5 = (\underbrace{111110000000}_{\text{12 ones}}\dots)\quad v_6 = (\underbrace{000000000001}_{\text{13 ones}}\dots) \implies v_7\ \text{has 19 ones, eval} = 59$$

The analogies: hillclimbing is a kangaroo searching the local hilltop; simulated annealing is a drunk kangaroo that slowly sobers up; genetic algorithms are many kangaroos parachuted randomly, with the weakest ones shot periodically.

### 1.5. Conclusions

Three examples reveal the key challenges: representation (TSP requires integer vectors, not bits), evaluation function design, and constraint handling. These are explored throughout the rest of the book.

---

## 2. GAs: How Do They Work?

A detailed walkthrough of one complete generation, using the function $f(x_1, x_2) = 21.5 + x_1 \cdot \sin(4\pi x_1) + x_2 \cdot \sin(20\pi x_2)$ with $x_1 \in [-3.0, 12.1]$, $x_2 \in [4.1, 5.8]$, population size 20, and a 33-bit chromosome (18 bits for $x_1$, 15 for $x_2$).

**Roulette Wheel Selection:** compute fitness $F = \sum \text{eval}(v_i)$, then selection probability and cumulative probability for each chromosome. Spin the wheel $pop\_size$ times to build the new population.

**Crossover:** each chromosome is selected for crossover with probability $p_c = 0.25$. Selected pairs are cut at a random position $1 \leq pos \leq m-1$ and their tails swapped.

**Mutation:** each bit is flipped independently with probability $p_m = 0.01$. Expected mutations per generation: $p_m \cdot m \cdot pop\_size = 0.01 \times 33 \times 20 = 6.6$.

After one generation, the total population fitness rose from 387.8 to 447.0. After 1,000 generations, best value near 35.5 (note: stochastic sampling error can mean the best-ever individual, tracked separately, is better than the final population's best).

---

## 3. GAs: Why Do They Work?

The theoretical backbone: **schemata** and the **Schema Theorem**.

A **schema** $S$ is a template over $\{0, 1, *\}$ of the same length as chromosomes. A schema of length $m$ with $r$ don't-care symbols matches exactly $2^r$ strings. Every string of length $m$ is matched by $2^m$ schemata. Over a population of size $n$, between $2^m$ and $n \cdot 2^m$ distinct schemata may be present.

Two key properties of a schema:
- **Order** $o(S)$: number of fixed (non-`*`) positions. Controls disruption by mutation.
- **Defining length** $\delta(S)$: distance between first and last fixed positions. Controls disruption by crossover.

**Reproductive Schema Growth Equation (selection only):**

$$\xi(S, t+1) = \xi(S, t) \cdot \frac{\text{eval}(S, t)}{\bar{F}(t)}$$

Above-average schemata receive exponentially increasing trials.

**With crossover:**

$$\xi(S, t+1) \geq \xi(S, t) \cdot \frac{\text{eval}(S, t)}{\bar{F}(t)} \cdot \left[1 - p_c \cdot \frac{\delta(S)}{m-1}\right]$$

Short defining length → low disruption probability.

**With mutation:**

$$\xi(S, t+1) \geq \xi(S, t) \cdot \frac{\text{eval}(S, t)}{\bar{F}(t)} \cdot \left[1 - p_c \cdot \frac{\delta(S)}{m-1} - o(S) \cdot p_m\right]$$

Low order → low disruption by mutation.

> **Theorem 1 (Schema Theorem).** Short, low-order, above-average schemata receive exponentially increasing trials in subsequent generations of a genetic algorithm.

> **Hypothesis 1 (Building Block Hypothesis).** A GA seeks near-optimal performance through the juxtaposition of short, low-order, high-performance schemata (building blocks).

**Implicit Parallelism:** A population of $n$ strings of length $m$ usefully processes at least $O(n^3)$ schemata simultaneously, without extra memory.

**Deception:** The building block hypothesis fails when short, low-order, above-average schemata mislead the search toward suboptimal regions. Deception is linked to **epistasis** — strong gene interactions that prevent building blocks from forming independently. Mitigations include better coding, inversion operators, and messy GAs (mGAs).

---

## 4. GAs: Selected Topics

Practical complications when applying GA theory: finite population, finite iterations, and coding mismatches cause premature convergence. Two main research directions: fixing the **sampling mechanism** and compensating for **function characteristics**.

### 4.1. Sampling Mechanism

Two opposing forces: **selective pressure** (focuses on top individuals) and **population diversity** (maintains exploration). Standard approaches include:

- **Elitist model:** preserve the best chromosome across generations.
- **Expected value model / Remainder stochastic sampling:** reduce stochastic error of selection.
- **Ranking-based selection:** probabilities based on rank, not raw fitness — prevents "super individuals" dominating. Linear: $\text{prob}(\text{rank}) = q - (\text{rank}-1)r$. Nonlinear: $\text{prob}(\text{rank}) = q(1-q)^{\text{rank}-1}$.
- **Tournament selection:** pick $k$ individuals, take the best. Larger $k$ → stronger pressure.
- **modGA:** select $r$ parents and independently select $pop\_size - r$ survivors. Avoids exact-copy proliferation while maintaining the Schema Theorem growth equation: $\xi(S, t+1) \geq \xi(S, t) \cdot p_s(S) \cdot p_g(S)$.

### 4.2. Characteristics of the Function

Problems arising from fitness landscape shape: super individuals, premature convergence on flat or shifted landscapes. Fixes: **linear scaling** ($f' = af + b$), **sigma truncation** ($f' = f - (\bar{f} - c\sigma)$), **power law scaling** ($f' = f^k$). Termination conditions: generation count, convergence of alleles, or stagnation in best value.

### 4.3. Contractive Mapping Genetic Algorithms

Using the **Banach Fixpoint Theorem**: define a metric on the space of populations,

$$\delta(P_1, P_2) = \begin{cases} 0 & \text{if } P_1 = P_2 \\ |1 + M - \text{Eval}(P_1)| + |1 + M - \text{Eval}(P_2)| & \text{otherwise} \end{cases}$$

where $M$ is an upper bound on $\text{eval}$. A GA iteration $f$ that strictly improves population evaluation is a contractive mapping in this space, guaranteeing convergence to a unique fixpoint (the global optimum). The **CM-GA** re-runs selection+recombination whenever no improvement is found, ensuring every accepted iteration is contractive.

### 4.4. Genetic Algorithms with Varying Population Size

**GAVaPS:** replaces fixed population with an age/lifetime mechanism. Each chromosome is assigned a lifetime proportional to its fitness; when its age exceeds its lifetime, it dies. Three strategies for lifetime calculation:
- **Proportional:** $\text{lifetime} \propto \text{fitness} / \text{AvgFit}$
- **Linear:** lifetime scales against best-found fitness
- **Bi-linear:** compromise between proportional and linear using AvgFit as a pivot

GAVaPS self-tunes population size: grows during wide exploration, shrinks during convergence, and expands again when a better zone is found. Outperforms SGA on test functions G1–G4 in most scenarios.

### 4.5. Genetic Algorithms, Constraints, and the Knapsack Problem

The **0/1 knapsack problem**: find a binary vector $x$ maximising $\sum P[i] \cdot x[i]$ subject to $\sum W[i] \cdot x[i] \leq C$.

Three constraint-handling categories compared:

#### 4.5.1. The 0/1 Knapsack Problem and the Test Data
Three data types (uncorrelated, weakly correlated, strongly correlated), two capacity types (restrictive $C_1 = 2v$, average $C_2 = 0.5\sum W[i]$), three sizes ($n = 100, 250, 500$).

#### 4.5.2. Description of the Algorithms
- **Penalty functions $A_p[i]$:** logarithmic, linear, or quadratic penalties on constraint violations. Fail on restrictive capacities.
- **Repair algorithms $A_r[i]$:** random or greedy removal of items until feasible. Orvosh–Davis **5%-rule**: replacing repaired chromosomes back 5% of the time gives best performance.
- **Decoders $A_d[i]$:** ordinal representation + greedy/random ordering. Always produces feasible solutions.

#### 4.5.3. Experiments and Results
Conclusions: logarithmic penalties win on average capacity; greedy repair wins on restrictive capacity. Penalty methods fundamentally fail when the feasible region is very small.

### 4.6. Other Ideas

**Multi-point and uniform crossover:** 2-point, multi-point, segmented, shuffle, and $p$-uniform crossovers. No single crossover wins universally; this motivates problem-specific operators.

**Messy GAs (mGA):** variable-length chromosomes with tagged bits; cut and splice operators; two-phase evolution (primordial → juxtaposition). Solve deceptive problems where classical GAs fail.

**Delta Coding:** apply GA on delta values added to a saved best solution, increasing precision iteratively.

---

# Part II. Numerical Optimization

Part II moves to floating-point optimisation with specialised operators, constraint handling, and evolution strategies.

## 5. Binary or Float?

Floating-point (FP) representation is closer to the problem space for continuous parameter optimisation. For 100 variables with domain $[-500, 500]$ and 6-digit precision, binary requires 3000-bit chromosomes — a search space of $\approx 10^{900}$. **Gray coding** reduces Hamming-distance problems of binary: adjacent integers differ by exactly 1 bit.

### 5.1. The Test Case
Linear-quadratic optimal control: $\min \left(x_N^2 + \sum_{k=0}^{N-1}(x_k^2 + u_k^2)\right)$ subject to $x_{k+1} = x_k + u_k$. Optimal value: $J^* = K_N x_0^2$ via Riccati equation.

### 5.2. The Two Implementations
Binary (30 bits/variable) vs. floating-point chromosomes of equal length to the solution vector.

#### 5.2.1. The Binary Implementation
Elements stored as integers (word-sized), decoded at evaluation time. Precision = $(UB - LB)/(2^n - 1)$.

#### 5.2.2. The Floating Point Implementation
Each element is a float within $[LB, UB]$. Better precision, natural domain handling, easier constraint support.

### 5.3. The Experiments

#### 5.3.1. Random Mutation and Crossover
FP random mutation replaces an element with a uniform draw from the domain — more disruptive than flipping a bit. FP is more stable (lower standard deviation) but random mutation is not ideal.

#### 5.3.2. Non-uniform Mutation
The key innovation. For variable $x_k \in [LB_k, UB_k]$:
$$x_k' = \begin{cases} x_k + \Delta(t, UB_k - x_k) & \text{if } r = 1 \\ x_k - \Delta(t, x_k - LB_k) & \text{if } r = 0 \end{cases}$$
where $\Delta(t, y) = y \cdot r_1 \cdot (1 - t/T)^b$, $r_1$ uniform in $[0,1]$, $b$ a shape parameter. Early in evolution, $\Delta$ is large (exploration); late, $\Delta \to 0$ (fine local tuning). This is the most important operator for numerical optimisation in the book.

#### 5.3.3. Other Operators
Boundary mutation (set $x_k$ to $LB$ or $UB$), whole non-uniform mutation (nudge entire vector), arithmetical crossover: $v' = \alpha v_1 + (1-\alpha)v_2$.

### 5.4. Time Performance
FP avoids binary-to-decimal decoding overhead. Binary time grows super-linearly with required precision; FP time is nearly flat.

### 5.5. Conclusions
FP representation with non-uniform mutation dramatically outperforms binary for high-precision numerical problems. FP also simplifies constraint handling (Chapter 7).

---

## 6. Fine Local Tuning

Applies the FP evolution program to three discrete-time optimal control problems.

### 6.1. The Test Cases

#### 6.1.1. The Linear-Quadratic Problem
$\min (x_N^2 + \sum (x_k^2 + u_k^2))$, $x_{k+1} = x_k + u_k$. Analytic optimum available via Riccati.

#### 6.1.2. The Harvest Problem
$\max \sum_{k=0}^{N-1} \sqrt{u_k}$, $x_{k+1} = \alpha x_k - u_k$, $x_N = x_0$. Non-convex; GAMS fails for $N > 4$.

#### 6.1.3. The Push-Cart Problem
Optimal control of a cart with constraints on final state.

### 6.2. The Evolution Program for Numerical Optimization

#### 6.2.1. The Representation
Chromosome = floating-point vector $(u_0, \dots, u_{N-1})$ initialised randomly within domain.

#### 6.2.2. The Specialised Operators
Mutation group: uniform, boundary, non-uniform, and whole non-uniform mutations. Crossover group: simple (split between elements), uniform and non-uniform arithmetical crossover.

### 6.3. Experiments and Results
All three problems solved to machine precision within 40,000 generations. Non-uniform mutation is critical for the final digits of accuracy.

### 6.4. Evolution Program versus Other Methods

#### 6.4.1–6.4.3. Comparisons with GAMS
Linear-quadratic: both GAMS and EP achieve 0.000% error. Harvest problem: GAMS fails for $N > 4$; EP consistently finds exact solutions. Push-cart: both succeed; EP time complexity grows nearly **linearly** with $N$, while GAMS grows at least quadratically.

#### 6.4.4. The Significance of Non-uniform Mutation
Without non-uniform mutation, errors increase from $\approx 0.001\%$ to $\approx 1\text{–}7\%$. Non-uniform mutation is the key to fine local tuning.

### 6.5. Conclusions
FP EP advantages: handles discontinuous objective functions, provides incremental results, scales linearly with problem size, is naturally parallelisable.

---

## 7. Handling Constraints

General nonlinear programming (NLP): optimise $f(x)$ subject to $g_j(x) \leq 0$ and $h_j(x) = 0$. No general efficient solver exists; evolutionary approaches offer a promising alternative.

### 7.1. An Evolution Program: the GENOCOP System

**GENOCOP** (GEnetic algorithm for Numerical Optimization for COnstrained Problems) handles the case where the feasible domain $D$ is a **convex set** defined by linear constraints.

#### 7.1.1. An Example
Eliminate equalities algebraically: $p$ independent equations eliminate $p$ variables. Express remaining variables' feasible ranges as functions of free variables.

#### 7.1.2. Operators
All operators maintain feasibility by construction:
- **Uniform mutation:** draw new value from current feasible range $[\text{left}(k), \text{right}(k)]$.
- **Boundary mutation:** set $x_k$ to one of its bounds.
- **Non-uniform mutation:** time-dependent small perturbation.
- **Arithmetical crossover:** $v' = \alpha v_1 + (1-\alpha)v_2$; convexity guarantees feasibility.
- **Heuristic crossover:** $v' = r(v_1 - v_2) + v_1$; pick $r$ so $v'$ is better than $v_1$.

#### 7.1.3. Testing GENOCOP
Tested on many nonlinear functions with linear constraints. Results competitive with or better than GAMS, especially for non-smooth objectives.

### 7.2. Nonlinear Optimization: GENOCOP II
Handles nonlinear constraints by combining GENOCOP-style operators (for linear constraints) with a simulated-annealing-like acceptance criterion. Temperature decreases exponentially; infeasible offspring w.r.t. nonlinear constraints are accepted with decreasing probability. The initialisation begins from a single feasible point provided by the user.

### 7.3. Other Techniques

Five constraint-handling methods compared on five benchmark NLP problems (G1–G5) ranging from quadratic to nonlinear with mixed constraint types.

#### 7.3.1. Five Test Cases
G1: quadratic, 9 linear constraints, $\rho \approx 0.01\%$ feasible. G2: linear objective, mixed constraints. G3: polynomial objective, 4 nonlinear constraints. G4: nonlinear equations. G5: quadratic, mixed constraints, $\rho \approx 0.0003\%$ feasible.

#### 7.3.2. Experiments
Methods: Homaifar et al. (multiple violation levels), Joines–Houck (dynamic penalties $(C \cdot t)^\alpha$), Schoenauer–Xanthakis (sequential constraint satisfaction), GENOCOP II, Powell–Skolnick (feasible always beats infeasible), death penalty (reject infeasibles). No single method dominates all cases; the topology of the feasible region and the ratio $\rho$ are critical.

### 7.4. Other Possibilities
Adaptive penalties (Bean & Hadj-Alouane): adjust $\lambda(t)$ based on whether best individuals are feasible or not. Multi-objective approach: treat each constraint violation as a separate objective. GENOCOP III (section 7.5) uses repair.

### 7.5. GENOCOP III
Maintains two populations: **search points** (linearly feasible, moved by closed operators) and **reference points** (fully feasible). To evaluate an infeasible search point $S$: pick a reference point $R$, generate $Z = \alpha S + (1-\alpha)R$ until $Z$ is fully feasible, then $\text{eval}(S) := f(Z)$. If $Z$ improves on $R$, it replaces $R$. Very low standard deviation of results; outperforms all other methods on G2, G3, G5.

---

## 8. Evolution Strategies and Other Methods

### 8.1. Evolution of Evolution Strategies

Evolution Strategies (ES) were independently developed (Rechenberg, Schwefel) for parameter optimisation. Chromosomes are pairs $(x, \sigma)$ where $x$ is the solution vector and $\sigma$ is a vector of step sizes. Self-adaptation:

$$\sigma_i' = \sigma_i \cdot e^{N(0, \tau')} \cdot e^{N_i(0, \tau)}$$
$$x_i' = x_i + \sigma_i' \cdot N_i(0, 1)$$

where $\tau \propto 1/\sqrt{2n}$ and $\tau' \propto 1/\sqrt{2\sqrt{n}}$. Two selection strategies: $(\mu + \lambda)$-ES (offspring compete with parents) and $(\mu, \lambda)$-ES (offspring replace parents; $\lambda > \mu$). The latter allows self-adaptation of $\sigma$ to work because poor step sizes can die out.

### 8.2. Comparison of Evolution Strategies and Genetic Algorithms

Key differences: ES use real-valued vectors vs. GA binary strings; ES rely heavily on mutation (crossover is a secondary operator) vs. GA crossover-centric; ES use deterministic $(\mu, \lambda)$ selection vs. GA proportional/tournament; ES have no analogue of the Schema Theorem. ES excel at fine local tuning; GAs excel at global exploration.

### 8.3. Multimodal and Multiobjective Function Optimization

#### 8.3.1. Multimodal Optimization
Techniques: repeated independent runs, **fitness sharing** (degrade fitness proportionally to number of nearby individuals: $\text{eval}'(x) = \text{eval}(x)/m(x)$ where $m(x) = \sum_y sh(\text{dist}(x,y))$), **sequential niching** (modify fitness after each optimum found to prevent rediscovery), **labels/tags** (Spears: tag-based subpopulations with restricted mating).

#### 8.3.2. Multiobjective Optimization
Pareto optimality: solution $x$ is **nondominated** if no $y$ is at least as good on all objectives and strictly better on at least one. Methods: objective weighting $F = \sum w_i f_i$, VEGA (Vector Evaluated GA: subpopulations per objective), NSGA (Nondominated Sorting GA: layered classification with sharing).

### 8.4. Other Evolution Programs
**Delta Coding:** two-level GA (level $x$ and level $\delta$); best solution saved and delta-values evolved to refine it. **Dynamic Parameter Encoding (DPE):** shift binary representation left as precision demand increases. **IRM (Immune Recruitment Mechanism):** offspring must pass affinity test with existing population. **Scatter/Tabu Search:** elite set $V$, tabu set $T$, structured linear combinations of reference points (multi-parent crossover). **Interval Genetic Algorithm:** combines GA with simulated annealing on interval-valued individuals. **Granularity Evolution:** variable-length individuals with evolving resolution.

---

# Part III. Evolution Programs

The payoff: applying the EP methodology to hard real-world combinatorial and discrete problems. Each chapter shows a *natural* representation paired with *bespoke* operators that outperform both classical GAs (which struggle with constraints) and domain-specific solvers (which are not general).

## 9. The Transportation Problem

Find minimum-cost shipping plan from $n$ sources to $k$ destinations:

$$\min \sum_{i,j} f_{ij}(x_{ij}), \quad \sum_j x_{ij} = \text{sour}(i), \quad \sum_i x_{ij} = \text{dest}(j), \quad x_{ij} \geq 0$$

### 9.1. The Linear Transportation Problem

#### 9.1.1. Classical Genetic Algorithms
Binary representation requires complex repair to satisfy equality constraints after crossover. Mutation of a single element propagates changes to three or more others. Crossover destroys constraint satisfaction unpredictably.

#### 9.1.2. Incorporating Problem-Specific Knowledge
**GENETIC-1:** represent the solution as a permutation of $n \cdot k$ integers decoded by the `initialization` procedure (which greedily fills the matrix row by column). PMX-family crossover preserves partial structure. Swap mutation is straightforward.

#### 9.1.3. A Matrix as a Representation Structure
**GENETIC-2:** use the allocation matrix directly. A **matrix mutation** operator selects a $p \times q$ submatrix and re-solves it using a new initialisation (guaranteeing feasibility). Arithmetical crossover: $V' = \alpha V_1 + (1-\alpha)V_2$ preserves feasibility for linear transportation.

#### 9.1.4. Conclusions
GENETIC-2 significantly outperforms GENETIC-1, which outperforms binary + repair. For non-smooth cost functions GENETIC-2 beats GAMS.

### 9.2. The Nonlinear Transportation Problem

Nonlinear costs $f_{ij}(x_{ij})$; classical OR methods fail.

#### 9.2.1–9.2.5. Representation, Initialization, Evaluation, Operators, Parameters
Same matrix structure; mutation generates a new feasible submatrix; non-uniform and arithmetical crossovers. Operators drawn from GENOCOP + problem-specific matrix mutation.

#### 9.2.6–9.2.7. Test Cases and Results
Seven $7 \times 7$ problems with six cost function types (A–F). GENETIC-2 substantially outperforms GAMS on non-smooth and "practical" functions; comparable on smooth monotone functions.

#### 9.2.8. Conclusions
Problem-specific EP beats general-purpose tool (GAMS) and general-purpose EP (GENOCOP) on transportation-specific problems — but only for transportation problems.

---

## 10. The Traveling Salesman Problem

The TSP: find the minimum-cost Hamiltonian cycle over $n$ cities. NP-hard. The book traces the *evolution of evolution programs* for TSP, focussing on representation and crossover operators.

**Adjacency representation:** city $j$ in position $i$ if tour goes from $i$ to $j$. Operators: alternating-edges, subtour-chunks, heuristic crossovers. Best results ~16–27% above optimum.

**Ordinal representation:** 1-indexed references into a dynamic list. Classical crossover works but is essentially random after the cut point. Poor results.

**Path representation:** most natural — a permutation $(i_1, i_2, \dots, i_n)$ directly. Three crossovers:
- **PMX (Partially Mapped Crossover):** swap a segment, propagate mappings to fill conflicts.
- **OX (Order Crossover):** copy a segment, fill remaining cities in the order they appear in the other parent.
- **CX (Cycle Crossover):** identify cycles of position-city correspondences and alternate them.
- **ER (Edge Recombination):** build offspring by greedily selecting edges that appear in at least one parent. Best for preserving edge structure.
- **EER (Enhanced Edge Recombination):** prefer edges shared by both parents.

Additional operators: 2-opt local search (swap two edges if it improves tour length), Lin-Kernighan style moves. ER + local search achieves results well within 1% of optimum. Incest prevention (no mating between very similar individuals) further helps.

---

## 11. Evolution Programs for Various Discrete Problems

Brief tour of other combinatorial domains:

**SMC (Scheduling, Machine assignment, Crew scheduling):** sequence-based chromosomes with position-based and order-based operators.

### 11.2. The Timetable Problem
Matrix representation (teachers × hours, entries = classes). Operators: mutation of order $k$ (swap $k$-length blocks in a row), day mutation (swap day-columns), crossover (best rows of parent 1 grafted onto parent 2). Tested on a real Italian school schedule.

### 11.3. Partitioning Objects and Graphs
**Group-number encoding:** $n$-string of integers; operators include uniform crossover and swap mutation. **Permutation with separators:** objects + $k-1$ separator symbols; OX/PMX applicable. **Greedy decoding** + permutation: strongly outperforms the above two by incorporating heuristic during decoding. **GGA (Grouping GA, Falkenauer):** chromosome has an object part and a group part; BPCX transmits whole bins from parent 1 and repairs conflicts from parent 2.

### 11.4. Path Planning in a Mobile Robot Environment
**Evolutionary Navigator (EN):** off-line + on-line planning with the same algorithm. Chromosome = linked list of $(x, y)$ knot points (variable length). Evaluation: $\text{Path\_Cost} = w_d \cdot \text{dist} + w_s \cdot \text{smooth} + w_c \cdot \text{clear}$ for feasible paths; infeasible paths scored worst-feasible + penalty. Operators: crossover (cut at infeasible nodes), Mutation_1 (fine-tuning via non-uniform perturbation), Mutation_2 (large change), insertion, deletion, smooth, swap. En handles unknown obstacles by replanning locally on detection.

### 11.5. Remarks
Further applications: tree representations (characteristic vector, predecessors, Prüfer numbers, bias-vector), Steiner tree problem (binary string + greedy decoder + local pruning), set covering problem (binary string + greedy repair), maximum clique problem (cardinality + completeness weighted objective + local search), pallet loading (scheduling + stacking), and more.

---

## 12. Machine Learning

GAs applied to inductive learning of decision rules.

### 12.1. The Michigan Approach
**Classifier systems:** population of *rules*, not solutions. Each classifier $(P_1 \dots P_n) : d$ matches inputs and posts messages. The **bucket brigade** algorithm apportions credit through message chains. The **genetic component** periodically applies crossover and mutation to classifiers, using their strength as fitness. The elitist crowding factor model replaces classifiers that resemble newly generated ones.

### 12.2. The Pitt Approach
Each individual represents a *whole rule set* (a cognitive entity). Individuals compete for survival by their overall classification accuracy.

### 12.3. An Evolution Program: the GIL System
GIL is a Pitt-approach EP that uses rich, symbolic chromosomes (disjunctions of conjunctions of attribute selectors) with inductive learning operators:

#### 12.3.1. Data Structures
Chromosomes are variable-length sets of *complexes* (conjunctions of *selectors*). Selectors use internal binary encoding (1 = attribute value included). Variable length allows no artificial uniform-string constraint.

#### 12.3.2. Genetic Operators
Chromosome-level: RuleExchange (crossover of complexes), RuleCopy, NewPEvent (incorporate positive example), RuleGeneralisation, RuleDrop, RuleSpecialisation. Complex-level: RuleSplit, SelectorDrop, IntroSelector, NewNEvent. Selector-level: ReferenceChange, ReferenceExtension, ReferenceRestriction. Operator probabilities adapt based on coverage balance between specialisation and generalisation.

### 12.4. Comparison
GIL outperforms CFS (classifier system), BpNet, C4.5, and AQ15 on the Emerald robots 5-concept learning task, especially with fewer training examples.

---

## 13. Evolutionary Programming and Genetic Programming

### 13.1. Evolutionary Programming
Fogel's original EP uses **finite state machines (FSMs)** as chromosomes. Fitness = accuracy of sequence prediction. Mutation operators on FSMs: change output symbol, change state transition, add a state, delete a state, change initial state. No crossover; mutation is the primary search operator. Modern EP extends to real-valued vectors using self-adaptive Gaussian mutation (similar to ES).

### 13.2. Genetic Programming
Koza's GP uses **tree-structured computer programs** as chromosomes. Terminal set = inputs and constants; function set = operations. Crossover swaps randomly chosen subtrees between two parents. Mutation replaces a subtree with a randomly generated one. GP discovers the structure of a solution, not just its parameters — fundamentally different from the other paradigms. Applications: symbolic regression, control, robot navigation, circuit design.

---

## 14. A Hierarchy of Evolution Programs

A systematic comparison of five evolution programs (EP$_1$–EP$_5$) on the same $3 \times 4$ nonlinear transportation problem $P$, demonstrating the **exploration–exploitation tradeoff**: more problem-specific knowledge → better results on $P$, but narrower applicability domain.

$$EP_1 \prec EP_2 \prec EP_3 \approx EP_4 \prec EP_5$$

| Program | System | Domain | Avg. Cost |
|---------|--------|--------|-----------|
| EP$_1$ | GENESIS (binary + penalty) | Very general | ~453 (infeasible) |
| EP$_2$ | KORR (evolution strategies, inequalities only) | Parameter optimisation | 460.75 |
| EP$_3$ | GENOCOP (linear constraints, FP) | Linear-constrained opt. | 405.45 |
| EP$_4$ | GENETIC-2 (matrix, problem-specific) | Transportation | 391.65 |
| EP$_5$ | GENESIS (tuned penalties for problem $P$) | Problem $P$ only | ~378–391 |

The **Hierarchy Theorem** of evolution programs: $EP_i \prec EP_j$ if $\text{dom}(EP_i) \supset \text{dom}(EP_j)$ and $EP_j$ performs better on problems in $\text{dom}(EP_j)$.

**Practical guidance for constructing an EP:**
1. Select a *natural* representation for solutions.
2. Design an initialisation procedure (random or heuristic).
3. Define the evaluation function.
4. Design genetic operators that preserve or repair feasibility.
5. Set parameter values; consider a meta-GA to tune them.

The long-term vision: a programming methodology **EVA** (EVolution progrAmming) supporting language **PROBIOL**, where programmers select data structures + operators for a problem domain, and the evolution engine handles the rest on parallel hardware.

---

## 15. Evolution Programs and Heuristics

A structured taxonomy of heuristics for the five EP components, with special focus on handling feasible and infeasible individuals.

### 15.1. Techniques and Heuristics: A Summary
Common guidelines: FP/ES for numerical optimisation; GAs for combinatorial; GP for program discovery; EP for behaviour modelling. Key practice: hybridise by seeding initial population from heuristics, or embed local search in genetic operators. Typical GA parameters: pop size 50–100, $p_c \in [0.65, 1.00]$, $p_m \in [0.001, 0.01]$.

### 15.2. Feasible and Infeasible Solutions

The search space $S = F \cup U$ (feasible + infeasible). Twelve questions (A–L) frame the design space:

A. How to evaluate feasible individuals? B. How to evaluate infeasible individuals? C. How to relate the two? D. Reject infeasibles? E. Repair infeasibles? F. Replace infeasibles by repaired versions? G. Penalise infeasibles? H. Maintain feasibility by specialised operators? I. Use decoders? J. Separate individuals and constraints? K. Explore the feasibility boundary? L. Find feasible solutions (constraint satisfaction)?

### 15.3. Heuristics for Evaluating Individuals

Detailed treatment of each option:

- **A (eval$_F$ design):** Usually the objective function. For complex problems (robot paths, bin packing, SAT) requires heuristic measures or transformation of Boolean variables to continuous.
- **D (rejection):** Death penalty. Works when feasible region is large and convex; fails when the ratio $\rho = |F|/|S|$ is tiny.
- **E (repair):** Greedy or random repair. Related to Baldwin effect (learning during lifetime). Weakness: problem-specific, sometimes as hard as solving the original problem.
- **F (replacement):** 5%-rule for combinatorial (Orvosh–Davis); 15% for continuous (GENOCOP III experiments). Related to Lamarckian vs. Darwinian evolution.
- **G (penalty):** Minimal-penalty rule: keep penalty just above the level where infeasible beats feasible. Static (Homaifar), dynamic (Joines–Houck), adaptive (Bean–Hadj-Alouane). Self-adaptive penalties incorporated in chromosome structures are a promising direction.
- **H (specialised operators):** The GENOCOP approach. Maintains feasibility by construction. Most reliable when feasible region has exploitable structure (convexity, linear constraints).
- **I (decoders):** Any string → feasible solution via decoding. Good when decoding is fast, complete, sound, and local (small change → small change in decoded solution).
- **J (separation):** Multi-objective: treat each constraint as an objective. Behavioural memory (Schoenauer–Xanthakis): satisfy constraints one at a time in sequence.
- **K (boundary exploration):** Strategic oscillation: repeatedly cross the feasibility boundary at increasing depths, using adaptive penalties or modified gradients. Memory mechanisms prevent retracing.
- **L (finding feasible solutions):** Constraint satisfaction: evolutionary approaches with partial assignment, co-evolutionary models (constraints co-evolve with solutions).

---

## 16. Conclusions

The field is growing rapidly but many gaps remain.

**Theoretical foundations:** The Schema Theorem applies to standard GAs but not to most real-world modifications. Extensions needed to explain convergence of hybrid and constrained EP methods. Understanding what makes a problem hard (deception, epistasis, epistatic interactions, rugged fitness landscapes) is a fundamental open question.

**Function optimisation:** priorities are better constraint-handling techniques, large-scale problems (thousands of variables), and integer/mixed-integer programming.

**Representation and operators:** need systematic study of complex nonlinear objects of varying size (trees, graphs, FSMs), and operators at the genotype level for them. Lamarckian operators (improvements feed back into chromosomes) are a compelling direction.

**Machine learning applications:** EP can handle variable-length, structured chromosomes and symbolic reasoning — a natural fit for inductive learning, neural architecture search, and program synthesis.

**Parallel computation:** EPs are inherently parallel (population = multiple simultaneous search directions). Distributed EPs with island models and migration are a natural fit for parallel hardware.

**Vision:** the "Evolution Programming" methodology — a programming environment where developers choose representations and operators and the system handles search — remains the book's grand aspiration.

---

# Appendices (A–D)

- **Appendix A:** Mathematical background (metric spaces, Banach theorem, probability).
- **Appendix B:** Software implementations and benchmark test functions.
- **Appendix C:** Detailed experimental data for selected chapters.
- **Appendix D:** Additional constraint-handling experiments and tables.

---

# Key Formulas Reference

| Formula | Meaning |
|---------|---------|
| $\xi(S,t+1) = \xi(S,t) \cdot \frac{\text{eval}(S,t)}{\bar{F}(t)}$ | Schema growth under selection |
| $\xi(S,t+1) \geq \xi(S,t) \cdot \frac{\text{eval}(S,t)}{\bar{F}(t)} \cdot \left[1 - p_c\frac{\delta(S)}{m-1} - o(S)p_m\right]$ | Full Schema Theorem (selection + crossover + mutation) |
| $\Delta(t, y) = y \cdot r_1 \cdot \left(1 - \frac{t}{T}\right)^b$ | Non-uniform mutation perturbation (decreases to 0 over time) |
| $\sigma_i' = \sigma_i \cdot e^{\tau' N(0,1)} \cdot e^{\tau N_i(0,1)}$ | ES self-adaptation of step sizes |
| $\text{eval}'(x) = \text{eval}(x)/m(x)$, $m(x) = \sum_y sh(\text{dist}(x,y))$ | Fitness sharing for multimodal optimisation |
| $\text{eval}(x) = f(x) + (C \cdot t)^\alpha \sum_j f_j(x)$ | Dynamic penalty function (Joines–Houck) |
| $Z = \alpha S + (1-\alpha)R$ | GENOCOP III repair via random convex combination |

