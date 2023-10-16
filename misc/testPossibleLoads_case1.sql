-- TEST GUI : when there are already placed loads, verify possible positions


-- CLEAN ALL LOADS IN GAME :
UPDATE freighter_cargo SET cargo_amount= null, cargo_card_id= null, cargo_state= 0;

-- PUT SELECT CARDS in "DAY"
UPDATE card SET card_location= "discard" ;

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

select * from freighter_cargo ORDER BY `cargo_player_id` ASC, `cargo_key` ASC LIMIT 100;


