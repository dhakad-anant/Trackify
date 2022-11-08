from flask import Flask, render_template , request , jsonify, Blueprint
from flask_login import login_user, current_user
import modules.email_client.email as email
from datetime import datetime, timedelta
from random import random
from models import *

auth = Blueprint('auth', __name__, template_folder='templates')

@auth.route('/generateOTP' , methods=['POST'])
def generateOTP():
	try:
		print(request.form)
		addr = request.form['email'].lower()
		otp = str(int(random()*1e8)).rjust(8,'0')
		email.sendMail("Login OTP", addr, 'Hi there\nYour OTP for login is ' + otp)
		otp_obj = OTP.query.filter( OTP.email == addr ).first()
		if (otp_obj):
			otp_obj.created_on = datetime.now()
			otp_obj.otp = otp
			db.session.commit()
		else:
			otp_obj = OTP(addr, otp)
			db.session.add(otp_obj)
			db.session.commit()
		return jsonify({'error':False})
	except Exception as e:
		print("[Exception] ", e)
		return jsonify({'error':True, 'msg':str(e)})

@auth.route('/verifyOTP' , methods=['POST'])
def verifyOTP():
	try:
		addr = request.form['email'].lower()
		otp = request.form['otp']
		# print(f"debug -> email: {addr}, otp: {otp}")
		real_otp_obj = OTP.query.filter(OTP.email == addr, OTP.created_on > (datetime.now()-timedelta(minutes=10))).first()
		if not real_otp_obj:
			return jsonify({'match':False})
		real_otp = real_otp_obj.otp
		# print(f"debug -> real_otp: {real_otp}")
		if otp == real_otp:
			db.session.delete(real_otp_obj)
			db.session.commit()
			if 'login' in request.form.keys() and request.form['login']:
				user = Users.query.get(addr)
				if user:
					login_user(user)
					if len(user.name):
						return jsonify({'match':True, 'name':user.name, 'profile':True, 'name':user.name, 'offices':user.offices})
					else:
						return jsonify({'match':True, 'name':'', 'profile':False, 'name':'', 'offices':user.offices})
				user = Users(addr)
				office = OfficeEmails.query.filter_by(email=addr).first()
				if office:
					user.offices = office.name
				db.session.add(user)
				db.session.commit()
				login_user(user, remember=True)
				return jsonify({'match':True, 'name':'', 'profile':False, 'offices':user.offices})
			elif 'addoffice' in request.form.keys() and request.form['addoffice']:
				# print(f"debug -> INSIDE ADDOFFICE!")
				account = OfficeEmails.query.filter_by(email=addr).first()
				# print(f"debug -> account_obj: {account}")
				user = current_user
				# print(f"debug -> user.offices: {user.offices.split('$')}")
				if account.name in user.offices.split('$'):
					raise Exception('Office already added!')
				if len(user.offices):
					user.offices = user.offices + '$' + account.name
				else:
					user.offices = account.name
				db.session.commit()
				return jsonify({'match':True, 'offices':user.offices})
			return jsonify({'match':True})
		else:
			return jsonify({'match':False})
	except Exception as e:
		print("[Exception] ", e)
		return jsonify({'error':True, 'msg':str(e)})
