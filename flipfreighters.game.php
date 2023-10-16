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
  * flipfreighters.game.php
  *
  * This is the main file for your game logic.
  *
  * In this PHP file, you are going to defines the rules of the game.
  *
  */


require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );

//TODO JSA constants file
const JOKER_TYPE = 5;
const JOKER_VALUE = 15;

const NB_CARDS_BY_WEEK = 15;
const NB_CARDS_BY_ROUND = 3;

const DECK_LOCATION_WEEK_1 = "WEEK_1";
const DECK_LOCATION_WEEK_2 = "WEEK_2";
const DECK_LOCATION_WEEK_3 = "WEEK_3";
//For cards we flip over the table :
const DECK_LOCATION_DAY = "DAY";

const STATE_LOAD_INITIAL = 0;
const STATE_LOAD_TO_CONFIRM = 1;
const STATE_LOAD_CONFIRMED = 2;

const STATE_MOVE_TO_CONFIRM = 1;
const STATE_MOVE_CONFIRMED = 2;
const STATE_MOVE_DELIVERED_TO_CONFIRM = 3;
const STATE_MOVE_DELIVERED_CONFIRMED = 4;

class FlipFreighters extends Table
{
	function __construct( )
	{
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();
        
        self::initGameStateLabels( array( 
                "round_number" => 10,
                "turn_number" => 11,
            //      ...
            //    "my_first_game_variant" => 100,
            //    "my_second_game_variant" => 101,
            //      ...
        ) );        
        
        $this->cards = self::getNew( "module.common.deck" );
        $this->cards->init( "card" );
	}
	
