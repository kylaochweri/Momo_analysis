db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT,
        amount INTEGER,
        date TEXT,
        sender TEXT,
        receiver TEXT,
        transaction_id TEXT
    )
`);
