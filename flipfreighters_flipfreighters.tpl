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

<div id="ffg_game_container">

<div id="ffg_game_upper">
    <span id="ffg_round_label"></span>
    <input type="range" min="30" max="150" value="60" class="slider" id="ffg_playerBoardSliderSize" list="ffg_slider_values">
    <datalist id="ffg_slider_values">
      <option value="30" label="30"></option>
      <option value="60" label="60"></option>
      <option value="80" label="80"></option>
      <option value="100" label="100"></option>
      <option value="125" label="125"></option>
      <option value="150" label="150"></option>
    </datalist>
</div>
    
<div id="ffg_game_zone">

    <div id="ffg_cards" class="whiteblock">
        <!-- BEGIN ffg_cards -->
        <div id="ffg_card_wrapper_{INDEX}" class="ffg_card_wrapper">
            <div class="ffg_card_buttons_wrapper">
                <a href="#" id="ffg_button_card_plus_{INDEX}" class="ffg_button_card_plus bgabutton bgabutton_green ffg_selectable" onclick="return false;"><span>+1</span></a>
                <a href="#" id="ffg_button_card_minus_{INDEX}" class="ffg_button_card_minus bgabutton bgabutton_red ffg_selectable" onclick="return false;"><span>-1</span></a>
            </div>
            <div class="ffg_card_usage_wrapper ffg_no_display">{CARD_USAGE_LABEL}<span id="ffg_card_usage_{INDEX}" class="ffg_card_usage">0</span>
            </div>
            <div class="ffg_card_buttons_wrapper">
                <!-- BEGIN ffg_cards_suit_modifier -->
                <a href="#" id="ffg_button_card_suit_modifier{INDEX}_{SUIT}" class="ffg_button_card_suit_modifier ffg_button_card_suit_modifier_{SUIT} bgabutton ffg_selectable ffg_no_display {OPT_CLASSES}" onclick="return false;" title="{SUIT_LABEL}" data_suit="{SUIT}"></a>
                <!-- END ffg_cards_suit_modifier -->
            </div>
            
            <div id="ffg_card_{INDEX}" class="ffg_card ffg_selectable {OPT_CLASSES}" data_id="{CARD_ID}" data_suit="{CARD_SUIT}" data_value="{CARD_VALUE}" data_amount='{AMOUNT}'>
                <span id="ffg_cardModifier_{INDEX}" class="ffg_cardModifier" data_value="{MODIFIER}"></span>
            </div>
        </div>
            
        <!-- END ffg_cards -->
    </div>
    
<div id="ffg_all_players_board_wrap" class="">
    <!-- BEGIN ffg_playerBoard -->
     
    <div id="ffg_board_player_container_{PLAYER_ID}" class="ffg_board_container {PLAYER_CLASS}" data_player_id="{PLAYER_ID}">
        <div id="ffg_board_player_{PLAYER_ID}" class="ffg_board" style="outline-color: #{PLAYER_COLOR};">
            
            <span class="ffg_board_title"><h1>
                <span style="color:#{PLAYER_COLOR}; outline-color:#{PLAYER_COLOR};"><img id="ffg_player_avatar_{PLAYER_ID}" class="emblem ffg_player_avatar" src="" alt="">{PLAYER_NAME}</span>
            </h1></span>
            
            <!-- LIST of amounts to select by for JOKER : TODO JSA Could be outside of players loop  -->
            <div id="ffg_cargo_amount_list" class="whiteblock ffg_hidden">
                <div id="ffg_arrow" class="ffg_arrow"><i class="fa fa-arrow-up"></i></div>
                <div id="ffg_cargo_amount_loading" class=""><i class="fa fa-spinner fa-spin"></i> </div>
                <!-- BEGIN ffg_cargo_amount_list -->
                    <div id="ffg_cargo_amount_list_{AMOUNT}" class="ffg_cargo_amount {CLASSES}" data_amount="{AMOUNT}">
                        <span class="ffg_container_number">{AMOUNT}</span> 
                    </div>
                <!-- END ffg_cargo_amount_list -->
                <div id="ffg_close_amount_list" class=""><i class="fa fa-close"></i></div>
            </div>
            
            <div id="ffg_board_trucks_wrapper">
                <!-- BEGIN ffg_player_trucks_cargo -->
            
                    <div id="ffg_container_{PLAYER_ID}_{CONTAINER_ID}" class="ffg_container" data_id="{CONTAINER_ID}"  data_player="{PLAYER_ID}" data_truck="{TRUCK_ID}" data_amount="{AMOUNT}" data_state="{STATE}" data_card="{CARD_ID}" data_overtime="{SPENT_OVERTIME}">
                        <span class="ffg_container_number">{AMOUNT}</span> 
                    </div>
                    
                <!-- END ffg_player_trucks_cargo -->
                
                <!-- BEGIN ffg_player_truck_positions -->
                    <div id="ffg_truck_{PLAYER_ID}_{TRUCK_ID}" class="ffg_truck" data_id="{TRUCK_ID}"  data_player="{PLAYER_ID}"  data_confirmed_state="{CONFIRMED_STATE}" data_confirmed_position="{CONFIRMED_POSITION}" data_not_confirmed_state="{NOT_CONFIRMED_STATE}" data_not_confirmed_position="{NOT_CONFIRMED_POSITION}" data_score="{SCORE}">
                    
                        <!-- BEGIN ffg_player_truck_position -->
                        <div id="ffg_truck_pos_{PLAYER_ID}_{TRUCK_ID}_{INDEX}" class="ffg_truck_pos {CLASSES}" data_position="{INDEX}" data_player="{PLAYER_ID}" data_truck="{TRUCK_ID}"></div>
                        <!-- END ffg_player_truck_position -->
                        
                        
                        <div id="ffg_score_{PLAYER_ID}_{TRUCK_ID}" class="ffg_truck_score ffg_score_{SCORE_TYPE}">
                            <span class="ffg_score_number">{SCORE}</span>
                        </div>
                        <div id="ffg_score_right_{PLAYER_ID}_{TRUCK_ID}" class="ffg_truck_score_right">
                            <span class="ffg_score_number">{SCORE}</span>
                        </div>
                        
                        <div id="ffg_symbol_{PLAYER_ID}_{TRUCK_ID}" class="ffg_truck_symbol ffg_truck_symbol_{CARGO_VALUE_FILTER}"></div>
                        <div id="ffg_symbol_path_size_{PLAYER_ID}_{TRUCK_ID}" class="ffg_symbol_path_size"></div>
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
            
            <div id="ffg_total_score_{PLAYER_ID}" class="ffg_total_score" data_player="{PLAYER_ID}">
                <span class="ffg_score_number"></span>
            </div>
            
            <div id="ffg_board_overtime_wrapper">
                <!-- BEGIN ffg_overtime_hour -->
                <div id="ffg_overtime_{PLAYER_ID}_{INDEX}" class="ffg_overtime ffg_empty_value" data_player="{PLAYER_ID}" data_index="{INDEX}">
                    <i class="fa fa-plus fa-2x ffg_icon_overtime_plus"></i>
                    <i class="fa fa-minus fa-2x ffg_icon_overtime_minus"></i>
                    <i class="fa fa-times fa-3x ffg_icon_overtime_used"></i>
                </div>
                <!-- END ffg_overtime_hour -->
            </div>
        </div>
    </div>
    <!-- END ffg_playerBoard -->
