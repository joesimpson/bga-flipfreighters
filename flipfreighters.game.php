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
//const JOKER_VALUE = 15;
const JOKER_VALUE = 6; // USE CARD_VALUE_MAX in order to have the maximum value when using overtime hours tokens

const NB_CARDS_BY_WEEK = 15;// BY ROUND
const NB_CARDS_BY_TURN = 3;
const NB_ROUNDS = 3;

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

const SCORE_BY_REMAINING_OVERTIME = 2;
const SCORE_TYPE_NUMBER_OF_GOODS_X5 = 1;
const SCORE_TYPE_NUMBER_OF_GOODS_3_TO_30 = 2;
const SCORE_TYPE_SUM_GOODS_X1 = 3;
const SCORE_TYPE_SUM_GOODS_X2 = 4;

// TRUCK VALUES Types :
const CARGO_TYPE_DIFFERENT_VALUES = 1;
const CARGO_TYPE_SAME_VALUES = 2;
const CARGO_TYPE_REVERSE_ORDERED_VALUES = 3;
const CARGO_TYPE_ORDERED_VALUES = 4;
const CARGO_TYPE_ALL_VALUES = 5;
//CARGO SUIT TYPE :
const CARGO_SUIT_ALL = 0;
const CARGO_SUIT_SPADE = 1;
const CARGO_SUIT_HEART = 2;
const CARGO_SUIT_CLUB = 3;
const CARGO_SUIT_DIAMOND = 4;

const CARD_VALUE_MIN = 1;
const CARD_VALUE_MAX = 6;

const NB_OVERTIME_TOKENS = 5;

