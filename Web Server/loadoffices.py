from main import app, db
from models import *

f = open('offices.tsv', 'r')

offices = [x.split('\t') for x in f.read().split('\n')]
departments = [
                'Computer Science and Engineering', 
                'Electrical Engineering', 
                'Mechanical Engineering', 
                'Chemical Engineering',
                'Civil Engineering',
                'Biomedical Engineering',
                'Humanities and Social Sciences',
                'Maths Department',
                'Physics Department',
                'Chemistry Department',
                'Metallurgical and Materials Engineering',
                'Other'
            ]

with app.app_context():
    OfficeEmails.query.delete()
    Users.query.delete()

    for office in offices:
        office_name = office[0]; email = office[2]; category = office[3]
        user_name = office[1]
        user_obj = Users(email, user_name, office_name, 'Other')
        db.session.add(user_obj)
        print("User: {} added!".format(user_name))
        office_emails_obj = OfficeEmails(email, office_name, 'IITRPR', category)
        db.session.add(office_emails_obj)
        print("Office: {} added!".format(office_name))

    db.session.commit()

    for dept in departments:
        obj = Department(dept)
        db.session.add(obj)
        print("Department: {} added!".format(dept))

    db.session.commit()