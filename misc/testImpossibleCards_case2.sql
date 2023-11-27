-- TEST GUI : 1 PLAYER - when there are already moved trucks, verify possible positions -> this currently leads to 3 disabled cards in the river, and we may need to improve the code to make them suit modifiable...
-- MOves are not cancelable and didnt use the day cards, so "Restart turn" wont make cards enabled again
-- CASE 2 : we need to change cards value in order to play
-- => after test it is GOOOOOOOOOOOO:  if a "6" is loaded in the truck, this truck may be moved by any card, so all cards are selectable

SELECT  @player_id :=player_id  FROM `player` where player_no = 1 ;

-- SET ROUND => 1/3
UPDATE global SET global_value='1' WHERE global_id='10';
-- SET TURN => 1/5
UPDATE global SET global_value='1' WHERE global_id='11';
-- ENABLE ffg_variant_overtime_hours
UPDATE global SET global_value='2' WHERE global_id='100';

-- PUT CARDS in "WEEK_1" (just to play some days)
UPDATE card SET card_location= "WEEK_1" ;

SELECT  @card_1 :=card_id  FROM card WHERE card_type = 2 AND card_type_arg = 2 LIMIT 1 ;
SELECT  @card_2 :=card_id  FROM card WHERE card_type = 2 AND card_type_arg = 5 LIMIT 1 ;
SELECT  @card_3 :=card_id  FROM card WHERE card_type = 2 AND card_type_arg = 6 LIMIT 1 ;
SELECT @card_max := MAX(card_id) FROM card where card_id in (@card_1,@card_2,@card_3);

UPDATE card SET card_location= "DAY" WHERE card_id in (@card_1,@card_2,@card_3);

/* ---------------------------- ----------------------------   ---------------------------- */
/* ---------------------------- ----------------------------   ---------------------------- */

-- CLEAN ALL LOADS IN GAME :
DELETE FROM freighter_cargo ;

-- LOAD A cargo in each truck
INSERT INTO `freighter_cargo` (`cargo_player_id`, `cargo_key`, `cargo_amount`, `cargo_state`, `cargo_card_id`, `cargo_overtime_used`) VALUES (@player_id, 'truck2_1', 6, 2, @card_max+7, 0) ;

INSERT INTO `freighter_cargo` (`cargo_player_id`, `cargo_key`, `cargo_amount`, `cargo_state`, `cargo_card_id`, `cargo_overtime_used`) VALUES (@player_id, 'truck1_1', 1, 2, @card_max+1, 0) ;
INSERT INTO `freighter_cargo` (`cargo_player_id`, `cargo_key`, `cargo_amount`, `cargo_state`, `cargo_card_id`, `cargo_overtime_used`) VALUES (@player_id, 'truck3_1', 1, 2, @card_max+1, 0) ;
INSERT INTO `freighter_cargo` (`cargo_player_id`, `cargo_key`, `cargo_amount`, `cargo_state`, `cargo_card_id`, `cargo_overtime_used`) VALUES (@player_id, 'truck4_1', 1, 2, @card_max+1, 0) ;
INSERT INTO `freighter_cargo` (`cargo_player_id`, `cargo_key`, `cargo_amount`, `cargo_state`, `cargo_card_id`, `cargo_overtime_used`) VALUES (@player_id, 'truck5_1', 1, 2, @card_max+1, 0) ;
INSERT INTO `freighter_cargo` (`cargo_player_id`, `cargo_key`, `cargo_amount`, `cargo_state`, `cargo_card_id`, `cargo_overtime_used`) VALUES (@player_id, 'truck6_1', 1, 2, @card_max+1, 0) ;
INSERT INTO `freighter_cargo` (`cargo_player_id`, `cargo_key`, `cargo_amount`, `cargo_state`, `cargo_card_id`, `cargo_overtime_used`) VALUES (@player_id, 'truck7_1', 1, 2, @card_max+1, 0) ;
INSERT INTO `freighter_cargo` (`cargo_player_id`, `cargo_key`, `cargo_amount`, `cargo_state`, `cargo_card_id`, `cargo_overtime_used`) VALUES (@player_id, 'truck8_1', 1, 2, @card_max+1, 0) ;
INSERT INTO `freighter_cargo` (`cargo_player_id`, `cargo_key`, `cargo_amount`, `cargo_state`, `cargo_card_id`, `cargo_overtime_used`) VALUES (@player_id, 'truck9_1', 1, 2, @card_max+1, 0) ;

/* ---------------------------- ----------------------------   ---------------------------- */
/* ---------------------------- ----------------------------   ---------------------------- */
-- CLEAN ALL MOVES IN GAME :
DELETE FROM freighter_move;

/* ---------------------------- ----------------------------   ---------------------------- */
-- INSERT DATA SAMPLES, don't care about the real card_value here, but card_id should be different than the river cards 
/* ---------------------------- ----------------------------   ---------------------------- */
INSERT INTO freighter_move VALUES (@player_id, "truck1", 0, 2, 2,  @card_max+1,0);
INSERT INTO freighter_move VALUES (@player_id, "truck1", 2, 3, 2,  @card_max+1,0);
INSERT INTO freighter_move VALUES (@player_id, "truck1", 3, 5, 4,  @card_max+1,0);
INSERT INTO freighter_move VALUES (@player_id, "truck3", 0, 4, 2,  @card_max+3,0);
INSERT INTO freighter_move VALUES (@player_id, "truck3", 4, 7, 4,  @card_max+3,0);

INSERT INTO freighter_move VALUES (@player_id, "truck4", 0, 7, 4, @card_max +4,0);

INSERT INTO freighter_move VALUES (@player_id, "truck5", 0, 5, 4, @card_max +4,0);

INSERT INTO freighter_move VALUES (@player_id, "truck6", 0, 8, 4, @card_max +4,0);

INSERT INTO freighter_move VALUES (@player_id, "truck7", 0, 2, 2, @card_max +5,0);
INSERT INTO freighter_move VALUES (@player_id, "truck7", 2, 5, 4, @card_max +5,0);

INSERT INTO freighter_move VALUES (@player_id, "truck8", 0, 3, 2, @card_max +6,0);
INSERT INTO freighter_move VALUES (@player_id, "truck8", 3, 5, 4, @card_max +6,0);

INSERT INTO freighter_move VALUES (@player_id, "truck9", 0, 8, 4,  @card_max +2,0);


/* ---------------------------- ----------------------------   ---------------------------- */