    protected function getGameName( )
    {
		// Used for translations and stuff. Please do not modify.
        return "flipfreighters";
    }	

    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame( $players, $options = array() )
    {    
        // Set the colors of the players with HTML color code
        // The default below is red/green/blue/orange/brown
        // The number of colors defined here must correspond to the maximum number of players allowed for the gams
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];
 
        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $values = array();
        foreach( $players as $player_id => $player )
        {
            $color = array_shift( $default_colors );
            $values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."')";
        }
        $sql .= implode( ',', $values );
        self::DbQuery( $sql );
        self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );
        self::reloadPlayersBasicInfos();
        
        /************ Start the game initialization *****/

        // Init global values with their initial values
        self::setGameStateInitialValue( 'round_number', 0 );
        self::setGameStateInitialValue( 'turn_number', 0 );
        
        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        //self::initStat( 'table', 'table_teststat1', 0 );    // Init a table statistics
        //self::initStat( 'player', 'player_teststat1', 0 );  // Init a player statistics (for all players)

        // TODO: setup the initial game situation here
        $this->initDeck();
        $this->initPlayerBoard();

        // Activate first player (which is in general a good idea :) )
        $this->activeNextPlayer();

        /************ End of the game initialization *****/
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas()
    {
        $result = array();
    
        $current_player_id = self::getCurrentPlayerId();    // !! We must only return informations visible by this player !!
    
        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
        $sql = "SELECT player_id id, player_score score FROM player ";
        $result['players'] = self::getCollectionFromDb( $sql );
  
        // TODO: Gather all information about current game situation (visible by player $current_player_id).
        
        $result['round_number'] = self::getGameStateValue( 'round_number');
        $result['turn_number'] = self::getGameStateValue( 'turn_number');
        $result['dayCards'] = $this->getCurrentDayCards();
        
        $trucks = $this->trucks_types;
        $result['material'] = array( 
            'card_types' =>  $this->card_types,
            'trucks_types' =>  $this->trucks_types,
        ); 
  
        return $result;
    }

    /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression()
    {
        // TODO: compute and return the game progression

        return 0;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////    

    /*
        In this space, you can put any utility methods useful for your game logic
    */
    
    
    /**
    Init the deck component with  52 cards:
        + 2->6 + Ace of each suit (color)
        + 2 Joker
        x2 physical decks
    */
    function initDeck()
    {
        // Create cards
        $cards = array();
        foreach( $this->card_types as  $color_id => $color ) // spade, heart, club, diamond
        {
            for( $value=1; $value<=6; $value++ )   //  A,2, 3, 4,5,6
            {
                $cards[] = array( 'type' => $color_id, 'type_arg' => $value, 'nbr' => 2);
            }
        }
        
        //We don't have any need to distinguish jokers :
        $cards[] = array( 'type' => JOKER_TYPE, 'type_arg' => JOKER_VALUE, 'nbr' => 4);

        $this->cards->createCards( $cards, 'deck' );
        
        $this->cards->shuffle( 'deck' );
        
        // then deal out three piles with 15 cards each :
        
        $this->cards->pickCardsForLocation( NB_CARDS_BY_WEEK, 'deck', DECK_LOCATION_WEEK_1,0, true );
        $this->cards->pickCardsForLocation( NB_CARDS_BY_WEEK, 'deck', DECK_LOCATION_WEEK_2,0, true );
        $this->cards->pickCardsForLocation( NB_CARDS_BY_WEEK, 'deck', DECK_LOCATION_WEEK_3,0, true );

        //The extra 7 cards may be removed from the table
        $this->cards->moveAllCardsInLocation( 'deck', 'discard' );
        
    }

    function getCurrentWeekLocation()
    { 
        $round = self::getGameStateValue( 'round_number');
        
        switch($round){
            default:
            case 1: return DECK_LOCATION_WEEK_1;
            case 2: return DECK_LOCATION_WEEK_2;
            case 3: return DECK_LOCATION_WEEK_3;
        }
    }
    
    /**
    Return current turn (day) cards ordered by card id 
    */
    function getCurrentDayCards()
    { 
        $dayCards = $this->cards->getCardsInLocation( DECK_LOCATION_DAY,null,'card_id' );
        return $dayCards;
    }
    
    /**
    Return all possibles loading positions for this card according to its color and value, and according to already loaded trucks from player board
    Example : input : "5 of Hearts" 
        output  array(
                truck1_2,
                truck2_2,
                truck3_5,
                truck4_2,
                truck5_1,truck5_2,truck5_3,truck5_4,truck5_5,truck5_6,
                truck6_1,truck6_2,truck6_3,truck6_4,
            )
    */
    function getPossibleLoadingWithCard($card,$playerBoard)
    { 
        $possibles = array();
        
        //Loop over each container 
        $cargos = $playerBoard['trucks_loading'];
        foreach( $cargos as $container_id => $container )
        {
            if($this->isPossibleLoadingWithCard($card,$container) == false ) {
                continue;
            }
            $possibles[] = $container['id'];
        }
        return $possibles;
    }
    
    function isPossibleLoadingWithCard($card,$container)
    { 
        
        $card_id = $card['id'];
        self::dump("isPossibleLoadingWithCard($card_id)", $container);
        //IF Container is not empty KO
        if( array_key_exists('amount',$container) && $container['amount']>0 ) {
            return false;
        }
        //TODO JSA filter other cases
             
        return true;
    }
    
    function getPossibleMovesWithCard($card,$playerBoard)
    { 
        $possibles = array();
        
        $trucks_positions = $playerBoard['trucks_positions'];
        foreach( $trucks_positions as $truck_position ){
            $truck_id = $truck_position['truck_id'];
            $material = $this->trucks_types[$truck_id];
            $truck_max_position = end($material['path_size']);//TODO JSA GAME RULES
            
            for ($k =1; $k<= $truck_max_position; $k++ ) {
                $position_id = $truck_id."_".$k;
                if($this->isPossibleMoveWithCard($card,$playerBoard,$truck_id,$k) == false ) {
                    continue;
                }
                $possibles[] = $position_id;
            }
        }
        return $possibles;
    }
    function isPossibleMoveWithCard($card,$playerBoard,$truck_id,$k)
    { 
        $card_id = $card['id'];
        self::trace("isPossibleMoveWithCard($card_id,$truck_id,$k)");

        //TODO JSA isPossibleMoveWithCard
             
        return true;
    }
    
    //TODO JSA separate module for player board / truck
    function initPlayerBoard()
    {
        $players = self::loadPlayersBasicInfos();
        
        //CLEAN BEFORE (useful FOR TESTING)
        self::DbQuery( "DELETE FROM freighter_loading " );
        
        $trucks = $this->trucks_types;
        
        //TODO JSA : may be unnecessary if we use material container_ids to retrieve possibles actions, so we insert only when loaded ?
        //Step 1 : prepare an entry for all possible loading in every players trucks :
        $sql = "INSERT INTO freighter_loading (loading_player_id, loading_key) VALUES ";
        $values = array();
        foreach( $players as $player_id => $player )
        {
            foreach( $trucks as $truck_id => $truck ) {
                foreach( $truck['containers'] as $container_id => $container ){
                    $values[] = "( '$player_id', '".$truck_id."_$container_id' )";
                }
            }
        }
        $sql .= implode( ',', $values );
        self::DbQuery( $sql );
    }
    
    function getPlayerBoard($player_id){
        $trucks_loading = array();
        
        $trucks_loading = $this->getCollectionFromDb("SELECT loading_key id,loading_amount  amount, loading_state state,loading_card_id card_id,
            SUBSTRING(loading_key FROM 1 FOR 6) truck_id
            FROM freighter_loading
            WHERE loading_player_id ='$player_id' ");
        
        $trucks_positions = $this->getDoubleKeyCollectionFromDB( $this->getSQLSelectTruckPositions($player_id)) [$player_id];
        
        self::dump("getPlayerBoard($player_id) trucks_positions BEFORE ",$trucks_positions);
        
        //LOOP ON EACH TRUCK to add trucks which are not selected by this player yet
        foreach ($this->trucks_types as $truck_type_id =>  $truck_type){
            if( ! array_key_exists($truck_type_id, $trucks_positions ) ){
                $trucks_positions[$truck_type_id] = array (
                    "player_id" => $player_id,
                    "truck_id" => $truck_type_id,
                    "confirmed_state" => null,
                    "confirmed_position" => null,
                    "not_confirmed_state" => null,
                    "not_confirmed_position" => null,
                );
            }
            
            //TODO JSA DO the same with cargo load
        }
        self::dump("getPlayerBoard($player_id) trucks_positions AFTER ",$trucks_positions);
            
        return array( 
            "trucks_loading" => $trucks_loading,
            "trucks_positions" => $trucks_positions,
        );
    }
    
    //TODO JSA FACTORIZE
    function getTruckContainer($player_id,$container_id){
        $datas = $this->getObjectFromDB("SELECT loading_key id,loading_amount  amount, loading_state state,loading_card_id card_id,
            SUBSTRING(loading_key FROM 1 FOR 6) truck_id
            FROM freighter_loading
            WHERE loading_player_id ='$player_id' AND loading_key ='$container_id' "
            );

        self::dump("getTruckContainer($player_id,$container_id)", $datas);            
        return $datas;    
    }
    
    function getSQLSelectTruckPositions($player_id = null){
        // This request seems complicated but it is not, it is long because we want a "FULL JOIN" equivalent in mySql + because we want to aggregate datas directly
        $sql = " SELECT a.fmove_player_id player_id, a.fmove_truck_id truck_id, a.confirmed_state,a.confirmed_position, b.not_confirmed_state,b.not_confirmed_position
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
            SELECT b.fmove_player_id player_id, b.fmove_truck_id truck_id, a.confirmed_state,a.confirmed_position, b.not_confirmed_state,b.not_confirmed_position
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
             ";
             //TODO JSA WHERE fmove_player_id ='$player_id'
             //TODO JSA use STATE constants
        if(isset($player_id) ){
            $sql = "SELECT * FROM ( ".$sql.") c WHERE player_id ='$player_id' ";
        }     
        return $sql;    
    }
    
    /**
    Return truck state and positions
    */
    function getTruckPositions($truckId,$player_id){
        self::trace("getCurrentTruckPosition($truckId,$player_id)...");
        
        $sql = $this->getSQLSelectTruckPositions($player_id);
        $sql = $sql." AND truck_id ='$truckId' ";
        return $this->getObjectFromDB($sql);
    }
    
    /**
    Return current truck position according to positions
    */
    function getCurrentTruckPosition($truckId,$player_id){
        self::trace("getCurrentTruckPosition($truckId,$player_id)...");
        
        $position = 0;
        
        $res = $this->getTruckPositions($truckId,$player_id);

        if(! isset($res)){
            return 0;
        } 
        
        $confirmed_pos = $res['confirmed_position'] ;
        $not_confirmed_pos = $res['not_confirmed_position'];

        if( isset($confirmed_pos)){
            $position = $confirmed_pos;
        } 
        if( isset($not_confirmed_pos)){//WILL BE GREATER than the confirmed one
            $position = $not_confirmed_pos;
        } 
        
        return $position;
    }
    
    function updateLoadInTruck($player_id, $containerId, $amount,$state,$cardId = null){
        
        $this->DbQuery("UPDATE freighter_loading SET loading_amount= $amount, loading_card_id= $cardId, loading_state= $state WHERE loading_key='$containerId' AND loading_player_id ='$player_id' ");
    }
    
    function insertMoveTruck($player_id,$truckId, $fromPosition, $toPosition, $newState,$cardId){
        $this->DbQuery("INSERT INTO freighter_move VALUES ('$player_id', '$truckId', $fromPosition, $toPosition, $newState, $cardId); ");
    }
//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
//////////// 

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in flipfreighters.action.php)
    */


    function loadTruck($cardId, $containerId, $amount )
    {
        // Check that this is the player's turn and that it is a "possible action" at this game state (see states.inc.php)
        self::checkAction( 'loadTruck' ); 
        
        $player_id = self::getCurrentPlayerId();
        $player_name = self::getCurrentPlayerName();
        self::trace("loadTruck($cardId, $containerId, $amount,$player_id,$player_name )");
        
        //ANTICHEAT CHECKS :
        if($amount == null || $amount<=0)
            throw new BgaVisibleSystemException( ("Incorrect quantity for loading this truck here"));
        if($cardId == null )
            throw new BgaVisibleSystemException( ("Unknown card"));
        $card = $this->cards->getCard($cardId);
        if($card == null )
            throw new BgaVisibleSystemException( ("Unknown card"));
        if($card['location'] != DECK_LOCATION_DAY )
            throw new BgaVisibleSystemException( ("You cannot play that card know"));
        
        if($containerId == null )
            throw new BgaVisibleSystemException( ("Unknown truck container"));
        $container = $this->getTruckContainer($player_id,$containerId);
        if($container == null )
            throw new BgaVisibleSystemException( ("Unknown truck container"));
        
        //LOGIC CHECK :
        if($this->isPossibleLoadingWithCard($card,$container) == false ) {
            throw new BgaVisibleSystemException( ("You cannot load at this place"));
        }
        
        //REAL ACTION :
        $newState = STATE_LOAD_TO_CONFIRM;
        $this->updateLoadInTruck($player_id,$containerId, $amount, $newState,$cardId);
        
        //NOTIFY ACTION :
        self::notifyPlayer($player_id, "loadTruck", clienttranslate( 'You load a truck with ${amount} goods' ), array(
            'containerId' => $containerId,
            'amount' => $amount,
            'card_id' => $cardId,
            'state' => $newState,
        ) );
        
        //Should not be public but the framework prefers to get minimum 1 notifyAll per action ?...
        self::notifyAllPlayers("loadTruckPublic", '', '' );
          
    }
    
    function moveTruck($cardId, $truckId, $position ){
        // Check that this is the player's turn and that it is a "possible action" at this game state (see states.inc.php)
        self::checkAction( 'moveTruck' ); 
        
        $player_id = self::getCurrentPlayerId();
        $player_name = self::getCurrentPlayerName();
        self::trace("moveTruck($cardId, $truckId, $position,$player_id,$player_name )");
        
        //TODO JSA ANTICHEAT CHECKS :
        
        
        //REAL ACTION :
        $newState = STATE_MOVE_TO_CONFIRM;
        $fromPosition = $this->getCurrentTruckPosition($truckId,$player_id);
        $this->insertMoveTruck($player_id,$truckId, $fromPosition, $position, $newState,$cardId);
        $truckPositions = $this->getTruckPositions($truckId,$player_id);
        
        //NOTIFY ACTION :
        self::notifyPlayer($player_id, "moveTruck", clienttranslate( 'You move a truck' ), array(
            'fromPosition' => $fromPosition,
            'position' => $position,
            'truckId' => $truckId,
            'card_id' => $cardId,
            'truckState' => $truckPositions,
        ) );
        
        //Should not be public but the framework prefers to get minimum 1 notifyAll per action ?...
        self::notifyAllPlayers("moveTruckPublic", '', '' );
    }
    
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */
    
    function argPlayerTurn(){
        $players = self::loadPlayersBasicInfos();
        $dayCards = $this->getCurrentDayCards();
        
        $privateDatas = array ();
        
        foreach($players as $player_id => $player){
            $possibleCards = array();
            $playerBoard = $this->getPlayerBoard($player_id);
            foreach( $dayCards as $dayCard){
                $possibleCards[$dayCard['id']] = array(
                    "LOAD" => $this->getPossibleLoadingWithCard($dayCard,$playerBoard),
                    "MOVE" => $this->getPossibleMovesWithCard($dayCard,$playerBoard),
                    );
            }
            $privateDatas[$player_id] = array(
                'possibleCards' => $possibleCards,
            );
        }
        
        return array(
            '_private' => $privateDatas,
        );
    }

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

    function stNewRound()
    { 
        self::trace("stNewRound()");
        
        //INCREASE ROund number
        $round = self::getGameStateValue( 'round_number');
        $round++;
        self::setGameStateValue( 'round_number', $round );
        
        //Reset days of week :
        self::setGameStateValue( 'turn_number', 0 );
        
        //NOTIF ALL about new round
        self::notifyAllPlayers( "newRound", clienttranslate( 'The game starts week number ${nb} !' ), array( 
            'nb' => $round,
        ) );
        
        $this->gamestate->nextState( 'next' );
    }
    
    function stNewTurn()
    { 
        self::trace("stNewTurn()");
        
        $turn = self::incGameStateValue( 'turn_number',1 );
        
        //Flip three cards face up from the draw deck  :
        $weekLocation = $this->getCurrentWeekLocation();
        $newCards = $this->cards->pickCardsForLocation( NB_CARDS_BY_ROUND, $weekLocation, DECK_LOCATION_DAY,0, true );
        
        $maxTurn = NB_CARDS_BY_WEEK / NB_CARDS_BY_ROUND;
        
        //NOTIF ALL about new cards
        self::notifyAllPlayers( "newTurn", clienttranslate( 'Day ${day}/${max} : the game draws new cards' ), array( 
            'newCards' => $newCards,
            'day' => $turn,
            'max' => $maxTurn,
        ) );
        
        $this->gamestate->nextState( 'next' );
    }
    
    function stPlayerTurn()
    { 
        self::trace("stPlayerTurn()");
        
        $this->gamestate->setAllPlayersMultiactive();
    }
    
    function stEndTurn()
    { 
        self::trace("stEndTurn()");
        
        //Discard cards from board
        $this->cards->moveAllCardsInLocation( DECK_LOCATION_DAY, 'discard' );
    
        $week = $this->getCurrentWeekLocation();
        $weekSize = $this->cards->countCardInLocation( $week );
        if($weekSize == 0){
            //END WEEK = END round
            $this->gamestate->nextState( 'endRound' );
            return;
        }
    
        $this->gamestate->nextState( 'newTurn' );
    }
     
    
    function stEndRound()
    {  
        self::trace("stEndRound()");
        
        //TODO JSA CHECK round_number and end if >=MAX
        
        $this->gamestate->nextState( 'newRound' );
    }

//////////////////////////////////////////////////////////////////////////////
//////////// Zombie
////////////

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
        
        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message. 
    */

    function zombieTurn( $state, $active_player )
    {
    	$statename = $state['name'];
    	
        if ($state['type'] === "activeplayer") {
            switch ($statename) {
                default:
                    $this->gamestate->nextState( "zombiePass" );
                	break;
            }

            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive( $active_player, '' );
            
            return;
        }

        throw new feException( "Zombie mode not supported at this game state: ".$statename );
    }
    
///////////////////////////////////////////////////////////////////////////////////:
////////// DB upgrade
//////////

    /*
        upgradeTableDb:
        
        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.
    
    */
    
    function upgradeTableDb( $from_version )
    {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345
        
        // Example:
//        if( $from_version <= 1404301345 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        if( $from_version <= 1405061421 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        // Please add your future database scheme changes here
//
//


    }    
}
