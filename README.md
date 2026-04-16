# Transformer-Vis: A From-Scratch Transformer Implementation and Attention Visualizer
## 1. Overview:
Transformer-Vis is a comprehensive Transformer Model trained for Translation. It is a from-scratch implementation of the Transformer architecture as proposed in "Attention Is All You Need." 

Unlike standard implementations that utilize high-level abstractions, this project is a ground-up reconstruction of the core architecture. This includes the manual implementation of Multi-Head Attention, Positional Encodings, and specialized masking logic. A React-based frontend provides real-time visualization of attention weights, mapping the linguistic alignment between source and target sequences during inference.

The core idea of this project, was to get accustomed to the architecture and the mathematics behind transformer models, as a stepping stone to further research on topics such as State Space Machines (SSMs), Mamba, etc.

## 2. Table of Contents:
Architecture Components

Multi-Head Attention

Positional Encoding

Encoder and Decoder Stacks

Dataset and Preprocessing

Training Methodology

Deployment and Docker Integration

Future Roadmap

External Resources and References

## 3. Architecture Description and Visualizations:
### 3.1. Embedding Model:
#### **Technical Explanations:**
The Embedding Layer is the first layer, which converts word tokens to discrete vectors. In the simplest terms it is a 2-dimensional look-up matrix. It has dimensions of `vocab_size` x `d_model`. 

Implicitly pytorch converts a token id number (lets say 4) to a one hot vector `[0, 0, 0, 0, 1, 0, 0 0, ...]`. Once this one hot vector is multiplied by the embedding matrix, it outputs a d_model sized vector. Logically the vector for the token with `id = n` is the $n^{th}$ row of the embedding matrix. This vector is then multiplied by $\sqrt{d_{model}}$ to scale the variance of the vector upto the order of magnitude of 1. (complicated math stuff... present in my notes for those interested)

**Implementation:**
```python
class embedding(nn.Module):
    def __init__(self, vocabSize, dmodel):
        super().__init__()

        self.vocabSize = vocabSize
        self.dmodel = dmodel

        self.embedding = nn.Embedding(vocabSize, dmodel)

    def forward(self, x):
        return self.embedding(x) * math.sqrt(self.dmodel)
```

#### **Front-end Visualization:**
The user can interact, find and explore the vector embeddings of different words (tokens). 

* Each vector consists of `d_model` number of stripes, with varying color to represent the different values.

* A dedicated gallery provides a scrollable interface to compare the embeddings of the entire vocabulary.

### 3.2 Positional Encoding:
#### **Technical Explanations:**
The Positional Encoding layer, is a completely deterministic mathematical layer. It adds information about the position of the token within the sentence / sequence. 

* It utilizes the `sine` and `cosine` functions. Since these functions have are bounded (range of `[-1, 1]`) and are periodic in nature, they make for perfect candidates for encoding positional information.

* Each position in a sequence is mapped to a vector of size `d_model` composed of wave functions with varying frequencies. This generates a unique encoding for every position.

$$PE_{(pos, 2i)} = \sin\left(\frac{pos}{10000^{2i/d_{model}}}\right)$$
$$PE_{(pos, 2i+1)} = \cos\left(\frac{pos}{10000^{2i/d_{model}}}\right)$$

**Implementation:**
```python
class positionalEncoding(nn.Module):
    def __init__(self, d_model, dropout, max_len=5000):
        super().__init__()

        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))

        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)

        pe = pe.unsqueeze(0)

        self.register_buffer('pe', pe)

        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        return self.dropout(x + self.pe[:, :x.size(1), :])
```

#### **Front-end Visualization:**
A similar vector visualisation to that used int he embedding layer, displays the vector created for a given position in a sequence.

The gradient diagram below shows a continuous spectrum of the positional encodings. 

* The `X-Axis` represents the position in the sequence
* The `Y-Axis` represents items in each of the vector

Hence a slice on pixel value `x=n` will give you the positional encoding for a token in the $n^{th}$ position.

### 3.3 Attention Mechanism:
### Technical Explanations:
The attention mechanism is the heart of the transformer architecture. In simple words it finds semantic relations between words within a sentence. 

It uses 3 matrices, to transform the input vector into a set of 3 vectors.
* $W_k$ = `Weight matrix for keys`
* $W_v$ = `Weight matrix for values`
* $W_q$ = `Weight matrix for queries`

