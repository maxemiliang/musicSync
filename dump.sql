-- Adminer 4.2.4 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';

DROP DATABASE IF EXISTS `musick`;
CREATE DATABASE `musick` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `musick`;

DROP TABLE IF EXISTS `music`;
CREATE TABLE `music` (
  `tID` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(300) NOT NULL,
  `title` varchar(100) NOT NULL,
  `artist` varchar(100) NOT NULL,
  `album` varchar(100) NOT NULL,
  `location` varchar(100) NOT NULL,
  `date` datetime NOT NULL,
  PRIMARY KEY (`tID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `music_playlists`;
CREATE TABLE `music_playlists` (
  `mID` int(11) NOT NULL AUTO_INCREMENT,
  `sID` int(11) NOT NULL,
  `pID` int(11) NOT NULL,
  PRIMARY KEY (`mID`),
  KEY `sID` (`sID`),
  KEY `pID` (`pID`),
  CONSTRAINT `music_playlists_ibfk_1` FOREIGN KEY (`sID`) REFERENCES `music` (`tID`) ON DELETE NO ACTION,
  CONSTRAINT `music_playlists_ibfk_2` FOREIGN KEY (`pID`) REFERENCES `playlist` (`pID`) ON DELETE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `playlist`;
CREATE TABLE `playlist` (
  `pID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(300) NOT NULL,
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


-- 2016-04-01 05:50:22

