Momo Transaction SMS Parser

 This project is a simple but useful tool we built to help people understand their mobile money (MoMo) transactions better. We all get SMS notifications for every transaction whether it’s receiving money, paying someone, withdrawing cash, or buying internet bundles. After a while, these messages pile up and it’s hard to keep track manually.

So, this app reads those SMS messages from a file, picks out the important details, and saves them neatly in a database. This way, you can easily check your transaction history without scrolling through tons of texts.

What the System Does :

The program reads an XML file called modified_sms_v2.xml that contains exported SMS messages. It goes through each message one by one and tries to figure out what kind of transaction it is.
For each message, it tries to get:

  1.What type of transaction it is (payment, money received, withdrawal, etc.)
  2.The amount involved
  3.The date the transaction happened
  4.Who sent or received the money
  5.If the message is recognized, it saves all that info into a database file called momo.db. If it can’t understand the message, it saves it in a log file called ignored.log so I can check and improve the system later.

Why This Project Matters :

 .Mobile money is a big deal, especially in Rwanda and many other places. But keeping track of all those SMS messages by hand is tough. This project automates the process, making it way easier to search, organize, and understand your 
  transactions.

Technologies Used :

  1.JavaScript (Node.js) for processing the SMS messages
  2.SQLite to save the transactions locally in a small database
  3.XML2JS, a Node.js library that converts the XML SMS file into a format the program can read

Project Structure:

  1.Backend/ — This folder has the main script (processMomoData.js) that does all the work
  2.Database/ — Contains the database file (momo.db) and optionally a schema file
  3.ignored.log — Logs messages that couldn’t be processed
  4.modified_sms_v2.xml — The input XML file with the SMS messages

How to Run the System :

  1.Make sure you have Node.js installed on your computer.
  2.Install the needed packages by running:
  3.npm install xml2js sqlite3
  4.Put your SMS export XML file in the project folder and rename it to modified_sms_v2.xml.
  5.Run the program using this command:
      .node Backend/processMomoData.js

When it’s done, you open the Database/momo.db file with a tool like DB Browser for SQLite to see your transactions.

AUTHORS

1.Mukeshimana Josiane
2.Ntwali Ishimwe Christian