</div>
    
</div>
</div>

<script type="text/javascript">

// Javascript HTML templates

/*
// Example:
var jstpl_some_game_item='<div class="my_game_item" id="my_game_item_${MY_ITEM_ID}"></div>';

*/
var jstpl_player_board_details = '\<div class="ffg_player_panel_details" id="ffg_player_panel_details_${player_id}">\
        <div id="ffg_show_board_${player_id}" class="ffg_show_board">\
            <i class="fa fa-eye ffg_icon_show_board"></i>\
        </div>\
        <div id="ffg_show_score_${player_id}" class="ffg_show_score">\
            <span id="ffg_icon_show_score_${player_id}" class="fa-stack ffg_icon_show_score">\
                <i class="fa fa-calendar-o fa-stack-2x"></i>\
                <i class="fa fa-star fa-stack-1x "></i>\
            </span>\
        </div>\
        <div id="ffg_overtime_wrapper_${player_id}" class="ffg_overtime_wrapper"><i class="fa fa-clock-o ffg_icon_overtime" id="ffg_icon_overtime_${player_id}" aria-hidden="true"></i><span id="ffg_overtime_${player_id}" class="ffg_overtime_count ffg_player_panel_counter">0</span></div>\
        <div id="ffg_delivered_trucks_wrapper_${player_id}" class="ffg_delivered_trucks_wrapper"><i class="fa fa-truck fa-flip-horizontal ffg_icon_delivered_trucks" id="ffg_icon_delivered_trucks_${player_id}" aria-hidden="true"></i><span id="ffg_stat_delivered_trucks_${player_id}" class="ffg_stat_delivered_trucks ffg_player_panel_counter">0</span></div>\
    </div>';


var jstpl_showScore = `<div id="ffg_showScoreDialogContent">\
        <table id='ffg_players_overview'>
          <thead>
            <tr>
              <th id="ffg_overview_user"><i class="fa fa-user"></i></th>
              <th id="ffg_overview_week1"><div></div></th>
              <th id="ffg_overview_week2"><div></div></th>
              <th id="ffg_overview_week3"><div></div></th>
              <th id="ffg_overview_overtime"><i class="fa fa-clock-o"></i></th>
              <th id="ffg_overview_deliveredtrucks"><i class="fa fa-truck fa-flip-horizontal"></i></th>
              <th id="ffg_overview_total"><i class="fa fa-star"></i></th>
            </tr>
          </thead>
          <tbody id="ffg_overview_body"></tbody>
        </table>
    </div>`;
    
var jstpl_showScoreRow = '<tr id="ffg_scorerow_${player_id}" class="${trclasses}"><td><span class="playername" style="color:#${player_color};">${player_name}</span></td><td>${score_week1}</td><td>${score_week2}</td><td>${score_week3}</td><td>${overtime}</td><td>${delivered}</td><td>${score}</td></tr>';


////////////////////////////////////////////////////////////////////////////////////
//// Inspired from WTO' SCORE SHEET : display players Board in modal            ////
////////////////////////////////////////////////////////////////////////////////////
var jstpl_playerBoardContainer = `<div id="ffg_modal_player_board_container_\${player_id}" class="ffg_player_board_container">
    <div class='ffg_slideshow_line'>
        <div class="ffg_slideshow_left"><i class="fa fa-arrow-left"></i></div>
        <div style="flex-basis: 50%;cursor: default;"></div>
        <div class="ffg_slideshow_right"><i class="fa fa-arrow-right"></i></div>
    </div>
    <div id="ffg_modal_player_board_holder"></div>
</div>`;
var jstpl_playerBoard = `
    <div id="ffg_modal_player_board_\${player_id}" class="ffg_modal_player_board">
        <div class="ffg_modal_player_board_overlay"></div>
    </div>
`;

</script>  

{OVERALL_GAME_FOOTER}
