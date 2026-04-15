from data.Dataset import *

from tokenizers import Tokenizer
from tokenizers.models import WordLevel
from tokenizers.trainers import WordLevelTrainer
from tokenizers.pre_tokenizers import Whitespace

import os

def getOrBuildTokenizer(tokenizerPath, ds, lang):
    if lang not in ['en', 'fr']: raise ValueError('lang must be in ["en", "fr"]')

    if not os.path.exists(tokenizerPath):
        tokenizer = Tokenizer(WordLevel(unk_token='[UNK]'))
        tokenizer.pre_tokenizer = Whitespace()
        tokenizer_trainer = WordLevelTrainer(special_tokens=["[UNK]", "[SOS]", "[EOS]", "[PAD]"],
                                             vocab_size=VOCAB_SIZE, min_frequency=2)
        print(ds)
        sentences = ds[lang]
        tokenizer.train_from_iterator(sentences, tokenizer_trainer)

        tokenizer.save(tokenizerPath)
    else:
        tokenizer = Tokenizer.from_file(tokenizerPath)

    return tokenizer
