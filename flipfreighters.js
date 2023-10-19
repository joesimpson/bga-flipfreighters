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
            this.selectedCargoContainer = null;
            this.material = [];
            
            this.constants = [];
            this.currentRound = 1;
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
            
            this.constants  = gamedatas.constants;
            this.currentRound = gamedatas.round_number;//TODO JSA update on new round
            
            // Setting up player boards
            for( let player_id in gamedatas.players )
            {
                let player = gamedatas.players[player_id];
                         
                // Setting up players boards if needed
            
                let playerContainers = dojo.query(".ffg_container[data_player='"+player_id+"']");
                let playerTrucks = dojo.query(".ffg_truck[data_player='"+player_id+"']");
                    
                if(this.player_id == player_id){ //CURRENT player
                    playerContainers.connect( 'onclick', this, 'onSelectLoadTarget' );
                    this.displayPlayerScores(player);
                }
                else {
                    //TODO JSA update other players, instead of destroying them (destroy for now because it is displayed in the same place for every one)
                    playerContainers.forEach(dojo.destroy);
                    playerTrucks.forEach(dojo.destroy);
                }
            }
            
            this.material = gamedatas.material;
            this.dayCards = gamedatas.dayCards;
            
            dojo.query("#playerBoardSliderSize").connect( 'oninput', this, 'onBoardSliderChange' );
            
            // TODO: Set up your game interface here, according to "gamedatas"
            
            dojo.query(".ffg_card").connect( 'onclick', this, 'onSelectCard' );
            dojo.query(".ffg_not_drawn_pos").connect( 'onclick', this, 'onSelectTruckPos' );
            
            dojo.query(".ffg_cargo_amount").connect( 'onclick', this, 'onSelectCargoAmount' );

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

                case 'playerTurn':
                    this.addActionButton( 'ffg_button_endturn', _('End turn'), 'onEndTurn' ); 
                    break;
                }
            }  
            else if (!this.isSpectator) { // player is NOT active but not spectator either
                switch( stateName )
                {
                case 'playerTurn':
                    this.addActionButton( 'ffg_button_cancelturn', _('Restart turn'), 'onCancelTurn',null, false, 'red' );
                    break;
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
            if (this.checkAction(action)) {
                this.ajaxcallwrapperNoCheck(action, args, handler);
            }
        },
        ajaxcallwrapperNoCheck: function(action, args, handler) {
            if (!args) {
                args = {};
            }
            //Beware of "Move recorded, waiting for update...." when lock enabled
            args.lock = true;

            this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html", args, this, (result) => { }, handler);
        },
        
        playCardOnTable: function( row,card_id, color, value )
        {            
            console.log( "playCardOnTable ... " ,row,card_id, color, value);
            
            let divId = "ffg_card_"+row;
            let div = dojo.query("#"+divId)[0];
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
        
        displayPossibleLoads: function( card_id )
        {            
            console.log( "displayPossibleLoads ... " ,card_id, this.possibleCards);
            
            dojo.query(".ffg_container").removeClass("ffg_selectable") ;
             
            if(card_id == null){
                return;
            }
            
            if(this.possibleCards [ card_id ] == undefined) {
                console.log( "displayPossibleLoads ... Not possible card :", card_id );
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
            this.selectedCargoContainer = null;
            dojo.query(".ffg_card").removeClass("ffg_selected") ;
            dojo.query(".ffg_container").removeClass("ffg_selectable") ;
            dojo.query(".ffg_truck_pos").removeClass("ffg_selectable") ;
            dojo.query(".ffg_cargo_amount").removeClass("ffg_selectable");
            dojo.query("#ffg_cargo_amount_list").addClass("ffg_hidden");
            dojo.query(".ffg_cargo_to_fill").removeClass("ffg_cargo_to_fill");
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

        /**
        Return true if at least 1 card is still playable
                false otherwise  (ie all cards are non playable)
        */
        existPossibleCard: function()
        {
            console.log( "existPossibleCard()", this.possibleCards);
            
            for(let i in this.possibleCards){
                let pcard = this.possibleCards[i];
                if( pcard["LOAD"].length > 0 ) return true;
                if( pcard["MOVE"].length > 0 ) return true;
            }
            
            return false;
        },
        
        displayTruckScore: function(player_id, truckScore, truckDivId){
            console.log("displayTruckScore",player_id, truckScore, truckDivId);
            
            let numberDivs = dojo.query("#"+truckDivId+" .ffg_score_number");
            
            for(let i in numberDivs){
                numberDivs[i].innerHTML=truckScore;
            }
           
        },
        
        displayPlayerScores: function(playerDatas){
            console.log("displayPlayerScores",playerDatas);
            
            let k=1;
            while( k< this.currentRound ){
                let weekscore = playerDatas['score_week'+k];
                this.updatePlayerWeekScore(playerDatas.id,k,weekscore);
                k++;
            }
            //TODO JSA when do we display last week ?
            //+ TODO JSA display sum of all weeks at end of game
        },
        
        updatePlayerWeekScore: function(player_id, round,weekscore) {
            console.log("updatePlayerWeekScore",player_id, weekscore , round);
            if(this.player_id == player_id){//CURRENT player
                let numberDiv = dojo.query("#ffg_week_score_"+player_id+"_"+round+" .ffg_score_number")[0];
                numberDiv.innerHTML = weekscore;
            }
            else {
                //TODO JSA displayer other players elsewhere
            }
        },
        
        /**
        Update BGA player panel score
        */
        updatePlayerScore: function(player_id,score) {
            console.log("updatePlayerScore",player_id, score);
            this.scoreCtrl[ player_id ].toValue( score );
        },
        
        /**
        Update BGA player panel score : by increasing whatever the current score value is
        (Useful when we don't want to compute all the score again)
        */
        increasePlayerScore: function(player_id,delta_score) {
            console.log("increasePlayerScore",player_id, delta_score);
            this.scoreCtrl[ player_id ].incValue( delta_score );
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
            dojo.query("#ffg_cargo_amount_list").addClass("ffg_hidden");
            dojo.query(".ffg_cargo_to_fill").removeClass("ffg_cargo_to_fill");
            
            let div_id = evt.currentTarget.id;
            let card_id= evt.currentTarget.getAttribute("data_id") ;
            let data_value= evt.currentTarget.getAttribute("data_value") ;
            
            if(this.selectedCard == card_id ){
                //IF ALREADY DISPLAYED , hide
                console.log("onSelectCard() => Hide :",card_id);
                this.unselectCard();
                this.displayPossibleLoads( null);
                this.displayPossibleMoves( null);
                return;
            } //ELSE continue to SHOW
            
            dojo.addClass(div_id,"ffg_selected") ;
                
            this.selectedCard = card_id;
            this.selectedAmount = data_value;
            this.displayPossibleLoads( card_id);
            this.displayPossibleMoves( card_id);
            
        },        
        /**
        Click Handler for the trucks cargo containers : 
        */
        onSelectLoadTarget: function( evt )
        {
            console.log( 'onSelectLoadTarget',evt );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );
            
            let div_id = evt.currentTarget.id;
            let container_id = evt.currentTarget.getAttribute("data_id") ;
            this.selectedCargoContainer = container_id;
            let cardId = this.selectedCard;
            if( cardId ==null || ! dojo.hasClass( div_id, 'ffg_selectable' ) )
            {
                // This is not a possible action => the click does nothing
                return ;
            }
            let cardSuit = dojo.query(".ffg_card[data_id="+cardId+"]")[0].getAttribute("data_suit") ;
            dojo.query(".ffg_cargo_to_fill").removeClass("ffg_cargo_to_fill");
            dojo.query("#ffg_cargo_amount_list").addClass("ffg_hidden");
            
            if( cardSuit == this.constants.JOKER_TYPE){
                dojo.query("#ffg_cargo_amount_list").removeClass("ffg_hidden");
                dojo.query("#"+div_id).addClass("ffg_cargo_to_fill");
                //let boardpos = dojo.position("ffg_board_current_player");
                //let dx = dojo.position(div_id).x - boardpos.x;
                //let dy = dojo.position(div_id).y - boardpos.y;
                //let dx = dojo.coords(div_id).x;
                //let dy = dojo.coords(div_id).y;
                //dojo.query("#ffg_cargo_amount_list").style("left", dx +"px").style("top", dy +"px") ;
                let divAmountList = dojo.query("#ffg_cargo_amount_list")[0];
                dojo.setMarginBox(divAmountList, {  l: dojo.getMarginBox(dojo.query( "#"+div_id)[0]  ).l, t: dojo.getMarginBox(dojo.query("#"+div_id)[0]  ).t  } ); 
                //this.placeOnObject( "ffg_cargo_amount_list", div_id);
                //this.slideToObject( "ffg_cargo_amount_list", div_id).play();
                dojo.query(".ffg_cargo_amount").addClass("ffg_selectable");
                return ;
            }
            //TODO JSA GET amount from overtime hours
            let amount = this.selectedAmount;
            
            this.ajaxcallwrapper("loadTruck", {'cardId': cardId, 'containerId': container_id, 'amount': amount});
        },     
        
        onSelectCargoAmount: function( evt )
        {
            console.log( 'onSelectCargoAmount',evt )
            // Preventing default browser reaction
            dojo.stopEvent( evt );;
            
            let div_id = evt.currentTarget.id;
            let data_amount = evt.currentTarget.getAttribute("data_amount") ;
            this.selectedAmount = data_amount;
            
            dojo.query(".ffg_cargo_to_fill").removeClass("ffg_cargo_to_fill");
            
            if( ! dojo.hasClass( div_id, 'ffg_selectable' ) )
            {
                // This is not a possible action => the click does nothing
                return ;
            }
            
            this.ajaxcallwrapper("loadTruck", {'cardId': this.selectedCard, 'containerId': this.selectedCargoContainer, 'amount': this.selectedAmount });
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
            let isDelivery = false;
            let truck_material = this.material.trucks_types[truck_id];
            
            
            if( ! dojo.hasClass( div_id, 'ffg_selectable' ) )
            {
                // This is not a possible action => the click does nothing
                return ;
            }
            
            if(truck_material.path_size.lastItem == position ){
                //LAST POSITION iS ALWAYS DELIVERED
                isDelivery = true;
            }
            else if(truck_material.path_size.length >1 && truck_material.path_size[0] == position ){
                // DISPLAY CONFIRM TO DELIVER AT "X1" half path
                const choices = [_("Yes"), _("No"), _("Cancel")];
                this.multipleChoiceDialog(_("Do you want to deliver this truck now (at x1) ?"), choices, (choice) => {
                    if (choice==0) isDelivery = true;
                    if (choice==1) isDelivery = false;
                    if (choice==2) return; // cancel operation, do not call server action
                    
                    this.ajaxcallwrapper("moveTruck", {'cardId': cardId, 'truckId': truck_id, 'position': position,'isDelivery': isDelivery,});
                });
                return; //(multipleChoiceDialog is async function)
            }
            
            this.ajaxcallwrapper("moveTruck", {'cardId': cardId, 'truckId': truck_id, 'position': position,'isDelivery': isDelivery,});
        },
        
        onEndTurn: function( evt )
        {
            console.log( 'onEndTurn',evt );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );
            
            if(this.existPossibleCard()){
                this.confirmationDialog(_("You still have cards to play, are you sure to end your turn ?"), () => {
                    this.ajaxcallwrapper("endTurn", { });
                });
                return;
            }
            
            this.ajaxcallwrapper("endTurn", { });
        },   
        
        onCancelTurn: function( evt )
        {
            console.log( 'onCancelTurn',evt );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );
            
            this.confirmationDialog(_("Are you sure you want to cancel your whole turn ?"), () => {
                this.ajaxcallwrapperNoCheck("cancelTurn", { });
            });
            return;
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
            dojo.subscribe( 'endTurnScore', this, "notif_endTurnScore" );
            dojo.subscribe( 'newWeekScore', this, "notif_newWeekScore" );
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
            dojo.query(".ffg_cargo_amount").removeClass("ffg_selectable");
            
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
            truckDiv.setAttribute("data_score",notif.args.truckScore);
            
            this.displayTruckScore(this.player_id, notif.args.truckScore,truckDivId);    
            this.increasePlayerScore(this.player_id,notif.args.truckScore);
            
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
        
        notif_endTurnScore: function( notif )
        {
            console.log( 'notif_endTurnScore',notif );
            this.updatePlayerWeekScore(notif.args.player_id,notif.args.k,notif.args.nb );
            this.updatePlayerScore(notif.args.player_id,notif.args.newScore );
        },
        
        notif_newWeekScore: function( notif )
        {
            console.log( 'notif_newWeekScore',notif );
            this.updatePlayerWeekScore(notif.args.player_id,notif.args.k,notif.args.nb );
            this.updatePlayerScore(notif.args.player_id,notif.args.newScore );
        },
   });             
});

//# sourceURL=flipfreighters.js