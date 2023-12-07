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
        <div id="ffg_user_settings">
            <i aria-hidden="true" id="ffg_icon_settings" class="fa6 fa6-gear fa6-light fa6-solid"></i>
            <input type="range" min="5" max="30" value="10" class="ffg_slider" id="ffg_cardsSliderSize" list="ffg_slider_values">
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
        <span id="ffg_round_label"></span>
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
    
    <!-- LIST of amounts to select by for JOKER : -->
    <div id="ffg_cargo_amount_list" class="ffg_hidden">
        <div id="ffg_arrow" class="ffg_arrow"><i class="fa fa-arrow-up"></i></div>
        <div id="ffg_cargo_amount_loading" class=""><i class="fa fa-spinner fa-spin"></i> </div>
        <!-- BEGIN ffg_cargo_amount_list -->
            <div id="ffg_cargo_amount_list_{AMOUNT}" class="ffg_cargo_amount {CLASSES}" data_amount="{AMOUNT}">
                <span class="ffg_container_number">{AMOUNT}</span> 
            </div>
        <!-- END ffg_cargo_amount_list -->
        <div id="ffg_close_amount_list" class=""><i class="fa fa-close"></i></div>
    </div>
    
<div id="ffg_all_players_board_wrap" class="">
    
    <!-- BEGIN ffg_playerBoard -->
     
    <div id="ffg_board_player_container_{PLAYER_ID}" class="ffg_board_container {PLAYER_CLASS}" data_player_id="{PLAYER_ID}">
        <div id="ffg_board_player_{PLAYER_ID}" class="ffg_board" style="outline-color: #{PLAYER_COLOR};">
            
            <span class="ffg_board_title"><h1>
                <span style="color:#{PLAYER_COLOR}; outline-color:#{PLAYER_COLOR};"><img id="ffg_player_avatar_{PLAYER_ID}" class="emblem ffg_player_avatar" src="" alt="">{PLAYER_NAME}</span>
            </h1></span>
            
            <div id="ffg_board_trucks_wrapper">
                <!-- BEGIN ffg_player_trucks_cargo -->
            
                    <div id="ffg_container_{PLAYER_ID}_{CONTAINER_ID}" class="ffg_container {CLASSES}" data_id="{CONTAINER_ID}"  data_player="{PLAYER_ID}" data_truck="{TRUCK_ID}" data_amount="{AMOUNT}" data_state="{STATE}" data_card="{CARD_ID}" data_overtime="{SPENT_OVERTIME}">
                        <span class="ffg_container_number">{AMOUNT}</span> 
                    </div>
                    
                <!-- END ffg_player_trucks_cargo -->
                
                <!-- BEGIN ffg_player_truck_positions -->
                    <div id="ffg_truck_{PLAYER_ID}_{TRUCK_ID}" class="ffg_truck" data_id="{TRUCK_ID}"  data_player="{PLAYER_ID}"  data_confirmed_state="{CONFIRMED_STATE}" data_confirmed_position="{CONFIRMED_POSITION}" data_not_confirmed_state="{NOT_CONFIRMED_STATE}" data_not_confirmed_position="{NOT_CONFIRMED_POSITION}" data_score="{SCORE}">
                        <div id="ffg_shape_{PLAYER_ID}_{TRUCK_ID}" class="ffg_truck_shape"></div>
                    
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
                    <div class="ffg_board_week{ROUND}_label ffg_board_week_label">
                        <div class="ffg_board_week_label_simple">{WEEK_LABEL}</div>
                        <svg class="ffg_board_week_label_adjusted">
                            <text class="ffg_board_week_label_adjusted_text" lengthAdjust="spacingAndGlyphs" x="0" y="22" textLength="65"></text>
                        </svg>
                    </div>
                    <span class="ffg_score_number"></span>
                </div>
                <!-- END ffg_week_score -->
            </div>
            
            <div id="ffg_total_score_{PLAYER_ID}" class="ffg_total_score" data_player="{PLAYER_ID}">
                <span class="ffg_score_number"></span>
            </div>
            
            <div id="ffg_board_overtime_wrapper_{PLAYER_ID}" class="ffg_board_overtime_wrapper">
                <div class="ffg_board_overtime_label_simple">{OVERTIME_HOURS_LABEL}</div>
                <div class="ffg_board_overtime_label_adjusted">
                    <svg>
                        <text class="ffg_board_overtime_label_adjusted_text" x="0" y="25" textLength="245" lengthAdjust="spacingAndGlyphs"></text>
                    </svg>
                </div>
                
                <!-- BEGIN ffg_overtime_hour -->
                <div id="ffg_overtime_{PLAYER_ID}_{INDEX}" class="ffg_overtime ffg_empty_value" data_player="{PLAYER_ID}" data_index="{INDEX}">
                    <i class="fa fa-plus fa-2x ffg_icon_overtime_plus"></i>
                    <i class="fa fa-minus fa-2x ffg_icon_overtime_minus"></i>
                    <i class="fa fa-times fa-3x ffg_icon_overtime_used"></i>
                </div>
                <!-- END ffg_overtime_hour -->
            </div>
            
            <!-- Some viewer for drawing lines on the board : lines are at fixed positions, but may be hidden at start -->
            <svg class="svg-viewer ffg_truck_lines ffg_svg_straight_route" viewBox="-30 10 1400 1080">
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
                
                <line id="ffg_truck_line_{PLAYER_ID}_truck4_1" class="ffg_truck_line ffg_hidden" x1="385" y1="395" x2="435" y2="430"></line>
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
                <line id="ffg_truck_line_{PLAYER_ID}_truck9_6" class="ffg_truck_line ffg_hidden" x1="1130" y1="660" x2="1165" y2="640"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck9_7" class="ffg_truck_line ffg_hidden" x1="1180" y1="615" x2="1190" y2="590"></line>
                <line id="ffg_truck_line_{PLAYER_ID}_truck9_8" class="ffg_truck_line ffg_hidden" x1="1195" y1="560" x2="1190" y2="520"></line>
            </svg>
        
            <!-- More accurate lines : SVG generated by drawing on https://fffuel.co/llline/ with the same background( board.jpg) and viewBox="-30 -22 1400 1080" -->
            <svg class="svg-viewer ffg_truck_lines ffg_svg_accurate_route" viewBox="-30 10 1400 1080">
                <path id="ffg_truck_route_{PLAYER_ID}_truck1_1" class="ffg_truck_route" d="M840,183C839.6666666666666,189,836.5,209.1666692097982,838,219C839.5,228.8333307902018,847.1666666666666,238.16665395100912,849,241.99998474121094" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck1_2" class="ffg_truck_route" d="M856,269C854.6666666666666,274.5,849.3333333333334,296.5,848,302" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck1_3" class="ffg_truck_route" d="M846,348.33331298828125C846.3333333333334,353.99997965494794,849.3333333333334,373.33331298828125,848,382.33331298828125C846.6666666666666,391.33331298828125,839,395.99997965494794,838,402.33331298828125C837,408.66664632161456,841.3333333333334,417.33331298828125,842,420.33331298828125" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck1_4" class="ffg_truck_route" d="M839,461.33331298828125C837,467.66664632161456,829,492.99997965494794,827,499.33331298828125" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck1_5" class="ffg_truck_route" d="M818,529.3333129882812C817.6666666666666,530.4999796549479,819.8333333333334,532.4999796549479,816,536.3333129882812C812.1666666666666,540.1666463216146,796,545.6666463216146,795,552.3333129882812C794,558.9999796549479,807.5,572.3333129882812,810,576.3333129882812" ></path>
                
                <path id="ffg_truck_route_{PLAYER_ID}_truck2_1" class="ffg_truck_route" d="M494.9999694824219,143.66665649414062C494.4999694824219,148.33332316080728,492.4999694824219,166.99998982747397,491.9999694824219,171.66665649414062" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck2_2" class="ffg_truck_route" d="M495.9999694824219,201.66665649414062C496.3333028157552,204.66665649414062,499.8333028157552,214.99998982747397,497.9999694824219,219.66665649414062C496.16663614908856,224.33332316080728,487.9999643961589,225.99998982747397,484.9999694824219,229.66665649414062C481.9999745686849,233.33332316080728,480.8333282470703,239.66665649414062,480,241.66665649414062" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck2_3" class="ffg_truck_route" d="M467,282.6666564941406C465.5,285.99998982747394,458,295.8333231608073,458,302.6666564941406C458,309.49998982747394,466,317.8333231608073,467,323.6666564941406C468,329.49998982747394,464.5,335.3333231608073,464,337.6666564941406" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck2_4" class="ffg_truck_route" d="M458,361.6666564941406C457,364.99998982747394,452.5,373.99998982747394,452,381.6666564941406C451.5,389.3333231608073,454.5,403.3333231608073,455,407.6666564941406" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck2_5" class="ffg_truck_route" d="M458,452.3333435058594C457.8333333333333,455.6666768391927,459,466.00001525878906,457,472.3333435058594C455,478.6666717529297,447.8333333333333,487.33331807454425,446,490.33331298828125" ></path>
                
                <path id="ffg_truck_route_{PLAYER_ID}_truck3_1" class="ffg_truck_route" d="M382,189C384.8333333333333,189.16666666666666,394,187.33333333333334,399,190C404,192.66666666666666,409.8333333333333,202.5,412,205" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck3_2" class="ffg_truck_route" d="M429,218.66665649414062C433,220.83332316080728,446.8333333333333,226.83332316080728,453,231.66665649414062C459.1666666666667,236.49998982747397,463.8333333333333,244.99998982747397,466,247.66665649414062"></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck3_3" class="ffg_truck_route" d="M493.9999694824219,272.6666564941406C496.3333028157552,273.8333231608073,502.1666310628255,279.1666564941406,507.9999694824219,279.6666564941406C513.8333079020182,280.1666564941406,521.8333282470703,275.6666564941406,529,275.6666564941406C536.1666717529297,275.6666564941406,547.3333333333334,278.99998982747394,551,279.6666564941406"></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck3_4" class="ffg_truck_route" d="M577,276.6666564941406C581.8333333333334,275.49998982747394,599.1666666666666,274.1666564941406,606,269.6666564941406C612.8333333333334,265.1666564941406,611.6666666666666,250.66665649414062,618,249.66665649414062C624.3333333333334,248.66665649414062,636,260.8333231608073,644,263.6666564941406C652,266.49998982747394,662.3333333333334,266.1666564941406,666,266.6666564941406"></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck3_5" class="ffg_truck_route" d="M686,269.6666564941406C699.1666666666666,270.3333231608073,751.8333333333334,272.99998982747394,765,273.6666564941406"></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck3_6" class="ffg_truck_route" d="M784,282.6666564941406C785.6666666666666,285.8333231608073,789,298.1666564941406,794,301.6666564941406C799,305.1666564941406,808,301.49998982747394,814,303.6666564941406C820,305.8333231608073,827.3333333333334,312.8333231608073,830,314.6666564941406"></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck3_7" class="ffg_truck_route" d="M866,330.6666564941406C869,331.49998982747394,879.3333333333334,330.3333231608073,884,335.6666564941406C888.6666666666666,340.99998982747394,887.1666666666666,355.1666564941406,894,362.6666564941406C900.8333333333334,370.1666564941406,919.8333333333334,377.6666564941406,925,380.6666564941406"></path>
                
                <path id="ffg_truck_route_{PLAYER_ID}_truck4_1" class="ffg_truck_route" d="M381,396.6666564941406C383.8333333333333,396.8333231608073,392.6666666666667,392.1666564941406,398,397.6666564941406C403.3333333333333,403.1666564941406,406.3333333333333,423.8333231608073,413,429.6666564941406C419.6666666666667,435.49998982747394,433.8333333333333,432.1666564941406,438,432.6666564941406" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck4_2" class="ffg_truck_route" d="M480,429.6666564941406C483.3333282470703,428.49998982747394,492.3333028157552,422.99998982747394,499.9999694824219,422.6666564941406C507.66663614908856,422.3333231608073,521.6666615804037,426.8333231608073,526,427.6666564941406" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck4_3" class="ffg_truck_route" d="M570,430.6666564941406C573,431.1666564941406,583.3333333333334,430.8333231608073,588,433.6666564941406C592.6666666666666,436.49998982747394,591,445.6666564941406,598,447.6666564941406C605,449.6666564941406,620.3333333333334,443.8333231608073,630,445.6666564941406C639.6666666666666,447.49998982747394,646.8333333333334,456.99998982747394,656,458.6666564941406C665.1666666666666,460.3333231608073,676.5,454.49998982747394,685,455.6666564941406C693.5,456.8333231608073,703.3333333333334,463.99998982747394,707,465.6666564941406" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck4_4" class="ffg_truck_route" d="M732,469C739.6666666666666,469.5,767.6666666666666,475.1666666666667,778,472C788.3333333333334,468.8333333333333,786.6666666666666,454.5,794,450C801.3333333333334,445.5,817.3333333333334,445.8333333333333,822,445" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck4_5" class="ffg_truck_route" d="M867,441C875.3333333333334,441.3333333333333,908.6666666666666,442.6666666666667,917,443" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck4_6" class="ffg_truck_route" d="M949,447C959.1666564941406,448.5,999.8332824707031,454.5,1009.9999389648438,456" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck4_7" class="ffg_truck_route" d="M1040,457C1042.3333333333333,457,1043.1666666666667,461.5,1054,457C1064.8333333333333,452.5,1093.6666666666667,435,1105,430C1116.3333333333333,425,1119.1666666666667,427.5,1122,427" ></path>
                
                <path id="ffg_truck_route_{PLAYER_ID}_truck5_1" class="ffg_truck_route" d="M382,615C389.5,616,413.6666666666667,617.6666666666666,427,621C440.3333333333333,624.3333333333334,452.8333333333333,633,462,635C471.1666666666667,637,478.6666666666667,633.3333333333334,482,633" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck5_2" class="ffg_truck_route" d="M528,632C533,632.8333333333334,549,633.5,558,637C567,640.5,572.1666666666666,650.5,582,653C591.8333333333334,655.5,611.1666666666666,652.1666666666666,617,652" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck5_3" class="ffg_truck_route" d="M643.5927124023438,652.8526000976562C654.071787516276,653.201904296875,691.0978495279948,656.3456319173177,706.4671630859375,654.9484252929688C721.8364766438802,653.5512186686198,730.9183553059896,646.2158711751302,735.80859375,644.4693603515625" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck5_4" class="ffg_truck_route" d="M778,642C784,641.8333333333334,796.6666666666666,638.6666666666666,814,641C831.3333333333334,643.3333333333334,870.6666666666666,653.5,882,656" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck5_5" class="ffg_truck_route" d="M911,654C915.5,653.1666666666666,931.1666666666666,655.3333333333334,938,649C944.8333333333334,642.6666666666666,944,626,952,616C960,606,974.3333435058594,597.5,986,589C997.6666564941406,580.5,1014.9999389648438,575.8333333333334,1021.9999389648438,565C1028.9999389648438,554.1666666666666,1026.9999898274739,530.8333333333334,1028,524" ></path>
                
                <path id="ffg_truck_route_{PLAYER_ID}_truck6_1" class="ffg_truck_route" d="M429.81951904296875,764.7691650390625C430.1688232421875,761.6254374186198,429.1209259033203,750.7970377604166,431.91534423828125,745.9067993164062C434.7097625732422,741.0165608723959,444.1409149169922,737.1742451985677,446.5860290527344,735.427734375" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck6_2" class="ffg_truck_route" d="M471.73583984375,732.4935913085938C476.6260732014974,733.1921997070312,496.187006632487,735.9866333007812,501.0772399902344,736.6852416992188" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck6_3" class="ffg_truck_route" d="M517.84375,722.0145263671875C518.5423583984375,719.5694071451823,522.3846944173177,711.8847452799479,522.035400390625,707.3438110351562C521.6861063639323,702.8028767903646,516.795888264974,696.864735921224,515.7479858398438,694.7689208984375" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck6_4" class="ffg_truck_route" d="M509.46051025390625,667.5233154296875C508.76190694173175,664.0302937825521,505.9674936930339,650.0582071940104,505.2688903808594,646.565185546875" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck6_5" class="ffg_truck_route" d="M505.2688903808594,604.6488647460938C505.2688903808594,602.5530497233073,502.1251678466797,596.9642130533854,505.2688903808594,592.073974609375C508.41261291503906,587.1837361653646,520.9875030517578,578.1018575032552,524.1312255859375,575.3074340820312" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck6_6" class="ffg_truck_route" d="M532.5144653320312,550.1576538085938C532.1651611328125,543.8702087402344,530.7679443359375,518.7204284667969,530.4186401367188,512.4329833984375" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck6_7" class="ffg_truck_route" d="M536.7061157226562,487.283203125C537.7540181477865,484.48877970377606,541.9456278483073,476.8041127522786,542.9935302734375,470.51666259765625C544.0414326985677,464.2292124430339,542.9935302734375,453.05152893066406,542.9935302734375,449.5585021972656" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck6_8" class="ffg_truck_route" d="M547.1851806640625,405.54638671875C547.5344848632812,403.45057169596356,546.486582438151,398.9096425374349,549.281005859375,392.97149658203125C552.075429280599,387.0333506266276,561.506601969401,373.7598419189453,563.9517211914062,369.9175109863281" ></path>
                
                <path id="ffg_truck_route_{PLAYER_ID}_truck7_1" class="ffg_truck_route" d="M702.2755737304688,879.2007446289062C705.0699869791666,875.7077128092448,716.2476399739584,861.735585530599,719.0420532226562,858.2425537109375" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck7_2" class="ffg_truck_route" d="M740.000244140625,843.5718383789062C746.6369934082031,841.8253275553385,773.1839904785156,834.8392842610677,779.8207397460938,833.0927734375" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck7_3" class="ffg_truck_route" d="M794.491455078125,818.4220581054688C794.8407491048177,815.6276346842448,797.9844360351562,807.9429626464844,796.5872192382812,801.655517578125C795.1900024414062,795.3680725097656,787.8546651204427,784.1904093424479,786.108154296875,780.6973876953125" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck7_4" class="ffg_truck_route" d="M765.1500244140625,768.1224975585938C757.1160583496094,765.6773783365885,724.9801940917969,755.8969014485677,716.9462280273438,753.4517822265625" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck7_5" class="ffg_truck_route" d="M710.6588134765625,736.6852416992188C712.4053243001302,733.5415242513021,714.1518249511719,722.3638712565104,721.1378784179688,717.8229370117188C728.1239318847656,713.2820027669271,747.3355916341146,710.8368530273438,752.5751342773438,709.4396362304688" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck7_6" class="ffg_truck_route" d="M758.862548828125,692.673095703125C758.5132446289062,687.7828674316406,757.1160278320312,668.2219543457031,756.7667236328125,663.3317260742188" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck7_7" class="ffg_truck_route" d="M756.7667236328125,621.4154052734375C756.7667236328125,616.5251668294271,756.7667236328125,596.9642130533854,756.7667236328125,592.073974609375" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck7_8" class="ffg_truck_route" d="M754.6709594726562,564.828369140625C753.9723510742188,561.6846415201823,755.0202433268229,550.5069376627604,750.4793090820312,545.9660034179688C745.9383748372396,541.4250691731771,731.2676798502604,538.979970296224,727.4253540039062,537.582763671875" ></path>
                
                <path id="ffg_truck_route_{PLAYER_ID}_truck8_1" class="ffg_truck_route" d="M911.8571166992188,856.146728515625C911.5078125,853.7016092936198,910.110595703125,843.921132405599,909.7612915039062,841.4760131835938" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck8_2" class="ffg_truck_route" d="M911.8571166992188,814.2304077148438C911.5078125,812.8332010904948,915.3501383463541,809.3401896158854,909.7612915039062,805.84716796875C904.1724446614584,802.3541463216146,883.5635782877604,795.3680928548177,878.3240356445312,793.2722778320312" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck8_3" class="ffg_truck_route" d="M857.3659057617188,776.5057373046875C855.619394938151,773.7113138834635,847.2361450195312,764.6294352213541,846.8868408203125,759.7391967773438C846.5375366210938,754.8489583333334,846.8868204752604,748.9108174641927,855.2700805664062,747.164306640625C863.6533406575521,745.4177958170573,890.2003479003906,748.9108276367188,897.1864013671875,749.2601318359375" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck8_4" class="ffg_truck_route" d="M924.4320068359375,749.2601318359375C927.9250284830729,749.2601318359375,938.0547790527344,752.4038492838541,945.39013671875,749.2601318359375C952.7254943847656,746.1164143880209,964.601816813151,733.5415445963541,968.4441528320312,730.3978271484375" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck8_5" class="ffg_truck_route" d="M989.4022827148438,717.8229370117188C996.3883361816406,714.3299051920573,1024.3325500488281,700.3577779134115,1031.318603515625,696.86474609375" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck8_6" class="ffg_truck_route" d="M1043.8934326171875,678.00244140625C1043.5441487630208,675.5573221842448,1044.2428385416667,668.2219645182291,1041.7977294921875,663.3317260742188C1039.3526204427083,658.4414876302084,1029.5720825195312,653.5512491861979,1029.2227783203125,648.6610107421875C1028.8734741210938,643.7707722981771,1037.9553833007812,636.4354146321615,1039.701904296875,633.9902954101562" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck8_7" class="ffg_truck_route" d="M1058.564208984375,617.2237548828125C1061.358622233073,614.7786356608073,1072.5362752278645,604.9981587727865,1075.3306884765625,602.5530395507812" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck8_8" class="ffg_truck_route" d="M1098.3846435546875,587.88232421875C1100.1311645507812,586.485117594401,1106.7679443359375,583.6907145182291,1108.86376953125,579.4990844726562C1110.9595947265625,575.3074544270834,1110.6102905273438,565.5269673665365,1110.9595947265625,562.7325439453125" ></path>
                
                <path id="ffg_truck_route_{PLAYER_ID}_truck9_1" class="ffg_truck_route" d="M1161.2591552734375,881.2965087890625C1159.8619384765625,878.8513895670573,1154.2730712890625,869.0709126790365,1152.8758544921875,866.6257934570312" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck9_2" class="ffg_truck_route" d="M1140.301025390625,847.7634887695312C1136.4586995442708,843.5718587239584,1121.0893961588542,826.8053385416666,1117.2470703125,822.6137084960938" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck9_3" class="ffg_truck_route" d="M1104.672119140625,801.655517578125C1102.9256184895833,797.8131917317709,1095.9396158854167,782.4438883463541,1094.193115234375,778.6015625" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck9_4" class="ffg_truck_route" d="M1087.9056396484375,755.547607421875C1087.9056396484375,749.9587605794271,1087.9056396484375,727.6033732096354,1087.9056396484375,722.0145263671875" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck9_5" class="ffg_truck_route" d="M1090.00146484375,696.86474609375C1090.3507690429688,694.7689310709635,1087.207051595052,688.1321818033854,1092.0972900390625,684.2898559570312C1096.987528483073,680.4475301106771,1114.8019612630208,675.5573018391927,1119.3428955078125,673.810791015625" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck9_6" class="ffg_truck_route" d="M1140.301025390625,659.1400756835938C1144.492655436198,655.6470540364584,1161.2591756184895,641.6749674479166,1165.4508056640625,638.1819458007812" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck9_7" class="ffg_truck_route" d="M1178.025634765625,617.2237548828125C1179.7721557617188,612.3335164388021,1186.7582397460938,592.7725626627604,1188.5047607421875,587.88232421875" ></path>
                <path id="ffg_truck_route_{PLAYER_ID}_truck9_8" class="ffg_truck_route" d="M1194.792236328125,562.7325439453125C1195.1415405273438,559.5888264973959,1197.2373657226562,550.8562927246094,1196.8880615234375,543.8702392578125C1196.5387573242188,536.8841857910156,1193.39501953125,524.6585591634115,1192.6964111328125,520.8162231445312" ></path>
            </svg>
        
            <div class="ffg_board_overtime_unused_label">
                <div class="ffg_label_simple_1">{LABEL_2000_DOLLARS}</div>
                <div class="ffg_label_simple_2">{PER_UNUSED_LABEL}</div>
                <svg class="ffg_label_adjusted">
                    <text class="ffg_label_adjusted_1" x="2" y="25" lengthAdjust="spacingAndGlyphs" textLength="90"><!-- TODO COPY {2000_DOLLARS_LABEL} in JS to avoid a span --></text>
                    <text class="ffg_label_adjusted_2" x="0" y="40" lengthAdjust="spacingAndGlyphs" textLength="100"><!-- TODO COPY {PER_UNUSED_LABEL} in JS to avoid a span --></text>
                </svg>
            </div>
            <div class="ffg_board_currency_label_simple">{CURRENCY_LABEL}</div>
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
              <th id="ffg_overview_week1"><div id="ffg_overview_week1_content"></div></th>
              <th id="ffg_overview_week2"><div id="ffg_overview_week2_content"></div></th>
              <th id="ffg_overview_week3"><div id="ffg_overview_week3_content"></div></th>
              <th id="ffg_overview_overtime"><i class="fa fa-clock-o"></i></th>
              <th id="ffg_overview_total"><i class="fa fa-star"></i></th>
            </tr>
          </thead>
          <tbody id="ffg_overview_body"></tbody>
        </table>
    </div>`;
    
var jstpl_weekLabel = `<div class="ffg_board_week{ROUND}_label ffg_board_week_label">
    <div class="ffg_board_week_label_simple"></div>
    <svg class="ffg_board_week_label_adjusted">
        <text class="ffg_board_week_label_adjusted_text" lengthAdjust="spacingAndGlyphs" x="0" y="22" textLength="65"></text>
    </svg>
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
