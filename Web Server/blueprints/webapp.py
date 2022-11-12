from flask import Flask, render_template , request , jsonify, Blueprint, redirect
from flask_login import login_user, current_user, login_required
import modules.email_client.email as email
from modules.crypt import crypt
from datetime import datetime, timedelta
from random import random
from models import *

webapp = Blueprint('webapp', __name__, template_folder='../templates', static_folder='../static')

@webapp.route('/favicon.ico')
def favicon():
    return webapp.send_static_file('favicon.ico')
    

@webapp.route('/webapp' , methods=['GET'])
def dash():
    if current_user.is_authenticated:
        if current_user.name:
            return render_template("dashboard.html", offices=current_user.offices.split('$') if current_user.offices!='' else [])
        return redirect("/webapp/profile", code=302)
    return redirect("/webapp/login", code=302)

@webapp.route('/webapp/profile' , methods=['GET'])
def profile():
    if current_user.is_authenticated:
        if current_user.name:
            return redirect("/webapp", code=302)
        return webapp.send_static_file('profile.html')
    return redirect("/webapp/login", code=302)

@webapp.route('/webapp/offices' , methods=['GET'])
def offices():
    if current_user.is_authenticated:
        if current_user.name:
            return render_template("offices.html", offices=current_user.offices.split('$') if current_user.offices!='' else [])
        return redirect("/webapp/profile", code=302)
    return redirect("/webapp/login", code=302)

@webapp.route('/webapp/login' , methods=['GET'])
def login():
    if current_user.is_authenticated:
        if current_user.name:
            return redirect("/webapp", code=302)
        return redirect("/webapp/profile", code=302)
    return webapp.send_static_file('login.html')

@webapp.route('/webapp/generateqr' , methods=['GET'])
def generateqr():
    qr = QRCode()
    db.session.add(qr)
    db.session.commit()
    return jsonify({'code':qr.id})

@webapp.route('/webapp/login/scan' , methods=['GET'])
@login_required
def webappLoginScan():
    try:
        code = request.args['qr']
        id = code
        obj = QRCode.query.filter_by(id=id).first()
        obj.authenticated_user = current_user.login_email
        db.session.commit()
        return jsonify({'success':True})
    except:
        return jsonify({'success':False})


@webapp.route('/webapp/login/read' , methods=['GET'])
def webappLoginRead():
    code = request.args['qr']
    id = code
    obj = QRCode.query.filter_by(id=id).first()
    if(obj and obj.authenticated_user):
        usr = Users.query.filter_by(login_email=obj.authenticated_user).first()
        login_user(usr)
        db.session.delete(obj)
        db.session.commit()
        return jsonify({'login':True})
    return jsonify({'login':False})



