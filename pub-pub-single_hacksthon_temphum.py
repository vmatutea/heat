#!/usr/bin/python

# Copyright (c) 2014 Roger Light <roger@atchoo.org>
#
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the Eclipse Distribution License v1.0
# which accompanies this distribution. 
#
# The Eclipse Distribution License is available at 
#   http://www.eclipse.org/org/documents/edl-v10.php.
#
# Contributors:
#    Roger Light - initial implementation

# This shows an example of using the publish.single helper function.

import sys
import re, os, time
import RPi.GPIO as GPIO
import Adafruit_DHT as dht



try:
    import paho.mqtt.publish as publish
except ImportError:
    # This part is only required to run the example from within the examples
    # directory when the module itself is not installed.
    #
    # If you have the module installed, just use "import paho.mqtt.publish"
    import os
    import inspect
    cmd_subfolder = os.path.realpath(os.path.abspath(os.path.join(os.path.split(inspect.getfile( inspect.currentframe() ))[0],"../src")))
    if cmd_subfolder not in sys.path:
        sys.path.insert(0, cmd_subfolder)
    import paho.mqtt.publish as publish

GPIO.setmode(GPIO.BCM)
HEAT=18
GPIO.setup(HEAT, GPIO.IN)
TEMP= 4
GPIO.setup(TEMP, GPIO.IN)


#!/usr/bin/python
# -*- coding: utf-8 -*-



# function: read and parse sensor data file
def read_sensor(path):
  value = "U"
  try:
    f = open(path, "r")
    line = f.readline()
    if re.match(r"([0-9a-f]{2} ){9}: crc=[0-9a-f]{2} YES", line):
      line = f.readline()
      m = re.match(r"([0-9a-f]{2} ){9}t=([+-]?[0-9]+)", line)
      if m:
        value = str(float(m.group(2)) / 1000.0)
    f.close()
  except (IOError), e:
    print time.strftime("%x %X"), "Error reading", path, ": ", e
  return value

# define pathes to 1-wire sensor data
pathes = (
  "/sys/bus/w1/devices/28-000004d065c5/w1_slave"
)

# read sensor data
while True:
     data= 'temp'
     data += ':'
     h,t=dht.read_retry(dht.DHT22,TEMP)
     data += str(t)
     print data
     data_led= 'ledstat'
     data_led += ':'
     if GPIO.input(HEAT) == GPIO.HIGH:
     	data_led += 'on'
     else:
     	data_led += 'off'
     #time.sleep(1)
     publish.single("iot-kohlscheid-temp1", data,qos=1, hostname="test.mosquitto.org")
     publish.single("iot-kohlscheid-ledstat",data_led,qos=1, hostname="test.mosquitto.org")


# insert data into round-robin-database
#rrdtool.update(
#  "%s/temperature.rrd" % (os.path.dirname(os.path.abspath(__file__))),
#  data)
