
-- ------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- FlipFreighters implementation : © joesimpson <1324811+joesimpson@users.noreply.github.com>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----

-- dbmodel.sql

-- This is the file where you are describing the database schema of your game
-- Basically, you just have to export from PhpMyAdmin your table structure and copy/paste
-- this export here.
-- Note that the database itself and the standard tables ("global", "stats", "gamelog" and "player") are
-- already created and must not be created here

-- Note: The database schema is created from this file when the game starts. If you modify this file,
--       you have to restart a game to see your changes in database.

-- create a standard "card" table to be used with the "Deck" tools :

CREATE TABLE IF NOT EXISTS `card` (
  `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `card_type` varchar(16) NOT NULL,
  `card_type_arg` int(11) NOT NULL,
  `card_location` varchar(16) NOT NULL,
  `card_location_arg` int(11) NOT NULL,
  PRIMARY KEY (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


-- Example 2: add a custom field to the standard "player" table
-- ALTER TABLE `player` ADD `player_my_custom_field` INT UNSIGNED NOT NULL DEFAULT '0';

CREATE TABLE IF NOT EXISTS `freighter_cargo` (
  `cargo_player_id` int(10) unsigned NOT NULL COMMENT 'Id of player who owns the truck/board',
  `cargo_key` varchar(32) NOT NULL COMMENT 'Id of one truck cargo containing the truck id and the cargo index',
  `cargo_amount` int(2) COMMENT 'Quantity of loaded goods in this cargo',
  `cargo_state` int(10) DEFAULT 0 COMMENT 'LOAD status : [0: EMPTY, 1: UNCONFIRMED, 2 : CONFIRMED, ] ',
  `cargo_card_id` int(10) unsigned COMMENT 'Id of card used to load the cargo',
  PRIMARY KEY (`cargo_player_id`, `cargo_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT 'save infos related to each truck cargo';


CREATE TABLE IF NOT EXISTS `freighter_move` (
  `fmove_player_id` int(10) unsigned NOT NULL COMMENT 'Id of player who owns the truck/board',
  `fmove_truck_id` varchar(32) NOT NULL COMMENT 'Id of moved truck',
  `fmove_position_from` int(2) NOT NULL COMMENT 'Truck position BEFORE moving',
  `fmove_position_to` int(2) NOT NULL COMMENT 'Truck position AFTER moving',
  `fmove_state` int(10) DEFAULT 1 COMMENT 'Move status : [ 1: UNCONFIRMED, 2 : CONFIRMED, 3: DELIVERED, 4 : DELIVERED_CONFIRMED, ] ',
  `fmove_card_id` int(10) unsigned COMMENT 'Id of card used to move truck',
  PRIMARY KEY (`fmove_player_id`, `fmove_truck_id`,`fmove_position_from`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT 'save infos related to each truck move';