const MAX_LOAD = 11;//CARD_VALUE_MAX + NB_OVERTIME_TOKENS

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
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar, player_score) VALUES ";
        $values = array();
        $initScore = NB_OVERTIME_TOKENS * SCORE_BY_REMAINING_OVERTIME;
        foreach( $players as $player_id => $player )
        {
            $color = array_shift( $default_colors );
            $values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."', $initScore)";
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
        self::initStat( 'player', 'score_week1', 0 );  // Init a player statistics (for all players)
        self::initStat( 'player', 'score_week2', 0 );
        self::initStat( 'player', 'score_week3', 0 );

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
        
        //TODO JSA retrieve current player unconfirmed deliveries, in order to send him only his temporary "player_score" (as we do in UI : updating score when we deliver )
  
        // TODO: Gather all information about current game situation (visible by player $current_player_id).
        
        $result['round_number'] = self::getGameStateValue( 'round_number');
        $result['turn_number'] = self::getGameStateValue( 'turn_number');
        $result['dayCards'] = $this->getCurrentDayCards();
        
        $result['material'] = array( 
            'card_types' =>  $this->card_types,
            'trucks_types' =>  $this->trucks_types,
            'tooltips' =>  $this->ffg_tooltips,
        ); 
        
        $result['constants'] = array( 
            'JOKER_TYPE' => JOKER_TYPE,
            'NB_ROUNDS' => NB_ROUNDS,
            'CARD_VALUE_MAX' => CARD_VALUE_MAX,
            'STATE_LOAD_TO_CONFIRM' => STATE_LOAD_TO_CONFIRM,
            'STATE_MOVE_DELIVERED_TO_CONFIRM' => STATE_MOVE_DELIVERED_TO_CONFIRM,
            'STATE_MOVE_DELIVERED_CONFIRMED' => STATE_MOVE_DELIVERED_CONFIRMED,
        ); 
        
        //SOME STATS are directly displayed during the game, let's add them in the players array, as if it was in the player table:
        foreach($result['players'] as $player){ 
            $player_id = $player["id"];
            for($k=1; $k <= NB_ROUNDS;$k++){
                $result['players'][$player_id]["score_week".$k] = self::getStat( "score_week".$k, $player_id );
            }
            
            $availableOvertime = $this->getPlayerAvailableOvertimeHours($player_id);
            if($player_id  == $current_player_id) $availableOvertime = $this->getPlayerAvailableOvertimeHoursPrivateState($player_id);
            $result['players'][$player_id]['availableOvertime'] = $availableOvertime;
            
        }
  
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
        $round = self::getGameStateValue( 'round_number'); // FROM 1 to 3
        $turn = self::getGameStateValue( 'turn_number'); // FROM 1 to 5, reset to 1 at each turn
        
        $maxTurnsByRound = NB_CARDS_BY_WEEK/NB_CARDS_BY_TURN;//5
        $maxTurns = NB_ROUNDS * $maxTurnsByRound;//15
        $progression = ( ($round -1) * $maxTurnsByRound + $turn-1 ) / $maxTurns *100;// FROM 0 TO 14/15 (93%)
        
        return $progression;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////    

    /*
        In this space, you can put any utility methods useful for your game logic
    */
    
    function isCurrentPlayerId($player_id)
    {
        return self::getCurrentPlayerId() == $player_id;
    }
    
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
            for( $value=CARD_VALUE_MIN; $value<=CARD_VALUE_MAX; $value++ )   //  A,2, 3, 4,5,6
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
    Return true if $card_suit is present in $containers_suit_filter (Either array, or a single value), => this would means this suit is allowed
    false otherwise
    */
    function isInSuitFilter($card_suit,$containers_suit_filter ,$cargo_index){
        if($card_suit == JOKER_TYPE) return true;
        
        if(is_array($containers_suit_filter)){
            //suit corresponding to container position
            return $containers_suit_filter[$cargo_index] == $card_suit;
        }
        else if(CARGO_SUIT_ALL == $containers_suit_filter ){
            return true;
        }
        else {
           return $containers_suit_filter == $card_suit;
        }
    }
    /**
    return true if at least one of the cargos is loaded with a number < $card_value
    */
    function hasInferiorValueLoaded($cargos, $card_value){
        
        foreach( $cargos as $cargo )
        {
            if(isset ($cargo['amount'] ) && $cargo['amount'] < $card_value){
               return true;
            }
        }
        return false;
    }
    /**
    return true if at least one of the cargos is loaded with a number > $card_value
    */
    function hasSuperiorValueLoaded($cargos, $card_value){
    
        foreach( $cargos as $cargo )
        {
            if(isset ($cargo['amount'] ) && $cargo['amount'] > $card_value){
               return true;
            }
        }
        return false;
    }
    /**
    return true if at least one of the cargos is loaded with a number != $card_value
    */
    function hasOtherValueLoaded($cargos, $card_value){
        if($this->hasInferiorValueLoaded($cargos, $card_value)){
           return true;
        }
        if($this->hasSuperiorValueLoaded($cargos, $card_value)){
           return true;
        }
        return false;
    }
    /**
    return true if at least one of the cargos is loaded with a number == $card_value
    */
    function hasSameValueLoaded($cargos, $card_value){
    
        foreach( $cargos as $cargo )
        {
            if(isset ($cargo['amount'] ) && $cargo['amount'] == $card_value){
               return true;
            }
        }
        return false;
    }
    
    function cardAlreadyUsed($player_id,$card,$trucks_cargos){
        
        $card_id = $card["id"];
        self::trace("cardAlreadyUsed($player_id,$card_id)...");
        //self::dump("cardAlreadyUsed($player_id,$card_id)...",$trucks_cargos);
        
        //LOOK FOR at least 1 cargo :
        foreach( $trucks_cargos as $truck_id => $cargos )
        {
            foreach( $cargos as $cargo )
            {
                if(isset ($cargo['card_id'] ) && $cargo['card_id'] == $card_id){
                   return true;
                }

            }
        }
        
        //look for positions card_id, but not in the array of last confirmed and last not confirmed_pos : look at all positions of this player
        $power = $this->getCardUsedPowerForMoves($player_id, $card_id);
        self::trace("cardAlreadyUsed($player_id,$card_id)... used power =$power");
        $card_value = $card["type_arg"];
        if($power >= $card_value ) {
            //NO remaining moves for this card
            return true;
        }
        
        return false;
    }
    /**
    Return all possibles cargo positions for this card according to its color and value, and according to already loaded trucks from player board
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
    function getPossibleLoadsWithCard($card,$playerBoard)
    { 
        $possibles = array();
        
        $player_id = $playerBoard['player_id'];
        $trucks_cargos = $playerBoard['trucks_cargos'];
        $trucks_positions = $playerBoard['trucks_positions'];
        
        //IF CARD ALREADY USED => KO
        if( $this->cardAlreadyUsed($player_id,$card, $trucks_cargos)) return $possibles;
            
        //IF CARD ALREADY USED for a move => KO
        $cardUsedPower = $this->getCardUsedPowerForMoves($player_id, $card["id"]);
        if($cardUsedPower >0) return $possibles;
        
        //Loop over each container 
        foreach( $trucks_cargos as $truck_id => $cargos )
        {
            $truck = $trucks_positions[$truck_id];
            
            foreach( $cargos as $container_id => $container )
            {
                if($this->isPossibleLoadWithCard($card,$container,$truck,$cargos, false) == false ) {
                    continue;
                }
                $possibles[] = $container_id;
            }
        }
        return $possibles;
    }
    /**
    Return true if LOAD truck $container with card $card is possible according to current truck position and loaded cargos
    
    if $strictValue is TRUE, then look only for the value of the card, else look for all Joker possible values
    */
    function isPossibleLoadWithCard($card,$container,$truck,$cargos, $strictValue)
    { 
        // 'id' absent with php array datas
        //$card_id = $card['id'];
        //self::dump("isPossibleLoadWithCard($card_id)", $container);
        //self::dump("isPossibleLoadWithCard($card_id)", $truck);
        
        //IF Container is not empty KO
        if( array_key_exists('amount',$container) && $container['amount']>0 ) {
            return false;
        }
        $currentTruckPosition = $this->getCurrentTruckPositionInDatas($truck);
        if( $currentTruckPosition >0 ) {//if truck MOVED
            return false;
        }
        
        $truck_id = $container['truck_id'];
        $material = $this->trucks_types[$truck_id];
        $containers = $material['containers'];
        $containers_suit_filter = $material['containers_suit_filter'];
        $cargo_value_filter = $material['cargo_value_filter'];
        
        $card_suit = $card['type'];
        $card_value = $card['type_arg'];
        $cargo_index = $container['cargo_index']; //From 0 
        
        $isJoker = ($card_suit == JOKER_TYPE);
        
        if(CARGO_TYPE_ORDERED_VALUES == $cargo_value_filter ){ // Truck 1-6
            $target_value = $containers[$cargo_index];
            if(!$strictValue && $isJoker){//COnsider that joker is THAT VALUE, or it won't be playable
                $card_value = $target_value;
            }
            if($this->hasInferiorValueLoaded($cargos, $card_value)){ 
                //GAME RULE : You may skip numbers but you may never fill in numbers that were skipped.
                return false;
            }
        }
        if(CARGO_TYPE_REVERSE_ORDERED_VALUES == $cargo_value_filter ){ // Truck 6-1
            $target_value = $containers[$cargo_index];
            if(!$strictValue && $isJoker){//COnsider that joker is THAT VALUE, or it won't be playable
                $card_value = $target_value;
            }
            if($this->hasSuperiorValueLoaded($cargos, $card_value)){ 
                //GAME RULE : You may skip numbers but you may never fill in numbers that were skipped.
                return false;
            }
        }
        if(!$strictValue && $isJoker){//AFTER previous checks, a joker is always possible
            return true;
        }
        if( ! $this->isInSuitFilter($card_suit,$containers_suit_filter,$cargo_index )){
            return false;
        }
        if(CARGO_TYPE_ORDERED_VALUES == $cargo_value_filter ){ // Truck 1-6
            if($card_value != $containers[$cargo_index]){
                // Example : playing any "5" is possible in the 5th cargo (index 4)
                return false;
            }
        }
        if(CARGO_TYPE_REVERSE_ORDERED_VALUES == $cargo_value_filter ) {// Truck 6-1
            if( $card_value != $containers[$cargo_index]){
                // Example : playing any "6" is possible in the first cargo (index 0)
                return false;
            }
        }
        if(CARGO_TYPE_SAME_VALUES == $cargo_value_filter ){
            //GAME RULE : ALL THE SAME NUMBERS
            if($this->hasOtherValueLoaded($cargos, $card_value)){ 
                return false;
            }
        }
        if(CARGO_TYPE_DIFFERENT_VALUES == $cargo_value_filter ){
            //GAME RULE : ALL DIFFERENT NUMBERS
            if($this->hasSameValueLoaded($cargos, $card_value)){ 
                return false;
            }
        }
        return true;
    }
    
    function getPossibleMovesWithCard($card,$playerBoard)
    { 
        $possibles = array();
        
        $player_id = $playerBoard['player_id'];
        $trucks_positions = $playerBoard['trucks_positions'];
        $trucks_cargos = $playerBoard['trucks_cargos'];
        
        //IF CARD ALREADY USED => KO
        if( $this->cardAlreadyUsed($player_id,$card,$trucks_cargos)) return $possibles;
        
        $cardUsedPower = $this->getCardUsedPowerForMoves($player_id, $card["id"]);
        
        $cardMovePower = $card["type_arg"];
        foreach( $trucks_positions as $truck_position ){
            $truck_id = $truck_position['truck_id'];
            $material = $this->trucks_types[$truck_id];
            $truck_max_position = end($material['path_size']);//TODO JSA GAME RULES
            $truck_cargos = $trucks_cargos[$truck_id];
            $currentTruckPosition = $this->getCurrentTruckPositionInDatas($truck_position);
            $truckState = $this->getCurrentTruckStateInDatas($truck_position);
            
            for ($k =$currentTruckPosition+1 ; $k<= min($currentTruckPosition + $cardMovePower,$truck_max_position); $k++ ) {
                $position_id = $truck_id."_".$k;
                if($this->isPossibleMoveWithCard($card,$currentTruckPosition,$truckState,$truck_cargos,$truck_id,$k,$cardMovePower,$cardUsedPower) == false ) {
                    continue;
                }
                $possibles[] = $position_id;
            }
        }
        return $possibles;
    }
    /**
    Return true if Move truck $truck_id with card $card to position $target_pos is possible according to current truck position and loaded cargos
    */
    function isPossibleMoveWithCard($card,$currentTruckPosition,$truckState,$truck_cargos,$truck_id,$target_pos,$cardMovePower,$cardUsedPower)
    { 
        $card_id = $card['id'];

        $countCargoValues = $this->countCargoValues($truck_cargos);
        if($countCargoValues <1){
            //TRUCK Cannot move before being loaded
            self::trace("isPossibleMoveWithCard($card_id) : KO Cannot move before being loaded (with $countCargoValues) ");
            return false;
        }
        if($truckState ==STATE_MOVE_DELIVERED_CONFIRMED || $truckState ==STATE_MOVE_DELIVERED_TO_CONFIRM ){
            //You cannot move a delivered truck
            self::trace("isPossibleMoveWithCard($card_id) : KO You cannot move a delivered truck (with state $truckState) ");
           return false;
        }
        
        $moveSize = $target_pos - $currentTruckPosition;
        if($cardMovePower - $cardUsedPower < $moveSize ) {
            //NOT enough power to do this move
            self::trace("isPossibleMoveWithCard($card_id) : KO NOT enough power to do this move (cardMovePower $cardMovePower, cardUsedPower=$cardUsedPower, moveSize=$moveSize) ");
            return false;
        }
        
        return true;
    }
    
    //TODO JSA separate module for player board / truck
    function initPlayerBoard()
    {
        $players = self::loadPlayersBasicInfos();
        
        //CLEAN BEFORE (useful FOR TESTING)
        self::DbQuery( "DELETE FROM freighter_cargo " );
        
        $trucks = $this->trucks_types;
        
        /*
        // may be unnecessary if we use material container_ids to retrieve possibles actions, so we insert only when loaded ?
        //Step 1 : prepare an entry for all possible cargo in every players trucks :
        $sql = "INSERT INTO freighter_cargo (cargo_player_id, cargo_key) VALUES ";
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
        */
        
    }
    
    function getPlayerBoard($player_id){
        
        $trucks_cargos = $this->getTruckCargos($player_id);
        
        $trucks_positions = $this->getDoubleKeyCollectionFromDB( $this->getSQLSelectTruckPositions($player_id));
        
        if( ! isset($trucks_positions ) || ! array_key_exists($player_id, $trucks_positions )){ 
            //ONLY BEFORE THE FIRST MOVE of the game for this player
            $trucks_positions = array();
        } else {
            $trucks_positions = $trucks_positions [$player_id];
        }
        
        //self::dump("getPlayerBoard($player_id) trucks_positions BEFORE ",$trucks_positions);
        
        $trucks_scores = array();
        
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
            
            $trucks_scores[$truck_type_id] = $this->computeScore($player_id,$truck_type_id, $trucks_cargos[$truck_type_id], $trucks_positions[$truck_type_id] ); 
        }
        //self::dump("getPlayerBoard($player_id) trucks_positions AFTER ",$trucks_positions);
        
        //TODO JSA get cards spend overtime
        
        return array( 
            "player_id" => $player_id,
            "trucks_cargos" => $trucks_cargos,
            "trucks_positions" => $trucks_positions,
            "trucks_scores" => $trucks_scores,
        );
    }
    
    function getSQLSelectTruckCargos($player_id,$truck_id,$cargo_id){
        $sql = "SELECT SUBSTRING(cargo_key FROM 1 FOR 6) truck_id, cargo_key id,cargo_amount  amount, cargo_state state,cargo_card_id card_id, cargo_overtime_used overtime, SUBSTRING(cargo_key FROM 8 FOR 2) cargo_index
            FROM freighter_cargo
            WHERE cargo_player_id ='$player_id' ";
        if(isset($truck_id) ){
            $sql = "SELECT * FROM ( ".$sql.") c WHERE truck_id ='$truck_id' ";
        } else if(isset($cargo_id) ){
            $sql = "SELECT * FROM ( ".$sql.") c WHERE id ='$cargo_id' ";
        } 
        return $sql;
    }
    function getTruckCargos($player_id,$truck_id = null){
        $sql = $this->getSQLSelectTruckCargos($player_id,$truck_id,null);
        $trucks_cargos = $this->getDoubleKeyCollectionFromDB( $sql);
        
        //LOOP ON EACH TRUCK to add trucks which are not selected by this player yet
        foreach ($this->trucks_types as $truck_type_id =>  $truck_type){
            if($truck_id !=null && $truck_id != $truck_type_id) continue;
                
            if( ! array_key_exists($truck_type_id, $trucks_cargos ) ){
                $trucks_cargos[$truck_type_id] = array ();
            }
        
            //LOOP ON EACH CARGOS to add cargos which are not selected by this player yet
            foreach( $truck_type['containers'] as $container_id => $container ){
                $cargo_key = $truck_type_id."_".$container_id;
                if( ! array_key_exists($cargo_key, $trucks_cargos[$truck_type_id] ) ){
                    $trucks_cargos[$truck_type_id][$cargo_key] = $this->getEmptyTruckCargo($player_id,$truck_type_id, $container_id);
                }
            }
        }
        
        return $trucks_cargos;    
    }
    function getTruckContainer($player_id,$cargo_id){
        $sql = $this->getSQLSelectTruckCargos($player_id,null,$cargo_id);
        $datas = $this->getObjectFromDB($sql);
        self::dump("getTruckContainer($player_id,$cargo_id)", $datas);   
        
        if( $datas == null){
            //Cargo is not inserted yet...
            $cargoTruckIdAndCargoIndex = explode("_", $cargo_id);
            $truck_type_id = $cargoTruckIdAndCargoIndex[0];
            $cargo_index = $cargoTruckIdAndCargoIndex[1];
            
            $truckMaterial = $this->trucks_types[$truck_type_id];
            if( isset($truckMaterial ) ){//IF truck is defined
                $truckMaterialCargos = $truckMaterial['containers'];
                if( array_key_exists($cargo_index,$truckMaterialCargos ) ){//IF truck cargo is defined
                    $datas = $this->getEmptyTruckCargo($player_id,$truck_type_id, $cargo_index);
                }
            }
        }   
        return $datas;    
    }
    
    function getEmptyTruckCargo($player_id,$truck_id, $cargo_index){
        $cargo_key = $truck_id."_".$cargo_index;
        return array (
            "truck_id" => $truck_id,
            "id" => $cargo_key,
            "amount" => null,
            "state" => STATE_LOAD_INITIAL,
            "card_id" => null,
            "overtime" => 0,
            "cargo_index" => $cargo_index,
        ); 
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
        self::trace("getTruckPositions($truckId,$player_id)...");
        
        $sql = $this->getSQLSelectTruckPositions($player_id);
        $sql = $sql." AND truck_id ='$truckId' ";
        return $this->getObjectFromDB($sql);
    }
    
    /**
    Return current truck position according to positions
    */
    function getCurrentTruckPosition($truckId,$player_id){
        self::trace("getCurrentTruckPosition($truckId,$player_id)...");
        
        $res = $this->getTruckPositions($truckId,$player_id);
        
        return $this->getCurrentTruckPositionInDatas($res);
    }
    
    function getCurrentTruckPositionInDatas($truck_datas){
        $position = 0;
        
        if(! isset($truck_datas)){
            return 0;
        } 
        
        $confirmed_pos = $truck_datas['confirmed_position'] ;
        $not_confirmed_pos = $truck_datas['not_confirmed_position'];

        if( isset($confirmed_pos)){
            $position = $confirmed_pos;
        } 
        if( isset($not_confirmed_pos)){//WILL BE GREATER than the confirmed one
            $position = $not_confirmed_pos;
        } 
        
        return $position;
    }
    
    /**
    Return current truck state according to positions
    */
    function getCurrentTruckState($truckId,$player_id){
        self::trace("getCurrentTruckState($truckId,$player_id)...");
        
        $res = $this->getTruckPositions($truckId,$player_id);
        
        return $this->getCurrentTruckStateInDatas($res);
    }
    function getCurrentTruckStateInDatas($truck_datas){
        $state = null;
        
        if(! isset($truck_datas)){
            return null;
        } 
        
        $confirmed_state = $truck_datas['confirmed_state'] ;
        $not_confirmed_state = $truck_datas['not_confirmed_state'];

        if( isset($confirmed_state)){
            $state = $confirmed_state;
        } 
        if( isset($not_confirmed_state)){
            $state = $not_confirmed_state;
        } 
        
        return $state;
    }
    
    function getCardUsedPowerForMoves($player_id, $card_id){
        $sql = " SELECT `fmove_card_id`, SUM( `fmove_position_to`- `fmove_position_from` - `fmove_overtime_used` ) as `card_used_power`  FROM `freighter_move` where fmove_player_id = '$player_id' and `fmove_card_id` = $card_id group by `fmove_card_id` ";
        
        $res = $this->getObjectFromDB($sql);
        
        if(isset($res)){
            return $res["card_used_power"];
        }
        return 0; 
    }
    
    function getPlayerPossibleCards($player_id ){
        $dayCards = $this->getCurrentDayCards();
        $possibleCards = array();
        $playerBoard = $this->getPlayerBoard($player_id);
        foreach( $dayCards as $dayCard){
            $possibleCards[$dayCard['id']] = $this->getPlayerPossibleCardArray($dayCard,$playerBoard);
        }
        return $possibleCards;
    }
    
    function getPlayerPossibleCardArray($card,$playerBoard ){
        return array(
            "LOAD" => $this->getPossibleLoadsWithCard($card,$playerBoard),
            "MOVE" => $this->getPossibleMovesWithCard($card,$playerBoard),
            );
    }
    
    function insertLoadInTruck($player_id, $cargoId, $amount,$state,$cardId,$overtimeUsed){
        $this->DbQuery("INSERT INTO freighter_cargo (cargo_player_id, cargo_key,cargo_amount,cargo_card_id,cargo_state,cargo_overtime_used ) VALUES ( '$player_id', '$cargoId', $amount,$cardId,$state, $overtimeUsed ) ");
    }
    /**
    Deprecated : we only insert when necessary, so ne need for update for now
    */
    function updateLoadInTruck($player_id, $cargoId, $amount,$state,$cardId,$overtimeUsed){
        $this->DbQuery("UPDATE freighter_cargo SET cargo_amount= $amount, cargo_card_id= $cardId, cargo_state= $state, cargo_overtime_used=$overtimeUsed WHERE cargo_key='$cargoId' AND cargo_player_id ='$player_id' ");
    }
    
    function insertMoveTruck($player_id,$truckId, $fromPosition, $toPosition, $newState,$cardId,$overtimeUsed){
        $this->DbQuery("INSERT INTO `freighter_move`(`fmove_player_id`, `fmove_truck_id`, `fmove_position_from`, `fmove_position_to`, `fmove_state`, `fmove_card_id`, `fmove_overtime_used`) VALUES ('$player_id', '$truckId', $fromPosition, $toPosition, $newState, $cardId, $overtimeUsed); ");
    }
    
    /**
    CONFIRM all players actions by updating to the corresponding state
    */
    function confirmTurnActions($players){
        self::trace( "confirmTurnActions()...");

        $oldState = STATE_LOAD_TO_CONFIRM;
        $newState = STATE_LOAD_CONFIRMED;
        $this->DbQuery("UPDATE freighter_cargo SET cargo_state= $newState WHERE cargo_state = $oldState");
        
        $oldState = STATE_MOVE_TO_CONFIRM;
        $newState = STATE_MOVE_CONFIRMED;
        $this->DbQuery("UPDATE freighter_move SET fmove_state= $newState WHERE fmove_state = $oldState");
        
        $oldState = STATE_MOVE_DELIVERED_TO_CONFIRM;
        $newState = STATE_MOVE_DELIVERED_CONFIRMED;
        $this->DbQuery("UPDATE freighter_move SET fmove_state= $newState WHERE fmove_state = $oldState");
        
        foreach($players as $player_id => $player){
            ///Set the public data about spent overtime by getting the private info 
            $privateInfo = $this-> getPlayerAvailableOvertimeHoursPrivateState($player_id);
            $this->setPlayerAvailableOvertimeHours($player_id,$privateInfo);
        }
        
    }
    
    /** This function MUST cancel actions BEFORE the previous method confirmTurnActions() can SAVE them
    */
    function cancelTurnActions($player_id){
        self::trace( "cancelTurnActions($player_id)...");
        $oldState = STATE_LOAD_TO_CONFIRM;
        /*
        $newState = STATE_LOAD_INITIAL;
        $this->DbQuery("UPDATE freighter_cargo SET cargo_state= $newState, cargo_amount = NULL, cargo_card_id = NULL, cargo_overtime_used = 0 WHERE cargo_state = $oldState AND cargo_player_id ='$player_id'");
        */
        $this->DbQuery("DELETE FROM freighter_cargo WHERE cargo_state = $oldState AND cargo_player_id ='$player_id'");
        
        $oldState1 = STATE_MOVE_TO_CONFIRM;
        $oldState2 = STATE_MOVE_DELIVERED_TO_CONFIRM;
        $this->DbQuery("DELETE FROM freighter_move WHERE fmove_state in ( $oldState1, $oldState2) AND fmove_player_id ='$player_id'");
    }
    
    function sumCargoValues($cargos){
        //self::dump( 'sumCargoValues', $cargos );
        $sum = 0;
        foreach($cargos as $cargo){
            if(isset ($cargo['amount'] ) ){
                $sum += $cargo['amount'];
            }
        }
        //self::trace( "sumCargoValues()... => $sum");
        return $sum;
    }
    function countCargoValues($cargos){
        //self::dump( 'countCargoValues', $cargos );
        $sum = 0;
        foreach($cargos as $cargo){
            if(isset ($cargo['amount'] ) ){
                $sum += 1;
            }
        }
        //self::trace( "countCargoValues()... => $sum");
        return $sum;
    }
    
    /**
    Return current score for one player's truck
    */
    function computeScore($player_id,$truckId,$cargos, $truck_position_state){
        self::trace("computeScore($player_id,$truckId)...");
        //self::dump( 'cargo', $cargos );
        //self::dump( 'truck_position_state', $truck_position_state );
        //TODO JSA computeScore should not be sent to others when state is not confirmed yet
        $truck_material = $this->trucks_types[$truckId];
        $path_sizes = $truck_material['path_size'];
        $delivery_type = null;
        
        for($k = 0; $k< count($path_sizes)  ; $k++){
            $path_size = $path_sizes[$k];
            
            if($truck_position_state['confirmed_state'] == STATE_MOVE_DELIVERED_CONFIRMED && $truck_position_state['confirmed_position'] == $path_size
            || $truck_position_state['not_confirmed_state'] == STATE_MOVE_DELIVERED_TO_CONFIRM && $truck_position_state['not_confirmed_position'] == $path_size
            ){
                $delivery_type = $truck_material['delivery_score'][$k];
                break;
            }
        }
        
        self::trace("computeScore($player_id,$truckId)... delivery_type = $delivery_type");
        
        switch ($delivery_type){
            case SCORE_TYPE_NUMBER_OF_GOODS_X5: 
                $numberOfGoods = $this->countCargoValues($cargos);
                return $numberOfGoods * 5;
            case SCORE_TYPE_NUMBER_OF_GOODS_3_TO_30: 
                $numberOfGoods = $this->countCargoValues($cargos);
                $scorePerGoods = [3, 7, 10, 15, 20, 30];
                return $scorePerGoods[$numberOfGoods -1 ];
            case SCORE_TYPE_SUM_GOODS_X1: 
                $valueOfGoods = $this->sumCargoValues($cargos);
                return $valueOfGoods * 1;
            case SCORE_TYPE_SUM_GOODS_X2: 
                $valueOfGoods = $this->sumCargoValues($cargos);
                return $valueOfGoods * 2;
            default: break;
        }
        
        return 0;
    }
    
    /**
    Return the score of the week for this player id: 
        Total all the values for all the trucks that have been delivered 
    */
    function computePlayerWeekScore($player_id){
        self::trace("computePlayerWeekScore($player_id)...");
        $score = 0;
        
        $playerBoard = $this->getPlayerBoard($player_id);
        $trucks_scores = $playerBoard['trucks_scores'];
        foreach( $trucks_scores as $truck_id => $truck_score )
        {
            $score += $truck_score;
        }
        
        return $score;
    }
    
    /**
    Return the current total score for this player : 
        - SUM score of each week (must be computed before calling this function)
        - add 2 Points per unused "overtime hours"
    */
    function computePlayerTotalScore($player_id){
        self::trace("computePlayerTotalScore($player_id)...");
        $score = 0;
        
        for($k=1; $k <= NB_ROUNDS;$k++){
            $score += self::getStat( "score_week".$k, $player_id );
        }
        
        $score += SCORE_BY_REMAINING_OVERTIME * $this->getPlayerAvailableOvertimeHours($player_id);
        
        return $score;
    }
    
    function dbUpdatePlayerScore($player_id,$score){
        self::DbQuery( "UPDATE player SET player_score=$score WHERE player_id='$player_id'" );
    }
    
    function dbGetScore($player_id) {
       return $this->getUniqueValueFromDB("SELECT player_score FROM player WHERE player_id='$player_id'");
    }
    
    function getPlayerAvailableOvertimeHours($player_id){
        return NB_OVERTIME_TOKENS - $this->getUniqueValueFromDB("SELECT player_ffg_overtime_used FROM player WHERE player_id='$player_id'");
    }
    /**
    Return the total number of available tokens, also counting the one used during this turn : don't send this info to other players
    */
    function getPlayerAvailableOvertimeHoursPrivateState($player_id){
        $spent = $this->getUniqueValueFromDB("SELECT SUM(overtime_hours ) FROM (
            SELECT SUM(`cargo_overtime_used`) 'overtime_hours' FROM `freighter_cargo` WHERE `cargo_player_id` = '$player_id'
                UNION ALL
            SELECT SUM(`fmove_overtime_used`) 'overtime_hours' FROM `freighter_move` WHERE `fmove_player_id` = '$player_id'
        ) subq ");
        if($spent == null) $spent = 0; 
        
        return NB_OVERTIME_TOKENS - $spent;
    }
    
    function setPlayerAvailableOvertimeHours($player_id, $nb){
        $used = NB_OVERTIME_TOKENS - $nb;
        self::DbQuery( "UPDATE player SET player_ffg_overtime_used=$used WHERE player_id='$player_id'" );
    }
