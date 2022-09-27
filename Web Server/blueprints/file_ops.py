from flask import Flask, render_template , request , jsonify, Blueprint
from flask_login import login_required, current_user
from datetime import datetime, timedelta
import modules.email_client.email as email
from modules.crypt import crypt
from random import random
from models import *
from modules.pHashDB.ocr import search_tree
import modules.email_client.email as email

file_ops = Blueprint('file_ops', __name__, template_folder='templates')

@file_ops.route('/createFile' , methods=['POST'])
@login_required
def createFile():
    try:
        name, type, submitted_to = [request.form[x] for x in ['name', 'type', 'submitted_to']]
        new_file = Files(name, current_user.login_email, type, submitted_to)
        db.session.add(new_file)
        db.session.commit()
        tag = crypt.encrypt(new_file.id)
        search_tree.add(tag)
        if 'transfer_to' in request.form.keys():
            to_id = request.form['transfer_to'].split()[-1]
            newTransferRequest = TransferRequest(new_file.id, name, current_user.login_email, to_id)
            db.session.add(newTransferRequest)
            db.session.commit()
            email.sendMail('Pending File Transfer Request', to_id, 'A transfer of file has been initiated by '+current_user.name+' of file ['+name+']. \n\nPlease check the app or click the following link to confirm [Must be logged in on the webapp]: http://192.168.1.6:5000/confirmTransfer?tid='+str(newTransferRequest.id))
        return jsonify({'tag':tag})
    except Exception as e:
        return jsonify({'error':True, 'msg':str(e)})


@file_ops.route('/confirmTransfer', methods=['GET'])
@login_required
def confirmTransfer():
    try:
        t_id = request.args['tid']
        transfer = TransferRequest.query.filter_by(id=t_id).first()
        f = Files.query.filter_by(id=transfer.file_id).first()
        f.created_by = transfer.to_id
        log = FileLogs(f.id, transfer.from_id, "Ownership transfered", "To " + transfer.to_id)
        db.session.add(log)
        db.session.delete(transfer)
        db.session.commit()
        return jsonify({'error':False, 'msg':'Transfer successful!'})
    except Exception as e:
        print(e)
        return jsonify({'error':True, 'msg':str(e)})

@file_ops.route('/confirmFile' , methods=['POST'])
@login_required
def confirmFile():
    try:
        f = Files.query.filter_by(id=crypt.decrypt(request.form['tag'])).first()
        f.confirmed = True
        db.session.commit()
        return jsonify({'error':False})
    except:
        return jsonify({'error':True})

# Show files created by me
@file_ops.route('/showFiles', methods=['GET'])
@login_required
def showFiles():
    try:
        fs = Files.query.filter_by(created_by=current_user.login_email).all()
        ret = [{'name':x.name, 
                'owner':Users.query.filter_by(login_email=x.created_by).first().name,
                'dept':Users.query.filter_by(login_email=x.created_by).first().department,
                'trackingID':crypt.encrypt(x.id),
                'type':x.category,
                'time':x.created_on,
                'tags':[y.tag for y in Tags.query.filter(Tags.file_id==x.id, Tags.email==current_user.login_email).all()],
                'handledBy':[y.location for y in FileLogs.query.filter_by(file_id=x.id).all()],
                'status':str(str('Currently with ' + x.location) if x.confirmed else str('Sent to ' + x.location)) if x.location else 'File Processed'
                } for x in fs]
        ret = sorted(ret, key=lambda x: x['time'], reverse=True)
        return jsonify(ret)
    except Exception as e:
        print(e)
        return jsonify({'error':True})

# Show Files waiting to be transfered
@file_ops.route('/showTransfers', methods=['GET'])
@login_required
def showTransfers():
    try:
        transfers = TransferRequest.query.filter_by(to_id=current_user.login_email).all()
        ret = [{'t_id':x.id,
                'from':Users.query.filter_by(login_email=x.from_id).first().name + ' (' + x.from_id + ')',
                'name':x.name, 
                'trackingID':crypt.encrypt(x.file_id),
                } for x in transfers]
        print(ret)
        return jsonify(ret)
    except Exception as e:
        print(e)
        return jsonify({'error':True})

