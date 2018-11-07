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
 
  def on_message(self, message):
    WriteSerialMsg(message)
    for con in connections:
        con.write_message(u"cmd: " + message)
    print ('[WS] Incoming message:'), message

  def on_close(self):
    print ('[WS] Connection was closed.')
    connections.remove(self)

application = tornado.web.Application([
  (r'/', MainHandler),
  (r'/ws', WSHandler),
  ], **settings)


def Callback():
  if ser_port != None and ser_port.is_open:
    numChar = ser_port.inWaiting()
    if numChar > 0:
      message = ser_port.read(numChar)
      for con in connections:
        con.write_message(u"- Received: " + message)

if __name__ == "__main__":
    try:
        OpenSerialPort(ser_portName)
        http_server = tornado.httpserver.HTTPServer(application)
        http_server.listen(PORT)
        main_loop = tornado.ioloop.IOLoop.current()
        cb = tornado.ioloop.PeriodicCallback(Callback, 1000)
        cb.start()
        print ("Tornado Server started")
        main_loop.start()

    except:
        print ("Exception triggered - Tornado Server stopped.")

