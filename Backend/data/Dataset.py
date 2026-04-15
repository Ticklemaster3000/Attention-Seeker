import pandas as pd
import os
from config import *
from torch.utils.data import Dataset
import torch

def getDataset(outPath):
    if not os.path.exists(outPath):
        df = pd.read_parquet(DATASET_URL)
        df['en'] = df['translation'].apply(lambda s: s['en'].lower())
        df['fr'] = df['translation'].apply(lambda s: s['fr'].lower())
        df = df.drop(["id", 'translation'], axis=1)
        df.to_csv(outPath, index=False)
        return df
    else:
        df = pd.read_csv(outPath)
        return df

def getAllSentences(path, lang):
    if lang not in ['en', 'fr']: raise ValueError('lang must be in ["en", "fr"]')

    df = getDataset(path)
    return df[lang]

def getMaxSeqLen(df, src, tgt, src_tokenizer, tgt_tokenizer):
    maxSrcSeqLen = 0
    for item in df[src]:
        maxSrcSeqLen = max(maxSrcSeqLen, len(src_tokenizer.encode(item)))

    maxTgtSeqLen = 0
    for item in df[tgt]:
        maxTgtSeqLen = max(maxTgtSeqLen, len(tgt_tokenizer.encode(item)))

    return maxSrcSeqLen, maxTgtSeqLen

class bilingualDataset(Dataset):
    def __init__(self, ds, src_lang, tgt_lang, src_tokenizer, tgt_tokenizer, maxSeqLength):
        super().__init__()

        self.ds = ds

        self.src_lang = src_lang
        self.tgt_lang = tgt_lang

        self.src_tokenizer = src_tokenizer
        self.tgt_tokenizer = tgt_tokenizer

        self.maxSeqLength = maxSeqLength

        self.sos_token = torch.tensor(self.src_tokenizer.encode("[SOS]").ids, dtype=torch.int64)
        self.eos_token = torch.tensor(self.src_tokenizer.encode("[EOS]").ids, dtype=torch.int64)
        self.pad_token = self.src_tokenizer.encode("[PAD]").ids

    def __len__(self):
        return len(self.ds)

    def __getitem__(self, idx):
        # stuff to return
        # padded english seq
        # padded french seq
        # padded french seq

        src = self.ds.iloc[idx][self.src_lang]
        src_tokens = self.src_tokenizer.encode(src).ids

        tgt = self.ds.iloc[idx][self.tgt_lang]
        tgt_tokens = self.tgt_tokenizer.encode(tgt).ids

        src_padding = self.maxSeqLength - len(src_tokens) - 2 # 2 special tokens -> SOS, EOS
        tgt_padding = self.maxSeqLength - len(tgt_tokens) - 1 # 1 special token -> SOS

        if src_padding < 0 or tgt_padding < 0: raise ValueError("Sequence is too long")

        encoder_input = torch.cat([
            self.sos_token,
            torch.tensor(src_tokens, dtype=torch.int64),
            self.eos_token,
            torch.tensor(self.pad_token * src_padding, dtype=torch.int64)
        ])

        decoder_input = torch.cat([
            self.sos_token,
            torch.tensor(tgt_tokens, dtype=torch.int64),
            torch.tensor(self.pad_token * tgt_padding, dtype=torch.int64)
        ])

        label = torch.cat([
            torch.tensor(tgt_tokens, dtype=torch.int64),
            self.eos_token,
            torch.tensor(self.pad_token * tgt_padding, dtype=torch.int64)
        ])

        assert encoder_input.size(0) == self.maxSeqLength
        assert decoder_input.size(0) == self.maxSeqLength
        assert label.size(0) == self.maxSeqLength

        src_mask = (encoder_input != self.pad_token[0]).unsqueeze(0).int()

        causal_mask = torch.tril(torch.ones(self.maxSeqLength, self.maxSeqLength)).bool()
        tgt_mask = ((decoder_input != self.pad_token[0]).unsqueeze(0) & causal_mask).int()

        return {
            "encoder_input": encoder_input,
            "decoder_input": decoder_input,

            "label": label,

            "src_mask": src_mask.unsqueeze(0),
            "tgt_mask": tgt_mask.unsqueeze(0),

            "src_text": src,
            "tgt_text": tgt
        }