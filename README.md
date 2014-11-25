# audio

A simple wrapper for the html5 audio tag, witch can  cross mobile browser both iOS and android2.3+.

You can create one player to play a song list. And you also can create mutil players to play diffrent songs. These players default to be mutexed, and you can use needVioceMutex param to free it.

## Usage

1. Insert 'audio.js' in your page.

2. Create a audio player :
    <script>
      var myplayer = AudioPlayer();
      myplayer.init();
      myplayer.play('http://thirdparty.gtimg.com/2009535.m4a?fromtag=38');
      
    </script>


