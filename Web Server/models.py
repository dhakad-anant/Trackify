from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from itsdangerous import URLSafeSerializer

db = SQLAlchemy()

serializer = URLSafeSerializer(b'\n\x7f&J\xae\xce&\xea\x05e\xdb\x7f\xd3\xbc\x1a6')

class OTP(db.Model):
    email = db.Column(db.String, primary_key=True)
    otp = db.Column(db.String)
    created_on = db.Column(db.DateTime)
 
    def __init__(self, email, otp):
        self.email = email
        self.otp = otp
        self.created_on = datetime.now()
 
    def __repr__(self):
        return f"{self.email}:{self.otp}"

class Institutions(db.Model):
    login_email = db.Column(db.String, unique=True)
    name = db.Column(db.String, primary_key=True)

    def __init__(self, login_email, name):
        self.login_email = login_email
        self.name = name

    def __repr__(self):
        return self.name

class OfficeEmails(db.Model):
    email = db.Column(db.String, primary_key=True)
    name = db.Column(db.String)
    institution = db.Column(db.String)
    category = db.Column(db.String)

    def __init__(self, email, name, institution, category):
        self.email = email
        self.name = name
        self.institution = institution
        self.category = category

    def __repr__(self):
        return self.name + ', ' + self.institution + ', ' + self.category

class Users(UserMixin, db.Model):
    login_email = db.Column(db.String, primary_key=True)
    name = db.Column(db.String)
    offices = db.Column(db.String, nullable=True)
    token = db.Column(db.String, unique=True)
    department = db.Column(db.String)

    def __init__(self, login_email):
        self.login_email = login_email
        self.name = ''
        self.department = ''
        self.offices = ''
        self.token = serializer.dumps([self.login_email])

    def __repr__(self):
        return self.login_email

    def get_id(self):
        return str(self.token)

class Files(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    created_by = db.Column(db.String)
    created_on = db.Column(db.DateTime)
    category = db.Column(db.String)
    location = db.Column(db.String)
    confirmed = db.Column(db.Boolean)
    
    def __init__(self, name, created_by, category, location):
        self.name = name
        self.created_by = created_by
        self.created_on = datetime.now()
        self.category = category
        self.location = location
        self.confirmed = False

    def __repr__(self):
        return self.created_by+': '+self.name+': '+self.location

class FileLogs(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    file_id = db.Column(db.Integer)
    location = db.Column(db.String)
    time = db.Column(db.DateTime)
    outcome = db.Column(db.String)
    remarks = db.Column(db.String)

    def __init__(self, file_id, location, outcome, remarks):
        self.file_id = file_id
        self.location = location
        self.time = datetime.now()
        self.outcome = outcome
        self.remarks = remarks

    def __repr__(self):
        return str(self.id)+" "+self.location+" "+str(self.time)

class Tags(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    file_id = db.Column(db.Integer)
    tag = db.Column(db.String)
    email = db.Column(db.String)

    def __init__(self, file_id, tag, email):
        self.file_id = file_id
        self.tag = tag
        self.email = email

    def __repr__(self):
        return str(self.tag) + " " + str(self.file_id) + " " + str(self.email)

class TransferRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    file_id = db.Column(db.Integer)
    from_id = db.Column(db.String)
    to_id = db.Column(db.String)

    def __init__(self, file_id, name, from_id, to_id):
        self.file_id = file_id
        self.name = name
        self.from_id = from_id
        self.to_id = to_id

    def __repr__(self):
        return "Transfer from " + self.from_id

class Department(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return self.name

class QRCode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    authenticated_user = db.Column(db.String)
    time = db.Column(db.DateTime)

    def __init__(self):
        self.time = datetime.now()

    def __repr__(self):
        return self.id