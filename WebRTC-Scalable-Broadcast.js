// Muaz Khan   - www.MuazKhan.com
// MIT License - www.WebRTC-Experiment.com/licence

// WebRTC Scalable Broadcast:
// this module simply initializes socket.io
// and configures it in a way that
// single broadcast can be relayed over unlimited users
// without any bandwidth/CPU usage issues.
// Everything happens peer-to-peer!

// Ref. discussion: https://github.com/muaz-khan/WebRTC-Experiment/issues/2
// Source Code: https://github.com/muaz-khan/WebRTC-Scalable-Broadcast


//<kau> Node.js 기반 signaling 서버
module.exports = exports = WebRTC_Scalable_Broadcast;

function WebRTC_Scalable_Broadcast(app) {
    var io = require('socket.io').listen(app, {
        log: false,
        origins: '*:*'
    });

    io.set('transports', [
        'websocket', // 'disconnect' EVENT will work only with 'websocket'
        'xhr-polling',
        'jsonp-polling'
    ]);

    var listOfBroadcasts = {};

    io.on('connection', function(socket) {
        var currentUser;
        socket.on('join-broadcast', function(user) {
            currentUser = user;

            user.numberOfViewers = 0;
            if (!listOfBroadcasts[user.broadcastid]) {
                listOfBroadcasts[user.broadcastid] = {
                    broadcasters: {},
                    allusers: {},
                    typeOfStreams: user.typeOfStreams // object-booleans: audio, video, screen
                };
            }

            var firstAvailableBroadcaster = getFirstAvailableBraodcater(user);
            if (firstAvailableBroadcaster) {
                listOfBroadcasts[user.broadcastid].broadcasters[firstAvailableBroadcaster.userid].numberOfViewers++;
                socket.emit('join-broadcaster', firstAvailableBroadcaster, listOfBroadcasts[user.broadcastid].typeOfStreams);

                console.log('User <', user.userid, '> is trying to get stream from user <', firstAvailableBroadcaster.userid, '>');
            } else {
                currentUser.isInitiator = true;
                socket.emit('start-broadcasting', listOfBroadcasts[user.broadcastid].typeOfStreams);

                console.log('User <', user.userid, '> will be next to serve broadcast.');
            }

            listOfBroadcasts[user.broadcastid].broadcasters[user.userid] = user;
            listOfBroadcasts[user.broadcastid].allusers[user.userid] = user;
        });

        socket.on('message', function(message) {
            socket.broadcast.emit('message', message);
        });

        socket.on('disconnect', function() {
            if (!currentUser) return;
            if (!listOfBroadcasts[currentUser.broadcastid]) return;
            if (!listOfBroadcasts[currentUser.broadcastid].broadcasters[currentUser.userid]) return;

            delete listOfBroadcasts[currentUser.broadcastid].broadcasters[currentUser.userid];
            if (currentUser.isInitiator) {
                delete listOfBroadcasts[currentUser.broadcastid];
            }
        });
    });

    function getFirstAvailableBraodcater(user) {
        var broadcasters = listOfBroadcasts[user.broadcastid].broadcasters;
        var firstResult;
        for (var userid in broadcasters) {
            if (broadcasters[userid].numberOfViewers <= 3) {
                firstResult = broadcasters[userid];
                continue;
            } else delete listOfBroadcasts[user.broadcastid].broadcasters[userid];
        }
        return firstResult;
    }
}
