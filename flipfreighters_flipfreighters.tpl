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
    <input type="range" min="5" max="30" value="10" class="ffg_slider" id="ffg_cardsSliderSize" list="ffg_slider_values">
    <span id="ffg_round_label"></span>
    <input type="range" min="5" max="100" value="60" class="ffg_slider" id="ffg_playerBoardSliderSize" list="ffg_slider_values">
    <datalist id="ffg_slider_values">
        <option value="5" label="5"></option>
        <option value="10" label="10"></option>
        <option value="20" label="20"></option>
        <option value="30" label="30"></option>
        <option value="50" label="50"></option>
        <option value="80" label="80"></option>
        <option value="100" label="100"></option>
    </datalist>
</div>
    
<div id="ffg_game_zone">

    <div id="ffg_cards_container" class="whiteblock">
        <div id="ffg_cards_sticky">
        <div id="ffg_cards_resizable">
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
                <span id="ffg_cardModifier_{INDEX}" class="ffg_cardModifier ffg_noselect_text" data_value="{MODIFIER}"></span>
            </div>
        </div>
            
        <!-- END ffg_cards -->
        <div id="ffg_discard_pile_wrapper" class="ffg_no_display">
            <div id="ffg_discard_pile" class="ffg_card_back"></div>
            <div id="ffg_discard_pile_size" class="ffg_deck_size">0</div>
        </div>
        </div>
        </div>
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
                        <div id="ffg_truck_pos_{PLAYER_ID}_{TRUCK_ID}_{INDEX}" class="ffg_truck_pos {CLASSES}" data_position="{INDEX}" data_player="{PLAYER_ID}" data_truck="{TRUCK_ID}">
                            <i class="fa fa-truck fa-flip-horizontal ffg_icon_truck_pos {ICON_CLASSES}" id="ffg_truck_pos_{PLAYER_ID}_{TRUCK_ID}_{INDEX}_icon" aria-hidden="true"></i>
                        </div>
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
            
            <div id="ffg_board_overtime_wrapper_{PLAYER_ID}" class="ffg_board_overtime_wrapper">
                <!-- BEGIN ffg_overtime_hour -->
                <div id="ffg_overtime_{PLAYER_ID}_{INDEX}" class="ffg_overtime ffg_empty_value" data_player="{PLAYER_ID}" data_index="{INDEX}">
                    <i class="fa fa-plus fa-2x ffg_icon_overtime_plus"></i>
                    <i class="fa fa-minus fa-2x ffg_icon_overtime_minus"></i>
                    <i class="fa fa-times fa-3x ffg_icon_overtime_used"></i>
                </div>
                <!-- END ffg_overtime_hour -->
            </div>
            
            <!-- Some viewer for drawing lines on the board : lines are at fixed positions, but may be hidden at start -->
            <svg class="svg-viewer ffg_truck_lines" viewBox="-30 10 1400 1080">
                <line id="ffg_truck_line_{PLAYER_ID}_truck1_1" class="ffg_truck_line ffg_hidden" x1="845" y1="182" x2="855" y2="240"></line> 
                <line id="ffg_truck_line_{PLAYER_ID}_truck1_2" class="ffg_truck_line ffg_hidden" x1="855" y1="260" x2="855" y2="310"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck1_3" class="ffg_truck_line ffg_hidden" x1="850" y1="340" x2="850" y2="420"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck1_4" class="ffg_truck_line ffg_hidden" x1="850" y1="450" x2="830" y2="500"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck1_5" class="ffg_truck_line ffg_hidden" x1="820" y1="525" x2="820" y2="575"></line>
                
                <line id="ffg_truck_line_{PLAYER_ID}_truck2_1" class="ffg_truck_line ffg_hidden" x1="500" y1="140" x2="490" y2="170"></line> 
                <line id="ffg_truck_line_{PLAYER_ID}_truck2_2" class="ffg_truck_line ffg_hidden" x1="490" y1="200" x2="490" y2="245"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck2_3" class="ffg_truck_line ffg_hidden" x1="485" y1="275" x2="465" y2="335"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck2_4" class="ffg_truck_line ffg_hidden" x1="465" y1="365" x2="465" y2="410"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck2_5" class="ffg_truck_line ffg_hidden" x1="465" y1="450" x2="440" y2="500"></line>
                
                <line id="ffg_truck_line_{PLAYER_ID}_truck3_1" class="ffg_truck_line ffg_hidden" x1="380" y1="190" x2="412" y2="206"></line> 
                <line id="ffg_truck_line_{PLAYER_ID}_truck3_2" class="ffg_truck_line ffg_hidden" x1="437" y1="222" x2="461" y2="243"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck3_3" class="ffg_truck_line ffg_hidden" x1="493" y1="268" x2="553" y2="277"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck3_4" class="ffg_truck_line ffg_hidden" x1="575" y1="277" x2="665" y2="270"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck3_5" class="ffg_truck_line ffg_hidden" x1="690" y1="270" x2="763" y2="270"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck3_6" class="ffg_truck_line ffg_hidden" x1="785" y1="275" x2="825" y2="310"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck3_7" class="ffg_truck_line ffg_hidden" x1="865" y1="325" x2="925" y2="380"></line>
                
                <line id="ffg_truck_line_{PLAYER_ID}_truck4_1" class="ffg_truck_line ffg_hidden" x1="380" y1="390" x2="435" y2="430"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck4_2" class="ffg_truck_line ffg_hidden" x1="480" y1="430" x2="530" y2="425"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck4_3" class="ffg_truck_line ffg_hidden" x1="570" y1="430" x2="710" y2="470"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck4_4" class="ffg_truck_line ffg_hidden" x1="735" y1="470" x2="825" y2="440"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck4_5" class="ffg_truck_line ffg_hidden" x1="860" y1="440" y2="440" x2="924"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck4_6" class="ffg_truck_line ffg_hidden" x1="940" y1="440" x2="1010" y2="455"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck4_7" class="ffg_truck_line ffg_hidden" x1="1030" y1="460" x2="1120" y2="425"></line>
                
                <line id="ffg_truck_line_{PLAYER_ID}_truck5_1" class="ffg_truck_line ffg_hidden" x1="380" y1="616" x2="490" y2="628"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck5_2" class="ffg_truck_line ffg_hidden" x1="525" y1="628" x2="620" y2="650"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck5_3" class="ffg_truck_line ffg_hidden" x1="640" y1="648" x2="740" y2="640"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck5_4" class="ffg_truck_line ffg_hidden" x1="775" y1="640" x2="890" y2="655"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck5_5" class="ffg_truck_line ffg_hidden" x1="900" y1="655" x2="1040" y2="510"></line>
                
                <line id="ffg_truck_line_{PLAYER_ID}_truck6_1" class="ffg_truck_line ffg_hidden" x1="430" y1="770" x2="450" y2="740"></line> 
                <line id="ffg_truck_line_{PLAYER_ID}_truck6_2" class="ffg_truck_line ffg_hidden" x1="470" y1="730" x2="510" y2="735"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck6_3" class="ffg_truck_line ffg_hidden" x1="520" y1="735" x2="510" y2="690"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck6_4" class="ffg_truck_line ffg_hidden" x1="510" y1="690" x2="515" y2="640"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck6_5" class="ffg_truck_line ffg_hidden" x1="515" y1="620" x2="530" y2="570"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck6_6" class="ffg_truck_line ffg_hidden" x1="530" y1="550" x2="530" y2="500"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck6_7" class="ffg_truck_line ffg_hidden" x1="530" y1="490" x2="560" y2="440"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck6_8" class="ffg_truck_line ffg_hidden" x1="560" y1="410" x2="575" y2="370"></line>
                
                <line id="ffg_truck_line_{PLAYER_ID}_truck7_1" class="ffg_truck_line ffg_hidden" x1="700" y1="880" x2="730" y2="850"></line> 
                <line id="ffg_truck_line_{PLAYER_ID}_truck7_2" class="ffg_truck_line ffg_hidden" x1="730" y1="840" x2="790" y2="830"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck7_3" class="ffg_truck_line ffg_hidden" x1="790" y1="820" x2="780" y2="770"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck7_4" class="ffg_truck_line ffg_hidden" x1="780" y1="770" x2="700" y2="750"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck7_5" class="ffg_truck_line ffg_hidden" x1="700" y1="750" x2="760" y2="710"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck7_6" class="ffg_truck_line ffg_hidden" x1="760" y1="710" x2="765" y2="660"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck7_7" class="ffg_truck_line ffg_hidden" x1="760" y1="620" x2="760" y2="590"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck7_8" class="ffg_truck_line ffg_hidden" x1="760" y1="565" x2="725" y2="535"></line>
                
                <line id="ffg_truck_line_{PLAYER_ID}_truck8_1" class="ffg_truck_line ffg_hidden" x1="910" y1="860" x2="910" y2="840"></line> 
                <line id="ffg_truck_line_{PLAYER_ID}_truck8_2" class="ffg_truck_line ffg_hidden" x1="910" y1="820" x2="870" y2="790"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck8_3" class="ffg_truck_line ffg_hidden" x1="870" y1="775" x2="910" y2="750"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck8_4" class="ffg_truck_line ffg_hidden" x1="910" y1="750" x2="980" y2="720"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck8_5" class="ffg_truck_line ffg_hidden" x1="980" y1="720" x2="1050" y2="690"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck8_6" class="ffg_truck_line ffg_hidden" x1="1045" y1="690" x2="1045" y2="630"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck8_7" class="ffg_truck_line ffg_hidden" x1="1050" y1="620" x2="1080" y2="600"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck8_8" class="ffg_truck_line ffg_hidden" x1="1090" y1="590" x2="1110" y2="560"></line>
                
                <line id="ffg_truck_line_{PLAYER_ID}_truck9_1" class="ffg_truck_line ffg_hidden" x1="1160" y1="880" x2="1155" y2="870"></line> 
                <line id="ffg_truck_line_{PLAYER_ID}_truck9_2" class="ffg_truck_line ffg_hidden" x1="1150" y1="850" x2="1115" y2="820"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck9_3" class="ffg_truck_line ffg_hidden" x1="1110" y1="800" x2="1090" y2="770"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck9_4" class="ffg_truck_line ffg_hidden" x1="1090" y1="760" x2="1090" y2="720"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck9_5" class="ffg_truck_line ffg_hidden" x1="1090" y1="700" x2="1130" y2="670"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck9_6" class="ffg_truck_line ffg_hidden" x1="1130" y1="660" x2="1160" y2="640"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck9_7" class="ffg_truck_line ffg_hidden" x1="1180" y1="610" x2="1190" y2="590"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck9_8" class="ffg_truck_line ffg_hidden" x1="1200" y1="560" x2="1190" y2="520"></line>
            </svg>
        </div>
    </div>
    <!-- END ffg_playerBoard -->
