from flask import Flask, render_template , request , jsonify, Blueprint
from flask_login import login_required
from modules.pHashDB.ocr import readTag
from modules.crypt import crypt
from modules.pHashDB.search import search_tree

from PIL import Image
from models import *
import numpy as np
import io

scan = Blueprint('scan', __name__, template_folder='templates')

@scan.route('/initDB' , methods=['GET'])
#  @login_required
def initDB():
	ids = Files.query.all()
	tags = [crypt.encrypt(x.id) for x in ids]
	for tag in tags:
		search_tree.add(tag)
	return "Done"

@scan.route('/scan' , methods=['POST'])
@login_required
def scanImage():
    file = io.BytesIO(request.files['image'].read()) ## byte file
    # print(algorithm)
    # npimg = np.fromstring(file, np.uint8)
    # img = cv2.imdecode(npimg,cv2.IMREAD_COLOR)
    # ######### Do preprocessing here ################
    # id = memory.identify_process(img)
    # ################################################

    id = readTag(file)
    print("<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>> id: ", id)
    return jsonify({'id':id})