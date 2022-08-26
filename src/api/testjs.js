/*
We parse commonly used data types. You can parse more by adding custom
middleware. Data available by default on the req object:

   Cookies at req.cookies
   URL Queries (e.g. api/foo?query=foo) at req.query
   Form parameters and data at req.body
   JSON POST bodies at req.body
   Files uploaded from forms at req.files
      E.g. curl -F xls=@file.xls ... will set
      req.files[0] =  {"fieldname":"xls","originalname":"file.xls","encoding":"7bit","mimetype":"application/octet-stream","buffer":{"type":"Buffer","data":[123,...,123]},"size":524}
  req object keys: ["_readableState","_events","_eventsCount","_maxListeners","socket","httpVersionMajor","httpVersionMinor","httpVersion","complete","headers","rawHeaders","trailers","rawTrailers","aborted","upgrade","url","method","statusCode","statusMessage","client","_consuming","_dumped","next","baseUrl","originalUrl","_parsedUrl","params","query","res","body","cookies"]


Response helpers

   res.send(body) -- returns the response.
                     The body can be a string, object, or buffer
   res.json(body) -- returns a JSON response.
                     The body can be any value that can be serialized
                     with JSON.stringify()
   res.status(statusCode) -- set the HTTP status for the response.
                     Defaults to 200.
   res.redirect([statusCode], url) -- Returns a redirect to a URL.
                     Optionally set the statusCode which defaults to 302.


*/

export default function handler(req, res) {
  res.setHeader('X-Version', '666');
  res.status(200).json({
    "req.method": req.method,
    "req.query": req.query,
    "req.headers": req.headers,
    "req.url": req.url,
    "req.httpVersion": req.httpVersion,
    "req.body": req.body,
    "req.cookies": req.cookies,
  })
}



/*
   curl https://site.gtsb.io/api/testjs?how=are\&you=doing \
        -d '{"XYZ":23}' -H 'content-type:application/json'

  returns:
 
{
  "req.method": "POST",
  "req.query": {
    "how": "are",
    "you": "doing"
  },
  "req.headers": {
    "host": "build-abcd1234-3210-1234-12c4-123456789012.gtsb.io",
    "user-agent": "Mozilla/5.0 (Windows; U; Windows NT 5.0; en-US; rv:1.7) Gecko/20040616",
    "content-length": "10",
    "content-type": "application/json",
    "x-build-id": "abcd1234-3210-1234-a3c1-123456789012",
    "x-function-id": "12345678-1230-5a0d-0123-012399239123",
    "x-original-host": "build-abcd1234-2310-1234-12c4-123456789012.gtsb.io"
  },
  "req.url": "/api/testjs?how=are&you=doing",
  "req.httpVersion": "1.1",
  "req.body": {
    "XYZ": 23
  }
}

*/
