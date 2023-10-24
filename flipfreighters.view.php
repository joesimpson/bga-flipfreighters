<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * FlipFreighters implementation : © joesimpson <1324811+joesimpson@users.noreply.github.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * flipfreighters.view.php
 *
 * This is your "view" file.
 *
 * The method "build_page" below is called each time the game interface is displayed to a player, ie:
 * _ when the game starts
 * _ when a player refreshes the game page (F5)
 *
 * "build_page" method allows you to dynamically modify the HTML generated for the game interface. In
 * particular, you can set here the values of variables elements defined in flipfreighters_flipfreighters.tpl (elements
 * like {MY_VARIABLE_ELEMENT}), and insert HTML block elements (also defined in your HTML template file)
 *
 * Note: if the HTML of your game interface is always the same, you don't have to place anything here.
 *
 */
  
require_once( APP_BASE_PATH."view/common/game.view.php" );
  
class view_flipfreighters_flipfreighters extends game_view
{
    protected function getGameName()
    {
        // Used for translations and stuff. Please do not modify.
        return "flipfreighters";
    }
    
  	function build_page( $viewArgs )
  	{		
  	    // Get players & players number
        $players = $this->game->loadPlayersBasicInfos();
        $players_nbr = count( $players );

        /*********** Place your code below:  ************/
        
        $cards = $this->game->getCurrentDayCards();
        $cardsWithOvertime = array();
        foreach( $cards as $card )
        {
            $cardsWithOvertime[$card["id"]] = $card["type_arg"];
        }
        
        $this->page->begin_block( "flipfreighters_flipfreighters", "ffg_cargo_amount_list" );
        for($k=CARD_VALUE_MIN; $k<=MAX_LOAD; $k++ )
        {
            $classes = "";
            if($k>CARD_VALUE_MAX) {
                $classes = "ffg_no_display";
            }
                
            $this->page->insert_block( "ffg_cargo_amount_list", array( 
                                                    "AMOUNT" => $k,
                                                    "CLASSES" => $classes,
                                                     ) );
        }

        $this->page->begin_block( "flipfreighters_flipfreighters", "ffg_player_trucks_cargo" );
        $this->page->begin_block( "flipfreighters_flipfreighters", "ffg_player_truck_position" );
        $this->page->begin_block( "flipfreighters_flipfreighters", "ffg_player_truck_positions" );
        $this->page->begin_block( "flipfreighters_flipfreighters", "ffg_week_score" );
        $this->page->begin_block( "flipfreighters_flipfreighters", "ffg_overtime_hour" );
        $this->page->begin_block( "flipfreighters_flipfreighters", "ffg_playerBoard" );
        
        foreach( $players as $player_id => $player )
        { 
            $this->page->reset_subblocks( 'ffg_player_trucks_cargo' ); 
            $this->page->reset_subblocks( 'ffg_player_truck_position' ); 
            $this->page->reset_subblocks( 'ffg_player_truck_positions' ); 
            $this->page->reset_subblocks( 'ffg_week_score' ); 
            $this->page->reset_subblocks( 'ffg_overtime_hour' ); 
                                                     
            $player_board = $this->game->getPlayerBoard($player_id);
            $trucks_cargos = $player_board['trucks_cargos'];
        
            //$this->game->dump("VIEW trucks_cargos", $trucks_cargos);
            
            foreach( $trucks_cargos as $truck_id => $truck_cargos )
            {
                foreach( $truck_cargos as $truck_cargo )
                {
                    $card_id = $truck_cargo['card_id'];
                    $card_overtime = $truck_cargo['overtime'];
                    
                    if(array_key_exists($card_id,$cardsWithOvertime) && $this->game->isCurrentPlayerId($player_id) ){
                        $cardsWithOvertime[$card_id] = $truck_cargo['amount'] ;
                    }
                    
                    $this->page->insert_block( "ffg_player_trucks_cargo", array( 
                                                        "PLAYER_ID" => $player_id,
                                                        "CONTAINER_ID" => $truck_cargo['id'],
                                                        "TRUCK_ID" => $truck_cargo['truck_id'],
                                                        "AMOUNT" => $truck_cargo['amount'],
                                                        "STATE" => $truck_cargo['state'],
                                                        "CARD_ID" => $card_id,
                                                        "SPENT_OVERTIME" => $card_overtime,
                                                         ) );
                }
            }
            
            $trucks_positions = $player_board['trucks_positions'];
            $trucks_scores = $player_board['trucks_scores'];
            //$this->game->dump("VIEW trucks_positions", $trucks_positions);
            //TODO JSA FILTER PRIVATE DATAS : current player cannot see "NOT_CONFIRMED" datas from other players
            foreach( $trucks_positions as $trucks_position )
            {
                
                $truck_id = $trucks_position['truck_id'];
                $truckScore = $trucks_scores[$truck_id];
                
                $confirmed_pos = $trucks_position['confirmed_position'] ;
                $not_confirmed_pos = $trucks_position['not_confirmed_position'];
                $confirmed_state = $trucks_position['confirmed_state'];
                $not_confirmed_state = $trucks_position['not_confirmed_state'];
                $truck_material = $this->game->trucks_types[$truck_id];
                $truck_max_position = end($truck_material ['path_size']);
                $score_type = end($truck_material ['delivery_score']);
                $cargo_value_filter = $truck_material ['cargo_value_filter'];
                
                $this->page->reset_subblocks( 'ffg_player_truck_position' ); 
                 //TODO JSA look for cardsWithOvertime 
                 
                for ($k =1; $k<= $truck_max_position; $k++ )
                { //POSITIONS start at 1
                    $classes = " ffg_not_drawn_pos";
                    
                    if( isset($confirmed_pos) && $k<= $confirmed_pos){
                        $classes = " ffg_confirmed_pos";
                    } 
                    else if(isset($not_confirmed_pos) && $k<= $not_confirmed_pos){
                        $classes = " ffg_not_confirmed_pos";
                    }
                    $this->page->insert_block( "ffg_player_truck_position", array( 
                                                            "PLAYER_ID" => $player_id,
                                                            "TRUCK_ID" => $truck_id,
                                                            "INDEX" => $k,
                                                            "CLASSES" => $classes,
                                                             ) );
                }
                
                $this->page->insert_block( "ffg_player_truck_positions", array( 
                                                        "PLAYER_ID" => $player_id,
                                                        "TRUCK_ID" => $truck_id,
                                                        "CONFIRMED_STATE" => $confirmed_state,
                                                        "CONFIRMED_POSITION" => $confirmed_pos,
                                                        "NOT_CONFIRMED_STATE" => $not_confirmed_state,
                                                        "NOT_CONFIRMED_POSITION" => $not_confirmed_pos,
                                                        "SCORE" => $truckScore,
                                                        "SCORE_TYPE" => $score_type,
                                                        "CARGO_VALUE_FILTER" => $cargo_value_filter,
                                                         ) );
                
            }
            
            for($k=1; $k <= NB_ROUNDS;$k++){
                $this->page->insert_block( "ffg_week_score", array( 
                                                    "WK_PLAYER_ID" => $player_id,
                                                    "ROUND" => $k,
                                                     ) );
            }
            
            for($k=1; $k <= NB_OVERTIME_TOKENS;$k++){
                $this->page->insert_block( "ffg_overtime_hour", array( 
                                                    "PLAYER_ID" => $player_id,
                                                    "INDEX" => $k,
                                                     ) );
            }
            
            $playerClass = "";
            if($this->game->isCurrentPlayerId($player_id) ){
                $playerClass = "ffg_current_player";
            }
            else {
                $playerClass = "ffg_other_player";
            }
            $this->page->insert_block( "ffg_playerBoard", array( 
                                                    "PLAYER_ID" => $player_id,
                                                    "PLAYER_CLASS" => $playerClass,
                                                    "PLAYER_NAME" => $player['player_name'],
                                                    "PLAYER_COLOR" => $player['player_color'],
                                                     ) );
        }
        
        $this->page->begin_block( "flipfreighters_flipfreighters", "ffg_cards" );
        $index =0;
        
        //$this->game->dump("VIEW cardsWithOvertime :", $cardsWithOvertime);
        foreach( $cards as $card )
        {
            $card_id = $card['id'];
            $card_value = $card['type_arg'];
            
            // IF current player already used overtime on this card, let's set this info
            $amount = $cardsWithOvertime[$card_id];
            $modifier = $amount - $card_value;
            if( $card['type'] == JOKER_TYPE){
                //Never consider a negative modifier on Jokers
                $modifier = max(0,$modifier); 
                $amount = $modifier + $card_value;
            }
                
            $this->page->insert_block( "ffg_cards", array( 
                                                    "INDEX" => $index,
                                                    "CARD_ID" => $card_id,
                                                    "CARD_SUIT" => $card['type'],
                                                    "CARD_VALUE" => $card_value,
                                                    "AMOUNT" => $amount,
                                                    "MODIFIER" => $modifier,
                                                     ) );
            $index++;
        }

        /*********** Do not change anything below this line  ************/
  	}
}
