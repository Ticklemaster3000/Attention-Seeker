from torch.utils.data import random_split, DataLoader

from tokenizer.Tokenizer import *
from data.Dataset import *
from Transformer import *

from tqdm import tqdm


def preTrain(datasetPath):
    df = getDataset(datasetPath)

    english_tokenizer = getOrBuildTokenizer(ENGLISH_TOKENIZER_PATH, df, "en")
    french_tokenizer = getOrBuildTokenizer(FRENCH_TOKENIZER_PATH, df, "fr")

    train_len = int(len(df) * 0.9)
    test_len = len(df) - train_len

    ds = bilingualDataset(df, "en", "fr", english_tokenizer, french_tokenizer, MAX_SEQ_LEN)

    train_ds, test_ds = random_split(ds, [train_len, test_len])

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)
    test_loader = DataLoader(test_ds, batch_size=BATCH_SIZE, shuffle=True)

    return train_loader, test_loader, english_tokenizer, french_tokenizer

def train():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    train_loader, test_loader, english_tokenizer, french_tokenizer = preTrain(DATASET_PATH)

    model = initTransformer(D_MODEL, VOCAB_SIZE, HEADS, LAYERS, DROPOUT).to(device)

    optimizer = torch.optim.Adam(model.parameters(), lr=LR, eps=1e-9)
    criterion = torch.nn.CrossEntropyLoss(ignore_index=french_tokenizer.token_to_id("[PAD]"), label_smoothing=0.1).to(device)

    os.makedirs(MODEL_FOLDER, exist_ok=True)

    initial_epoch = 0
    global_step = 0

    if PRE_LOAD:
        model_path = os.path.join(MODEL_FOLDER, f"model-{PRE_LOAD}.pt")
        state = torch.load(model_path)
        initial_epoch = state["epoch"] + 1
        optimizer.load_state_dict(state["optimizer_state_dict"])
        model.load_state_dict(state["model_state_dict"])
        global_step = state["global_step"] + 1

    for epoch in range(initial_epoch, EPOCHS + 1):
        model.train()
        batch_iterator = tqdm(train_loader)

        for data in batch_iterator:
            encoder_input = data['encoder_input'].to(device)
            decoder_input = data['decoder_input'].to(device)

            label = data['label'].to(device)

            src_mask = data['src_mask'].to(device)
            tgt_mask = data['tgt_mask'].to(device)

            encoder_output = model.encode(encoder_input, src_mask)
            decoder_output = model.decode(decoder_input, encoder_output, tgt_mask, src_mask)
            predictions = model.project(decoder_output)

            loss = criterion(predictions.view(-1, french_tokenizer.get_vocab_size()), label.view(-1))
            batch_iterator.set_postfix(loss=loss.item())

            loss.backward()

            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)

            optimizer.step()
            optimizer.zero_grad()

            global_step += 1

        torch.save({
            "epoch": epoch,
            "global_step": global_step,
            "optimizer_state_dict": optimizer.state_dict(),
            "model_state_dict": model.state_dict()
        }, os.path.join(MODEL_FOLDER, f"model-{epoch}.pt"))

if __name__ == "__main__":
    train()