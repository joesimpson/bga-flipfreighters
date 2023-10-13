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

<center> <h1>   Work IN PROGRESS... </h1></center>

<div id="ffg_game_zone">

    <div id="ffg_cards">
        <!-- BEGIN ffg_cards -->
    
            <div id="ffg_card_{INDEX}" class="ffg_card ffg_selectable" data_id="{CARD_ID}" data_suit="{CARD_SUIT}" data_value="{CARD_VALUE}"></div>
            
        <!-- END ffg_cards -->
    </div>
    
    <!-- TODO JSA Display other players boards somewhere-->
    <div id="ffg_board_current_player_container">
        <div id="ffg_board_current_player" class="ffg_board">
        
            <div id="ffg_board_trucks_wrapper">
                <!-- BEGIN ffg_player_trucks_cargo -->
            
                    <div id="ffg_container_{PLAYER_ID}_{CONTAINER_ID}" class="ffg_container" data_id="{CONTAINER_ID}"  data_player="{PLAYER_ID}" data_truck="{TRUCK_ID}" data_amount="{AMOUNT}" data_state="{STATE}" data_card="{CARD_ID}">
                        <span class="ffg_container_number">{AMOUNT}</span> 
                    </div>
                    
                <!-- END ffg_player_trucks_cargo -->
                
                <!-- BEGIN ffg_player_truck_position -->
                    <div id="ffg_truck_{PLAYER_ID}_{TRUCK_ID}" class="ffg_truck" data_id="{TRUCK_ID}"  data_player="{PLAYER_ID}"  data_confirmed_state="{CONFIRMED_STATE}" data_confirmed_position="{CONFIRMED_POSITION}" data_not_confirmed_state="{NOT_CONFIRMED_STATE}" data_not_confirmed_position="{NOT_CONFIRMED_POSITION}">
                    
                    </div>
                <!-- END ffg_player_truck_position -->
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
