n = 967*10093
# p = 104729 / 967
# q = 20117 / 10093
e = 54647
d = 3942935
import time

def power(x, y):
    if y==0: return 1
    t = power(x, y//2)
    if y%2: return (t*t*x)%n
    return (t*t)%n

def encrypt(x):
    y = stringify(power(x, e))
    y = 'A'*(5-len(y)) + y
    y = time.ctime()[-2:] + y
    return y

def decrypt(x):
    x = x[2:]
    x = x.upper()
    return power(strtoint(x),d)

def ntos(x):
    return chr(65 + x)

def ston(x):
    x = ord(x) - 65
    return x

def stringify(x):
    ans = ''
    while(x):
        ans = ntos(x%26) + ans
        x = x//26
    return ans

def strtoint(x):
    ans = 0
    for c in x:
        ans = 26*ans + ston(c)
    return ans

