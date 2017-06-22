insert into admins ("userName", "password", "firstName", "lastName", "email") values
  ('admin', 'admin', 'papa', 'admin', 'papa@admin.com');

insert into albums ("href", "name", "release_date", "images", "genres") values
  ('http://album1.com', 'Album 1', current_date, '{image1}', '{pop}'),
  ('http://album2.com', 'Album 2', current_date, '{image2}', '{rock}'),
  ('http://album3.com', 'Album 3', current_date, '{image3}', '{metal}'),
  ('http://album4.com', 'Album 4', current_date, '{image4}', '{pop}'),
  ('http://album5.com', 'Album 5', current_date, '{image5}', '{country}');

insert into artists ("name", "description", "href", "popularity", "images", "genres") values
  ('Carlos Vives', 'Colombia?', 'http://carlitos.com', 5, '{vives1}', '{pop}'),
  ('Metallica', 'Metallica', 'http://metallica.com', 4, '{metallica1}', '{metal}'),
  ('Soda Stereo', 'Soda', 'http://soda.com', 2, '{soda1}', '{rock}'),
  ('Tiesto', 'Uncle T', 'http://tiesto1.com', 5, '{tiesto1}', '{edm1}'),
  ('Alesso', 'Alesso', 'http://alesso1.com', 1, '{alesso1}', '{edm1}');

insert into albums_artists ("album_id", "artist_id") values
  (1,1),
  (3,3),
  (4,4);

insert into playlists ("name", "description", "href", "owner_id") values
  ('Playlist1', 'mega playlist', 'http://playlist1.com', 1),
  ('Playlist2', 'cool', 'http://playlist2.com', 3),
  ('PlaylistMetal', 'puro metal', 'http://playlist3.com', 1),
  ('PlaylistPop', 'pop duro', 'http://playlist4.com', 2);

insert into playlists_albums ("playlist_id", "album_id") values
  (1, 1),
  (3, 2);

insert into playlists_tracks ("playlist_id", "track_id") values
  (2, 1),
  (4, 4);

insert into tracks ("name", "duration", "album_id", "href", "external_id") values
  ('Track1', 2, 1, 'http://track1.com', NULL),
  ('Track2', 1, 2, 'http://track2.com', NULL),
  ('Track3', 5, 3, 'http://track3.com', NULL),
  ('Track4', 1, 1, 'http://track4.com', NULL),
  ('Track5', 6, 5, 'http://track5.com', NULL);

insert into artists_tracks ("artist_id", "track_id") values
  (1,1),
  (2,2),
  (1,3),
  (4,4),
  (3,5);

insert into tracks_rating ("user_id", "track_id", "album_id", "rating") values
  (1,1,1,3),
  (2,2,2,4),
  (1,2,3,5);

insert into users ("facebookUserId", "facebookAuthToken", "userName", "password", "firstName", "lastName", "country",
   "birthdate", "email", "images", "href") values
   (NULL, NULL, 'papaBaute', '12345678', 'carlos', 'baute', 'colombia', current_date, 'carlos@baute.com', '{baute1}', 'http://baute.com'),
   (NULL, NULL, 'manuporto', 'manuporto', 'manu', 'porto', 'argentina', current_date, 'manu@porto.com', '{porto1}', 'http://porto.com'),
   (NULL, NULL, 'agusbarbe', 'agusbarbe', 'agus', 'barbe', 'argentina', current_date, 'agus@barbe.com', '{barbe1}', 'http://barbe.com'),
   (NULL, NULL, 'santiagui', 'santiagui', 'santi', 'agui', 'suecia', current_date, 'santi@agui.com', '{santi1}', 'http://santi.com'),
   (NULL, NULL, 'stanca1234', 'stanca1234', 'stanca', '1234', 'argentina', current_date, 'stanca@1234.com', '{stanca1}', 'http://stanca.com');

 insert into users_artists ("user_id", "artist_id") values
   (1,1),
   (1,2),
   (2,4);

 insert into users_tracks ("user_id", "track_id") values
   (1,1),
   (1,2),
   (2,4);

 insert into users_users ("user_id", "friend_id") values
   (1,2),
   (2,3),
   (3,4),
   (3,5),
   (2,4);
