-- TEST GUI - END ROUND : verify computation & display of score


-- CLEAN ALL MOVES IN GAME :
DELETE FROM freighter_move;


-- CLEAN ALL LOADS IN GAME :
UPDATE freighter_cargo SET cargo_amount= null, cargo_card_id= null, cargo_state= 0;

-- PUT SELECT CARDS in "DAY"
UPDATE card SET card_location= "deck" WHERE card_location= "DAY";
-- TODO JSA INIT ALL LOCATIONS to avoid bugs when looking at week_1 etc....

UPDATE card SET card_location= "DAY" WHERE card_type = 1 AND card_type_arg = 2 LIMIT 1 ;
UPDATE card SET card_location= "DAY" WHERE card_type = 2 AND card_type_arg = 5 LIMIT 1 ;
UPDATE card SET card_location= "DAY" WHERE card_type = 4 AND card_type_arg = 6 LIMIT 1 ;

-- player 1
--  2 of spade, STATUS to be CONFIRMED
UPDATE freighter_cargo SET cargo_amount= 2, cargo_state= 1, cargo_card_id= (select card_id from card where card_type = 1 AND card_type_arg = 2 and card_location = "DAY" LIMIT 1)
WHERE cargo_key="truck2_1" and cargo_player_id =(select player_id FROM `player` where player_no = 1);

-- player 2
-- 5 HEARTS + 1 overtime hour, STATUS CONFIRMED
UPDATE freighter_cargo SET cargo_amount= 5+1, cargo_state= 2, cargo_card_id= (select card_id from card where card_type = 2 AND card_type_arg = 5 and card_location = "DAY" LIMIT 1)
WHERE cargo_key="truck2_2" and cargo_player_id =(select player_id FROM `player` where player_no = 2);


-- player 1
--  6 of DIAMOND - 2 Overtime hours, STATUS CONFIRMED
UPDATE freighter_cargo SET cargo_amount= 6-2, cargo_state= 2, cargo_card_id= (select card_id from card where card_type = 4 AND card_type_arg = 6 and card_location = "DAY" LIMIT 1)
WHERE cargo_key="truck1_3" and cargo_player_id =(select player_id FROM `player` where player_no = 1);

UPDATE freighter_cargo SET cargo_amount= 3, cargo_state= 2, cargo_card_id= 7
WHERE cargo_key="truck5_2" and cargo_player_id =(select player_id FROM `player` where player_no = 1);

UPDATE freighter_cargo SET cargo_amount= 5, cargo_state= 2, cargo_card_id= 7
WHERE cargo_key="truck8_2" and cargo_player_id =(select player_id FROM `player` where player_no = 1);
UPDATE freighter_cargo SET cargo_amount= 2, cargo_state= 2, cargo_card_id= 7
WHERE cargo_key="truck8_1" and cargo_player_id =(select player_id FROM `player` where player_no = 1);

UPDATE freighter_cargo SET cargo_amount= 6, cargo_state= 2, cargo_card_id= 7
WHERE cargo_key="truck9_0" and cargo_player_id =(select player_id FROM `player` where player_no = 1);
UPDATE freighter_cargo SET cargo_amount= 1, cargo_state= 2, cargo_card_id= 7
WHERE cargo_key="truck9_3" and cargo_player_id =(select player_id FROM `player` where player_no = 1);




-- player 2
UPDATE freighter_cargo SET cargo_amount= 3, cargo_state= 2, cargo_card_id= 7
WHERE cargo_key="truck3_1" and cargo_player_id =(select player_id FROM `player` where player_no = 2);

UPDATE freighter_cargo SET cargo_amount= 4, cargo_state= 2, cargo_card_id= 7
WHERE cargo_key="truck5_1" and cargo_player_id =(select player_id FROM `player` where player_no = 2);




-- INSERT DATA SAMPLES, don't care about the real card_id for now

/* ---------------------------- ----------------------------   ---------------------------- */
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck1", 0, 2, 2, 15);
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck1", 2, 3, 2, 35);
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck1", 3, 4, 1, 45);

INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck2", 0, 1, 2, 7);

-- truck 3 NOT DELIVERED by player 1
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck3", 0, 4, 2, 12);
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck3", 4, 6, 1, 25);

-- truck 4
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck4", 0, 1, 1, 7);

-- truck 5 DELIVERED by player 1
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck5", 0, 5, 3, 7);

