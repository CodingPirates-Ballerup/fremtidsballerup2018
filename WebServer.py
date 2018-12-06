import sys
import os.path
import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web

import serial

#Tornado Folder Paths
settings = dict(
    template_path = os.path.join(os.path.dirname(__file__), "templates"),
    static_path = os.path.join(os.path.dirname(__file__), "static")
    )

#Tonado server port
PORT = 80
connections = []

#Serial port
ser_port = None
ser_portName = "/dev/ttyACM0"
#ser_portName = "COM6"

def OpenSerialPort(portname):
  global ser_port
  try:
    ser_port = serial.Serial(portname,
      baudrate=115200,
      bytesize=8,
      parity='N',
      stopbits=1,
      xonxoff=0,
      rtscts=0,
      timeout=3.0)
  except:
    print ("Exception triggered - Failed to open serial port:" + portname)

def WriteSerialMsg(message):
  if ser_port == None or not ser_port.is_open:
    OpenSerialPort(ser_portName)
  if ser_port != None and ser_port.is_open:
    asciiMsg = str(message + '\n')
    ser_port.write(asciiMsg.encode())
    print(asciiMsg)

class MainHandler(tornado.web.RequestHandler):
  def get(self):
     print ("[HTTP](MainHandler) User Connected.")
     self.render("index.html")

class WSHandler(tornado.websocket.WebSocketHandler):
  def open(self):
    print ('[WS] Connection was opened.')
    connections.append(self)

  # def check_origin(self):
  #   return True

  def on_message(self, message):
    WriteSerialMsg(message)
    # for con in connections:
    #   con.write_message(u"cmd: " + message)
    print ('[WS] Incoming message:'), message

  def on_close(self):
    print ('[WS] Connection was closed.')
    connections.remove(self)

application = tornado.web.Application([
  (r'/index.html', MainHandler),
  (r'/', MainHandler),
  (r'/ws', WSHandler),
  ], **settings)


def ParseCommands(cmdString):
  moreToParse = True
  while moreToParse:
    idx = cmdString.find('\n')
    if idx != -1:
      cmd = cmdString[0: idx].strip()
      cmdString = cmdString[idx+1:]
      for con in connections: # send incomming cmd to all connected clients.
        con.write_message(cmd)
    else:
      moreToParse = False
  return cmdString

txtBuffer = ""
def Callback():
  global txtBuffer
  if ser_port != None and ser_port.is_open:
    numChar = ser_port.inWaiting()
    if numChar > 0:
      message = ser_port.read(numChar).decode()  # Read characters from the serial port
      txtBuffer = ParseCommands(txtBuffer + message) # Try to parse commands.

if __name__ == "__main__":
    try:
        OpenSerialPort(ser_portName)
        http_server = tornado.httpserver.HTTPServer(application)
        http_server.listen(PORT)
        main_loop = tornado.ioloop.IOLoop.current()
        cb = tornado.ioloop.PeriodicCallback(Callback, 500)
        cb.start()
        print ("Tornado Server started")
        main_loop.start()
    except:
        print ("Exception triggered - Tornado Server stopped.")