</div>
    
</div>
</div>

<script type="text/javascript">

// Javascript HTML templates
var jstpl_player_board_details = `<div class="ffg_player_panel_details" id="ffg_player_panel_details_\${player_id}">
        <div id="ffg_show_board_\${player_id}" class="ffg_show_board">
            <i class="fa fa-eye ffg_icon_show_board"></i>
        </div>
        <div id="ffg_show_score_\${player_id}" class="ffg_show_score">
            <span id="ffg_icon_show_score_\${player_id}" class="fa-stack ffg_icon_show_score">
                <i class="fa fa-calendar-o fa-stack-2x"></i>
                <i class="fa fa-star fa-stack-1x "></i>
            </span>
        </div>
        <div id="ffg_overtime_wrapper_\${player_id}" class="ffg_overtime_wrapper">
            <i class="fa fa-clock-o ffg_icon_overtime" id="ffg_icon_overtime_\${player_id}" aria-hidden="true"></i>
            <span id="ffg_overtime_\${player_id}" class="ffg_overtime_count ffg_player_panel_counter">0</span>
        </div>
        <div id="ffg_delivered_trucks_wrapper_\${player_id}" class="ffg_delivered_trucks_wrapper">
            <i class="fa fa-truck fa-flip-horizontal ffg_icon_delivered_trucks" id="ffg_icon_delivered_trucks_\${player_id}" aria-hidden="true"></i>
            <span id="ffg_stat_delivered_trucks_\${player_id}" class="ffg_stat_delivered_trucks ffg_player_panel_counter">0</span>
        </div>
    </div>`;


