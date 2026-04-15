import torch.nn as nn
import torch
import math

class embedding(nn.Module):
    def __init__(self, vocabSize, dmodel):
        super().__init__()

        self.vocabSize = vocabSize
        self.dmodel = dmodel

        self.embedding = nn.Embedding(vocabSize, dmodel)

    def forward(self, x):
        return self.embedding(x) * math.sqrt(self.dmodel)

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

class layerNormalization(nn.Module):
    def __init__(self, d_model, eps=1e-6):
        super().__init__()

        self.dmodel = d_model
        self.eps = eps

        self.alpha = nn.Parameter(torch.ones(d_model))
        self.beta = nn.Parameter(torch.zeros(d_model))

    def forward(self, x):
        x = (x - torch.mean(x, dim=2, keepdim=True)) / (torch.std(x, dim=2, keepdim=True) + self.eps)
        x = self.alpha * x + self.beta
        return x

class feedForward(nn.Module):
    def __init__(self, d_model, dropout, d_ff =  2048):
        super().__init__()

        self.dmodel = d_model
        self.d_ff = d_ff

        self.l1 = nn.Linear(d_model, d_ff)
        self.l2 = nn.Linear(d_ff, d_model)

        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        x = self.l1(x)
        x = torch.relu(x)
        x = self.dropout(x)
        x = self.l2(x)

        return x

class multiHeadAttention(nn.Module):
    def __init__(self, d_model, k, dropout):
        super().__init__()

        self.d_model = d_model
        self.k = k

        self.d_k = d_model // k

        self.w_k = nn.Linear(d_model, d_model)
        self.w_q = nn.Linear(d_model, d_model)
        self.w_v = nn.Linear(d_model, d_model)

        self.w_o = nn.Linear(d_model, d_model)
        self.dropout = nn.Dropout(dropout)

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

class encoderBlock(nn.Module):
    def __init__(self, d_model, heads, attentionDropout, residualDropout):
        super().__init__()

        self.multiHeadedAttention = multiHeadAttention(d_model, heads, attentionDropout)
        self.norm1 = layerNormalization(d_model, 1e-6)

        self.feedForward = feedForward(d_model, residualDropout)
        self.norm2 = layerNormalization(d_model, 1e-6)

        self.dropout = nn.Dropout(residualDropout)

    def forward(self, x, mask=None):
        residual = x
        x = self.norm1(x)
        x = residual + self.dropout(self.multiHeadedAttention(x, x, x, mask)[0])

        residual = x
        x = self.norm2(x)
        x = residual + self.dropout(self.feedForward(x))

        return x

class Encoder(nn.Module):
    def __init__(self, layers, d_model, heads, attentionDropout, residualDropout):
        super().__init__()

        self.encoderList = nn.ModuleList([encoderBlock(d_model, heads, attentionDropout, residualDropout) for _ in range(layers)])

    def forward(self, x, mask=None):
        for encoder in self.encoderList:
            x = encoder(x, mask)

        return x

class decoderBlock(nn.Module):
    def __init__(self, d_model, heads, attentionDropout, residualDropout):
        super().__init__()

        self.multiHeadedAttention1 = multiHeadAttention(d_model, heads, attentionDropout)

        self.norm1 = layerNormalization(d_model, 1e-6)

        self.multiHeadedAttention2 = multiHeadAttention(d_model, heads, attentionDropout)

        self.norm2 = layerNormalization(d_model, 1e-6)

        self.feedForward = feedForward(d_model, residualDropout)

        self.norm3 = layerNormalization(d_model, 1e-6)

        self.dropout = nn.Dropout(residualDropout)

    def forward(self, x, context, tgt_mask=None, src_mask=None):
        residual = x
        x = self.norm1(x)
        x = residual + self.dropout(self.multiHeadedAttention1(x, x, x, tgt_mask)[0])

        residual = x
        x = self.norm2(x)
        x = residual + self.dropout(self.multiHeadedAttention2(x, context, context, src_mask)[0])

        residual = x
        x = self.norm3(x)
        x = residual + self.dropout(self.feedForward(x))

        return x

class Decoder(nn.Module):
    def __init__(self, layers, d_model, heads, attentionDropout, residualDropout):
        super().__init__()

        self.decoderList = nn.ModuleList([decoderBlock(d_model, heads, attentionDropout, residualDropout) for _ in range(layers)])

    def forward(self, x, context, tgt_mask=None, src_mask=None):
        for decoder in self.decoderList:
            x = decoder(x, context, tgt_mask, src_mask)
        return x

class projectionLayer(nn.Module):
    def __init__(self, d_model, vocabSize):
        super().__init__()

        self.linear = nn.Linear(d_model, vocabSize)

    def forward(self, x):
        return self.linear(x)

class Transformer(nn.Module):
    def __init__(self, d_model, vocabSize, heads,
                 encodeLayers, decodeLayers,
                 positionalDropout, attentionDropout, residualDropout):
        super().__init__()

        self.src_embedding = embedding(vocabSize, d_model)
        self.tgt_embedding = embedding(vocabSize, d_model)

        self.positionalEncoding = positionalEncoding(d_model, positionalDropout)

        self.encoder = Encoder(encodeLayers, d_model, heads, attentionDropout, residualDropout)

        self.decoder = Decoder(decodeLayers, d_model, heads, attentionDropout, residualDropout)

        self.projection = projectionLayer(d_model, vocabSize)

    def encode(self, src, src_mask=None):
        src = self.src_embedding(src)
        src = self.positionalEncoding(src)
        src = self.encoder(src, src_mask)
        return src

    def decode(self, tgt, context, tgt_mask=None, src_mask=None):
        tgt = self.tgt_embedding(tgt)
        tgt = self.positionalEncoding(tgt)
        tgt = self.decoder(tgt, context, tgt_mask, src_mask)
        return tgt

    def project(self, x):
        x = self.projection(x)
        return x

def initTransformer(d_model, vocabSize, heads, layers, dropout):
    transformer = Transformer(d_model, vocabSize, heads, layers, layers, dropout, dropout, dropout)

    for p in transformer.parameters():
        if p.dim() > 1:
            nn.init.xavier_uniform_(p)

    return transformer