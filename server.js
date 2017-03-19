var express = require('express');
var app = express();
var port = process.env.port || 1337;
var path = require('path');
var fallback = require('express-history-api-fallback');
var root = path.join(__dirname, 'public');

app.use(express.static(root));
app.use(fallback('index.html', {root: root}));

app.get('/say-hello', function (req, res) {
    res.send('Hello World!');
});

const webpush = require('web-push'),
      bodyParser = require('body-parser'),
      file = require('fs'),
      options = {
          vapidDetails: {
              subject: 'http://www.google.com',
              publicKey: 'BPOOvDThOUuSxiC-DuMv-WXG0XbSCwKR6Jux0CkyeyZ86OMF2U64VYKksNCJKoJdq1ISzYKfCUUxB6hKM0zeNGA',
              privateKey: 'UGU2kXUSbtRVFxDuqNpbSVfzU3C6RrRznJXi3e6G_tM'
          },
          TTL: 60 * 60
      },
      subscriptionsFileName = './subscriptions/subscriptions.json';


app.use(bodyParser.json());


app.post('/push/:title/:msg', (req, res) => {
    var title = req.params.title,
        msg = req.params.msg;

    getAllSubscriptions().forEach(subscriber => {
        console.log(`Sending to ${subscriber.endpoint}...`);
        webpush.sendNotification(
            subscriber,
            JSON.stringify({title: title,
                            body: msg,
                            icon: '/images/coffee.png',
                            badge: '/images/coffee-beans.png',
                            vibrate: [200, 100, 200, 100, 200, 100, 200]
                           }),
            options).catch((err) => {
                console.log('Error while pushing to [' + subscriber.endpoint + ']: ' + err.statusCode + ', ' + err.body);
            });
    });
    res.send(`Sent ${title}: ${msg}.`);
});


function getAllSubscriptions() {
    var fileContent, allSubscriptions;

    if (!file.existsSync(subscriptionsFileName)) {
        return [];
    }
    fileContent = file.readFileSync(subscriptionsFileName, 'utf8');
    if (fileContent.length == 0) {
        return [];
    }
    allSubscriptions = JSON.parse(fileContent);
    return Array.isArray(allSubscriptions) ? allSubscriptions : [];
}

app.post('/registerSubscription', (req, res) => {
    var allSubscriptions = getAllSubscriptions();

    allSubscriptions.push(req.body.subscription);
    file.writeFileSync(subscriptionsFileName, JSON.stringify(allSubscriptions), {flag: 'w+' });
    res.status(200).send({success: true});
});

app.post('/unregisterSubscription', (req, res) => {
    var subscriptionObject = req.body.subscription,
        allSubscriptions = getAllSubscriptions().filter(el => el.endpoint !== subscriptionObject.endpoint);

    file.writeFileSync(subscriptionsFileName, JSON.stringify(allSubscriptions), {flag: 'w+' });
    res.status(200).send({success: true});
});


var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
