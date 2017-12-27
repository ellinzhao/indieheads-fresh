
const redditURL = 'https://www.reddit.com/r/indieheads/new.json?sort=new&limit=50';
const apiKey = 'c763c0f97b3861a17100b676c05e477d';
const sharedSecret	= '9dad2a267479d0e70208aff78c078193';

var ex = 'http://ws.audioscrobbler.com//2.0/?method=artist.getsimilar&artist=cher&api_key=c763c0f97b3861a17100b676c05e477d&format=json';

var likedArtists = [];

var likeBtn = '<i class="fas fa-heart fa-xs"></i>';
var deleteBtn = '<i class="fas fa-times-circle fa-xs"></i>';
var rightCell = '<td class="right-cell">' + deleteBtn + '</td>';


function displayData(data) {
    var pattern = /.*\[FRESH](.*)-(.*)/ig;
    var posts = data.data.children;
    for (var i = 0; i < posts.length; i++) {
        var title = posts[i].data.title;
        var url = posts[i].data.url;
        var match = pattern.exec(title);
        if (match !== null) {
            var artist = match[1].trim();
            var song = match[2].trim();
            var id = 'toggle-row-' + i;
            findSimilar(artist, song, url, id, i);
        }
    }
}

function formatRow(artist, song, url, id, i, similar) {
    const table = $('table');
    var playBtn = '<a href="'+ url + '" target="_blank"><i class="fas fa-play-circle"></i></a>';
    var leftCell = '<td class="left-cell">' + likeBtn + playBtn + '</td>';
    var middleCell = '<td data-toggle="collapse" href="#' + id + '" class="middle-cell" aria-expanded="false" aria-controls="' + id + '">' +
        '<span class="artist">' + artist + '</span>' + '<br/>' + '<span class="light">' + song + '</span>' +
        '<div id="' + id + '" class="collapse" role="tabpanel"><br/>' + similar + '</div>' +
        '</td>';
    table.append('<tr id="' + "row-" + i +'">' + leftCell + middleCell + rightCell + '</tr>');
}


function findSimilar(artist, song, url, id, j) {
    $.ajax({
        type: 'GET',
        url: 'https://ws.audioscrobbler.com/2.0',
        data: {
            api_key: apiKey,
            artist: artist,
            limit: '10',
            method: 'artist.getsimilar',
            format: 'json'
        },
        dataType: "jsonp",

        contentType: 'application/json',
        success: function(data) {
            var similarArtists = ['<div>'];
            if (data.similarartists === undefined) {
                similarArtists.push('None found, sorry!<br/>')
            } else {
                var arr = data.similarartists.artist;
                var resultsLen = arr.length;
                if (resultsLen) {
                    for (var i = 0; i < resultsLen; i++) {
                        similarArtists.push(arr[i].name);
                        similarArtists.push('<br/>');
                    }
                } else {
                    similarArtists.push('None found, sorry!<br/>')
                }
            }
            similarArtists.push('</div>');
            var similarArtistStr = similarArtists.join('');
            formatRow(artist, song, url, id, j, similarArtistStr)
        },
        error: function() {
            console.log("error in finding similar artists.");
        }
    });
}

jQuery(document).ready(function($) {
    $.ajax({
        type: 'GET',
        url: redditURL,
        success: displayData,
        error: function() {
            console.log("error: could not retrieve data from reddit.");
        }
    });

    const likedTags = $('#liked');

    // TODO: handle edge cases ('UMO - SB - 05')

    $('table').on('click', 'tr .right-cell .fa-times-circle', function() {
        $(this).parent().parent().remove();
    }).on('click', 'tr .fa-heart', function() {
        var artist = $(this).parent().parent().parent().children('.middle-cell').children('.artist').text();
        if (likedArtists.indexOf(artist) !== -1) {
            likedArtists.splice(likedArtists.indexOf(artist), 1);
            $(this).removeClass('liked');
        } else {
            $(this).addClass('liked');
            likedArtists.push(artist);
        }
    });


    // TODO: change to hashSet?
    // TODO: function to generate playlist
    // TODO: make nicer transitions

});
