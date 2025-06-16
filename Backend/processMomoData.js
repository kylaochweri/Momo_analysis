const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const sqlite3 = require('sqlite3').verbose();

// Paths
const XML_FILE = path.join(__dirname, 'modified_sms_v2.xml');
const DB_FILE = path.join(__dirname, '..', 'Database', 'momo.db');
const IGNORED_LOG = path.join(__dirname, 'ignored.log');

// File check
if (!fs.existsSync(XML_FILE)) {
  console.error(`❌ XML file not found at ${XML_FILE}`);
  process.exit(1);
}

// Open DB
const db = new sqlite3.Database(DB_FILE);

// Ensure table exists
db.serialize(() => {
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
});

// Read and parse XML
const xml = fs.readFileSync(XML_FILE, 'utf-8');

xml2js.parseString(xml, (err, result) => {
  if (err) {
    console.error('❌ Failed to parse XML:', err.message);
    process.exit(1);
  }

  const messages = result.smses.sms || [];
  const ignored = [];

  messages.forEach((msg) => {
    if (!msg.$ || !msg.$.body) {
      ignored.push(JSON.stringify(msg));
      return;
    }

    const text = msg.$.body;
    console.log('📨 Processing message:', text);

    let type = '';
    let amount = 0;
    let date = '';
    let transaction_id = '';
    let sender = '';
    let receiver = '';

    try {
      if (/received/i.test(text)) {
        type = 'Incoming Money';
        const amountMatch = text.match(/received\s+([\d,]+)\s+RWF/i);
        amount = amountMatch ? parseInt(amountMatch[1].replace(/,/g, '')) : 0;
        transaction_id = text.match(/Transaction ID[:\s]*([A-Z0-9]+)/i)?.[1] || '';
        date = text.match(/Date[:\s]*(.+)$/i)?.[1] || '';
        sender = text.match(/from\s+(.+?)\./i)?.[1] || '';
      } else if (/payment.*completed/i.test(text)) {
        type = /Airtime/i.test(text) ? 'Airtime Payment' : 'Payment';
        const amountMatch = text.match(/payment of\s+([\d,]+)\s+RWF/i);
        amount = amountMatch ? parseInt(amountMatch[1].replace(/,/g, '')) : 0;
        receiver = text.match(/to\s+(.+?)\s+has been completed/i)?.[1] || '';
        date = text.match(/Date[:\s]*(.+)$/i)?.[1] || '';
        transaction_id = text.match(/TxId[:\s]*([A-Z0-9]+)/i)?.[1] || '';
      } else if (/withdrawn/i.test(text)) {
        type = 'Withdrawal';
        const amountMatch = text.match(/withdrawn\s+([\d,]+)\s+RWF/i);
        amount = amountMatch ? parseInt(amountMatch[1].replace(/,/g, '')) : 0;
        date = text.match(/on\s+(.+?)\./i)?.[1] || '';
        receiver = text.match(/agent:\s+(.+?)\s+\(/i)?.[1] || '';
      } else if (/purchased an internet bundle/i.test(text)) {
        type = 'Internet Bundle';
        const amountMatch = text.match(/for\s+([\d,]+)\s+RWF/i);
        amount = amountMatch ? parseInt(amountMatch[1].replace(/,/g, '')) : 0;
        date = text.match(/Date[:\s]*(.+)$/i)?.[1] || '';
      } else {
        ignored.push(text);
        return;
      }

      db.run(
        `INSERT INTO transactions (type, amount, date, sender, receiver, transaction_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [type, amount, date, sender, receiver, transaction_id]
      );
    } catch (e) {
      console.error('❌ Error processing message:', text);
      console.error(e.message);
      ignored.push(text);
    }
  });

  // Save ignored messages
  fs.writeFileSync(IGNORED_LOG, ignored.join('\n'), 'utf-8');
  console.log(`✅ Done. Inserted messages into DB.`);
  console.log(`⚠️ Ignored messages: ${ignored.length}`);

  db.close();
});