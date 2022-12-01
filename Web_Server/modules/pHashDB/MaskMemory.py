import numpy as np
import cv2 
from imagehash import phash
from modules.pHashDB.utils import preprocessImage
from PIL import Image

class MaskMemory:
    def __init__(self, height, width):
        self.HEIGHT = height
        self.WIDTH =  width
        self.frame = [[set() for _ in range(width)] for _ in range(height)]
        self.total = {}
        self.id = 0
        self.hashes = {}
    
    def remember(self, id, img, mask):
        self.hashes[id] = phash(img)
        return self.hashes[id]

    def remember_process(self, img):
        # Input is CV2 read image
        cropped, mask = preprocessImage(img)
        self.remember(self.id, Image.fromarray(cropped), mask)
        self.id += 1
        print("Scanned")

    def identify(self, mask):
        h = phash(mask)
        min_diff_id = -1
        min_diff = float("inf")
        for id in self.hashes.keys():
            if self.hashes[id]-h < min_diff:
                min_diff = self.hashes[id]-h
                min_diff_id = id
        return min_diff_id

    def identify_process(self, img):
        # Input is CV2 read image
        cropped, mask = preprocessImage(img)
        id = self.identify(Image.fromarray(cropped))
        print("Dehashed")
        return id