/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * FlipFreighters implementation : © joesimpson <1324811+joesimpson@users.noreply.github.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * flipfreighters.js
 *
 * FlipFreighters user interface script
 * 
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter"
],
function (dojo, declare) {
    return declare("bgagame.flipfreighters", ebg.core.gamegui, {
        constructor: function(){
            console.log('flipfreighters constructor');
              
            // Here, you can init the global variables of your user interface
            // Example:
            // this.myGlobalValue = 0;
            
            this.dayCards = [];
            this.possibleCards = [];
            this.selectedCard = null;
            this.selectedAmount = null;//Not always the card value, with overtime hours

        },
        
        /*
            setup:
            
            This method must set up the game user interface according to current game situation specified
            in parameters.
            
            The method is called each time the game interface is displayed to a player, ie:
            _ when the game starts
            _ when a player refreshes the game page (F5)
            
            "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
        */
        
        setup: function( gamedatas )
        {
            console.log( "Starting game setup",gamedatas );
            
            // Setting up player boards
            for( let player_id in gamedatas.players )
            {
                let player = gamedatas.players[player_id];
                         
                // Setting up players boards if needed
            
                let playerContainers = dojo.query(".ffg_container[data_player='"+player_id+"']");
                let playerTrucks = dojo.query(".ffg_truck[data_player='"+player_id+"']");
                    
                if(this.player_id == player_id){ //CURRENT player
                    playerContainers.connect( 'onclick', this, 'onSelectLoadTarget' );
                }
                else {
                    //TODO JSA update other players, instead of destroying them (destroy for now because it is displayed in the same place for every one)
                    playerContainers.forEach(dojo.destroy);
                    playerTrucks.forEach(dojo.destroy);
                    
                }
            }
            
            this.dayCards = gamedatas.dayCards;
            
            dojo.query("#playerBoardSliderSize").connect( 'oninput', this, 'onBoardSliderChange' );
            
            // TODO: Set up your game interface here, according to "gamedatas"
            
            dojo.query(".ffg_card").connect( 'onclick', this, 'onSelectCard' );
            dojo.query(".ffg_not_drawn_pos").connect( 'onclick', this, 'onSelectTruckPos' );
            

            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();

            console.log( "Ending game setup" );
        },
       

        ///////////////////////////////////////////////////
        //// Game & client states
        
        // onEnteringState: this method is called each time we are entering into a new game state.
        //                  You can use this method to perform some user interface changes at this moment.
        //
        onEnteringState: function( stateName, args )
        {
            console.log( 'Entering state: '+stateName,args.args );
            
            switch( stateName )
            {
            case 'newTurn':
                //Prepare to flip all cards :
                dojo.query(".ffg_card").forEach("dojo.removeClass(item,'ffg_card_back');"); 
                break;
               
            case 'playerTurn':
                this.possibleCards = [];
                if(args.args._private !=undefined){
                    if(args.args._private.possibleCards!=undefined){
                        this.possibleCards = args.args._private.possibleCards;
                    }
                } 
                break;
                
            case 'endTurn':
                //Unflip all cards :
                dojo.query(".ffg_card").forEach("item.setAttribute('data_id',0); item.setAttribute('data_value',0); item.setAttribute('data_suit',0); dojo.addClass(item,'ffg_card_back');"); 
                break;
            }
        },

        // onLeavingState: this method is called each time we are leaving a game state.
        //                 You can use this method to perform some user interface changes at this moment.
        //
        onLeavingState: function( stateName )
        {
            console.log( 'Leaving state: '+stateName );
            
            switch( stateName )
            {
            
            /* Example:
            
            case 'myGameState':
            
                // Hide the HTML block we are displaying only during this game state
                dojo.style( 'my_html_block_id', 'display', 'none' );
                
                break;
           */
           
           
            case 'dummmy':
                break;
            }               
        }, 

        // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
        //                        action status bar (ie: the HTML links in the status bar).
        //        
        onUpdateActionButtons: function( stateName, args )
        {
            console.log( 'onUpdateActionButtons: '+stateName );
                      
            if( this.isCurrentPlayerActive() )
            {            
                switch( stateName )
                {
/*               
                 Example:
 
                 case 'myGameState':
                    
                    // Add 3 action buttons in the action status bar:
                    
                    this.addActionButton( 'button_1_id', _('Button 1 label'), 'onMyMethodToCall1' ); 
                    this.addActionButton( 'button_2_id', _('Button 2 label'), 'onMyMethodToCall2' ); 
                    this.addActionButton( 'button_3_id', _('Button 3 label'), 'onMyMethodToCall3' ); 
                    break;
*/
                }
            }
        },        

        ///////////////////////////////////////////////////
        //// Utility methods
        
        /*
        
            Here, you can defines some utility methods that you can use everywhere in your javascript
            script.
        
        */
 
        ajaxcallwrapper: function(action, args, handler) {
            if (!args) {
                args = {};
            }
            //Beware of "Move recorded, waiting for update...." when lock enabled
            args.lock = true;

            if (this.checkAction(action)) {
                this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html", args, this, (result) => { }, handler);
            }
        },
        
        playCardOnTable: function( row,card_id, color, value )
        {            
            console.log( "playCardOnTable ... " ,row,card_id, color, value);
            
            let divId = "#ffg_card_"+row;
            let div = dojo.query(divId)[0];
            if(div == undefined) {
                console.log( "playCardOnTable ...ERROR undefined row", row );
                return;
            }
            //UPDATE div datas :
            div.setAttribute("data_id",card_id);
            div.setAttribute("data_suit",color);
            div.setAttribute("data_value",value);
            dojo.addClass(divId,"ffg_selectable") ;
            
            //TODO JSA ADD some animation ?
        },
        
        displayPossibleLoading: function( card_id )
        {            
            console.log( "displayPossibleLoading ... " ,card_id, this.possibleCards);
            
            dojo.query(".ffg_container").removeClass("ffg_selectable") ;
             
            if(card_id == null){
                return;
            }
            
            if(this.possibleCards [ card_id ] == undefined) {
                console.log( "displayPossibleLoading ... Not possible card :", card_id );
                return ;
            }
            
            let containersToDisplay = this.possibleCards [ card_id ]["LOAD"];//array of container ids
            for(i in containersToDisplay){
                let container_id = containersToDisplay[i];
                let containerDivId = "ffg_container_"+this.player_id+"_"+container_id;
                //let containerDiv = dojo.query("#"+containerDivId);
                dojo.addClass(containerDivId,"ffg_selectable") ;
            }
        },
        displayPossibleMoves: function( card_id )
        {            
            console.log( "displayPossibleMoves ... " ,card_id, this.possibleCards);
            
            dojo.query(".ffg_truck_pos").removeClass("ffg_selectable") ;
             
            if(card_id == null){
                return;
            }
            
            if(this.possibleCards [ card_id ] == undefined) {
                console.log( "displayPossibleMoves ... Not possible card :", card_id );
                return ;
            }
            
            let movesToDisplay = this.possibleCards [ card_id ]["MOVE"];
            for(i in movesToDisplay){
                let pos_id = movesToDisplay[i];
                let pos_DivId = "ffg_truck_pos_"+this.player_id+"_"+pos_id;
                dojo.addClass(pos_DivId,"ffg_selectable") ;
            }
        },
        
        unselectCard : function()
        {
            console.log( "unselectCard ... ");
            
            this.selectedCard = null;
            this.selectedAmount = null;
            dojo.query(".ffg_card").removeClass("ffg_selected") ;
            dojo.query(".ffg_container").removeClass("ffg_selectable") ;
            dojo.query(".ffg_truck_pos").removeClass("ffg_selectable") ;
        },
        
        /**
        remove possible actions (of this type) for all cards on the parametered position
        */
        cleanPossibleCardForPos: function(type, posId)
        {
            console.log( "cleanPossibleCardForPos ... ",posId);
            for(let i in this.possibleCards){
                let pcard = this.possibleCards[i][type];
                let index = pcard.indexOf(posId);
                pcard.splice(index, 1);
            }
            
        },

        ///////////////////////////////////////////////////
        //// Player's action
        
        /*
        
            Here, you are defining methods to handle player's action (ex: results of mouse click on 
            game objects).
            
            Most of the time, these methods:
            _ check the action is possible at this game state.
            _ make a call to the game server
        
        */
        
        /* Example:
        
        onMyMethodToCall1: function( evt )
        {
            console.log( 'onMyMethodToCall1' );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );

            // Check that this action is possible (see "possibleactions" in states.inc.php)
            if( ! this.checkAction( 'myAction' ) )
            {   return; }

            this.ajaxcall( "/flipfreighters/flipfreighters/myAction.html", { 
                                                                    lock: true, 
                                                                    myArgument1: arg1, 
                                                                    myArgument2: arg2,
                                                                    ...
                                                                 }, 
                         this, function( result ) {
                            
                            // What to do after the server call if it succeeded
                            // (most of the time: nothing)
                            
                         }, function( is_error) {

                            // What to do after the server call in anyway (success or failure)
                            // (most of the time: nothing)

                         } );        
        },        
        
        */
        
        /**
        Slider Handler :
        */
        onBoardSliderChange: function( evt )
        {
            console.log( 'onBoardSliderChange',evt.currentTarget.value );
            document.querySelector(":root").style.setProperty("--ffg_board_display_scale",evt.currentTarget.value /100);
        },        
        /**
        Click Handler for choosing a card on the left : 
        */
        onSelectCard: function( evt )
        {
            console.log( 'onSelectCard',evt );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );
            
            dojo.query(".ffg_card").removeClass("ffg_selected") ;
            
            let div_id = evt.currentTarget.id;
            let card_id= evt.currentTarget.getAttribute("data_id") ;
            let data_value= evt.currentTarget.getAttribute("data_value") ;
            
            if(this.selectedCard == card_id ){
                //IF ALREADY DISPLAYED , hide
                this.selectedCard = null;
                this.selectedAmount = null;
                console.log("onSelectCard() => Hide :",card_id);
                this.displayPossibleLoading( null);
                this.displayPossibleMoves( null);
                return;
            } //ELSE continue to SHOW
            
            dojo.addClass(div_id,"ffg_selected") ;
                
            this.selectedCard = card_id;
            this.selectedAmount = data_value;
            this.displayPossibleLoading( card_id);
            this.displayPossibleMoves( card_id);
            
        },        
        /**
        Click Handler for the trucks loading containers : 
        */
        onSelectLoadTarget: function( evt )
        {
            console.log( 'onSelectLoadTarget',evt );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );
            
            let div_id = evt.currentTarget.id;
            let container_id = evt.currentTarget.getAttribute("data_id") ;
            let cardId = this.selectedCard;
            let amount = this.selectedAmount;
            
            if( ! dojo.hasClass( div_id, 'ffg_selectable' ) )
            {
                // This is not a possible action => the click does nothing
                return ;
            }
            
            this.ajaxcallwrapper("loadTruck", {'cardId': cardId, 'containerId': container_id, 'amount': amount});
        },     

        /**
        Click Handler for the trucks moves positions : 
        */
        onSelectTruckPos: function( evt )
        {
            console.log( 'onSelectTruckPos',evt );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );
            
            let div_id = evt.currentTarget.id;
            let position = evt.currentTarget.getAttribute("data_position") ;
            let truck_id = evt.currentTarget.getAttribute("data_truck") ;
            let cardId = this.selectedCard;
            
            if( ! dojo.hasClass( div_id, 'ffg_selectable' ) )
            {
                // This is not a possible action => the click does nothing
                return ;
            }
            
            this.ajaxcallwrapper("moveTruck", {'cardId': cardId, 'truckId': truck_id, 'position': position,});
        },   
        
        ///////////////////////////////////////////////////
        //// Reaction to cometD notifications

        /*
            setupNotifications:
            
            In this method, you associate each of your game notifications with your local method to handle it.
            
            Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                  your flipfreighters.game.php file.
        
        */
        setupNotifications: function()
        {
            console.log( 'notifications subscriptions setup' );
            
            // TODO: here, associate your game notifications with local methods
            
            // Example 1: standard notification handling
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            
            // Example 2: standard notification handling + tell the user interface to wait
            //            during 3 seconds after calling the method in order to let the players
            //            see what is happening in the game.
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            // this.notifqueue.setSynchronous( 'cardPlayed', 3000 );
            // 
            
            dojo.subscribe( 'newTurn', this, "notif_newTurn" );
            dojo.subscribe( 'loadTruck', this, "notif_loadTruck" );
            dojo.subscribe( 'moveTruck', this, "notif_moveTruck" );
        },  
        
        //  from this point and below, you can write your game notifications handling methods
        
        notif_newTurn: function( notif )
        {
            console.log( 'notif_newTurn',notif );
            
            for ( let i in notif.args.newCards) {
                let card = notif.args.newCards[i];
                let color = card.type;
                let value = card.type_arg;     
                this.playCardOnTable(i,card.id, color, value );
            }
        },  

        notif_loadTruck: function( notif )
        {
            console.log( 'notif_loadTruck',notif );
            
            let containerDivId = "ffg_container_"+this.player_id+"_"+notif.args.containerId;
            let div = dojo.query("#"+containerDivId)[0];
            if(div == undefined) {
                console.log( "notif_loadTruck ...ERROR not found truck container", containerDivId );
                return;
            }
            //UPDATE div datas :
            div.setAttribute("data_amount",notif.args.amount);
            div.setAttribute("data_state",notif.args.state);
            div.setAttribute("data_card",notif.args.card_id);
            
            //ffg_container_number
            let numberDiv = dojo.query("#"+containerDivId+">.ffg_container_number")[0];
            numberDiv.innerHTML=notif.args.amount;
            
            //Remove possible selection of this place
            dojo.removeClass(containerDivId,"ffg_selectable") ;
            
            //unselect card
            this.unselectCard();
            
            //TODO JSA DISABLE THIS CARD FOR FURTHER ACTIONS
            
            //Update possible loads by removing the one we did
            this.cleanPossibleCardForPos("LOAD",notif.args.containerId);
            
        },
        
        notif_moveTruck: function( notif )
        {
            console.log( 'notif_moveTruck',notif );
            
            let truckDivId = "ffg_truck_"+this.player_id+"_"+notif.args.truckId;
            let truckDiv = dojo.query("#"+truckDivId)[0];
            if(truckDiv == undefined) {
                console.log( "notif_moveTruck ...ERROR not found truck", truckDivId );
                return;
            }
            
            let posId = notif.args.truckId+"_"+notif.args.position;
            let posDivId = "ffg_truck_pos_"+this.player_id+"_"+posId;
            let div = dojo.query("#"+posDivId)[0];
            if(div == undefined) {
                console.log( "notif_moveTruck ...ERROR not found truck position", posDivId );
                return;
            }
            //UPDATE truck div datas :
            truckDiv.setAttribute("data_confirmed_state",notif.args.truckState.confirmed_state);
            truckDiv.setAttribute("data_confirmed_position",notif.args.truckState.confirmed_position);
            truckDiv.setAttribute("data_not_confirmed_state",notif.args.truckState.not_confirmed_state);
            truckDiv.setAttribute("data_not_confirmed_position",notif.args.truckState.not_confirmed_position);
            
            //unselect card
            this.unselectCard();
            
            //TODO JSA DISABLE THIS CARD FOR FURTHER ACTIONS
            
            //Update possible moves by removing the one we did  (and the corresponding previous places too !)
            for (let k=parseInt(notif.args.fromPosition) +1 ; k<= notif.args.position; k++ ){
                let posId = notif.args.truckId+"_"+k;
                console.log( 'notif_moveTruck() ... Removing possible position',posId );
                this.cleanPossibleCardForPos("MOVE",posId);
                
                //UPDATE div classes :
                let posDivId = "ffg_truck_pos_"+this.player_id+"_"+posId;
                dojo.removeClass(posDivId,"ffg_not_drawn_pos") ;
                dojo.addClass(posDivId,"ffg_not_confirmed_pos") ;
                
                //Remove possible selection of this place
                dojo.removeClass(posDivId,"ffg_selectable") ;
            }
            
        },
        
   });             
});

//# sourceURL=flipfreighters.js