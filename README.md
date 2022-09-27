# Trackify - File Tracker

A system for tracking of files between different offices or faculties, consisting of a WebApp and a Mobile App. A unique ID is generated for each file/form which is then written on it. Each office holder may receive or update its status using this ID.

## Salient features
- Secure OTP based login
- Supports scanning of handwritten IDs from phone camera for easier updation
- Supports switching between multiple offices Easy login using QR code if the app is already installed (Trackify Web)
- Better management of personal or processed by files by adding custom tags
- A clear timeline is visible for each file along with any remarks and timestamp
- The office holder can request clarifications or any other inputs from the creator who is then notified via an email
- File creation may be delegated to some other person who can transfer the ownership while creating the file. Separate queues for created, received and incoming files for office holders
- Files are displayed in a tabular format with informative fields
- Filtering and Sorting on all fields in the files table

## How to run

### Server
The server has been hosted on a public IP (103.118.50.48). 

To run locally:
1. Move to `FileTrackingSystem/Web Server` and create `email.ini` with the contents:
```
[gmail]
username=YOUR_USERNAME
password=YOUR_PASSWORD

[azure]
subscription_key=YOUR_SUBSCRIPTION_KEY
endpoint=YOUR_ENDPOINT
``` 
2.  To initialize the database, store all required offices in `offices.tsv` and run:
```
pip install -r requirements.txt
python
>> from main import db, app
>> db.create_all(app=app)
>> exit()
python loadoffices.py
```

3. To start the server, run:
```
python main.py
```

### Web App
The web app has been hosted [here.](http://trackify.iitrpr.ac.in/webapp) 

To run locally, start the server and launch `localhost:5027/webapp` in your browser.

### Mobile App
The APK file can be found in `FileTrackingSystem/MobileApp`.

To run locally:

1. Move to `FileTrackingSystem/MobileApp/file-tracker` and run:
```
npm install
expo start
```
2. Scan the QR code in the terminal using Expo Go on your phone.
