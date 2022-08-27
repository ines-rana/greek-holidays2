// produce a list of official greek holidays in iCalendar (RFC 5545) format
// Content-Type: text/calendar; charset="UTF-8"

//	Αν χρειάζεσαι μια πηγή αργιών σε μορφή iCalendar χρησιμοποίησε το
//	 
//	https://greekholidays.gtsb.io
//	      (αργίες για το τρέχον έτος και 5 έτη μπροστά/πίσω)
//			ή
//	https://greekholidays.gtsb.io?years=2017-2021
//	      (αργίες για τα καθοριζόμενα έτη)
//	 
//	Μπορείς να τις δεις και σε ένα (άδειο) δυναμικό ημερολόγιο
//	
//	https://ical.gtsb.io/g/calendar.html


//	Αν χρειάζεσαι μια πηγή αργιών σε μορφή λίστας
//	πρόσθεσε την επιλογή asList=1
//
//	https://greekholidays.gtsb.io?asList=1[&...]

// Create a north sign (in SVG format)

// query parameters
//  years=2017-2021   :  desired range of years
//  asList=1          :  format output as a plain text list



const version = "2022-08"
const grTZ = 'Europe/Athens'; // timezone in Greece

import Cors from "cors"
const cors = Cors()

const moment = require("moment-timezone");  // date manipulation library
// moment.tz(..., String)     create a moment with a time zone
// moment().tz(String)        convert the time zone of an existing moment
// DD/MM/YYYY  D/M/Y          format date with/without zero-padding
// HH:mm:ss                   format time with zero-padding