var jstpl_showScore = `<div id="ffg_showScoreDialogContent">
        <table id='ffg_players_overview'>
          <thead>
            <tr>
              <th id="ffg_overview_user"><i class="fa fa-user"></i></th>
              <th id="ffg_overview_deliveredtrucks"><i class="fa fa-truck fa-flip-horizontal"></i></th>
              <th id="ffg_overview_week1"><div></div></th>
              <th id="ffg_overview_week2"><div></div></th>
              <th id="ffg_overview_week3"><div></div></th>
              <th id="ffg_overview_overtime"><i class="fa fa-clock-o"></i></th>
              <th id="ffg_overview_total"><i class="fa fa-star"></i></th>
            </tr>
          </thead>
          <tbody id="ffg_overview_body"></tbody>
        </table>
    </div>`;
    
var jstpl_showScoreRow = `<tr id="ffg_scorerow_\${player_id}" class="\${trclasses}">
        <td class="ffg_player_col"><span class="playername" style="color:#\${player_color};">\${player_name}</span></td>
        <td class="ffg_delivered_col"><span>\${delivered}</span>/<span>9</span></td>
        <td>\${score_week1}</td>
        <td>\${score_week2}</td>
        <td>\${score_week3}</td>
        <td class="ffg_overtime_col"><span>\${overtime}</span>/<span>5</span></td>
        <td>\${score}</td>
    </tr>`;


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
    </div>
