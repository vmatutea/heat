#! /usr/bin/env python

import MySQLdb

db=MySQLdb.connect("localhost","root","pi","heat")
curs=db.cursor()
try: 
	curs.execute("""INSERT INTO temperature (temp) VALUES ("15")""")
	db.commit()
	print "Data commited"
except:
	print "Error: the databse is being rolled back"
	db.rollback()


