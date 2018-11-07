import serial

ser_port = None

def OpenSerialPort(portname):
    global ser_port
    ser_port = serial.Serial(portname,
        baudrate=115200,
        bytesize=8, 
        parity='N', 
        stopbits=1,  
        xonxoff=0, 
        rtscts=0,
        timeout=3.0)  


OpenSerialPort('COM3')

if ser_port != None and ser_port.is_open:
    asciiMsg = str('Test:12345' + '\n')
    ser_port.write(asciiMsg)
    ser_port.flushOutput()

    print(asciiMsg)