import numpy as np
import cv2
import imutils

HEIGHT = 75
WIDTH = 175
MARGIN = 3
arucoDict = cv2.aruco.Dictionary_get(cv2.aruco.DICT_4X4_250)
arucoParams = cv2.aruco.DetectorParameters_create()
# img = cv2.cvtColor(cv2.imread('test.png'), cv2.COLOR_BGR2GRAY)

tie_points = np.array([
    [1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [1, WIDTH, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, WIDTH, 0, 0],
    [1, 0, HEIGHT, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, HEIGHT, 0],
    [1, WIDTH, HEIGHT, WIDTH*HEIGHT, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, WIDTH, HEIGHT, WIDTH*HEIGHT]
])
tie_points = np.linalg.inv(tie_points)

def preprocessImage(img):
    img = imutils.resize(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), width=720)
    # Detecting markers and identifying the projecting transform
    corners, ids, _ = cv2.aruco.detectMarkers(img, arucoDict, parameters=arucoParams)
    if len(ids)<4: raise Exception("Could not identify the field")
    corners = [corners[i] for i in sorted(range(4), key=lambda x:ids[x])]
    final = []
    for i in range(4):
        x, y = 0, 0
        for p in corners[i][0]:
            x += p[0]
            y += p[1]
        x = x/4
        y = y/4
        final.extend([[x],[y]])
        # img = cv2.circle(img, (x,y), 10, (255,255,255), -1)
    final = np.array(final)
    transform = tie_points@final

    # Removing perspective and cropping
    cropped = np.zeros((HEIGHT, WIDTH), dtype="uint8")
    for i in range(WIDTH):
        for j in range(HEIGHT):
            x = (np.array([1, i, j, i*j, 0, 0, 0, 0])@transform)[0]
            y = (np.array([0, 0, 0, 0, 1, i, j, i*j])@transform)[0]
            cropped[j][i] = img[int(y)][int(x)]

    # Blur to minimise noise
    cropped = cv2.blur(cropped[MARGIN:-MARGIN,WIDTH//7+MARGIN:WIDTH-WIDTH//7-MARGIN],(3,3))

    # Adaptive thresholding and dilation
    mask = cv2.adaptiveThreshold(cropped, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV,3,5)
    #cropped = cv2.erode(cropped, np.ones((3,3),np.uint8), iterations=1)
    mask = cv2.dilate(mask, np.ones((2,2),np.uint8), iterations=1)
    #cropped = cv2.erode(cropped, np.ones((3,3),np.uint8), iterations=1)
    #cv2.imshow('Cropped',mask)
    #cv2.waitKey(0)
    return cropped, mask
    