-- truck 6
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck6", 0, 1, 2, 7);

-- truck 7
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck7", 0, 2, 2, 7);
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck7", 2, 3, 1, 7);

-- truck 8 DELIVERED at "x1" (half path)
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck8", 0, 3, 2, 7);
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck8", 3, 5, 3, 7);

-- truck 9 DELIVERED at "x2" (full path)
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck9", 0, 5, 2, 7);
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 1), "truck9", 5, 8, 3, 7);
/* ---------------------------- ----------------------------   ---------------------------- */

INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 2), "truck2", 0, 1, 1, 11);
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 2), "truck2", 1, 3, 1, 12);

-- truck 3 DELIVERED by player 2
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 2), "truck3", 0, 5, 2, 12);
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 2), "truck3", 5, 7, 3, 25);

-- truck 5 DELIVERED by player 2
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 2), "truck5", 0, 2, 2, 7);
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 2), "truck5", 2, 5, 3, 7);

/* ---------------------------- ----------------------------   ---------------------------- */


select * from freighter_cargo ORDER BY `cargo_player_id` ASC, `cargo_key` ASC LIMIT 100;


SELECT * FROM `freighter_move`  ORDER BY `freighter_move`.`fmove_player_id` ASC, `freighter_move`.`fmove_truck_id` ASC, `freighter_move`.`fmove_position_from` ASC, `freighter_move`.`fmove_state` ASC LIMIT 100;


-- NO FULL JOIN in mysql ! use  LEFT JOIN ...UNION...RIGHT JOIN :
SELECT a.fmove_player_id, a.fmove_truck_id, a.confirmed_state,a.confirmed_position, b.not_confirmed_state,b.not_confirmed_position
FROM (
    SELECT fmove_player_id, fmove_truck_id, MAX(fmove_state) 'confirmed_state', MAX(fmove_position_to) 'confirmed_position' FROM `freighter_move`  
    WHERE fmove_state = 2 or fmove_state = 4
    GROUP by 1,2
    ) a
 left JOIN  (
    SELECT fmove_player_id, fmove_truck_id, MAX(fmove_state) 'not_confirmed_state', MAX(fmove_position_to) 'not_confirmed_position' FROM `freighter_move`  
    WHERE fmove_state = 1 or fmove_state = 3
    GROUP by 1,2
  ) b 
  on a.fmove_player_id = b.fmove_player_id AND  a.fmove_truck_id = b.fmove_truck_id 
UNION 
SELECT b.fmove_player_id, b.fmove_truck_id, a.confirmed_state,a.confirmed_position, b.not_confirmed_state,b.not_confirmed_position
FROM (
    SELECT fmove_player_id, fmove_truck_id, MAX(fmove_state) 'confirmed_state', MAX(fmove_position_to) 'confirmed_position' FROM `freighter_move`  
    WHERE fmove_state = 2 or fmove_state = 4
    GROUP by 1,2
    ) a
 right JOIN  (
    SELECT fmove_player_id, fmove_truck_id, MAX(fmove_state) 'not_confirmed_state', MAX(fmove_position_to) 'not_confirmed_position' FROM `freighter_move`  
    WHERE fmove_state = 1 or fmove_state = 3
    GROUP by 1,2
  ) b 
  on a.fmove_player_id = b.fmove_player_id AND  a.fmove_truck_id = b.fmove_truck_id 
ORDER BY 1,2
;




-- RESET 	Active state id to playerTurn
UPDATE global SET global_value='12' WHERE global_id='1';
-- RESET 	Active player id to player1
UPDATE global SET global_value=(select player_id FROM `player` where player_no = 1) WHERE global_id='2';


-- RESET ALL PLAYERS TO INACTIVE except P1
UPDATE player SET player_is_multiactive=0;
UPDATE player SET player_is_multiactive=1 where player_no = 1;

-- SET ROUND => 1/3
UPDATE global SET global_value='1' WHERE global_id='10';
-- SET TURN => 5/5
UPDATE global SET global_value='5' WHERE global_id='11';


-- CHECK SCORING AFTER running the script + click "End round"
SELECT * FROM `stats` WHERE stats_type in (10,11,12) order by stats_type,stats_player_id LIMIT 100;
-- PLAYER 1 MUST HAVE 24 points for week1
-- PLAYER 1 MUST HAVE 7 points for week1