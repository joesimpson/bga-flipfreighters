{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- FlipFreighters implementation : © joesimpson <1324811+joesimpson@users.noreply.github.com>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------
-->

<center>
    <input type="range" min="30" max="150" value="50" class="slider" id="playerBoardSliderSize">
</center>
    
<div id="ffg_game_zone">

    <div id="ffg_cards" class="whiteblock">
        <!-- BEGIN ffg_cards -->
    
            <div id="ffg_card_{INDEX}" class="ffg_card ffg_selectable" data_id="{CARD_ID}" data_suit="{CARD_SUIT}" data_value="{CARD_VALUE}"></div>
            
        <!-- END ffg_cards -->
    </div>
    
    <!-- TODO JSA Display other players boards somewhere-->
    <div id="ffg_board_current_player_container">
        <div id="ffg_board_current_player" class="ffg_board">
                
            <!-- LIST of amounts to select by for JOKER-->
            <div id="ffg_cargo_amount_list" class="whiteblock ffg_hidden">
                 <div id="ffg_cargo_amount_loading" class="ffg_cargo_amount"><span class="ffg_container_number"><i class="fa fa-spinner fa-spin"></i></span> </div>
                <!-- BEGIN ffg_cargo_amount_list -->
                    <div id="ffg_cargo_amount_list_{AMOUNT}" class="ffg_cargo_amount" data_amount="{AMOUNT}">
                        <span class="ffg_container_number">{AMOUNT}</span> 
                    </div>
                <!-- END ffg_cargo_amount_list -->
            </div>
            
            <div id="ffg_board_trucks_wrapper">
                <!-- BEGIN ffg_player_trucks_cargo -->
            
                    <div id="ffg_container_{PLAYER_ID}_{CONTAINER_ID}" class="ffg_container" data_id="{CONTAINER_ID}"  data_player="{PLAYER_ID}" data_truck="{TRUCK_ID}" data_amount="{AMOUNT}" data_state="{STATE}" data_card="{CARD_ID}">
                        <span class="ffg_container_number">{AMOUNT}</span> 
                    </div>
                    
                <!-- END ffg_player_trucks_cargo -->
                
                <!-- BEGIN ffg_player_truck_positions -->
                    <div id="ffg_truck_{PLAYER_ID}_{TRUCK_ID}" class="ffg_truck" data_id="{TRUCK_ID}"  data_player="{PLAYER_ID}"  data_confirmed_state="{CONFIRMED_STATE}" data_confirmed_position="{CONFIRMED_POSITION}" data_not_confirmed_state="{NOT_CONFIRMED_STATE}" data_not_confirmed_position="{NOT_CONFIRMED_POSITION}" data_score="{SCORE}">
                    
                        <!-- BEGIN ffg_player_truck_position -->
                        <div id="ffg_truck_pos_{PLAYER_ID}_{TRUCK_ID}_{INDEX}" class="ffg_truck_pos {CLASSES}" data_position="{INDEX}" data_player="{PLAYER_ID}" data_truck="{TRUCK_ID}"></div>
                        <!-- END ffg_player_truck_position -->
                        
                        
                        <div id="ffg_score_{PLAYER_ID}_{TRUCK_ID}" class="ffg_truck_score">
                            <span class="ffg_score_number">{SCORE}</span>
                        </div>
                        <div id="ffg_score_right_{PLAYER_ID}_{TRUCK_ID}" class="ffg_truck_score_right">
                            <span class="ffg_score_number">{SCORE}</span>
                        </div>
                    </div>
                <!-- END ffg_player_truck_positions -->
            </div>
            
            <div id="ffg_board_weeks_wrapper">
                <!-- BEGIN ffg_week_score -->
                <div id="ffg_week_score_{WK_PLAYER_ID}_{ROUND}" class="ffg_week_score" data_player="{PLAYER_ID}" data_round="{ROUND}">
                    <span class="ffg_score_number"></span>
                </div>
                <!-- END ffg_week_score -->
            </div>
        </div>
    </div>
    
</div>

<script type="text/javascript">

// Javascript HTML templates

/*
// Example:
var jstpl_some_game_item='<div class="my_game_item" id="my_game_item_${MY_ITEM_ID}"></div>';

*/

</script>  

{OVERALL_GAME_FOOTER}
