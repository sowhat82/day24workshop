create database if not exists party; 

use party;

create table IF NOT EXISTS images (
		id int not null auto_increment,
		image mediumblob,
		primary key (id)
);

SELECT * FRoM party.images;

select image from images where id = 1;

drop table images;