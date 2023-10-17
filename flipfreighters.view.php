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


        /*
        
        // Examples: set the value of some element defined in your tpl file like this: {MY_VARIABLE_ELEMENT}

        // Display a specific number / string
        $this->tpl['MY_VARIABLE_ELEMENT'] = $number_to_display;

        // Display a string to be translated in all languages: 
        $this->tpl['MY_VARIABLE_ELEMENT'] = self::_("A string to be translated");

        // Display some HTML content of your own:
        $this->tpl['MY_VARIABLE_ELEMENT'] = self::raw( $some_html_code );
        
        */
        
        /*
        
        // Example: display a specific HTML block for each player in this game.
        // (note: the block is defined in your .tpl file like this:
        //      <!-- BEGIN myblock --> 
        //          ... my HTML code ...
        //      <!-- END myblock --> 
        

        $this->page->begin_block( "flipfreighters_flipfreighters", "myblock" );
        foreach( $players as $player )
        {
            $this->page->insert_block( "myblock", array( 
                                                    "PLAYER_NAME" => $player['player_name'],
                                                    "SOME_VARIABLE" => $some_value
                                                    ...
                                                     ) );
        }
        
        */
        
        $cards = $this->game->getCurrentDayCards();
        
        $this->page->begin_block( "flipfreighters_flipfreighters", "ffg_cards" );
        $index =0;
        foreach( $cards as $card )
        {
            $this->page->insert_block( "ffg_cards", array( 
                                                    "INDEX" => $index,
                                                    "CARD_ID" => $card['id'],
                                                    "CARD_SUIT" => $card['type'],
                                                    "CARD_VALUE" => $card['type_arg'],
                                                     ) );
            $index++;
        }

        $this->page->begin_block( "flipfreighters_flipfreighters", "ffg_player_trucks_cargo" );
        $this->page->begin_block( "flipfreighters_flipfreighters", "ffg_player_truck_position" );
        $this->page->begin_block( "flipfreighters_flipfreighters", "ffg_player_truck_positions" );

        foreach( $players as $player_id => $player )
        { 
            $player_board = $this->game->getPlayerBoard($player_id);
            $trucks_cargos = $player_board['trucks_cargos'];
        
            //$this->game->dump("VIEW trucks_cargos", $trucks_cargos);
            
            foreach( $trucks_cargos as $truck_id => $truck_cargos )
            {
                foreach( $truck_cargos as $truck_cargo )
                {
                    $this->page->insert_block( "ffg_player_trucks_cargo", array( 
                                                        "PLAYER_ID" => $player_id,
                                                        "CONTAINER_ID" => $truck_cargo['id'],
                                                        "TRUCK_ID" => $truck_cargo['truck_id'],
                                                        "AMOUNT" => $truck_cargo['amount'],
                                                        "STATE" => $truck_cargo['state'],
                                                        "CARD_ID" => $truck_cargo['card_id'],
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
                $not_confirmed_state = $trucks_position['not_confirmed_state']  ;
                $truck_max_position = end($this->game->trucks_types[$truck_id]['path_size']);
                
                $this->page->reset_subblocks( 'ffg_player_truck_position' ); 
                
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
                                                         ) );
                
            }
            //TODO JSA use material file to add trucks which are not moved yet
            
        }

        /*********** Do not change anything below this line  ************/
  	}
}