//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
//////////// 

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in flipfreighters.action.php)
    */

    /**
    ACTION to refresh UI list of possibles values to be loaded (with JOKERs, or overtime hours)
    */
    function getPossibleLoads($containerId){
        self::checkAction( 'getPossibleLoads' ); 
        
        $player_id = self::getCurrentPlayerId();
        $player_name = self::getCurrentPlayerName();
        
        $possibles = array();
         
        if($containerId == null )
            throw new BgaVisibleSystemException( ("Unknown truck container"));
        $container = $this->getTruckContainer($player_id,$containerId);
        if($container == null )
            throw new BgaVisibleSystemException( ("Unknown truck container"));
        
        $truck_id = $container['truck_id'];
        $truckDatas = $this->getTruckPositions($truck_id,$player_id);
        $truckCargos = $this->getTruckCargos($player_id,$truck_id) [$truck_id];
        
        $cardSuit = JOKER_TYPE; //TODO JSA check how to use this method with a standard card
        
        for( $k =1; $k<= MAX_LOAD; $k++ )
        {
            $card = array( "type" => $cardSuit, "type_arg" => $k, );
            if($this->isPossibleLoadWithCard($card,$container,$truckDatas,$truckCargos,true) == true ) {
                $possibles[] = $k;
            }
        }
        
        //NOTIFY ACTION :
        self::notifyPlayer($player_id, "possibleLoads", '', array(
            'containerId' => $containerId,
            'possibles' => $possibles,
        ) );
    }

    /**
    ACTION to refresh UI list of possibles places for LOAD or MOVE action (with overtime hours). 
    $amount is the card value +/- overtime
    */
    function getPossibleActionsForCard($cardId, $amount ){
        self::checkAction( 'getPossibleActionsForCard' ); 
        
        $player_id = self::getCurrentPlayerId();
        $player_name = self::getCurrentPlayerName();
        self::trace("getPossibleActionsForCard($cardId, $amount,$player_id,$player_name )");
        
        $card = $this->cards->getCard($cardId);
        if($card == null )
            throw new BgaVisibleSystemException( ("Unknown card"));
        if($card['location'] != DECK_LOCATION_DAY )
            throw new BgaVisibleSystemException( ("You cannot play that card know"));
        
        $card_suit = $card['type'];
        $card['type_arg'] = $amount; //Don't save this in card, but allow to run rules on this value
        $playerBoard = $this->getPlayerBoard($player_id);
        
        $possibles = $this->getPlayerPossibleCardArray($card,$playerBoard);
        
        //send possiblePositions 
        self::notifyPlayer($player_id, "possibleCards", '', array(
            'cardId' => $cardId,
            'possibleCards' => $possibles,
        ) );
    }
    function loadTruck($cardId, $containerId, $amount )
    {
        // Check that this is the player's turn and that it is a "possible action" at this game state (see states.inc.php)
        self::checkAction( 'loadTruck' ); 
        
        $player_id = self::getCurrentPlayerId();
        $player_name = self::getCurrentPlayerName();
        self::trace("loadTruck($cardId, $containerId, $amount,$player_id,$player_name )");
        
        //ANTICHEAT CHECKS :
        if($amount == null || $amount<=0 || $amount> MAX_LOAD)
            throw new BgaVisibleSystemException( ("Incorrect quantity for loading this truck here"));
        $card = $this->cards->getCard($cardId);
        if($card == null )
            throw new BgaVisibleSystemException( ("Unknown card"));
        if($card['location'] != DECK_LOCATION_DAY )
            throw new BgaVisibleSystemException( ("You cannot play that card know"));
        $card_suit = $card['type'];
        
        $originalAvailableOvertime = $this->getPlayerAvailableOvertimeHoursPrivateState($player_id);
        $usedOvertime = abs($amount - $card['type_arg']);
        if( $card_suit == JOKER_TYPE) $usedOvertime = max(0,$amount - CARD_VALUE_MAX); //IF joker is used for a low value, don't consider overtime
        if($usedOvertime > $originalAvailableOvertime)
            throw new BgaVisibleSystemException( ("You don't have enough overtime hours to do that"));
        
        if($containerId == null )
            throw new BgaVisibleSystemException( ("Unknown truck container"));
        $container = $this->getTruckContainer($player_id,$containerId);
        if($container == null )
            throw new BgaVisibleSystemException( ("Unknown truck container"));
        
        //LOGIC CHECK :
        $truck_id = $container['truck_id'];
        $playerBoard = $this->getPlayerBoard($player_id);
        $trucks_cargos = $playerBoard['trucks_cargos'];
        $trucks_positions = $playerBoard['trucks_positions'];
        $truckDatas = $trucks_positions[$truck_id];
        $truckCargos = $trucks_cargos [$truck_id];
        $cardUsedPower = $this->getCardUsedPowerForMoves($player_id, $cardId);//>0 if card used for part of a move
        if( $this->cardAlreadyUsed($player_id,$card, $trucks_cargos) || $cardUsedPower >0)  {//ANTICHEAT
            throw new BgaVisibleSystemException( ("You already used that card"));
        }
        $card['type_arg'] = $amount; //Don't save this in card, but allow to run rules on this value
        if($this->isPossibleLoadWithCard($card,$container,$truckDatas,$truckCargos,true) == false ) {
            throw new BgaVisibleSystemException( ("You cannot load at this place"));
        }
        
        
        //REAL ACTION :
        $newState = STATE_LOAD_TO_CONFIRM;
        $this->insertLoadInTruck($player_id,$containerId, $amount, $newState,$cardId,$usedOvertime);
        $availableOvertime = $originalAvailableOvertime - $usedOvertime;
        
        //NOTIFY ACTION :
        self::notifyPlayer($player_id, "loadTruck", clienttranslate( 'You load a truck with ${amount} goods' ), array(
            'containerId' => $containerId,
            'amount' => $amount,
            'card_id' => $cardId,
            'state' => $newState,
            'availableOvertime' => $availableOvertime,
        ) );
        
        //resend possiblePositions (MOVE become possible)
        self::notifyPlayer($player_id, "possibleCards", '', array(
            'possibleCards' => $this->getPlayerPossibleCards($player_id ),
        ) );
        
        //Should not be public but the framework prefers to get minimum 1 notifyAll per action ?...
        self::notifyAllPlayers("loadTruckPublic", '', '' );
          
    }
    
    function moveTruck($cardId, $truckId, $position, $isDelivery ){
        // Check that this is the player's turn and that it is a "possible action" at this game state (see states.inc.php)
        self::checkAction( 'moveTruck' ); 
        
        $player_id = self::getCurrentPlayerId();
        $player_name = self::getCurrentPlayerName();
        self::trace("moveTruck($cardId, $truckId, $position,$isDelivery,$player_id,$player_name )");
        
        //ANTICHEAT CHECKS :
        if($cardId == null )
            throw new BgaVisibleSystemException( ("Unknown card"));
        $card = $this->cards->getCard($cardId);
        if($card == null )
            throw new BgaVisibleSystemException( ("Unknown card"));
        if($card['location'] != DECK_LOCATION_DAY )
            throw new BgaVisibleSystemException( ("You cannot play that card know"));
        $card_suit = $card['type'];
        if( !array_key_exists($truckId, $this->trucks_types ))
            throw new BgaVisibleSystemException( ("Unknown truck"));
        $fromPosition = $this->getCurrentTruckPosition($truckId,$player_id);
        $truck_material = $this->trucks_types[$truckId];
        $path_size = $truck_material ['path_size'];
        $truck_max_position = end($path_size);
        if($position <=$fromPosition || $position > $truck_max_position )
            throw new BgaVisibleSystemException( ("Wrong position"));
        if($isDelivery && array_search($position,$path_size) ===FALSE)
            throw new BgaVisibleSystemException( ("You cannot deliver here"));
        $trucks_cargos = $this->getTruckCargos($player_id);
        if( $this->cardAlreadyUsed($player_id,$card, $trucks_cargos))  {
            throw new BgaVisibleSystemException( ("You already used that card"));
        }
        $amount = $position - $fromPosition;
        $originalAvailableOvertime = $this->getPlayerAvailableOvertimeHoursPrivateState($player_id);
        $usedOvertime = max(0,$amount - $card['type_arg']);
        if($usedOvertime > $originalAvailableOvertime)
            throw new BgaVisibleSystemException( ("You don't have enough overtime hours to do that"));
        
        //LOGIC CHECKS
        $truckState = $this->getCurrentTruckState($truckId,$player_id);
        $truckCargos = $trucks_cargos [$truckId];
        $cardMovePower = $card['type_arg'];
        $card['type_arg'] = $amount; //Don't save this in card, but allow to run rules on this value
        $cardUsedPower = $this->getCardUsedPowerForMoves($player_id, $cardId);
        if($this->isPossibleMoveWithCard($card,$fromPosition,$truckState,$truckCargos,$truckId,$position,$cardMovePower,$cardUsedPower) == false ) {
            throw new BgaVisibleSystemException( ("You cannot move to this place"));
        }
        
        //REAL ACTION :
        $newState = STATE_MOVE_TO_CONFIRM;
        $truckScore = 0;
        if($isDelivery) $newState = STATE_MOVE_DELIVERED_TO_CONFIRM;
        $this->insertMoveTruck($player_id,$truckId, $fromPosition, $position, $newState,$cardId,$usedOvertime);
        $truckPositions = $this->getTruckPositions($truckId,$player_id);
        if($isDelivery) {
            $truckScore = $this->computeScore($player_id,$truckId,$truckCargos,$truckPositions);
        }
        $availableOvertime = $originalAvailableOvertime - $usedOvertime;
        
        //NOTIFY ACTION :
        self::notifyPlayer($player_id, "moveTruck", clienttranslate( 'You move a truck' ), array(
            'fromPosition' => $fromPosition,
            'position' => $position,
            'truckId' => $truckId,
            'card_id' => $cardId,
            'truckState' => $truckPositions,
            'truckScore' => $truckScore,
            'availableOvertime' => $availableOvertime,
        ) );
        
        //resend possiblePositions (MOVE become possible)
        self::notifyPlayer($player_id, "possibleCards", '', array(
            'possibleCards' => $this->getPlayerPossibleCards($player_id ),
        ) );
        
        //Should not be public but the framework prefers to get minimum 1 notifyAll per action ?...
        self::notifyAllPlayers("moveTruckPublic", '', '' );
    }
    
    function endTurn(){
        self::checkAction( 'endTurn' ); 
        
        $player_id = self::getCurrentPlayerId();
        $player_name = self::getCurrentPlayerName();
        self::trace("endTurn($player_id,$player_name )");
        
        self::notifyAllPlayers("endTurn", clienttranslate( '${player_name} ends his turn' ), array(
            'player_id' => $player_id,
            'player_name' => $player_name,
        ) );
        
        // END PLAYER turn and go to next state when everyone is ready
        $this->gamestate->setPlayerNonMultiactive( $player_id, 'next');
    }
    
    /**
    ACTION OF CANCELING is possible even when player is not ACTIVE, and the objective is to make them active again
    */
    function cancelTurn() {
        $this->gamestate->checkPossibleAction('cancelTurn');
        
        $player_id = self::getCurrentPlayerId();
        $player_name = self::getCurrentPlayerName();
        self::trace("cancelTurn($player_id)");
        
        $this->cancelTurnActions($player_id);
        
        //TODO JSA notif player to refresh UI datas
       
        self::notifyAllPlayers("cancelTurn", clienttranslate( '${player_name} restarts his turn' ), array(
            'player_id' => $player_id,
            'player_name' => $player_name,
        ) );
        
        self::notifyPlayer($player_id,"cancelTurnDatas", '', array(
            'availableOvertime' => $this->getPlayerAvailableOvertimeHoursPrivateState($player_id),
            'possibleCards' => $this->getPlayerPossibleCards($player_id ),
            'newScore' => $this->dbGetScore($player_id),
        ) );
        
        $this->gamestate->setPlayersMultiactive(array ($player_id), 'next', false);
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
        
        $privateDatas = array ();
        
        foreach($players as $player_id => $player){
            $privateDatas[$player_id] = array(
                'possibleCards' => $this->getPlayerPossibleCards($player_id ),
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
        
        $players = self::loadPlayersBasicInfos();
        
        $turn = self::incGameStateValue( 'turn_number',1 );
        
        //Flip three cards face up from the draw deck  :
        $weekLocation = $this->getCurrentWeekLocation();
        $newCards = $this->cards->pickCardsForLocation( NB_CARDS_BY_TURN, $weekLocation, DECK_LOCATION_DAY,0, true );
        
        $maxTurn = NB_CARDS_BY_WEEK / NB_CARDS_BY_TURN;
        
        $availableOvertimes = array();
        foreach($players as $player_id => $player){ 
            $availableOvertime = $this->getPlayerAvailableOvertimeHours($player_id);
            $availableOvertimes[$player_id] = array('availableOvertime' => $availableOvertime );
            
        }
        
        //NOTIF ALL about new cards
        self::notifyAllPlayers( "newTurn", clienttranslate( 'Day ${day}/${max} : the game draws new cards' ), array( 
            'newCards' => $newCards,
            'day' => $turn,
            'max' => $maxTurn,
            'availableOvertimes' => $availableOvertimes,
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
        
        
        $players = self::loadPlayersBasicInfos();
        $round = self::getGameStateValue( 'round_number');
        
        //Discard cards from board
        $this->cards->moveAllCardsInLocation( DECK_LOCATION_DAY, 'discard' );
    
        $week = $this->getCurrentWeekLocation();
        
        $this->confirmTurnActions($players);
        
        //TODO JSA notify all players actions
        
        //update players score
        foreach($players as $player_id => $player){
            //UPDATE player week score
            $score = $this->computePlayerWeekScore( $player_id);
            self::setStat( $score, "score_week".$round, $player_id );
            //UPDATE player total score
            $newPlayerScore = $this->computePlayerTotalScore( $player_id);
            $this->dbUpdatePlayerScore($player_id,$newPlayerScore);
            
            $player_name = $player['player_name'];
            self::notifyAllPlayers( "endTurnScore", '', array( 
                'player_id' => $player_id,
                'player_name' => $player_name,
                'k' => $round,
                'nb' => $score,
                'newScore' => $newPlayerScore,
            ) );
        }
        
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
        
        $players = self::loadPlayersBasicInfos();
        
        $round = self::getGameStateValue( 'round_number');
        
        foreach($players as $player_id => $player){
            //Score computation is done in stEndTurn
            $score = self::getStat( "score_week".$round, $player_id );
            //get UPDATED player score
            $newPlayerScore = $this->dbGetScore($player_id);
            
            $player_name = $player['player_name'];
            self::notifyAllPlayers( "newWeekScore", clienttranslate( '${player_name} scores ${nb} points for week ${k}' ), array( 
                'player_id' => $player_id,
                'player_name' => $player_name,
                'nb' => $score,
                'k' => $round,
                'newScore' => $newPlayerScore,
            ) );
        }
        
        
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