On multiplying the input vector `I` with these matrices we get the following:
* $I \times W_k = K$ (The Key matrix)
* $I \times W_q = Q$ (The Query matrix)
* $I \times W_v = V$ (The Value matrix)

Intuitively the matrices can be thought of as:
* The `Value Vector` containins a summary of the semantic value of the input vector. 
* The `Query Vector` converts the input vector into a query asking every other token in the sequence: "How much are you related to me?"
* The `Key Vector` answers the query of the `Query Vector` 

Mathematically speaking the dot product: 

$$Score = Q_a \cdot K^T_b$$

represents how much a key from a $token_b$ corresponds to the query of $token_a$.

In the code implementation instead of providing a single input vector, provision has been made to pass 3 seperate vectors. This is relevant and important for **Cross Attention** as discussed in the next section.

```python
def forward(self, q, k, v, mask=None):
    ...
    query = self.w_q(q)
    key = self.w_k(k)
    value = self.w_v(v)
    ...
    attention_scores = query @ key.transpose(-2, -1)
```

**WHAT IS SELF AND CROSS ATTENTION?**

Now when we pass a single input vector to be converted into the Value, Query and Key Vectors, it is called **Self Attention**. It can be thought of as finding relationships within the same sentence.

However what makes it truly powerful, is if the model is able to look at the word it is currently translating and ask the original English sentence: "Which part of the original context should I be focusing on right now to get this specific word right?". 

This exact problem is solved using **Cross Attention**. In Cross Attention the input for the Query vector comes from the decoder block (the section forming the new translated sequence) while the inputs for the Key and Value vector come from the encoder block (the section which condenses and extracts context from the original sequence). 

```python
#Self Attention
self.multiHeadedAttention(x, x, x, tgt_mask)

#Cross Attention
self.multiHeadedAttention(x, context, context, tgt_mask)
```

**HOW MUCH HEAD DO YOU NEED?**

As the name of the module suggests, the architecture proposed in the *"All you need is Attention"* paper is a **Multi Headed Attention Architecture**.

* While a single attention head can learn relationships, it is limited by only being able to focus on one "type" of relationship at a time. The Multi-Head architecture solves this by running multiple attention mechanisms in parallel.
* Instead of running the whole attention block on the entire embedding vector multiple times, it is split the vector along its embedding dimension.
* The `d_model` (e.g. 512) is split into $k$ smaller heads (e.g. 8 heads of 64 dimensions each).
* This "split" approach ensures that the total number of parameters and the computational cost are equivalent to a single-head attention with full dimensionality, while significantly increasing the model's ability to learn complex patterns in parallel.
* The results from all heads are concatenated to produce the final output.

```python
# (batch, seq, dmodel) --> (batch, seq, k, d_k) --> (batch, k, seq, d_k)
query = query.view(query.shape[0], query.shape[1], self.k, self.d_k).transpose(1, 2)

# (batch, seq, dmodel) --> (batch, seq, k, d_k) --> (batch, k, seq, d_k) --> (batch, k, d_k, seq)
key = key.view(key.shape[0], key.shape[1], self.k, self.d_k).transpose(1, 2)

# (batch, seq, dmodel) --> (batch, seq, k, d_k) --> (batch, k, seq, d_k)
value = value.view(value.shape[0], value.shape[1], self.k, self.d_k).transpose(1, 2)
```

**WHAT'S MASKING?**

**Masking** is a strategy employed to prevent the attention model from attending to unnecessary tokens (e.g. `[PAD]`) during computation.

There are two distinct types of maskings:
* Padding Masks: In the model, all the input sequences of irregular sizes are padded with a `[PAD]` token to have a final sequence of length `Max Sequence Length`. These Padding tokens need not be considered while calculating attention. Hence these columns and rows are masked.
* Causal Masks: This is used exclusively in the Decoder. During training, the model has access to the entire target sentence. To simulate a real-world scenario where the model must predict the next word without knowing the future, a "triangular" mask is applied. This prevents $token_n$ from looking at $token_{n+1}$ or any subsequent tokens.

**Mathematical Implementation:** Masking is achieved by adding a value of $-\infty$ (or a very large negative number) to the attention scores before the softmax layer.

**PUTTING EVERYTHING TOGETHER:**

The final Mathematical formula for attention is:

$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T + \text{Mask}}{\sqrt{d_k}}\right)V$$

