create database if not exists birthday; 

use birthday;

create table IF NOT EXISTS rsvps (
		id int not null auto_increment,
		name varchar(30) not null,
		email CHAR(255),
		phone int,
		answer varchar(20),
		primary key (id)
);

SELECT * FRoM birthday.rsvps;