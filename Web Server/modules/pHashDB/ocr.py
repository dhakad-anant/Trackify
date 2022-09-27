from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import OperationStatusCodes
from azure.cognitiveservices.vision.computervision.models import VisualFeatureTypes
from msrest.authentication import CognitiveServicesCredentials
from configparser import ConfigParser
from modules.pHashDB.search import search_tree
from array import array
import os
from PIL import Image
import sys
import time

def config(filename='email.ini', section='gmail'):
    # create a parser
    parser = ConfigParser()
    # read config file
    parser.read(filename)
    # get section, default to postgresql
    db = {}
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            db[param[0]] = param[1]
    else:
        raise Exception('Section {0} not found in the {1} file'.format(section, filename))
    return db

params = config(section='azure')
subscription_key = params['subscription_key']
endpoint = params['endpoint']

computervision_client = ComputerVisionClient(endpoint, CognitiveServicesCredentials(subscription_key))

def readTag(url):
    remote_image_url = url

    recognize_handw_results = computervision_client.read_in_stream(remote_image_url,  raw=True)

    operation_location_remote = recognize_handw_results.headers["Operation-Location"]

    operation_id = operation_location_remote.split("/")[-1]

    reco = ''

    while True:
        get_handw_text_results = computervision_client.get_read_result(operation_id)
        if get_handw_text_results.status not in ['notStarted', 'running']:
            break
        time.sleep(1)

    if get_handw_text_results.status == OperationStatusCodes.succeeded:
        for text_result in get_handw_text_results.analyze_result.read_results:
            for line in text_result.lines:
                ans = line.text
                print(line.text)
                reco += ans
            reco += ' '

    x = search_tree.find(reco.upper(), len(reco)+5)
    if len(x)>0:
        return x[0][1]
    else:
        return ''