def latestUpdate(x):
    try:
        return sorted(FileLogs.query.filter(FileLogs.file_id==x.id, FileLogs.outcome!="Ownership transfered").all(), key=lambda x: x.time, reverse=True)[0]
    except Exception as e:
        print(e)
        return None
def latestLocation(x):
    y = latestUpdate(x)
    if y is None:
        return "Self"
    return y.location
def latestTime(x):
    y= latestUpdate(x)
    if y is None:
        return x.created_on
    return y.time

# Show Files sent to me but not received
@file_ops.route('/showQueue', methods=['GET'])
@login_required
def showQueue():
    try:
        office = request.args['office']
        fs = Files.query.filter(Files.location == office, Files.confirmed == False).all()
        ret = [{'name':x.name, 
                'owner':Users.query.filter_by(login_email=x.created_by).first().name,
                'dept':Users.query.filter_by(login_email=x.created_by).first().department,
                'passed_by':latestLocation(x),
                'trackingID':crypt.encrypt(x.id),
                'status':x.created_by,
                'time':latestTime(x),
                'tags':[y.tag for y in Tags.query.filter(Tags.file_id==x.id, Tags.email==current_user.login_email).all()],
                'handledBy':[y.location for y in FileLogs.query.filter_by(file_id=x.id).all()],
                'type':x.category
                } for x in fs]
        ret = sorted(ret, key=lambda x: x['time'], reverse=True)
        return jsonify(ret)
    except Exception as e:
        print(e)
        return jsonify({'error':True})

# Show Files sent to me and received
@file_ops.route('/showReceived', methods=['GET'])
@login_required
def showReceived():
    try:
        office = request.args['office']
        fs = Files.query.filter(Files.location == office, Files.confirmed == True).all()
        ret = [{'name':x.name, 
                'owner':Users.query.filter_by(login_email=x.created_by).first().name,
                'dept':Users.query.filter_by(login_email=x.created_by).first().department,
                'passed_by':latestLocation(x),
                'trackingID':crypt.encrypt(x.id),
                'status': x.created_by,
                'time':latestTime(x),
                'tags':[y.tag for y in Tags.query.filter(Tags.file_id==x.id, Tags.email==current_user.login_email).all()],
                'handledBy':[y.location for y in FileLogs.query.filter_by(file_id=x.id).all()],
                'type':x.category
                } for x in fs]
        ret = sorted(ret, key=lambda x: x['time'], reverse=True)
        return jsonify(ret)
    except:
        return jsonify({'error':True})

@file_ops.route('/confirmed', methods=['GET'])
@login_required
def Confirmed():
    try:
        tag = request.args['tag']
        office = request.args['office']
        id = crypt.decrypt(tag)
        fs = Files.query.filter_by(id=id).first()
        if(fs.location != office):
            return jsonify({'error':True})
        return jsonify({'name':fs.name, 'confirmed':fs.confirmed})
        return jsonify(ret)
    except:
        return jsonify({'error':True})

@file_ops.route('/showProcessed', methods=['GET'])
@login_required
def showProcessed():
    try:
        office = request.args['office']
        fs = FileLogs.query.filter_by(location=office).all()
        fileids = list(set([x.file_id for x in fs]))
        print(fileids)
        files = [Files.query.filter_by(id=x).first() for x in fileids]
        ret = [{'name':x.name, 
                'owner':Users.query.filter_by(login_email=x.created_by).first().name,
                'dept':Users.query.filter_by(login_email=x.created_by).first().department,
                'trackingID':crypt.encrypt(x.id),
                'type':x.category,
                'time':x.created_on,
                'tags':[y.tag for y in Tags.query.filter(Tags.file_id==x.id, Tags.email==current_user.login_email).all()],
                'handledBy':[y.location for y in FileLogs.query.filter_by(file_id=x.id).all()],
                'status':str(str('Currently with ' + x.location) if x.confirmed else str('Sent to ' + x.location)) if x.location else 'File Processed'
                } for x in files]
        ret = sorted(ret, key=lambda x: x['time'], reverse=True)
        print(ret)

        return jsonify(ret)
        
    except Exception as e:
        print(e)
        return jsonify({'error':True})