export default async function corsHandler(req, res) {

  // Run CORS middleware and handle errors
  await new Promise((resolve, reject) => {
    cors(req, res, result => {
      if (result instanceof Error) {
        reject(result)
      }
      resolve(result)
    })
  })



  res.setHeader('X-Version', version);




const uuidv1 = require('uuid/v1'); // uuidv1();



const vcal_header = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:https://greekholidays.gtsb.io/
  Optional parameters: ?from=year1&to=year2
  Version: 20200328T000000
X-WR-CALNAME;LANGUAGE=el:Ελληνικές αργίες
X-WR-CALDESC;LANGUAGE=el:Επίσημες αργίες στην Ελλάδα
REFRESH-INTERVAL;VALUE=DURATION:PT24H
X-PUBLISHED-TTL:PT24H
CALSCALE:GREGORIAN
METHOD:PUBLISH`


// no need for VTIMEZONE definition
// DTSTART/DTEND in VEVENT object below are defined just as a date (instead of datetime)
/*
BEGIN:VTIMEZONE
TZID:Europe/Athens
TZURL:http://tzurl.org/zoneinfo-outlook/Europe/Athens
X-LIC-LOCATION:Europe/Athens
BEGIN:DAYLIGHT
TZOFFSETFROM:+0200
TZOFFSETTO:+0300
TZNAME:EEST
DTSTART:19700329T030000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0300
TZOFFSETTO:+0200
TZNAME:EET
DTSTART:19701025T040000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:TIMEZONE
*/

const vcal_event = `BEGIN:VEVENT
DESCRIPTION;LANGUAGE=el:description
SUMMARY;LANGUAGE=el:summary
DTSTART:dtstart
DTEND:dtend
COMMENT;LANGUAGE=el:comment
UID:uid
DTSTAMP:dtstamp
END:VEVENT`

const vcal_footer = 'END:VCALENDAR\r';


  var now = moment().tz(grTZ);
  const thisYear = Number(now.format('YYYY'));

  var asList = 0;
	if (req.query && req.query.asList) asList = Number(req.query.asList);
  if (isNaN(asList)) {
      asList = 0;
  }

  res.append('Content-Type',
      'text/' +
      ((asList == 1) ? 'plain' : 'calendar') +
      '; charset=utf-8'
  );


  var fromYear = -1;
  var toYear = -1;
	if (req.query && req.query.years) fromYear=req.query.years.split('-',2)[0];
	if (req.query && req.query.years) toYear=req.query.years.split('-',2)[1];
	
  if (fromYear == "") fromYear = (-1); else fromYear=Number(fromYear);
  if (toYear == "") toYear = (-1); else toYear=Number(toYear);
  if (isNaN(fromYear)) fromYear=(-1);
  if (isNaN(toYear)) toYear=(-1);
  
 if ((fromYear <= 0) && (toYear <= 0)) {
      fromYear = thisYear - 5; 
      toYear = thisYear + 5;
  } else {
      if (fromYear <= 0) {
          fromYear = thisYear
      }
      if (toYear <= 0) {
          toYear = thisYear
      }
  }
  if (fromYear > toYear) {
      var t = fromYear;
      fromYear = toYear;
      toYear = t
  }


  var hList = []
  for (var year = fromYear; year <= toYear; year++) {
      hList = hList.concat(holidays(year))
  }

  function date2event(dobj) {
      var dtstamp = ical_datetimestr(now.format("YYYY-MM-DD"));
      var uID = uuidv1();
      var o = {}
      o["year"] = dobj.y;
      o["month"] = dobj.m - 1; //month: 0-11
      o["date"] = dobj.d;
      var d1 = moment.tz(o, grTZ).format("YYYY-MM-DD")
      var d2 = moment.tz(o, grTZ).add(1, 'day').format("YYYY-MM-DD")
      var t = vcal_event;
      return (
          t.replace(/summary/g, dobj.t)
          .replace("dtstart", ical_datetimestr(d1))
          .replace("dtend", ical_datetimestr(d2))
          .replace("dtstamp", dtstamp)
          .replace("uid", uID + "_" + ical_datestr(d1))
          .replace(/comment/g, moment.tz(o, grTZ).format("DD/MM/YYYY") + " " + dobj.t)
          .replace("description", moment.tz(o, grTZ).format("DD/MM/YYYY"))
      )
  }

  function date2list(dobj) {
      var o = {}
      o["year"] = dobj.y;
      o["month"] = dobj.m - 1; //month: 0-11
      o["date"] = dobj.d;
      var d1 = moment.tz(o, grTZ).format("YYYY-MM-DD")
      return (d1 + '\t' + dobj.t + '\r')
  }



  res.send(
	(
      (asList == 1)
      ? hList.map(date2list).join().replace(/,/g, "\n") + '\n'
      : vcal_header +
          hList.map(date2event).join("\r\n") +
          vcal_footer 
	)
  );


/* debugging
  	res.send(''
		+ vcal_header + '\n'

		+ now.format('') + '\n' 
		+ now.format('MMMM DD/MM/YYYY HH:mm:ss') + '\n'
		+ 'DTSTAMP:' + ical_datetimestr("1997-01-06") + '\n'
		+ 'DTSTAMP:' + now.tz("UTC").format('YYYYMMDDTHHmmss') + 'Z' + '\n'
		+ thisYear + '\n'
		+ fromYear + " - " + toYear + '\n'
		+ moment.tz("2018-01-01 00:00:00",grTZ).format() + '\n'
		+ moment.tz("2018-01-01 00:00:00",grTZ).format('DD/MM/YYYY HH:mm:ss') + '\n'
		+ moment.tz("2018-01-01 00:00:00",grTZ).tz('UTC').format('DD/MM/YYYY HH:mm:ss') + '\n'

		+ moment.tz("2018-01-01 23:59:59",grTZ).format() + '\n'
		+ moment.tz("2018-01-01 23:59:59",grTZ).format('DD/MM/YYYY HH:mm:ss') + '\n'
		+ moment.tz("2018-01-01 23:59:59",grTZ).tz('UTC').format('DD/MM/YYYY HH:mm:ss') + '\n'


		+ vcal_footer
		+ "easter: " + JSON.stringify(greek_easter(fromYear)) + '\n'
		+ JSON.stringify(hList) + '\n'
		+ fromYear + " - " + toYear + '\n'
        );
*/
}


// υπολογισμός ημέρας/μήνα του ελληνορθοδόξου Πάσχα για το έτος y
function greek_easter(y) {
    // η Ελλάδα υιοθέτησε το γρηγοριανό ημερολόγιο το 1923,
    // η καθολική Ευρώπη το 1582
    if (y < 1923 || y > 4099) {
        return ("year must be between 1923 and 4099");
    }

    var retval = {};
    var e = 0,
        y2 = 0,
        G = 0,
        I = 0,
        J = 0,
        L = 0,
        p = 0,
        d = 0,
        m = 0;

    e = 10
    if (y > 1600) {
        y2 = Math.floor(y / 100)
        e = 10 + y2 - 16 - Math.floor((y2 - 16) / 4)
    }
    if (y < 1583) {
        e = 0
    }

    G = y % 19
    I = (19 * G + 15) % 30
    J = (y + (Math.floor(y / 4)) + I) % 7
    L = I - J
    p = L + e
    d = 1 + (p + 27 + Math.floor((p + 6) / 40)) % 31
    m = 3 + Math.floor((p + 26) / 30)

    retval["year"] = y;
    retval["month"] = m;
    retval["date"] = d;
    return retval;
}




// format datetime string in UTC timezone (1997-01-06) as 19970105T220000Z
function ical_datetimestr(ts) {
    var td = moment.tz(ts + " 00:00:00", grTZ);
    return td.tz("UTC").format('YYYYMMDDTHHmmss') + 'Z';
}




// format date string in UTC timezone (1997-01-06) as 19970106
function ical_datestr(ts) {
    var td = moment.tz(ts + " 00:00:00", grTZ);
    return td.tz("UTC").format('YYYYMMDD') // no time component
}




function holidays(y) {
    var ey = greek_easter(Number(y))
    var tm, tobj = {}
    var list = new Array();

    function add_one(ad, am, at) {
        var tobj = {};
        tobj.y = y;
        tobj.m = am;
        tobj.d = ad;
        tobj.t = at;
        list.push(tobj)
    }

    add_one(1, 1, "Πρωτοχρονιά");
    add_one(6, 1, "Θεοφάνεια");
    add_one(25, 3, "Εθνική εορτή")
    add_one(15, 8, "Κοίμηση της Θεοτόκου")
    add_one(28, 10, "Εθνική εορτή ")
    add_one(25, 12, "Χριστούγεννα")
    add_one(26, 12, "Δεύτερη ημέρα Χριστουγέννων")


    var easterMoment = moment.tz({
        year: 2000
    }, grTZ); // dummy date
    easterMoment.year(ey.year)
    easterMoment.set("month", ey.month - 1) // month: 0-11
    easterMoment.set("date", ey.date)


    tm = moment(easterMoment) // clone moment
    add_one(tm.date(), tm.month() + 1, "Πάσχα")

    tm = moment(easterMoment).subtract(48, "days")
    add_one(tm.date(), tm.month() + 1, "Καθαρά Δευτέρα")

    tm = moment(easterMoment).subtract(2, "days")
    add_one(tm.date(), tm.month() + 1, "Μεγάλη Παρασκευή")

    tm = moment(easterMoment).add(1, "days")
    add_one(tm.date(), tm.month() + 1, "Δευτέρα του Πάσχα")

    tm = moment(easterMoment).add(50, "days")
    add_one(tm.date(), tm.month() + 1, "Αγίου Πνεύματος")



    //1/5 Πρωτομαγιά
    //    Μετατίθεται σε άλλη εργάσιμη ημέρα,
    //    εφόσον συμπίπτει με Κυριακή, με ημέρα της Μεγάλης Εβδομάδας
    //    ή με τη Δευτέρα του Πάσχα
    //    Π.χ. το 2013 η Πρωτομαγιά μετατέθηκε για την Τρίτη του Πάσχα,
    //    ενώ το 2001 πήγε 2 Μαΐου
    var pmMoment = moment.tz({
        year: 2000
    }, grTZ); // dummy date
    pmMoment.year(ey.year)
    pmMoment.set("month", 5 - 1) // month: 0-11
    pmMoment.set("date", 1)
    if (pmMoment.dayOfYear() >= moment(easterMoment).subtract(6, "days").dayOfYear() &&
        pmMoment.dayOfYear() <= moment(easterMoment).add(1, "days").dayOfYear()) {
        tm = moment(easterMoment).add(2, "days") // Τρίτη του Πάσχα
        add_one(tm.date(), tm.month() + 1, "Πρωτομαγιά")
    } else {
        if (pmMoment.day() == 0) { // 0-6  : Sunday-Saturday
            add_one(2, 5, "Πρωτομαγιά")
        } else {
            add_one(1, 5, "Πρωτομαγιά")
        }
    }


    return list
}



/* https://tools.ietf.org/html/rfc5545

Samples:

LOCATION;LANGUAGE=el:Ελλάς
       DTSTART;TZID=America/New_York:19980119T020000
       DTEND;TZID=America/New_York:19980119T030000

DTSTART;TZID=America/New_York:19970105T083000
RRULE:FREQ=YEARLY;INTERVAL=2;BYMONTH=1;BYDAY=SU;BYHOUR=8,9;
 BYMINUTE=30
"every Sunday in January at 8:30 AM and 9:30 AM, every other year"

RRULE:FREQ=YEARLY



Sample event:

BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
BEGIN:VEVENT
UID:19970610T172345Z-AF23B2@example.com
DTSTAMP:19970610T172345Z
DTSTART:19970714T170000Z
DTEND:19970715T040000Z
SUMMARY:Bastille Day Party
END:VEVENT
END:VCALENDAR


Sample calendar:


BEGIN:VEVENT
CLASS:PUBLIC
UID:2019-01-01GR415regcountry@www.officeholidays.com
CREATED:20191118T200338Z
DESCRIPTION: New Year's Day is a public holiday in all countries that observe the Gregorian calendar, with the exception of Israel\n\n\n\nInformation provided by www.officeholidays.com
URL:https://www.officeholidays.com/holidays/greece/international-new-years-day
DTSTART;VALUE=DATE:20190101
DTEND;VALUE=DATE:20190102
DTSTAMP:20080101T000000Z
LOCATION;LANGUAGE=el:Ελλάς
PRIORITY:5
SEQUENCE:0
SUMMARY;LANGUAGE=el:Πρωτοχρονιά
TRANSP:OPAQUE
X-MICROSOFT-CDO-BUSYSTATUS:BUSY
X-MICROSOFT-CDO-IMPORTANCE:1
X-MICROSOFT-DISALLOW-COUNTER:FALSE
X-MS-OLK-ALLOWEXTERNCHECK:TRUE
X-MS-OLK-AUTOFILLLOCATION:FALSE
X-MICROSOFT-CDO-ALLDAYEVENT:TRUE
X-MICROSOFT-MSNCALENDAR-ALLDAYEVENT:TRUE
X-MS-OLK-CONFTYPE:0
END:VEVENT




Another sample calendar:


BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Teamup Solutions AG//Teamup Calendar//EN
METHOD:PUBLISH
X-WR-CALNAME:ABCD
X-WR-CALDESC:1234
X-PUBLISHED-TTL:PT15M
BEGIN:VTIMEZONE
TZID:Europe/Athens
TZURL:http://tzurl.org/zoneinfo-outlook/Europe/Athens
X-LIC-LOCATION:Europe/Athens
BEGIN:DAYLIGHT
TZOFFSETFROM:+0200
TZOFFSETTO:+0300
TZNAME:EEST
DTSTART:19700329T030000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0300
TZOFFSETTO:+0200
TZNAME:EET
DTSTART:19701025T040000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
UID:TU676549499
DTSTART;VALUE=DATE:20150326
SEQUENCE:0
TRANSP:OPAQUE
DTEND;VALUE=DATE:20150327
URL:https://teamup.com/zzzaaazzz/events/123456789
SUMMARY:just a summary
CLASS:PUBLIC
DESCRIPTION:description\n
X-MICROSOFT-CDO-ALLDAYEVENT:TRUE
CATEGORIES:office
DTSTAMP:20150325T032235Z
CREATED:20150325T031433Z
END:VEVENT
BEGIN:VEVENT
UID:TU676550870
DTSTART;VALUE=DATE:20150310
SEQUENCE:0
TRANSP:OPAQUE
DTEND;VALUE=DATE:20150311
URL:https://teamup.com/zzzaaazzz/events/123456780
LOCATION:somewhere
SUMMARY:Notes 1 2 3
CLASS:PUBLIC
DESCRIPTION:notes (13/03/2015)\
 n\n
X-MICROSOFT-CDO-ALLDAYEVENT:TRUE
CATEGORIES:office
DTSTAMP:20150325T032235Z
CREATED:20150325T031849Z
X-TEAMUP-WHO:Smith
END:VEVENT
END:VCALENDAR

*/