`;

////////////////////////////////////////////////////////////////////////////////////
////                        Show Discard pile in modal                          ////
////////////////////////////////////////////////////////////////////////////////////
var jstpl_discard_cards = `
    <div id="ffg_modal_discard_pile" class="">
        <div id="ffg_modal_discard_pile_content" class="ffg_modal_pile_content">
            <table id="ffg_discard_overview">
                <tbody id="ffg_discard_overview_body">
                </tbody>
            </table>
        </div>
        <hr>
        <h2 id="ffg_modal_deck_title" class="standard_popin_title">\${DECK_TITLE}</h2>
        <div id="ffg_modal_deck_content" class="ffg_modal_pile_content">
            <table id="ffg_deck_overview">
                <tbody id="ffg_deck_overview_body">
                </tbody>
            </table>
        </div>
    </div>
`;
var jstpl_discard_cards_row = `<tr id="ffg_discard_suit_\${suit}" style="color:\${COLOR};">
    <td class="ffg_row_label"><span class="ffg_discard_suit_title">\${name}</span></td><td><img class ="ffg_icon_card_suit ffg_icon_card_suit_\${suit}"></img></td>
    </tr>`;
var jstpl_deck_cards_row = `<tr id="ffg_deck_suit_\${suit}" style="color:\${COLOR};">
    <td class="ffg_row_label"><span class="ffg_deck_suit_title">\${name}</span></td><td><img class ="ffg_icon_card_suit ffg_icon_card_suit_\${suit}"></img></td>
    </tr>`;
var jstpl_discard_cards_cell = `<td id="ffg_discard_\${card_id}" class="ffg_discard_suit_\${suit}_\${value}">\${value_label}</td>`;
var jstpl_deck_cards_cell = `<td id="ffg_deck_\${card_id}" class="ffg_deck_suit_\${suit}_\${value}">\${value_label}</td>`;

var jstpl_tooltipIconTruck =  `<div class='ffg_tooltipIconTruck'>\${description}
    <ul>
        <li class='ffg_tooltipIconTruck_option1'>\${option1}</li>
        <li class='ffg_tooltipIconTruck_option2'>\${option2}</li>
        <li class='ffg_tooltipIconTruck_option3'>\${option3}</li>
    </ul>
<div>
`;


</script>  

{OVERALL_GAME_FOOTER}