@file_ops.route('/updateFile', methods=['POST'])
@login_required
def updateFile():
    try:
        tag, typ, office, next_location, remarks = [request.form[x] for x in ['tag','type', 'office','next','remarks']]
        remarks = current_user.name + ': ' + remarks
        typ = int(typ)
        if typ == 0:
            id = crypt.decrypt(tag)
            f = Files.query.filter_by(id=id).first()
            fl = FileLogs(id, office, 'Processed internally', remarks)
            f.location = office
            f.confirmed = True
            db.session.add(fl)
            db.session.commit()
        elif typ in [1, 3, 4]:
            id = crypt.decrypt(tag)
            f = Files.query.filter_by(id=id).first()
            fl = FileLogs(id, office, 'Passed on' if next_location else ('Approved and Returned' if typ==3 else 'Approved and Kept'), remarks)
            f.location = next_location
            f.confirmed = False
            db.session.add(fl)
            db.session.commit()
        elif typ in [5,6]:
            id = crypt.decrypt(tag)
            f = Files.query.filter_by(id=id).first()
            fl = FileLogs(id, office, 'Not Approved and Returned' if typ==5 else 'Not Approved and Kept' , remarks)
            f.location = ''
            db.session.add(fl)
            db.session.commit()
        else:
            if not next_location:
                id = crypt.decrypt(tag)
                f = Files.query.filter_by(id=id).first()
                email.sendMail("IMP: Input Required", f.created_by, "Hi there!\nYour file id: {}, {}, requires your input at {}.\n\n'{}'".format(tag, f.name, office, remarks))
            else:
                id = crypt.decrypt(tag)
                f = Files.query.filter_by(id=id).first()
                fl = FileLogs(id, office, 'Sent for clarification', remarks)
                f.location = next_location
                f.confirmed = False
                db.session.add(fl)
                db.session.commit()
        return jsonify({'error':False})
    except Exception as e:
        return jsonify({'error':True})

@file_ops.route('/fileHistory', methods=['GET'])
@login_required
def fileHistory():
    try:
        tag = request.args['tag']
        id = crypt.decrypt(tag)
        f = Files.query.filter_by(id=id).first()
        fls = FileLogs.query.filter_by(file_id=id).all()
        tags = Tags.query.filter(Tags.file_id == id, Tags.email == current_user.login_email).all()
        tags = [x.tag for x in tags]
        ret = { 'name':f.name,
                'token':tag,
                'tags':tags,
                'history': [{'location':x.location, 
                'date':x.time,
                'action':x.outcome + " by " + x.location,
                'remarks':x.remarks
                } for x in fls]
            }
        if (f.location and not f.confirmed):
            ret['history'].append({'location':f.location, 'date':datetime.now(), 'action':'Sent to ' + f.location, 'remarks':''})
        elif (f.location):
            ret['history'].append({'location':f.location, 'date':datetime.now(), 'action':'Currently at ' + f.location, 'remarks':''})
        
        ret['history'] = sorted(ret['history'], key=lambda x: x['date'], reverse=True)
        return jsonify(ret)
    except Exception as e:
        return jsonify({'error':True, 'msg':str(e)})


@file_ops.route('/addTag', methods=['POST'])
@login_required
def addTag():
    try:
        tag = request.form['tag']
        tag_obj = Tags(-1, tag, current_user.login_email)
        db.session.add(tag_obj)
        db.session.commit()
        return jsonify({'error':False})
    except Exception as e:
        print(e)
        return jsonify({'error':True})

@file_ops.route('/fileTag', methods=['POST'])
@login_required
def fileTag():
    try:
        tags = request.form['tags'].split('$')
        file_id = crypt.decrypt(request.form['file_id'])
        tags_already = Tags.query.filter(Tags.file_id == file_id, Tags.email == current_user.login_email).all()
        for tag in tags_already:
            if tag.tag not in tags:
                db.session.delete(tag)
        tags_already = [x.tag for x in tags_already]
        for tag in tags:
            if tag not in tags_already:
                tag_obj = Tags(file_id, tag, current_user.login_email)
                db.session.add(tag_obj)
        db.session.commit()
        return jsonify({'error':False})
    except Exception as e:
        print(e)
        return jsonify({'error':True})

@file_ops.route('/showTag', methods=['GET'])
@login_required
def showTag():
    try:
        tags = Tags.query.filter_by(email=current_user.login_email).all()
        ret = list(set([x.tag for x in tags]))
        return jsonify({'tags':ret})
    except Exception as e:
        print(e)
        return jsonify({'error':True})
