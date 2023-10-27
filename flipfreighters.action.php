<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * FlipFreighters implementation : © joesimpson <1324811+joesimpson@users.noreply.github.com>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * flipfreighters.action.php
 *
 * FlipFreighters main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/flipfreighters/flipfreighters/myAction.html", ...)
 *
 */
  
  
  class action_flipfreighters extends APP_GameAction
  { 
    // Constructor: please do not modify
   	public function __default()
  	{
  	    if( self::isArg( 'notifwindow') )
  	    {
            $this->view = "common_notifwindow";
  	        $this->viewArgs['table'] = self::getArg( "table", AT_posint, true );
  	    }
  	    else
  	    {
            $this->view = "flipfreighters_flipfreighters";
            self::trace( "Complete reinitialization of board game" );
      }
  	} 
  	
  	// TODO: defines your action entry points there


    /*
    
    Example:
  	
    public function myAction()
    {
        self::setAjaxMode();     

        // Retrieve arguments
        // Note: these arguments correspond to what has been sent through the javascript "ajaxcall" method
        $arg1 = self::getArg( "myArgument1", AT_posint, true );
        $arg2 = self::getArg( "myArgument2", AT_posint, true );

        // Then, call the appropriate method in your game logic, like "playCard" or "myAction"
        $this->game->myAction( $arg1, $arg2 );

        self::ajaxResponse( );
    }
    
    */
    public function loadTruck()
    {
        self::setAjaxMode();     

        // Retrieve arguments
        // Note: these arguments correspond to what has been sent through the javascript "ajaxcall" method
        $containerId = self::getArg( "containerId", AT_alphanum, true );
        $amount = self::getArg( "amount", AT_posint, true );
        $cardId = self::getArg( "cardId", AT_posint, true );
        $suit = self::getArg( "suit", AT_posint, false );

        // Then, call the appropriate method in your game logic 
        $this->game->loadTruck($cardId, $containerId, $amount,$suit );

        self::ajaxResponse( );
    }
    
    public function getPossibleLoads()
    {
        self::setAjaxMode();     

        // Retrieve arguments
        // Note: these arguments correspond to what has been sent through the javascript "ajaxcall" method
        $containerId = self::getArg( "containerId", AT_alphanum, true );

        // Then, call the appropriate method in your game logic 
        $this->game->getPossibleLoads($containerId );

        self::ajaxResponse( );
    }

    public function getPossibleActionsForCard()
    {
        self::setAjaxMode();     

        // Retrieve arguments
        // Note: these arguments correspond to what has been sent through the javascript "ajaxcall" method
        $cardId = self::getArg( "cardId", AT_posint, true );
        $amount = self::getArg( "amount", AT_posint, true );
        $suit = self::getArg( "suit", AT_posint, false );

        // Then, call the appropriate method in your game logic 
        $this->game->getPossibleActionsForCard($cardId, $amount, $suit );

        self::ajaxResponse( );
    }
    
    public function moveTruck()
    {
        self::setAjaxMode();     

        // Retrieve arguments
        // Note: these arguments correspond to what has been sent through the javascript "ajaxcall" method
        $position = self::getArg( "position", AT_posint, true );
        $truckId = self::getArg( "truckId", AT_alphanum, true );
        $cardId = self::getArg( "cardId", AT_posint, true );
        $isDelivery = self::getArg( "isDelivery", AT_bool, true );

        // Then, call the appropriate method in your game logic 
        $this->game->moveTruck($cardId, $truckId, $position, $isDelivery );

        self::ajaxResponse( );
    }
    
    public function endTurn()
    {
        self::setAjaxMode();     

        // Then, call the appropriate method in your game logic 
        $this->game->endTurn();

        self::ajaxResponse( );
    }
    
    public function cancelTurn() {
       self::setAjaxMode();
       $this->game->cancelTurn();
       self::ajaxResponse();
   }
  }
  

