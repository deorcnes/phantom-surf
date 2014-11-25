var page = require('webpage').create();
var server = require('webserver').create();
var system = require('system');
var fs = require("fs");
var host, port;
var address, output, size;
var currentAddress = null;

page.onConsoleMessage = function (msg) 
{
    console.log('---> Page console log: ' + msg);
};

port = system.args[1] || system.env.PORT;

var listening = server.listen(port, function (request, response) 
{
    console.log("GOT HTTP REQUEST ("+request.method+")");

    var a = 0;
    if (request.method === "GET") {
    // GET request
        if((a=request.url.indexOf("url=")) > 0) 
		{
            console.log("Loading URL " + request.url.slice(a+4));
            var params = URLToArray(request.url);
            output = "g.png";
            page.viewportSize = { width: 800, height: 600 };
			address = params["url"];
			if(currentAddress != address)
			{				
				page.open(address, function (status) {
					if (status !== 'success') {
						console.log('Unable to load the address!');
					} else {
						currentAddress = address;
						window.setTimeout(function () {
							var png = page.renderBase64("PNG");
							response.statusCode = 200;
							response.headers = {"Cache": "no-cache", "Content-Type": "text/html"};
							response.write("<html><head><title>Page Loaded</title></head><body>");
							response.write('<img src="data:image/png;base64,'+png+'"/>');
							response.write("</body></html>");
							response.close();
						}, 200);
					}
				});            
			}
			else
			{
				window.setTimeout(function () {
					var png = page.renderBase64("PNG");
					response.statusCode = 200;
					response.headers = {"Cache": "no-cache", "Content-Type": "text/html"};
					response.write("<html><head><title>Page Shot</title></head><body>");
					response.write('<img src="data:image/png;base64,'+png+'"/>');
					response.write("</body></html>");
					response.close();
				}, 200);			
			}
        } else {
             // we set the headers here
            response.statusCode = 200;
            response.headers = {"Cache": "no-cache", "Content-Type": "text/html"};
            // this is also possible:
            response.setHeader("foo", "bar");
            // now we write the body
            // note: the headers above will now be sent implictly
            response.write("<html><head><title>PhantomSurf</title></head>");
            // note: writeBody can be called multiple times
            response.write("<body><p>Specify a URL to surf to:</><form><input type='text' name='url' size='100'><br><input type='submit' value='Submit'></form></body></html>");
            response.close();       
        }
    } 
});
if (!listening) {
    console.log("could not create web server listening on port " + port);
    phantom.exit();
}

function URLToArray(url) 
{
  var request = {};
  var pairs = url.substring(url.indexOf('?') + 1).split('&');
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=');
    request[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return request;
}
 