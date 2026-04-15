class BasicTokenizer:
    def __init__(self, vocabSize):
        self.vocabSize = vocabSize
        self.merges = None
        self.vocab = None

    @staticmethod
    def getStats(text):
        pairs = list(zip(text[:-1], text[1:]))
        freq = {}
        for pair in pairs:
            freq.setdefault(pair, 0)
            freq[pair] += 1
        return freq

    @staticmethod
    def merge(text, target, idx):
        i = 0
        new_ids = []

        while i < len(text):
            if i < len(text) - 1 and (text[i], text[i+1]) == target:
                new_ids.append(idx)
                i += 2
            else:
                new_ids.append(text[i])
                i += 1

        return new_ids

    def viewVocab(self):
        for idx in self.vocab:
            print(idx, ":", self.vocab[idx].decode('utf8', 'replace'))

    def train(self, text, verbose=False):
        merged = {}
        text = [int(i) for i in text.encode("utf-8")]

        for i in range(self.vocabSize - 256):
            stats = self.getStats(text)
            pair = max(stats, key=stats.get)
            text = self.merge(text, pair, i + 256)
            merged[pair] = i + 256

            if verbose: print(pair, "merged to", i + 256)

        self.merges = merged

        self.vocab = {i: bytes([i]) for i in range(256)}

        for (p0, p1), idx in self.merges.items():
            self.vocab[idx] = self.vocab[p0] + self.vocab[p1]

    def encode(self, text):
        tokens_local = [int(i) for i in text.encode("utf-8")]

        if self.merges and len(tokens_local) >= 2:
            while True:
                status = self.getStats(tokens_local)
                pair = min(status, key=lambda x: self.merges.get(x, float("inf")))

                if pair not in self.merges: break

                tokens_local =self.merge(tokens_local, pair, self.merges[pair])

        return tokens_local

    def decode(self, encoded):
        decoded = b"".join([self.vocab[i] for i in encoded]).decode('utf-8')

        return decoded

class RegexTokenizer:
    def __init__(self, regex, vocabSize):
        self.vocabSize = vocabSize
        self.regex = regex

        self.merges = None
        self.vocab = None

    @staticmethod
    def getStats(texts):
        pairs = []
        for text in texts:
            pairs += list(zip(text[:-1], text[1:]))
        freq = {}
        for pair in pairs:
            freq.setdefault(pair, 0)
            freq[pair] += 1

        return freq

    @staticmethod
    def merge(texts, target, idx):
        global_new_ids = []

        for text in texts:
            i = 0
            new_ids = []
            while i < len(text):
                if i < len(text) - 1 and (text[i], text[i+1]) == target:
                    new_ids.append(idx)
                    i += 2
                else:
                    new_ids.append(text[i])
                    i += 1
            global_new_ids.append(new_ids)

        return global_new_ids

    def viewVocab(self):
        for idx in self.vocab:
            print(idx, ":", self.vocab[idx].decode('utf8', 'replace'))

    def train(self, text, verbose=False):
        import regex as re
        merged = {}
        text = [[int(j) for j in i.encode("utf-8")] for i in re.findall(self.regex, text)]

        for i in range(self.vocabSize - 256):
            stats = self.getStats(text)
            pair = max(stats, key=stats.get)
            text = self.merge(text, pair, i + 256)
            merged[pair] = i + 256

            if verbose: print(pair, "merged to", i + 256)

        self.merges = merged

        self.vocab = {i: bytes([i]) for i in range(256)}

        for (p0, p1), idx in self.merges.items():
            self.vocab[idx] = self.vocab[p0] + self.vocab[p1]

    def encode(self, text):
        tokens_local = [int(i) for i in text.encode("utf-8")]

        if self.merges and len(tokens_local) >= 2:
            while True:
                status = self.getStats(tokens_local)
                pair = min(status, key=lambda x: self.merges.get(x, float("inf")))

                if pair not in self.merges: break

                tokens_local =self.merge(tokens_local, pair, self.merges[pair])

        return tokens_local

    def decode(self, encoded):
        decoded = b"".join([self.vocab[i] for i in encoded]).decode('utf-8')

        return decoded