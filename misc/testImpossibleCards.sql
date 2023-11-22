-- TEST GUI : 1 PLAYER - when there are already moved trucks, verify possible positions -> this currently leads to 3 disabled cards in the river, and we may need to improve the code to make them suit modifiable...


-- PUT CARDS in "DAY"
UPDATE card SET card_location= "deck" ;

UPDATE card SET card_location= "DAY" WHERE card_type = 2 AND card_type_arg = 2 LIMIT 1 ;
UPDATE card SET card_location= "DAY" WHERE card_type = 2 AND card_type_arg = 5 LIMIT 1 ;
UPDATE card SET card_location= "DAY" WHERE card_type = 2 AND card_type_arg = 6 LIMIT 1 ;

/* ---------------------------- ----------------------------   ---------------------------- */
/* ---------------------------- ----------------------------   ---------------------------- */

-- CLEAN ALL LOADS IN GAME :
DELETE FROM freighter_cargo ;

/* ---------------------------- ----------------------------   ---------------------------- */
/* ---------------------------- ----------------------------   ---------------------------- */
-- CLEAN ALL MOVES IN GAME :
DELETE FROM freighter_move;

-- INSERT DATA SAMPLES, don't care about the real card_id for now

/* ---------------------------- ----------------------------   ---------------------------- */
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck1", 0, 2, 2, 15,0);
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck1", 2, 3, 2, 35,0);
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck1", 3, 4, 1, 45,0);

INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck2", 0, 1, 2, 7,0);

INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck3", 0, 4, 2, 12,0);
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck3", 4, 6, 1, 25,0);

INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck4", 0, 1, 1, 7,0);

INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck5", 0, 5, 3, 7,0);

INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck6", 0, 1, 2, 7,0);

INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck7", 0, 2, 2, 7,0);
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck7", 2, 3, 1, 7,0);

INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck8", 0, 3, 2, 7,0);
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck8", 3, 5, 3, 7,0);

/* ---------------------------- ----------------------------   ---------------------------- */
