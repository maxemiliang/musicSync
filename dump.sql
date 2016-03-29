-- Adminer 4.2.4 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';

DROP DATABASE IF EXISTS `musick`;
CREATE DATABASE `musick` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `musick`;

DROP TABLE IF EXISTS `music`;
CREATE TABLE `music` (
  `tID` int(11) NOT NULL AUTO_INCREMENT,
  `uID` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `artist` varchar(100) NOT NULL,
  `album` varchar(100) NOT NULL,
  `location` varchar(100) NOT NULL,
  `date` datetime NOT NULL,
  PRIMARY KEY (`tID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `playlist`;
CREATE TABLE `playlist` (
  `pID` int(11) NOT NULL AUTO_INCREMENT,
  `owner` int(11) NOT NULL,
  PRIMARY KEY (`pID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `uID` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(500) NOT NULL,
  PRIMARY KEY (`uID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- 2016-03-29 12:50:14