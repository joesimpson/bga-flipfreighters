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
            
            this.counterOvertime={};
            this.selectedOvertimeToken = null;
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
                    
                if(this.player_id == player_id){ //CURRENT player
                    playerContainers.connect( 'onclick', this, 'onSelectLoadTarget' );
                }
                this.displayPlayerScores(player);
                this.displayPlayerPanel(player_id,player);
                this.initPayerAvatar(player_id);
                
            }
            // TODO: Set up your game interface here, according to "gamedatas"
            
            if(!this.isSpectator){
                //Display current player board first :
                dojo.place("ffg_board_player_container_"+this.player_id, "ffg_all_players_board_wrap","first");
            }
            
            this.material = gamedatas.material;
            this.dayCards = gamedatas.dayCards;
            
            dojo.query(".ffg_card").forEach(this.updateOvertimeHourOnCard);
            
            this.initTooltips(this.material.tooltips);
            
            this.addTooltipToClass( "ffg_overtime_wrapper", _("Available overtime hours tokens"), '' );
            this.updatePlayersOvertimeHours(gamedatas.players);
            
            dojo.query("#playerBoardSliderSize").connect( 'oninput', this, 'onBoardSliderChange' );
            
            dojo.query(".ffg_card").connect( 'onclick', this, 'onSelectCard' );
            dojo.query(".ffg_current_player .ffg_truck_pos").connect( 'onclick', this, 'onSelectTruckPos' );
            
            dojo.query("#ffg_close_amount_list").connect( 'onclick', this, 'onCloseCargoAmountSelection' );
            dojo.query(".ffg_current_player .ffg_cargo_amount").connect( 'onclick', this, 'onSelectCargoAmount' );

            dojo.query(".ffg_current_player .ffg_overtime").connect( 'onclick', this, 'onSelectOvertimeHour' );
            
            dojo.query(".ffg_button_card_plus").connect( 'onclick', this, 'onClickCardPlus' );
            dojo.query(".ffg_button_card_minus").connect( 'onclick', this, 'onClickCardMinus' );
            
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
                this.unselectCard();
                break;
               
            case 'playerTurn':
                this.possibleCards = [];
                if(args.args._private !=undefined){
                    if(args.args._private.possibleCards!=undefined){
                        this.possibleCards = args.args._private.possibleCards;
                    }
                } 
                this.updatePossibleCards();
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
                    this.addActionButton( 'ffg_button_cancelturn', _('Restart turn'), 'onCancelTurn',null, false, 'red' );
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
        
        /*
        Init board avatar with the same as displayed by BGA player panel,
        */
        initPayerAvatar: function( player_id) {
            console.log( "initPayerAvatar ... " ,player_id);
            
            /*
            let bgaAvatar = dojo.query("#overall_player_board_"+player_id+" img#avatar_"+player_id) [0];
            if(bgaAvatar == undefined) return ;
            let imgsrc = bgaAvatar.getAttribute("src");
            */
            let imgsrc = this.getPlayerAvatar(player_id);
            let ffgAvatar = dojo.query("#ffg_player_avatar_"+player_id) [0];
            dojo.attr(ffgAvatar, "src", imgsrc); 
        },     
        // Studio cookBook function
        getPlayerAvatar: function(playerId) {
            let avatarURL = '';

            if (null != $('avatar_' + playerId)) {
                let smallAvatarURL = dojo.attr('avatar_' + playerId, 'src');
                avatarURL = smallAvatarURL;
            }
            else {
                avatarURL = 'https://x.boardgamearena.net/data/data/avatar/default_32.jpg';
            }

            return avatarURL;
        },        
        
        initTooltips: function (ffg_tooltips){
            console.log( "initTooltips ... " ,ffg_tooltips);
            
            for(let k in ffg_tooltips.trucks) {
                let message = ffg_tooltips.trucks[k];
                console.log( "initTooltip trucks... " ,k, message);
                this.addTooltipToClass( "ffg_truck_symbol_"+k, message,'' );
            }
            for(let k in ffg_tooltips.delivery_score) {
                let message = ffg_tooltips.delivery_score[k];
                console.log( "initTooltip delivery_score... " ,k, message);
                this.addTooltipToClass( "ffg_score_"+k, message,'' );
            }
            
            this.addTooltipToClass( "ffg_symbol_path_size", ffg_tooltips.path_size,'' );
            
        },
        
        updatePlayersOvertimeHours: function(players)
        {
            console.log( "updatePlayersOvertimeHours" ,players); 
            //RESET to 0 in case some player is not in the array
            for ( let i in this.counterOvertime) {
                this.counterOvertime[i].toValue(0);
            }
            for ( let player_id in players) {
                let nb = players[player_id].availableOvertime; 
                this.updatePlayerOvertimeHours(player_id,nb);
            }
        },
        updatePlayerOvertimeHours: function(player_id, nb)
        {
            console.log( "updatePlayerOvertimeHours" ,player_id, nb); 
            this.counterOvertime[player_id].toValue(nb);
            
            let selectableClass = "";
            if(player_id == this.player_id){//CURRENT PLAYER
                selectableClass = "ffg_selectable";
            }
            else {
                selectableClass = "ffg_selectable_for_others";
            }
            
            dojo.query(".ffg_overtime[data_player='"+player_id+"']").forEach( (item) => {  
                dojo.removeClass(item,"ffg_empty_value ffg_positive_value ffg_negative_value ffg_selectable ffg_selectable_for_others"); 
                if( parseInt(item.getAttribute("data_index"))<=nb ){
                    dojo.addClass(item,selectableClass); 
                } 
                dojo.addClass(item,"ffg_empty_value ");
            });
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
            let amount = value;
            div.setAttribute("data_amount",value);
            dojo.addClass(divId,"ffg_selectable") ;
            
            //TODO JSA ADD some animation ?
        },
        
        displayPlayerPanel: function( player_id,player)
        {
            console.log( "displayPlayerPanel" ,player_id,player); 
        
            let player_board_div = $('player_board_'+player_id);
            if(!player_board_div){
                console.error("Player panel not found",player_id);
            }
            dojo.place(  
                this.format_block(   
                    'jstpl_player_board_details',
                    {
                        player_id : player_id,
                    }
                ),
                player_board_div
            );
            this.counterOvertime[player_id] = new ebg.counter();
            this.counterOvertime[player_id].create("ffg_overtime_"+player_id); 
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
            dojo.query(".ffg_card_wrapper").removeClass("ffg_selected") ;
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
            console.log( "cleanPossibleCardForPos ... ",type,posId);
            for(let i in this.possibleCards){
                let pcard = this.possibleCards[i][type];
                let index = pcard.indexOf(posId);
                if(index >=0){
                    console.log( "cleanPossibleCardForPos ... delete index "+index+" for card "+i);
                    pcard.splice(index, 1);
                }
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
                if(this.isPossibleCard(i)) return true;
            }
            
            return false;
        },
        
        isPossibleCard: function(cardIndex)
        {
            console.log( "isPossibleCard()", cardIndex);
         
            let pcard = this.possibleCards[cardIndex];
            if( pcard["LOAD"].length > 0 ) return true;
            if( pcard["MOVE"].length > 0 ) return true; 
        
            return false;
        },
        
        updatePossibleCards: function()
        {
            console.log( "updatePossibleCards()");
         
            dojo.query(".ffg_card").removeClass("ffg_selectable");
            
            for(let card_id in this.possibleCards){
                if(this.isPossibleCard(card_id)){
                    dojo.query(".ffg_card[data_id='"+card_id+"']").addClass("ffg_selectable");
                }
            }
        },
        updateCargoAmountList: function(div_id,container_id,amount){
            console.log( "updateCargoAmountList()", div_id,container_id,amount);
            
            dojo.query("#ffg_cargo_amount_list").removeClass("ffg_hidden");
            dojo.query("#"+div_id).addClass("ffg_cargo_to_fill");
            let divAmountList = dojo.query("#ffg_cargo_amount_list")[0];
            dojo.setMarginBox(divAmountList, {  l: dojo.getMarginBox(dojo.query( "#"+div_id)[0]  ).l, t: dojo.getMarginBox(dojo.query("#"+div_id)[0]  ).t  } ); 
            
            dojo.query("#ffg_cargo_amount_loading").removeClass("ffg_no_display");
            dojo.query(".ffg_cargo_amount").removeClass("ffg_selectable").addClass("ffg_no_display");
            
            for(let k=1; k<= amount; k++){
                dojo.query("#ffg_cargo_amount_list_"+k).removeClass("ffg_no_display");
            }
        
            //TODO JSA don't call server for 1/2 trucks that we know allow all numbers
            //CALL SERVER to get updated possible numbers :
            this.ajaxcallwrapper("getPossibleLoads", {'containerId': container_id});
        },
        closeCargoAmountList: function(){
            console.log( "closeCargoAmountList()");
            dojo.query(".ffg_cargo_to_fill").removeClass("ffg_cargo_to_fill");
            dojo.query("#ffg_cargo_amount_list").addClass("ffg_hidden");
            this.selectedCargoContainer = null;
        },
        
        resetContainer: function(containerDiv){
            console.log( "resetContainer()",containerDiv);
            containerDiv.setAttribute("data_amount", "");
            containerDiv.setAttribute("data_state","0") ;
            containerDiv.setAttribute("data_card","") ;
            containerDiv.setAttribute("data_overtime","") ;
            let numberDiv = dojo.query("#"+containerDiv.id+">.ffg_container_number")[0];
            numberDiv.innerHTML = "";
        },
        
        displayOvertimeHoursOnCard: function()
        {
            console.log( "displayOvertimeHoursOnCard()");
             
            dojo.query(".ffg_card.ffg_selected .ffg_cardModifier").removeClass("ffg_empty_value ffg_positive_value ffg_negative_value");
            
            if(this.selectedCard >0 && this.selectedOvertimeToken != undefined){
                let div_id = this.selectedOvertimeToken;
                let data_index = parseInt(dojo.query("#"+div_id)[0].getAttribute("data_index") ); 
                let selectedCardDiv = dojo.query(".ffg_card.ffg_selected")[0] ;
                if( dojo.hasClass(div_id, "ffg_positive_value") ){
                    data_index = data_index;
                } else if( dojo.hasClass(div_id, "ffg_negative_value") ) {
                    data_index = -data_index;
                }
                else {
                    data_index = 0;
                }
                
                this.setOvertimeHoursOnCard(selectedCardDiv,data_index);
            }
        },
        
        resetOvertimeHourOnCard: function(cardDiv){
            console.log( "resetOvertimeHourOnCard()",cardDiv);
            let cardModifier =  dojo.query("#"+cardDiv.id+" .ffg_cardModifier")[0];
            let amount = parseInt(cardDiv.getAttribute("data_amount") ) ;
            let card_value = parseInt(cardDiv.getAttribute("data_value") ) ;
            cardDiv.setAttribute("data_amount", card_value);
            cardModifier.setAttribute("data_value",0) ;
            
            this.updateOvertimeHourOnCard(cardDiv);
        },
        updateOvertimeHourOnCard: function(cardDiv){
            console.log( "updateOvertimeHourOnCard()",cardDiv);
            let cardModifier =  dojo.query("#"+cardDiv.id+" .ffg_cardModifier")[0];
            let amount = parseInt(cardDiv.getAttribute("data_amount") ) ;
            let card_value = parseInt(cardDiv.getAttribute("data_value") ) ;

            let addClass ="";
            let delta = amount - card_value;
            if( delta>0 ){
                cardModifier.innerHTML ="+";
                addClass = "ffg_positive_value";
            } else if( delta<0 ) {
                cardModifier.innerHTML ="";
                addClass = "ffg_negative_value";
            }
            else {
                cardModifier.innerHTML = "";
                addClass = "ffg_empty_value";
            }
            cardModifier.innerHTML = cardModifier.innerHTML +delta;
            dojo.addClass(cardModifier,addClass);

            return addClass;
        },
        
        setOvertimeHoursOnCard: function(divCard, set_val)
        {
            console.log( "setOvertimeHoursOnCard()",divCard.id, null, set_val);
            this.increaseOvertimeHoursOnCard(divCard,null,set_val);
        },
        
        increaseOvertimeHoursOnCard: function(divCard, inc_val, set_val = undefined)
        {
            console.log( "increaseOvertimeHoursOnCard()",divCard.id,inc_val,set_val);
             
            dojo.query(".ffg_card.ffg_selected .ffg_cardModifier").removeClass("ffg_empty_value ffg_positive_value ffg_negative_value");
                        
            let delta = 0;
            let addClass ="";
            let selectedCardDiv = dojo.query(".ffg_card.ffg_selected")[0] ;
            let card_id = parseInt(selectedCardDiv.getAttribute("data_id") ) ;
            let card_type = parseInt(selectedCardDiv.getAttribute("data_suit") ) ;
            let card_value = parseInt(selectedCardDiv.getAttribute("data_value") ) ;
            let amount = parseInt(selectedCardDiv.getAttribute("data_amount") ) ;
            let selectedCardModifierQuery = dojo.query(".ffg_card.ffg_selected .ffg_cardModifier");
            let selectedCardModifier = selectedCardModifierQuery[0];
            if(selectedCardModifier!=undefined) {
                let data_value = parseInt(selectedCardModifier.getAttribute("data_value") ) ;
                
                if(set_val != undefined){
                    amount = card_value + set_val;
                    data_value = set_val;
                }
                else {
                    amount = amount +inc_val;
                    data_value = data_value + inc_val;
                }
                delta = amount - card_value;
                this.selectedAmount = amount;
                selectedCardDiv.setAttribute("data_amount", amount);
                selectedCardModifier.setAttribute("data_value",data_value) ;
                
                addClass = this.updateOvertimeHourOnCard(selectedCardDiv);
                
                let ffg_cargo_to_fill = dojo.query(".ffg_cargo_to_fill")[0];
                if(ffg_cargo_to_fill != undefined){
                    //this.updateCargoAmountList(ffg_cargo_to_fill.id, ffg_cargo_to_fill.getAttribute("data_id") ,this.selectedAmount);
                    //Updating will cause error "Please wait, an action is already in progress" because we call another action at the end of this method: we close this popup instead 
                    this.closeCargoAmountList();
                }
            }
            
            dojo.query(".ffg_overtime").forEach( ' dojo.removeClass(item,"ffg_empty_value ffg_positive_value ffg_negative_value"); if( parseInt(item.getAttribute("data_index"))<='+Math.abs(delta)+' ){   dojo.addClass(item,"'+addClass+'"); } else { dojo.addClass(item,"ffg_empty_value ");}' );
            
            //disable buttons and enable them again after receiving notif
            dojo.query(".ffg_button_card_plus").removeClass("ffg_selectable");
            dojo.query(".ffg_button_card_minus").removeClass("ffg_selectable");
            dojo.query(".ffg_overtime.ffg_selectable").addClass("ffg_selectable_wait");
            
            //CALL SERVER to refresh possible actions for this card ;
            this.ajaxcallwrapper("getPossibleActionsForCard", {'cardId': card_id,'amount': this.selectedAmount});
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
            
            let numberDiv = dojo.query("#ffg_week_score_"+player_id+"_"+round+" .ffg_score_number")[0];
            numberDiv.innerHTML = weekscore;
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
            
            let div_id = evt.currentTarget.id;
            
            if( ! dojo.hasClass( div_id, 'ffg_selectable' ) )
            {
                // This is not a possible action => the click does nothing
                return ;
            }
            
            dojo.query(".ffg_card").removeClass("ffg_selected") ;
            dojo.query(".ffg_card_wrapper").removeClass("ffg_selected") ;
            dojo.query("#ffg_cargo_amount_list").addClass("ffg_hidden");
            dojo.query(".ffg_cargo_to_fill").removeClass("ffg_cargo_to_fill");
            
            let card_id= evt.currentTarget.getAttribute("data_id") ;
            let data_value= evt.currentTarget.getAttribute("data_value") ;
            let data_amount= evt.currentTarget.getAttribute("data_amount") ;
            
            if(this.selectedCard == card_id ){
                //IF ALREADY DISPLAYED , hide
                console.log("onSelectCard() => Hide :",card_id);
                this.unselectCard();
                this.displayPossibleLoads( null);
                this.displayPossibleMoves( null);
                return;
            } //ELSE continue to SHOW
            
            dojo.addClass(div_id,"ffg_selected") ;
            dojo.query("#"+evt.currentTarget.parentElement.id ).addClass("ffg_selected") ; 
                
            this.selectedCard = card_id;
            this.selectedAmount = data_amount;
            this.displayOvertimeHoursOnCard();
            
            this.displayPossibleLoads( card_id);
            this.displayPossibleMoves( card_id);

        },     
        onClickCardPlus: function( evt )
        {
            console.log( 'onClickCardPlus',evt );
            
            let div_id = evt.currentTarget.id;
            if(! dojo.hasClass( div_id, 'ffg_selectable' ) )
            {
                return ;
            }
            
            let delta_value = parseInt(dojo.query(".ffg_card.ffg_selected .ffg_cardModifier")[0].getAttribute("data_value") ) ;
            if(Math.abs(delta_value +1) > this.counterOvertime[this.player_id].current_value ){
                //We cannot use more tokens
                return;
            }
            
            this.increaseOvertimeHoursOnCard(evt.currentTarget,1);
            
        },
        onClickCardMinus: function( evt )
        {
            console.log( 'onClickCardMinus',evt );
            
            let div_id = evt.currentTarget.id;
            if(! dojo.hasClass( div_id, 'ffg_selectable' ) )
            {
                return ;
            }
            
            let delta_value = parseInt(dojo.query(".ffg_card.ffg_selected .ffg_cardModifier")[0].getAttribute("data_value") ) ;
            if( Math.abs(delta_value - 1) > this.counterOvertime[this.player_id].current_value ){
                //We cannot use more tokens
                return;
            }
            let card_value = parseInt(dojo.query(".ffg_card.ffg_selected")[0].getAttribute("data_value") ) ;
            if( card_value + delta_value <=0 ){
                // we cannot use values under 1
                return;
            }
            
            this.increaseOvertimeHoursOnCard(evt.currentTarget,-1);
            
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
            let cardId = this.selectedCard;
            if( cardId ==null || ! dojo.hasClass( div_id, 'ffg_selectable' ) )
            {
                // This is not a possible action => the click does nothing
                return ;
            }
            if( ! dojo.hasClass("ffg_cargo_amount_list","ffg_hidden") && this.selectedCargoContainer == container_id ){
                //AMOUNT SELECTION already displayed, we want to hide this, like if we quit selection
                dojo.query(".ffg_cargo_to_fill").removeClass("ffg_cargo_to_fill");
                dojo.query("#ffg_cargo_amount_list").addClass("ffg_hidden");
                this.selectedCargoContainer = null;
                return ;
            }
            this.selectedCargoContainer = container_id;
            let cardSuit = dojo.query(".ffg_card[data_id="+cardId+"]")[0].getAttribute("data_suit") ;
            
            dojo.query(".ffg_cargo_to_fill").removeClass("ffg_cargo_to_fill");
            dojo.query("#ffg_cargo_amount_list").addClass("ffg_hidden");
            
            let amount = this.selectedAmount;
            
            if( cardSuit == this.constants.JOKER_TYPE){
                this.updateCargoAmountList(div_id,container_id,amount);
                return ;
            }
            
            this.ajaxcallwrapper("loadTruck", {'cardId': cardId, 'containerId': container_id, 'amount': amount});
        },
        
        onSelectCargoAmount: function( evt )
        {
            console.log( 'onSelectCargoAmount',evt )
            // Preventing default browser reaction
            dojo.stopEvent( evt );
            
            let div_id = evt.currentTarget.id;
            let data_amount = evt.currentTarget.getAttribute("data_amount") ;
            this.selectedAmount = data_amount;
            
            
            if( ! dojo.hasClass( div_id, 'ffg_selectable' ) )
            {
                // This is not a possible action => the click does nothing
                return ;
            }
            
            this.ajaxcallwrapper("loadTruck", {'cardId': this.selectedCard, 'containerId': this.selectedCargoContainer, 'amount': this.selectedAmount });
        },
        
        onCloseCargoAmountSelection: function( evt )
        {
            console.log( 'onCloseCargoAmountSelection',evt )
            // Preventing default browser reaction
            dojo.stopEvent( evt );
            
            this.closeCargoAmountList();
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
        
        onSelectOvertimeHour: function( evt )
        {
            console.log( 'onSelectOvertimeHour',evt )
            // Preventing default browser reaction
            dojo.stopEvent( evt );
            
            let div_id = evt.currentTarget.id;
            let div = dojo.query("#"+div_id);
            let data_amount = parseInt(evt.currentTarget.getAttribute("data_index") );
            
            if( ! dojo.hasClass( div_id, 'ffg_selectable' ) ||  dojo.hasClass( div_id, 'ffg_selectable_wait' ) )
            {
                // This is not a possible action => the click does nothing
                return ;
            }
            this.selectedOvertimeToken = null;
            
            //div.toggleClass("ffg_positive_value").toggleClass("ffg_negative_value");
            //TOGGLE with 3 Values : initial -> positive -> negative -> initial ->...
            let eltClass = "";
            if( dojo.hasClass(div_id, "ffg_empty_value") ){
                eltClass = "ffg_positive_value";
            } else if( dojo.hasClass(div_id, "ffg_positive_value") ){
                eltClass = "ffg_negative_value";
            } else {
                eltClass = "ffg_empty_value";
            } 
            //ALL Tokens on left receive the same state
            dojo.query(".ffg_overtime").forEach( ' dojo.removeClass(item,"ffg_empty_value ffg_positive_value ffg_negative_value"); if( parseInt(item.getAttribute("data_index"))<='+data_amount+' ){   dojo.addClass(item,"'+eltClass+'"); } else { dojo.addClass(item,"ffg_empty_value ");}' );
            
            this.selectedAmount = null;
            this.selectedOvertimeToken = div_id;
            
            this.displayOvertimeHoursOnCard();
            dojo.query(".ffg_card.ffg_selected .ffg_cardModifier").addClass(eltClass);
            
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
            
            this.unselectCard();
            
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
            dojo.subscribe( 'possibleLoads', this, "notif_possibleLoads" );
            dojo.subscribe( 'loadTruck', this, "notif_loadTruck" );
            dojo.subscribe( 'moveTruck', this, "notif_moveTruck" );
            dojo.subscribe( 'possibleCards', this, "notif_possibleCards" );
            dojo.subscribe( 'cancelTurnDatas', this, "notif_cancelTurnDatas" );
            
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
            
            this.updatePlayersOvertimeHours(notif.args.availableOvertimes);
            dojo.query(".ffg_card").forEach( dojo.hitch(this, "resetOvertimeHourOnCard"));
            dojo.query(".ffg_card .ffg_cardModifier").removeClass("ffg_positive_value").removeClass("ffg_negative_value").addClass("ffg_empty_value");
            dojo.query(".ffg_card .ffg_cardModifier").forEach(" item.innerHTML = ''"); 
        },  
        
        notif_possibleLoads: function( notif )
        {
            console.log( 'notif_possibleLoads',notif );
             
            dojo.query("#ffg_cargo_amount_loading").addClass("ffg_no_display");
            
            for ( let k in notif.args.possibles) {
                let value = notif.args.possibles[k];
                dojo.query("#ffg_cargo_amount_list_"+value).addClass("ffg_selectable");
            }
            
        },  

        notif_possibleCards: function( notif )
        {
            console.log( 'notif_possibleCards',notif );
            
            let card_id = notif.args.cardId;
            if(card_id !=undefined){
                //SPECIFIC CASE, retrieve 1 card infos via getPossibleActionsForCard
                this.possibleCards[card_id] = [];
                if(notif.args.possibleCards !=undefined){
                    this.possibleCards[card_id] = notif.args.possibleCards;
                }
                this.displayPossibleLoads( card_id);
                this.displayPossibleMoves( card_id);
            }  
            else { //GENERAL CASE, get all 3 cards infos
                this.possibleCards = [];
                if(notif.args.possibleCards !=undefined){
                    this.possibleCards = notif.args.possibleCards;
                }
            }
            
            this.updatePossibleCards();
            
            dojo.query(".ffg_button_card_plus").addClass("ffg_selectable");
            dojo.query(".ffg_button_card_minus").addClass("ffg_selectable");
            dojo.query(".ffg_overtime.ffg_selectable_wait").removeClass("ffg_selectable_wait");
            
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
            
            this.updatePlayerOvertimeHours(this.player_id,notif.args.availableOvertime);
            
            //Remove possible selection of this place
            dojo.removeClass(containerDivId,"ffg_selectable") ;
            dojo.query(".ffg_cargo_amount").removeClass("ffg_selectable");
            dojo.query(".ffg_cargo_to_fill").removeClass("ffg_cargo_to_fill");
            
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
            this.updatePlayerOvertimeHours(this.player_id,notif.args.availableOvertime);
            
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
        
        notif_cancelTurnDatas: function( notif )
        {
            console.log( 'notif_cancelTurnDatas',notif );
            
            this.updatePlayerOvertimeHours(this.player_id,notif.args.availableOvertime);
            dojo.query(".ffg_card").forEach( dojo.hitch(this, "resetOvertimeHourOnCard"));
            
            this.possibleCards = [];
            if(notif.args.possibleCards !=undefined){
                this.possibleCards = notif.args.possibleCards;
            } 
            this.updatePossibleCards();
            
            //Clean containers :
            let playerContainers = dojo.query(".ffg_container[data_player='"+this.player_id+"'][data_state="+this.constants.STATE_LOAD_TO_CONFIRM+"]");
            playerContainers.forEach( dojo.hitch(this, "resetContainer"));
            
            //Clean truck positions :
            dojo.query(".ffg_truck_pos.ffg_not_confirmed_pos[data_player='"+this.player_id+"']").addClass("ffg_not_drawn_pos").removeClass("ffg_not_confirmed_pos");
            dojo.query(".ffg_truck[data_player='"+this.player_id+"']:not([data_confirmed_state='"+this.constants.STATE_MOVE_DELIVERED_CONFIRMED+"']:not([data_confirmed_state='"+this.constants.STATE_MOVE_DELIVERED_TO_CONFIRM+"'])").forEach( (e) => { 
                dojo.attr(e,"data_not_confirmed_state", ""); 
                dojo.attr(e,"data_not_confirmed_position","");
                dojo.attr(e,"data_score","0");
                }
            );
            //Clean trucks scores
            dojo.query(".ffg_truck[data_player='"+this.player_id+"'][data_score='0'] .ffg_score_number").forEach( (e) => { 
                e.innerHTML = "0";
            }
            );
            
            this.updatePlayerScore(this.player_id,notif.args.newScore );
            
        },  
        
        notif_endTurnScore: function( notif )
        {
            console.log( 'notif_endTurnScore',notif );
            //Week score will be displayed when week really ends, not before
            //this.updatePlayerWeekScore(notif.args.player_id,notif.args.k,notif.args.nb );
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