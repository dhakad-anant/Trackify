from flask import Flask, render_template , request , jsonify, Blueprint
from flask_login import current_user, logout_user, login_required
from datetime import datetime, timedelta
from random import random
from models import *

user_ops = Blueprint('user_ops', __name__, template_folder='templates')

@user_ops.route('/setName' , methods=['POST'])
@login_required
def setName():
    try:
        name = request.form['name']
        department = request.form['dept']
        if len(name):
            current_user.name = name
            current_user.department = department
            db.session.commit()
            return jsonify({'error':False})
        else:
            return jsonify({'error':True, 'msg':'Enter a name!'})
    except Exception as e:
        return jsonify({'error':True, 'msg':str(e)})
    return "AddEmail"

@user_ops.route('/getUsers', methods=['GET'])
@login_required
def getUsers():
    try:
        users = Users.query.all()
        ret = [
            {
                'name': x.name,
                'email': x.login_email
            } for x in users
        ]
        print(ret)
        return jsonify(ret) 
    except Exception as e:
        return jsonify({'error':True, 'msg':str(e)})

@user_ops.route('/amiloggedin')
def amiloggedin():
    return jsonify({'logged':current_user.is_authenticated})

@user_ops.route('/logout')
@login_required
def logout():
    logout_user()
    return 'Successful'

@user_ops.route('/getMyOffices' , methods=['GET'])
@login_required
def getMyOffices():
    return jsonify({'offices': current_user.offices})