**Dimensional Analysis:**
| Variable | Name | Dimensions | Description |
| :--- | :--- | :--- | :--- |
| **$Q$** | Query | $L \times d_{k}$ | Represents $L$ tokens, each with a search vector of size $d_k$. |
| **$K^T$** | Key (Transposed) | $d_{k} \times L$ | The transposed Key matrix, for dot-product calculation. |
| **$V$** | Value | $L \times d_{v}$ | The semantic content for each token to be weighted by attention. |
| **Mask** | Attention Mask | $L \times L$ | Applied to $QK^T$ to nullify padding or future tokens ($-\infty$). |
| **Weights** | Softmax Output | $L \times L$ | The probability distribution defining the relationship between all tokens. |
| **Output** | Final Context | $L \times d_{v}$ | The weighted sum of Values; the new representation for each token. |

**Computation and Complexity:**

| Operation | Equation | Dimensions | Complexity ($O$) |
| :--- | :--- | :--- | :--- |
| **Linear Projections** | $I \cdot W_{q,k,v}$ | $(L \times d_{model}) \cdot (d_{model} \times d_k)$ | $O(L \cdot d_{model} \cdot d_k)$ |
| **Attention Scores** | $Q \cdot K^T$ | $(L \times d_k) \cdot (d_k \times L)$ | $O(L^2 \cdot d_k)$ |
| **Mask Addition** | $Score + M$ | $(L \times L) + (L \times L)$ | $O(L^2)$ |
| **Weighted Sum** | $Weights \cdot V$ | $(L \times L) \cdot (L \times d_k)$ | $O(L^2 \cdot d_k)$ |

Hence the total time Complexity boils down to:

$$O(L \cdot d_{model} \cdot d_k) + O(L^2 \cdot d_k) + O(L^2) + O(L^2 \cdot d_k) \approx O(L^2)$$

Thus we can see why people say a transformer has quadratic complexity. *(P.S. i dont expect random ppl to be talking about the time complexity of transformer models)*

**Implementation**
```python
def attention(self, query, key, value, mask=None):
        d_k = query.size(-1)

        # (batch, k, seq, d_k) @ (batch, k, d_k, seq) --> (batch, k, seq, seq)
        attention_scores = query @ key.transpose(-2, -1)
        attention_scores = attention_scores / math.sqrt(d_k)

        if mask is not None:
            attention_scores = attention_scores.masked_fill(mask == 0, -1e6)

        attention_scores = torch.softmax(attention_scores, dim = -1)

        attention_scores = self.dropout(attention_scores)

        # (batch, k, seq, seq) @ (batch, k, seq, d_k) --> (batch, k, seq, d_k)
        return attention_scores @ value, attention_scores

    def forward(self, q, k, v, mask=None):
        # (batch, seq, dmodel) --> (batch, seq, dmodel)
        query = self.w_q(q)
        key = self.w_k(k)
        value = self.w_v(v)

        # (batch, seq, dmodel) --> (batch, seq, k, d_k) --> (batch, k, seq, d_k)
        query = query.view(query.shape[0], query.shape[1], self.k, self.d_k).transpose(1, 2)

        # (batch, seq, dmodel) --> (batch, seq, k, d_k) --> (batch, k, seq, d_k) --> (batch, k, d_k, seq)
        key = key.view(key.shape[0], key.shape[1], self.k, self.d_k).transpose(1, 2)

        # (batch, seq, dmodel) --> (batch, seq, k, d_k) --> (batch, k, seq, d_k)
        value = value.view(value.shape[0], value.shape[1], self.k, self.d_k).transpose(1, 2)

        x, scores = self.attention(query, key, value, mask)

        # (batch, k, seq, d_k) -> (batch, seq, k, d_k) --> (batch, seq, dmodel)
        x = x.transpose(1, 2).contiguous().view(x.shape[0], x.shape[2], -1)
        x = self.w_o(x)

        return x, scores
```

#### **Front-end Visualization:**

### 7.1 Interactive Attention Dashboard

**Key Features:**
* **Head-Specific Heatmaps:** Allows users to cycle through all $k$ attention heads. This visually demonstrates the specialized feature extraction performed by the Multi-Head architecture.
* By hovering over any token in the input or output blocks, the interface **isolates the specific connections for that token.**
* The magnitude of the attention weights is represented by the **thickness and opacity** of the connecting lines, providing an intuitive "map" of the model's semantic focus.

