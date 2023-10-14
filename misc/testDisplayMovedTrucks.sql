-- TEST GUI : verify display of player already moved trucks


-- CLEAN ALL MOVES IN GAME :
DELETE FROM freighter_move;

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

-- truck 5 not DELIVERED by player 2
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 2), "truck5", 0, 2, 2, 7);
INSERT INTO freighter_move VALUES ((select player_id FROM `player` where player_no = 2), "truck5", 2, 5, 1, 7);

/* ---------------------------- ----------------------------   ---------------------------- */

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