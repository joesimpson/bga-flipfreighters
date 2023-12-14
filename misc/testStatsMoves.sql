-- TODO MANUAL : MAKE SOME MOVES DURING TURN

SELECT  @player_id :=player_id  FROM `player` where player_no = 1 ;

select * from freighter_move;

-- getNbCardsForMovesToConfirm
select count(distinct fmove_card_id) 'nbCardsFroMovesDuringTurn' , count(1) 'nbMoves'from freighter_move where fmove_player_id= @player_id AND fmove_state in (1, 3); 

-- listUnconfirmedTurnActions
SELECT * FROM ( SELECT a.fmove_player_id player_id, a.fmove_truck_id truck_id, a.confirmed_state,a.confirmed_position, b.not_confirmed_state,b.not_confirmed_position

        FROM (

        SELECT fmove_player_id, fmove_truck_id, MAX(fmove_state) 'confirmed_state', MAX(fmove_position_to) 'confirmed_position' FROM `freighter_move`

        WHERE fmove_state in (2, 4)

        GROUP by 1,2

        ) a

        left JOIN (

        SELECT fmove_player_id, fmove_truck_id, MAX(fmove_state) 'not_confirmed_state', MAX(fmove_position_to) 'not_confirmed_position' FROM `freighter_move`

        WHERE fmove_state in (1, 3)

        GROUP by 1,2

        ) b

        on a.fmove_player_id = b.fmove_player_id AND a.fmove_truck_id = b.fmove_truck_id

        UNION

        SELECT b.fmove_player_id player_id, b.fmove_truck_id truck_id, a.confirmed_state,a.confirmed_position, b.not_confirmed_state,b.not_confirmed_position

        FROM (

        SELECT fmove_player_id, fmove_truck_id, MAX(fmove_state) 'confirmed_state', MAX(fmove_position_to) 'confirmed_position' FROM `freighter_move`

        WHERE fmove_state in (2, 4)

        GROUP by 1,2

        ) a

        right JOIN (

        SELECT fmove_player_id, fmove_truck_id, MAX(fmove_state) 'not_confirmed_state', MAX(fmove_position_to) 'not_confirmed_position' FROM `freighter_move`

        WHERE fmove_state in (1, 3)

        GROUP by 1,2

        ) b

        on a.fmove_player_id = b.fmove_player_id AND a.fmove_truck_id = b.fmove_truck_id

        ORDER BY 1,2

        ) c WHERE not_confirmed_state in (1,3 )
        ;


-- STATS BEFORE CONFIRM END TURN :
-- stat_player_loading, stat_player_moving, stat_total_distance
SELECT * FROM `stats` where `stats_type` in (20,21,23); 

-- TODO : MANUAL CLICK END TURN

-- STATS AFTER CONFIRM END TURN :
-- stat_player_loading, stat_player_moving, stat_total_distance
SELECT * FROM `stats` where `stats_type` in (20,21,23); 
