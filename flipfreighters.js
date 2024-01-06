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

//debug() LOG MANAGEMENT, as seen on tisaac's BGA Games
var isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
var debug = isDebug ? console.info.bind(window.console) : function () {};

define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter"
],
function (dojo, declare) {
    let HORIZONTAL = 0;
    let VERTICAL = 1;
    
    return declare("bgagame.flipfreighters", ebg.core.gamegui, {
        constructor: function(){
            debug('flipfreighters constructor');
              
            // Here, you can init the global variables of your user interface
            //Some bugs remains with this functionality, and according to the game designer, it is not necessary : TODO JSA CLEAN this functionality code
            this.enable_multi_overtime_click = false;
            
            this._cardsRatio = this.getConfig('ffg_cardsRatio', 10);
            this._scoreSheetZoom = this.getConfig('ffg_ScoreSheetZoom', 100);
            // init sliders with these values
            document.getElementById("ffg_cardsSliderSize").value = this._cardsRatio;
            document.getElementById("ffg_playerBoardSliderSize").value = this._scoreSheetZoom;
      
            this.dayCards = [];
            this.possibleCards = [];
            this.possibleCardsBeforeOvertime = [];
            this.impossibleLoads = new Map();
            this.selectedCard = null;
            this.selectedAmount = null;//Not always the card value, with overtime hours
            this.selectedCargoContainer = null;
            this.selectedSuit = null;
            this.selectedMoves = {};
            this.material = [];
            
            this.constants = [];
            this.currentRound = 1;
            this.currentTurn = 1;
            
            this.counterOvertime={};
            this.selectedOvertimeToken = null;
            
            this.counterDelivered={};
            this.overtimeSuitVariant = false;
            this.selectedSuitCost = null;
            
            this.counterDiscardDeckSize = new ebg.counter();
            this.counterDiscardDeckSize.create("ffg_discard_pile_size");
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
            debug( "Starting game setup",gamedatas );
        
            this.OVERTIME_HOURS_LABEL = _("Overtime Hours") ;
            this.LABEL_2000_DOLLARS = _("$2000");
            this.PER_UNUSED_LABEL = _("per unused");
            this.WEEK_LABEL = _("Week");
            
            if (this.prefs[103].value == 1 ){
                //ffg_lang_original
                this.dontPreloadImage( 'board.jpg' );
            }
            else {
                //ffg_lang_translated, ffg_lang_translated_adjusted
                this.dontPreloadImage( 'board_translatable.jpg' );
                
                if (this.prefs[103].value == 2 ){//.ffg_lang_translated_adjusted
                    //BGA translation framework generates a span that I don't want to be in <svg><text> to make it fine, so let's copy the same string present in a simple div
                    dojo.query(".ffg_board_overtime_label_adjusted_text").forEach( (i) => { 
                        i.innerHTML = this.OVERTIME_HOURS_LABEL ;
                    });
                    dojo.query(".ffg_board_overtime_unused_label .ffg_label_adjusted_1").forEach( (i) => { 
                        i.innerHTML = this.LABEL_2000_DOLLARS ;
                    });
                    dojo.query(".ffg_board_overtime_unused_label .ffg_label_adjusted_2").forEach( (i) => { 
                        i.innerHTML = this.PER_UNUSED_LABEL ;
                    });
                    dojo.query(".ffg_board_week_label_adjusted_text").forEach( (i) => { 
                        i.innerHTML = this.WEEK_LABEL ;
                    });
                }
            }
            if (this.prefs[119].value == 1 ){//ffg_truck_shape_disabled
                this.dontPreloadImage( 'trucks_shapes.png' );
            }
            
            this.constants  = gamedatas.constants;
            this.currentRound = gamedatas.round_number;
            this.currentTurn = gamedatas.turn_number;
            
            this.selectedPlayerId = this.player_id;
            
            // Setting up player boards
            for( let player_id in gamedatas.players )
            {
                let player = gamedatas.players[player_id];
                         
                // Setting up players boards if needed
            
                let playerContainers = dojo.query(".ffg_container[data_player='"+player_id+"']");
                    
                if(this.player_id == player_id){ //CURRENT player
                    playerContainers.connect( 'onclick', this, 'onSelectLoadTarget' );
                }
                
                if ( this.isSpectator && this.prefs[this.constants.GAME_PREF_DISPLAY_ALL].value == this.constants.GAME_PREF_DISPLAY_ALL_NO ){
                    this.selectedPlayerId = player_id;
                }
                
                this.displayPlayerScores(player);
                this.displayPlayerPanel(player_id,player);
                this.initPayerAvatar(player_id);
                
            }
            // Set up your game interface here, according to "gamedatas"
            
            if(!this.isSpectator){
                // Create a new div for buttons to avoid BGA auto clearing it
                dojo.place("<div id='customActions' style='display:inline-block'></div>", $('generalactions'), 'after');
                dojo.place("<div id='restartAction' style='display:inline-block'></div>", $('customActions'), 'after');
          
                //Display current player board first :
                dojo.place("ffg_board_player_container_wrapper_"+this.player_id, "ffg_all_players_board_wrap","first");
            }
            
            this.material = gamedatas.material;
            this.dayCards = gamedatas.dayCards;
            this.overtimeSuitVariant = gamedatas.overtimeSuitVariant;
            
            this.updateCardsUsage();
            
            dojo.query(".ffg_card").forEach((i) => { 
                this.updateOvertimeHourOnCard(i);
            });
            
            this.initTooltips(this.material.tooltips);
            
            this.addTooltip( "ffg_cardsSliderSize", _("Layout : Modify cards ratio"), '' );
            this.addTooltip( "ffg_playerBoardSliderSize", _("Layout : Modify boards size"), '' ); 
            
            this.updateDiscardPile(this.gamedatas.discard_pile);
            this.addTooltip( "ffg_discard_pile_wrapper", _("Discard pile"), '' );
            dojo.query("#ffg_discard_pile_wrapper").connect( 'onclick', this, 'onClickDiscardPile' );
            
            this.addTooltipToClass( "ffg_overtime_wrapper", _("Available overtime hours tokens"), '' );
            this.updatePlayersOvertimeHours(gamedatas.players);
            
            //Keep the same string as tie_breaker_description
            this.addTooltipToClass( "ffg_delivered_trucks_wrapper", _("Number of delivered trucks"), '' );
            this.updatePlayersScoreAux(gamedatas.players);
            
            dojo.query("#ffg_cardsSliderSize").connect( 'oninput', this, 'onSliderChangeCards' );
            dojo.query("#ffg_playerBoardSliderSize").connect( 'oninput', this, 'onSliderChangeBoard' );
            
            dojo.query(".ffg_card").connect( 'onclick', this, 'onSelectCard' );
            dojo.query(".ffg_current_player .ffg_truck_pos").connect( 'onclick', this, 'onSelectTruckPos' );
            
            dojo.query("#ffg_close_amount_list").connect( 'onclick', this, 'onCloseCargoAmountSelection' );
            dojo.query(".ffg_cargo_amount").connect( 'onclick', this, 'onSelectCargoAmount' );

            dojo.query(".ffg_current_player .ffg_overtime").connect( 'onclick', this, 'onSelectOvertimeHour' );
            
            dojo.query(".ffg_button_card_plus").connect( 'onclick', this, 'onClickCardPlus' );
            dojo.query(".ffg_button_card_minus").connect( 'onclick', this, 'onClickCardMinus' );
            if(this.overtimeSuitVariant){
                for(let row in this.dayCards){
                    if(this.dayCards[row].type == this.constants.JOKER_TYPE) continue;
                        
                    dojo.query("#ffg_card_wrapper_"+row+" .ffg_button_card_suit_modifier").removeClass("ffg_no_display");
                }
                dojo.query(".ffg_button_card_suit_modifier").connect( 'onclick', this, 'onClickChangeSuit' );
            } 
            
            this.drawTruckLines();
            
            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();


            /* OVERRIDE BGA FUNCTION 
            WHEN SCROLLING- adapting the status bar
            */
            gameui.adaptStatusBar = (function(_super) {
                return function() {
                    //BGA 
                    _super.apply(this, arguments);
                    //Add :
                    debug("ffg override adaptStatusBar..."); 
                    if (dojo.hasClass('page-title', 'fixed-page-title')) {
                        dojo.query("#ffg_game_upper").addClass("ffg_fixed_page_title");
                    }
                    else {
                        dojo.query("#ffg_game_upper").removeClass("ffg_fixed_page_title");
                    }
                };         

            })(gameui.adaptStatusBar);
            
            //this.lang = _('$locale'); // en, fr, etc. 
            
            debug( "Ending game setup" );
        },
       

        ///////////////////////////////////////////////////
        //// Game & client states
        
        // onEnteringState: this method is called each time we are entering into a new game state.
        //                  You can use this method to perform some user interface changes at this moment.
        //
        onEnteringState: function( stateName, args )
        {
            debug( 'Entering state: '+stateName,args.args );
            
            this.previouspagemaintitletext = $('pagemaintitletext').innerHTML ;
            
            switch( stateName )
            {
            case 'newTurn':
                //Prepare to flip all cards :
                dojo.query(".ffg_card").forEach("dojo.removeClass(item,'ffg_card_back');"); 
                this.unselectCard();
                break;
               
            case 'playerTurn':
                this.currentRound = args.args.round_number;
                this.currentTurn = args.args.turn_number;
                this.updateRoundLabel();
                this.addCustomActionButtons();
                for ( let i in args.args.newCards) {
                    let card = args.args.newCards[i];
                    let suit = card.type;
                    let value = card.type_arg; 
                    let cardUsedPower = 0;
                    if(args.args._private !=undefined && args.args._private.cardSuits!=undefined){
                        let suitWithOvertime = args.args._private.cardSuits[card.id];
                        suit = suitWithOvertime;
                    } 
                    if(args.args._private !=undefined && args.args._private.cardUsedPower!=undefined){
                        cardUsedPower = args.args._private.cardUsedPower[card.id];
                    } 
                    this.playCardOnTable(i,card.id, suit, value, cardUsedPower );
                }
                this.possibleCards = [];
                if(args.args._private !=undefined){
                    if(args.args._private.possibleCards!=undefined){
                        this.possibleCards = args.args._private.possibleCards;
                    }
                } 
                //Preserve value in case we use overtime during turn and want to cancel
                this.possibleCardsBeforeOvertime = dojo.clone(this.possibleCards);
                this.updatePossibleCards();
                this.cleanMultiMoveSelection();
                break;
                
            case 'endTurn':
                gameui.unselectCard();
                for(let row in this.dayCards){
                    let card = dojo.clone(this.dayCards[row] );
                    card.location = this.constants.DECK_LOCATION_DISCARD_AFTER_DAY;
                    card.location_arg = this.currentRound;
                    if(this.gamedatas.discard_pile !=null) this.gamedatas.discard_pile.push(  card );
                    this.increaseDiscardPile(1);
                }
                
                //Unflip all cards :
                dojo.query(".ffg_card").forEach( (item) => {
                    this.animateDiscardCard(item, item.id.split("_").lastItem);
                    
                    item.setAttribute('data_id',0); 
                    item.setAttribute('data_value',0); 
                    item.setAttribute('data_suit',0); 
                    dojo.addClass(item,'ffg_card_back');
                    dojo.removeClass(item,'ffg_selectable');
                }); 
                break;
            case 'gameEnd':
                this.dayCards = [];
                //Unflip all cards :
                dojo.query(".ffg_card").forEach( (item) => {
                    item.setAttribute('data_id',0); 
                    item.setAttribute('data_value',0); 
                    item.setAttribute('data_suit',0); 
                    dojo.addClass(item,'ffg_card_back');
                    dojo.addClass(item,'disabled');
                    dojo.removeClass(item,'ffg_selectable');
                }); 
                break;
            }
        },

        // onLeavingState: this method is called each time we are leaving a game state.
        //                 You can use this method to perform some user interface changes at this moment.
        //
        onLeavingState: function( stateName )
        {
            debug( 'Leaving state: '+stateName );
            this.clearActionButtons();
            this.clearRestartActionButtons();

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
            debug( 'onUpdateActionButtons: '+stateName, args );
            /* Not reliable in this game where every player can restart or end the turn at any time,
                which would call this function and create race conditions with others functions
                => call custom func addCustomActionButtons instead
            */
            if (!this.isSpectator) {
                switch( stateName )
                {
                case 'playerTurn':
                    this.addCustomActionButtons(true);
                    this.clearRestartActionButtons();
                    this.addActionButton( 'ffg_button_cancelturn', _('Restart turn'), 'onCancelTurn','restartAction', false, 'red' );
                    break;
                }
            }
        },
        
        /**
         * Add needed action buttons for this game (only 1 active state exist, so no need to filter)
         * @param bool updateDisplay : indicate if we want to update buttons if not existing yet
         */
        addCustomActionButtons: function(updateDisplay = false)
        {
            debug( 'addCustomActionButtons() ',updateDisplay);
            if (this.isSpectator) return;

            let playerActive = this.isCurrentPlayerActive();
            let notDisplayedYet = ( $('customActions').childElementCount == 0) ;
            if (playerActive && (!updateDisplay || notDisplayedYet && updateDisplay) ) {
                this.clearActionButtons();
                for(let k=1;k<= this.constants.MAX_LOAD;k++){
                    this.addActionButton('ffg_button_amount_'+k, (k), 'onClickCargoAmount','customActions');
                    //HIDE it until needed :
                    dojo.query("#ffg_button_amount_"+k).removeClass("ffg_selectable").addClass("ffg_no_display disabled");
                }
                
                this.addActionButton( 'ffg_button_stopmoving', _('Confirm move(s)'), 'onStopMoving','customActions' ); 
                $("ffg_button_stopmoving").classList.add("bgabutton_green");
                $("ffg_button_stopmoving").classList.add("disabled");
                this.addActionButton( 'ffg_button_endturn', _('End turn'), 'onEndTurn','customActions' ); 
            } else if (!playerActive && !notDisplayedYet && updateDisplay ){
                debug( 'addCustomActionButtons() : remove buttons because ', playerActive, notDisplayedYet,updateDisplay);
                this.clearActionButtons();
            } else {
                debug( 'addCustomActionButtons() : no buttons update because ', playerActive, notDisplayedYet,updateDisplay);
            }
        },   

        // To be overrided by games
        onScreenWidthChange(){
            debug("onScreenWidthChange...");
            //TODO JSA ? User SETTING if(this.display_mode == HORIZONTAL)
            if(this.getDefaultMode() === HORIZONTAL){
                this.resizeHorizontal();
            } else {
                this.resizeVertical();
            }
        },
        ///////////////////////////////////////////////////
        //// Utility methods
        
        /*
        
            Here, you can defines some utility methods that you can use everywhere in your javascript
            script.
        
        */
        /**
        Return false if action is not possible at that time
        */
        ajaxcallwrapper: function(action, args, handler) {
            if (this.checkAction(action)) {
                return this.ajaxcallwrapperNoCheck(action, args, handler);
            }
            return false;
        },
        ajaxcallwrapperNoCheck: function(action, args, handler) {
            if (!args) {
                args = {};
            }
            args.version = this.gamedatas.version;
            //Beware of "Move recorded, waiting for update...." when lock enabled
            args.lock = true;
            debug( "ajaxcallwrapperNoCheck ... ",action, args, handler );
            this.ajaxcall("/" + this.game_name + "/" + this.game_name + "/" + action + ".html", args, this, 
                (result) => { }, 
                (error, errorMsg, errorCode) => {
                    if (error && errorMsg == "!!!checkVersion") {
                        this.infoDialog(
                            _("A new version of this game is now available"),
                            _("Reload Required"),
                            () => {
                                window.location.reload(true);
                            },
                            true
                        );
                    } else {
                        if (handler) handler(error, errorMsg, errorCode);
                    }
                }
            );
            return true;
        },
        
        /* @Override BGA standard error handling (for specific errors only) */
        showMessage: function (msg, type) {
            if (type == "error" && msg && msg.startsWith("!!!")) {
                return; // suppress red banner and gamelog message
            }
            this.inherited(arguments);
        },
        /** Update title in BGA status bar without waiting for status change*/
        setMainTitle: function(text) {
            //IF NOT DONE During player turn, no need to display specific messages, because it will lead to "not your turn" and could lead to loose original title
            if(!this.isCurrentPlayerActive()) return;

            //First reset in order to avoid going from one fake message to another and not being able to recover the original message :
            this.resetMainTitle();
            if($('pagemaintitletext').innerHTML == text) return;
            this.previouspagemaintitletext = $('pagemaintitletext').innerHTML ;
            $('pagemaintitletext').innerHTML = text;
        },
        resetMainTitle: function() {
            //IF NOT DONE During player turn, no need to display specific messages, because it will lead to "not your turn" and could lead to loose original title
            if(!this.isCurrentPlayerActive()) return;

            $('pagemaintitletext').innerHTML = this.previouspagemaintitletext;
        },
        
        clearActionButtons: function() {
            debug( "clearActionButtons()" );
            dojo.empty('customActions');
        },
        clearRestartActionButtons() {
            debug( "clearRestartActionButtons()" );
            dojo.empty('restartAction');
        },
  
        /** Return User local config */
        getConfig: function(value, default_value){
            return localStorage.getItem(value) == null? default_value : localStorage.getItem(value);
        },
        
        /** Copied from Welcome (WTO): */
        getDefaultMode: function(){
            const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
            return vw > 1.1*vh? HORIZONTAL : VERTICAL;
        },
        /** Copied from Welcome (WTO): */
        resizeHorizontal: function( widthToLeave = 0){
            debug( "resizeHorizontal ... ",widthToLeave );
            let gamecontainer = $('ffg_game_container');
            let box = gamecontainer.getBoundingClientRect();
            let sheetWidth = 1400 + 20 + 20 + widthToLeave; //margin 20 + outline 10 on both sides, + 100 to be safe ?
            let sheetZoom = this._scoreSheetZoom / 100;
            let sheetRatio =  (100 - this._cardsRatio ) / 100;
            let newSheetWidth = sheetZoom*sheetRatio*box['width'];
            let sheetScale = newSheetWidth / sheetWidth;
            let widthHeightRatio = 1080/1400;
            let newSheetHeight = sheetScale * 1080 ; //--ffg_board_display_height
            document.querySelector(":root").style.setProperty("--ffg_board_display_scale",sheetScale) ;
            dojo.query(".ffg_board_player_container_wrapper").forEach( i => {
                dojo.style(i.id, "width", `${newSheetWidth}px`);
                dojo.style(i.id, "height", `${newSheetHeight}px`);
                });
            dojo.style("ffg_all_players_board_wrap", "width", `${newSheetWidth}px`);
            let nbDisplayedSheets = Object.keys(this.gamedatas.players).length;
            if( dojo.query("html")[0].classList.contains("ffg_display_all_no") ){
                nbDisplayedSheets = 1;
            }
            let sumSheetHeight = (newSheetWidth * widthHeightRatio +20*sheetScale ) * nbDisplayedSheets ; //height + margin top 20
            dojo.style("ffg_all_players_board_wrap", "height", `${sumSheetHeight}px`);
            
            debug( "resizeHorizontal ... sheetZoom,sheetRatio, sheetScale, newSheetWidth, newSheetHeight,sumSheetHeight : ",sheetZoom,sheetRatio , sheetScale, newSheetWidth, newSheetHeight,sumSheetHeight );
            
            let cardsWidth = 130 + 10;//margin-left 10 on .ffg_card
            let cardsHeight = 963;
            let cardsRatio = this._cardsRatio / 100;
            let newCardsWidth = cardsRatio*box['width'];
            let cardsScale = newCardsWidth / cardsWidth; 
            //document.querySelector(":root").style.setProperty("--ffg_cards_display_scale",cardsScale) ;
            dojo.style('ffg_cards_resizable', 'transform', `scale(${cardsScale})`);
            dojo.style('ffg_cards_resizable', 'width', `${cardsWidth}px`);
            dojo.style('ffg_cards_sticky', 'height', `${cardsHeight * cardsScale}px`);
            dojo.style('ffg_cards_sticky', 'width', `${newCardsWidth}px`);
            dojo.style('ffg_cards_container', 'width', `${newCardsWidth}px`);
            
            let visiblecount = dojo.query("#ffg_cargo_amount_list .ffg_cargo_amount.ffg_selectable:not(.ffg_no_display)").length ;
            this.resizeCargoAmountList(visiblecount); 
        },
        resizeVertical: function(){
            debug( "resizeVertical ... " );
            //No special vertical layout for now, but leave more width space emptyfor better visibility on small width screens
            this.resizeHorizontal(100);
        },
        
        setScoreSheetZoom(a){
            debug( "setScoreSheetZoom ... ", a );
            this._scoreSheetZoom = a;
            localStorage.setItem("ffg_Layout", HORIZONTAL);
            localStorage.setItem("ffg_ScoreSheetZoom", a);
            this.onScreenWidthChange();
        },
        
        setCardsRatio(a){
            debug( "setCardsRatio ... ", a );
            this._cardsRatio = a;
            localStorage.setItem("ffg_Layout", HORIZONTAL);
            localStorage.setItem("ffg_cardsRatio", a);
            this.onScreenWidthChange();
        },

        /*
        Init board avatar with the same as displayed by BGA player panel,
        */
        initPayerAvatar: function( player_id) {
            debug( "initPayerAvatar ... " ,player_id);
            
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

        getNextPlayerId(pId, direction){
            let table = direction == 'right'? this.gamedatas.nextPlayerTable : this.gamedatas.prevPlayerTable;
            return table[pId];
        },        
        /**
        Update a set of properties in gamedatas.players from the parameter playerDatas
        */
        updatePlayerDatas: function( player_id, playerDatas )
        {
            debug( 'updatePlayerDatas',player_id, playerDatas );
            this.gamedatas.players[player_id].score = playerDatas.score;
            this.gamedatas.players[player_id].score_aux = playerDatas.score_aux;
            this.gamedatas.players[player_id].score_week1 = playerDatas.score_week1;
            this.gamedatas.players[player_id].score_week2 = playerDatas.score_week2;
            this.gamedatas.players[player_id].score_week3 = playerDatas.score_week3;
            this.gamedatas.players[player_id].availableOvertime = playerDatas.availableOvertime;
            
        },
        
        initTooltips: function (ffg_tooltips){
            debug( "initTooltips ... " ,ffg_tooltips);
            
            for(let k in ffg_tooltips.trucks) {
                let message =  _(ffg_tooltips.trucks[k]);
                debug( "initTooltip trucks... " ,k, message);
                this.addTooltipToClass( "ffg_truck_symbol_"+k, message,'' );
            }
            for(let k in ffg_tooltips.delivery_score) {
                let message = _(ffg_tooltips.delivery_score[k]);
                debug( "initTooltip delivery_score... " ,k, message);
                this.addTooltipToClass( "ffg_score_"+k, message,'' );
            }
            
            this.addTooltipToClass( "ffg_symbol_path_size", _(ffg_tooltips.path_size),'' );
            
            this.addTooltipToClass( "ffg_icon_show_score", _("Show current score situation"), '' );
            
            this.addTooltipToClass( "ffg_board_overtime_wrapper", _("Available overtime hours tokens"), '' );
            
            this.addTooltipToClass( "ffg_total_score", _("Overall score of this player"), '' );
            
            dojo.query(".ffg_week_score").forEach( (i) => { 
                    let round = i.getAttribute("data_round") ;
                    let tooltipText = dojo.string.substitute( _("Week ${n} score of this player"), {
                        n: round,
                    } );
                    this.addTooltip(i.id, tooltipText,'');  
                } ); 
            
            let tooltipIconTruck = this.format_block(
                "jstpl_tooltipIconTruck",
                {
                    description :  _("Optional information : current position of the truck on its route"),
                    option1 :  _("This color when cancelable in current turn"),
                    option2 :  _("This color when not cancelable"),
                    option3 :  _("This color when delivered"),
                }
                );
            this.addTooltipHtmlToClass( "ffg_icon_truck_pos",tooltipIconTruck , '' );
        },
        
        initShowScoreDialog: function()
        {
            // Create the new dialog over the play zone.
            this.showScoreDialog = new ebg.popindialog();
            this.showScoreDialog.create( 'showScoreDialogId' );
            this.showScoreDialog.setTitle( _("Players's score situation") );
            this.showScoreDialog.setMaxWidth( 1000 ); 

            // Create the HTML of my dialog. 
            let html = this.format_block( 'jstpl_showScore', { } );  
            this.showScoreDialog.setContent( html ); // Must be set before calling show() so that the size of the content is defined before positioning the dialog
            
            for(let k=1; k<= this.constants.NB_ROUNDS;k++){
                let data = {
                    'ROUND' : k,
                };
                dojo.place(this.format_block('jstpl_weekLabel', data), `ffg_overview_week${k}_content`);
            }
            
            dojo.query("#popin_showScoreDialogId .ffg_board_week_label_adjusted_text, #popin_showScoreDialogId .ffg_board_week_label_simple").forEach( (i) => { 
                i.innerHTML = this.WEEK_LABEL ;
            });
            
            for(let playerId in this.gamedatas.players){
                let player = this.gamedatas.players[playerId];
                let classes = (this.selectedPlayerId == playerId ) ? "ffg_highlight" : "";
                let avatarSrc = this.getPlayerAvatar(playerId);
                let data = {
                    'player_id' : playerId,
                    'player_name' : player.name,
                    'player_color' : player.color,
                    'player_avatar' : avatarSrc,
                    'score_week1' : player.score_week1,
                    'score_week2' : this.currentRound >=2 ? player.score_week2 : "-",
                    'score_week3' : this.currentRound >=3 ? player.score_week3 : "-",
                    'overtime' : player.availableOvertime,
                    'delivered' : player.score_aux,
                    'score' : player.score,
                    'trclasses' : classes,
                };
                dojo.place(this.format_block('jstpl_showScoreRow', data), 'ffg_overview_body');
            }
            
            //PREPARE MODAL SIZE
            let box = $("ebd-body").getBoundingClientRect();
            let modalWidth = 1000;
            let newModalWidth = box['width']*0.8;
            let modalScale = newModalWidth / modalWidth;
            if(modalScale > 1) modalScale = 1;
            dojo.style("popin_showScoreDialogId", "transform", `scale(${modalScale})`); 
        },
        
        initShowBoardDialog: function( selectedPlayerId)
        {
            let title = dojo.string.substitute( _("Players' boards"), );
            
            // Create the new dialog over the play zone.
            this.showBoardDialog = new ebg.popindialog();
            this.showBoardDialog.create( 'showBoardDialogId' );
            this.showBoardDialog.setTitle(title);
            this.showBoardDialog.setMaxWidth( 1000 ); 

            // Create the HTML of my dialog. 
            let html = this.format_block( 'jstpl_playerBoard', { 'player_id' : selectedPlayerId} );  
            this.showBoardDialog.setContent( html );
            
            let data = {
                'player_id' : selectedPlayerId,
            };
            dojo.place(this.format_block('jstpl_playerBoardContainer', data), 'popin_showBoardDialogId_contents');
            
            //Clone all players board directly and CSS will hide/show the good one
            let playerBoard = dojo.clone(dojo.byId("ffg_all_players_board_wrap"));
            dojo.attr(playerBoard, "id", "modal_"+playerBoard.id);
            dojo.query(playerBoard).query("*").forEach( (i) => {
                if(i.id != ""){
                    //Modify each existing element id in the board to make it distinct :
                    i.id = "modal_"+i.id;   
                    //disable current player actions in modal (overtime tokens):
                    if( dojo.hasClass(i, "ffg_selectable") ){
                        dojo.removeClass(i,"ffg_selectable"); 
                        dojo.addClass(i,"ffg_selectable_for_others");
                    }
                    if(i.id == "modal_ffg_board_player_container_wrapper_"+selectedPlayerId){
                        //THE ONE TO DISPLAY
                        dojo.addClass(i,"ffg_selectedPlayerId");
                    }
                }
            });
            
            dojo.place( playerBoard, 'ffg_modal_player_board_holder');
            
            dojo.query(".ffg_slideshow_left").connect( 'onclick', this, 'onClickSlideShowLeft' );
            dojo.query(".ffg_slideshow_right").connect( 'onclick', this, 'onClickSlideShowRight' );
            
            //PREPARE MODAL SIZE
            let box = $("ebd-body").getBoundingClientRect();
            let modalWidth = 1000;
            let newModalWidth = box['width']*0.8;
            let modalScale = newModalWidth / modalWidth;
            if(modalScale > 1) modalScale = 1;
            dojo.style("popin_showBoardDialogId", "transform", `scale(${modalScale})`); 
        },
        
        initShowDiscardPileDialog: function()
        {
            let title = dojo.string.substitute( _("Discard pile"), );
            let deckTitle = _("Deck");
            
            // Create the new dialog over the play zone.
            this.showDiscardPileDialog = new ebg.popindialog();
            this.showDiscardPileDialog.create( 'showDiscardPileDialogId' );
            this.showDiscardPileDialog.setTitle(title);
            this.showDiscardPileDialog.setMaxWidth( 1000 ); 

            // Create the HTML of my dialog. 
            let html = this.format_block( 'jstpl_discard_cards', { 'DECK_TITLE': deckTitle } );  
            this.showDiscardPileDialog.setContent( html );
            
            let jokerLabel = '*';//No need for translation for now
            let card_types = this.gamedatas.material.card_types;
            
            //Define TABLE ROWS
            for(let cardType in card_types){
                let typeDatas = this.gamedatas.material.card_types[cardType];
                let dataDiscard = {
                    'suit' : cardType,
                    'COLOR' : typeDatas.color,
                    'name' : _(typeDatas.name),
                };
                dojo.place(this.format_block('jstpl_discard_cards_row', dataDiscard), 'ffg_discard_overview_body');
                dojo.place(this.format_block('jstpl_deck_cards_row', dataDiscard), 'ffg_deck_overview_body');
                
                //FIrst : fill DECK TABLE
                for(let k=1;k<= this.constants.CARD_VALUE_MAX;k++){
                    for(let i=1;i<= this.constants.CARD_VALUE_NUMBER;i++){
                        let dataCell = {
                            'card_id' : 'deck_'+cardType+'_'+k+'_'+i,// Virtual id because we don't care here
                            'suit' : cardType,
                            'value' : k,
                            'value_label' : cardType !=this.constants.JOKER_TYPE ? k : jokerLabel,
                        };
                        
                        dojo.place(this.format_block('jstpl_deck_cards_cell', dataCell), 'ffg_deck_suit_'+cardType);
                    }
                }
            }
            let jokerRowDatas = {
                    'suit' : this.constants.JOKER_TYPE,
                    'name' : _('Joker'),
                    'COLOR' : 'blue',
                };
            dojo.place(this.format_block('jstpl_discard_cards_row', jokerRowDatas), 'ffg_discard_overview_body');
            dojo.place(this.format_block('jstpl_deck_cards_row', jokerRowDatas), 'ffg_deck_overview_body');
        
            //DEfine TABLE CELLS 
            //FIrst : fill DECK TABLE
            for(let i=1;i<= this.constants.JOKER_NUMBER;i++){
                let cardType = this.constants.JOKER_TYPE;
                let value = this.constants.JOKER_VALUE;
                let dataCell = {
                    'card_id' : 'deck_'+cardType+'_'+value+'_'+i,// Virtual id because we don't care here
                    'suit' : cardType,
                    'value' : value,
                    'value_label' : jokerLabel,
                };
                
                dojo.place(this.format_block('jstpl_deck_cards_cell', dataCell), 'ffg_deck_suit_'+cardType);
            }
            //Then : fill Discard TABLE and update DECK TABLE
            //resort this array :
            this.gamedatas.discard_pile.sort(this.compareCards);
            for(let i in this.gamedatas.discard_pile){
                let card = this.gamedatas.discard_pile[i];
                let dataCell = {
                    'card_id' : card.id,
                    'suit' : card.type,
                    'value' : card.type_arg,
                    'value_label' : card.type !=this.constants.JOKER_TYPE ? card.type_arg : jokerLabel,
                };
                
                dojo.place(this.format_block('jstpl_discard_cards_cell', dataCell), 'ffg_discard_suit_'+card.type);
                
                //Update deck table :
                dojo.destroy( dojo.query(".ffg_deck_suit_"+card.type+"_"+card.type_arg).lastItem);
            }
            //Update deck table by removing day cards too !
            this.dayCards.forEach((card) => { dojo.destroy( dojo.query(".ffg_deck_suit_"+card.type+"_"+card.type_arg).lastItem); });
            
            //PREPARE MODAL SIZE
            let box = $("ebd-body").getBoundingClientRect();
            let modalWidth = 1000;
            let newModalWidth = box['width']*0.8;
            let modalScale = newModalWidth / modalWidth;
            if(modalScale > 1) modalScale = 1;
            dojo.style("popin_showDiscardPileDialogId", "transform", `scale(${modalScale})`); 
        },
        updatePlayersOvertimeHours: function(players)
        {
            debug( "updatePlayersOvertimeHours" ,players); 
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
            debug( "updatePlayerOvertimeHours" ,player_id, nb); 
            this.counterOvertime[player_id].toValue(nb);
            this.gamedatas.players[player_id].availableOvertime = nb;
            
            let selectableClass = "";
            if(player_id == this.player_id && this.enable_multi_overtime_click){//CURRENT PLAYER
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
        /**
        reset nth card origin suit
        */
        resetDayCardOriginSuit: function(row,card_id, color){
            debug( "resetDayCardOriginSuit ... " ,row,card_id, color);
            
            dojo.query("#ffg_card_wrapper_"+row+" .ffg_button_card_suit_reset").forEach( (i) => { dojo.removeClass(i,"ffg_button_card_suit_reset"); this.removeTooltip(i.id);  } ); 
            if(this.overtimeSuitVariant){
                
                //hide suit modifiers IF JOKER (+ the same through init view)
                if(color ==  this.constants.JOKER_TYPE) {
                    dojo.query("#ffg_card_wrapper_"+row+" .ffg_button_card_suit_modifier").forEach( (i) => { dojo.addClass(i,"ffg_no_display"); } ); 
                }
                else {
                    dojo.query("#ffg_card_wrapper_"+row+" .ffg_button_card_suit_modifier").forEach( (i) => { 
                        dojo.removeClass(i,"ffg_no_display"); 
                        if( color == i.getAttribute("data_suit")){
                            dojo.addClass(i,"ffg_button_card_suit_reset");
                        }
                    } ); 
                    this.addTooltipToClass( "ffg_button_card_suit_reset", _("Reset to original suit"), '' );
                }
            }
        },   
        /**
        reset nth dayCard data to specified value
        */
        resetDayCard: function(row,card_id, color, value,usedPower){
            debug( "resetDayCard ... " ,row,card_id, color, value,usedPower);
            if(this.dayCards[row] == undefined) this.dayCards[row] ={};
            this.dayCards[row].id = card_id;
            this.dayCards[row].type = color;
            this.dayCards[row].type_arg = value;
            //Updating location_arg does not seem useful
            this.dayCards[row].usedPower = usedPower;  
            
            this.updateCardUsage(row);
            this.resetDayCardOriginSuit(row,card_id, color);
        },    
        resetDayCardFromJson: function(row,datas){
            this.resetDayCard(row, datas.id,datas.type,datas.type_arg,datas.usedPower);  
        },       
        
        playCardOnTable: function( row,card_id, color, value,usedPower )
        {            
            debug( "playCardOnTable ... " ,row,card_id, color, value,usedPower);
            
            let divId = "ffg_card_"+row;
            let div = dojo.query("#"+divId)[0];
            if(div == undefined) {
                debug( "playCardOnTable ...ERROR undefined row", row );
                return;
            }
            //UPDATE div datas :
            div.setAttribute("data_id",card_id);
            div.setAttribute("data_suit",color);
            div.setAttribute("data_value",value);
            let amount = value;
            div.setAttribute("data_amount",value);
            if(usedPower == 0 ){
                //We cannot play the same card for a later move
                dojo.addClass(divId,"ffg_selectable") ;
            }
            
            this.resetDayCard(row,card_id, color, value, usedPower );
            
            //ADD some animation :
            this.animateDrawCard(div,row);
        },
        animateDrawCard: function(cardDiv,row){
            debug( "animateDrawCard ... " ,cardDiv,row);
            let divId = cardDiv.id;
            //PLACE CARD COPY to avoid destroying / moving the card div
            let origin_copy = cardDiv.cloneNode();
            origin_copy.id = divId+"_copy";
            origin_copy.classList.add("ffg_animation_copy");
            dojo.addClass(divId,"ffg_card_back") ;
            
            let anim = this.slideTemporaryObject(origin_copy, 'ffg_cards_container', 'ffg_game_upper', divId,1000, row*200 ); 
            dojo.connect(anim, 'onEnd', (node) => {
                dojo.removeClass(divId,"ffg_card_back") ;
                //Needed in 3d ?
                dojo.destroy(origin_copy.id);
            });
            anim.play(); 
        }, 
        animateDiscardCard: function(cardDiv,row){
            debug( "animateDiscardCard ... " ,cardDiv,row);
            if(! this.gamedatas.showDiscardVariant) return;
            
            let divId = cardDiv.id;
            //PLACE CARD COPY to avoid destroying / moving the card div
            let origin_copy = cardDiv.cloneNode();
            origin_copy.id = divId+"_copy";
            origin_copy.classList.add("ffg_animation_copy");
            //dojo.addClass(divId,"ffg_card_back") ;
            let anim = this.slideTemporaryObject(origin_copy, cardDiv, divId, 'ffg_discard_pile', 1000, row*200 ); 
            dojo.connect(anim, 'onEnd', (node) => {
                //Needed in 3d ?
                dojo.destroy(origin_copy.id);
            });
            anim.play(); 
        }, 
        
        getCardRowFromId: function(card_id){
            for(let row in this.dayCards){
                let id = this.dayCards[row].id;
                if(card_id == this.dayCards[row].id) return row;
            }
            return undefined;
        },
        
        compareCards: function(a, b){
            if(a.type_arg > b.type_arg) return 1;
            if(a.type_arg < b.type_arg) return -1;
            if(a.type > b.type) return 1;
            if(a.type < b.type) return -1;
            return 0;
        },
        
        updateDiscardPile: function(list){
            debug( "updateDiscardPile",list); 
            if(! this.gamedatas.showDiscardVariant || list ==null){
                return;
            }
            this.counterDiscardDeckSize.setValue(list.length);
            
            dojo.removeClass("ffg_discard_pile_wrapper","ffg_no_display");
        },
        increaseDiscardPile: function(delta){
            debug( "increaseDiscardPile",delta); 
            if(! this.gamedatas.showDiscardVariant || delta ==null){
                return;
            }
            this.counterDiscardDeckSize.incValue(delta);
        },
        updateCardsUsage: function( ){
            debug( "updateCardsUsage"); 
            for(let row in this.dayCards){
                this.updateCardUsage(row);
            }
        },
        updateCardUsage: function( row ){
            debug( "updateCardUsage",row); 
            let card = this.dayCards[row];
            let divUsage = dojo.query("#ffg_card_usage_"+row)[0];
            divUsage.innerHTML = card.usedPower;
            dojo.addClass(divUsage.parentElement, "ffg_no_display");
            if(card.usedPower > 0) {
                dojo.removeClass(divUsage.parentElement, "ffg_no_display");
            }
        },
        
        displayPlayerPanel: function( player_id,player)
        {
            debug( "displayPlayerPanel" ,player_id,player); 
        
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
            
            this.counterDelivered[player_id] = new ebg.counter();
            this.counterDelivered[player_id].create("ffg_stat_delivered_trucks_"+player_id); 
            
            /*At least Spectator needs it, and it could be useful to highlight the player N line when we click on player N's panel
            if(this.player_id != player_id){ //CURRENT player
                dojo.query("#ffg_show_score_"+player_id).forEach( (i) => { dojo.destroy(i) } ); 
            }
            */
            dojo.query(".ffg_show_score").connect( 'onclick', this, 'onClickShowScore' );
            dojo.query(".ffg_show_board").connect( 'onclick', this, 'onClickShowBoard' );
            
        },
        displayImpossibleLoads: function(player_id)
        {            
            debug( "displayImpossibleLoads ... " ,player_id,this.impossibleLoads);
            
            //dojo.query(".ffg_container").removeClass("ffg_impossible_load") ;
            if(this.impossibleLoads == undefined) {
                return ;
            }
            let containersToDisplay = this.impossibleLoads.get(parseInt(player_id));
            //this.impossibleLoads.forEach( (value, key, map ) => {
                dojo.query(`#ffg_board_player_${player_id} .ffg_container`).removeClass("ffg_impossible_load") ;
                //let containersToDisplay = value;
                for(let i in containersToDisplay){
                    let container_id = containersToDisplay[i];
                    let containerDivId = "ffg_container_"+player_id+"_"+container_id;
                    dojo.addClass(containerDivId,"ffg_impossible_load") ;
                }
            //} );
        },
        displayPossibleLoads: function( card_id )
        {            
            debug( "displayPossibleLoads ... " ,card_id, this.possibleCards);
            
            dojo.query(".ffg_container").removeClass("ffg_selectable") ;
             
            if(card_id == null){
                return;
            }
            
            if(this.possibleCards [ card_id ] == undefined) {
                debug( "displayPossibleLoads ... Not possible card :", card_id );
                return ;
            }
            
            let containersToDisplay = this.possibleCards [ card_id ]["LOAD"];//array of container ids
            for(i in containersToDisplay){
                let container_id = containersToDisplay[i];
                let containerDivId = "ffg_container_"+this.player_id+"_"+container_id;
                dojo.addClass(containerDivId,"ffg_selectable") ;
            }
        },
        displayPossibleMoves: function( card_id )
        {            
            debug( "displayPossibleMoves ... " ,card_id, this.possibleCards);
            
            dojo.query(".ffg_truck_pos").removeClass("ffg_selectable") ;
             
            if(card_id == null){
                return;
            }
            
            if(this.possibleCards [ card_id ] == undefined) {
                debug( "displayPossibleMoves ... Not possible card :", card_id );
                return ;
            }
            
            let movesToDisplay = this.possibleCards [ card_id ]["MOVE"];
            for(i in movesToDisplay){
                let pos_id = movesToDisplay[i];
                let pos_DivId = "ffg_truck_pos_"+this.player_id+"_"+pos_id;
                dojo.addClass(pos_DivId,"ffg_selectable") ;
            }
        },
        
        updateLoad: function(player_id,containerId,amount,state,card_id,overtime)
        {
            debug( "updateLoad ... ",player_id,containerId,amount,state,card_id,overtime);
            
            let containerDivId = "ffg_container_"+player_id+"_"+containerId;
            let div = dojo.query("#"+containerDivId)[0];
            if(div == undefined) {
                debug( "updateLoad ...ERROR not found truck container", containerDivId );
                return;
            }
            //UPDATE div datas :
            div.setAttribute("data_amount",amount);
            div.setAttribute("data_state",state);
            div.setAttribute("data_card",card_id);
            div.setAttribute("data_overtime",overtime);
            
            //ffg_container_number
            let numberDiv = dojo.query("#"+containerDivId+">.ffg_container_number")[0];
            numberDiv.innerHTML=amount;
            
            this.animateCargoPosition(containerDivId);
        },
        updateMove: function(player_id,truck_id,position,fromPosition,confirmed_position,confirmed_state,not_confirmed_state,not_confirmed_position,truckScore,cssPos)
        {
            debug( "updateMove ... ",player_id,truck_id,position,fromPosition,confirmed_position,confirmed_state,not_confirmed_state,not_confirmed_position,truckScore,cssPos);
            
            let truckDivId = "ffg_truck_"+player_id+"_"+truck_id;
            let truckDiv = dojo.query("#"+truckDivId)[0];
            if(truckDiv == undefined) {
                debug( "updateMove ...ERROR not found truck", truckDivId );
                return;
            }
            
            let posId = truck_id+"_"+position;
            let posDivId = "ffg_truck_pos_"+player_id+"_"+posId;
            let div = dojo.query("#"+posDivId)[0];
            if(div == undefined) {
                debug( "updateMove ...ERROR not found truck position", posDivId );
                return;
            }
            //UPDATE truck div datas :
            truckDiv.setAttribute("data_confirmed_state",confirmed_state);
            truckDiv.setAttribute("data_confirmed_position",confirmed_position);
            truckDiv.setAttribute("data_not_confirmed_state",not_confirmed_state);
            truckDiv.setAttribute("data_not_confirmed_position",not_confirmed_position);
            truckDiv.setAttribute("data_score",truckScore);
            this.displayTruckScore(player_id, truckScore,truckDivId);   
            if(not_confirmed_state == this.constants.STATE_MOVE_DELIVERED_TO_CONFIRM || confirmed_state == this.constants.STATE_MOVE_DELIVERED_CONFIRMED && this.player_id != player_id){
                this.increasePlayerScore(player_id,truckScore);
                //Add 1 truck delivered only once for the player moving the truck, or receiving infos from others moving
                this.increasePlayerScoreAux(player_id,1);
                this.increasePlayerWeekScore(player_id,this.currentRound,truckScore);
            }
            let isDelivery = false;
            if(not_confirmed_state == this.constants.STATE_MOVE_DELIVERED_TO_CONFIRM || confirmed_state == this.constants.STATE_MOVE_DELIVERED_CONFIRMED ){
                isDelivery = true;
            }
            
            if(cssPos != "ffg_confirmed_pos"){
                //CLEAN truck icons except confirmed one
                dojo.query("#ffg_truck_"+player_id+"_"+truck_id+ " :not(.ffg_confirmed_pos) .ffg_icon_truck_pos").addClass("ffg_hidden" ) ;
            }
            else {
                //CLEAN ALL truck icons 
                dojo.query("#ffg_truck_"+player_id+"_"+truck_id+ " .ffg_icon_truck_pos").addClass("ffg_hidden" ) ;
            }
            //Update possible moves by removing the one we did  (and the corresponding previous places too !)
            for (let k=fromPosition ; k<= position; k++ ){
                let posId = truck_id+"_"+k;
                //UPDATE div classes :
                let posDivId = "ffg_truck_pos_"+player_id+"_"+posId;
                dojo.removeClass(posDivId,"ffg_not_drawn_pos ffg_not_confirmed_pos ffg_selectable ffg_temp_selection") ;
                dojo.addClass(posDivId,cssPos ) ;
                this.animateMovePosition(posDivId);
                let state = ( confirmed_position < k ) ? not_confirmed_state : confirmed_state;
                this.drawTruckLine(player_id, posId,state);
                
                if( k== position){
                    let truckIconDivId = posDivId + "_icon";
                    dojo.removeClass(truckIconDivId,"ffg_hidden" ) ;
                }
            }
        },
        
        animateCargoPosition: function(divId){
            debug( "animateCargoPosition ... ",divId);
            this.animationBlink2Times(divId);
        },
        animateMovePosition: function(divId){
            debug( "animateMovePosition ... ",divId);
            this.animationBlink2Times(divId);
        },
        animationBlink2Times: function(divId){
            // Make the token blink 2 times
            let anim = dojo.fx.chain( [
                dojo.fadeOut( { node: divId } ),
                dojo.fadeIn( { node: divId } ),
                dojo.fadeOut( { node: divId } ),
                dojo.fadeIn( { node: divId  } )
            ] );
            anim.play();
        },
         
        drawTruckLines: function(){
            debug( "drawTruckLines ... ");
            //Hide all
            dojo.query(".ffg_truck_line, .ffg_truck_route").forEach((a) => {
                dojo.addClass(a,"ffg_hidden"); 
                a.classList.add("ffg_hidden"); 
                a.classList.remove("ffg_delivery_done"); 
            });
            
            //Show not_confirmed ones
            dojo.query(".ffg_truck_pos.ffg_not_confirmed_pos").forEach((i) => { 
                let posId = i.getAttribute("data_truck")+ "_"+i.getAttribute("data_position");
                let player = i.getAttribute("data_player");
                let not_confirmed_state = i.parentElement.getAttribute("data_not_confirmed_state");
                this.drawTruckLine(player,posId,not_confirmed_state);
            });
            
            //Show confirmed ones
            dojo.query(".ffg_truck_pos.ffg_confirmed_pos").forEach((i) => { 
                let posId = i.getAttribute("data_truck")+ "_"+i.getAttribute("data_position");
                let confirmed_state = i.parentElement.getAttribute("data_confirmed_state");
                let player = i.getAttribute("data_player");
                this.drawTruckLine(player,posId,confirmed_state);
            });
        },
        drawTruckLine: function(player_id, posId,state, moreCss = undefined){
            debug( "drawTruckLine ... ",player_id, posId,state,moreCss);
            
            let isDelivery = (state == this.constants.STATE_MOVE_DELIVERED_TO_CONFIRM || state == this.constants.STATE_MOVE_DELIVERED_CONFIRMED);
            let notConfirmed = (state == this.constants.STATE_MOVE_TO_CONFIRM || state == this.constants.STATE_MOVE_DELIVERED_TO_CONFIRM);
                
            dojo.query("#ffg_truck_line_"+player_id+"_"+posId+", #ffg_truck_route_"+player_id+"_"+posId).forEach((a) => {
                dojo.removeClass(a,"ffg_hidden ffg_not_confirmed_move ffg_delivery_done"); 
                a.classList.remove("ffg_hidden"); 
                a.classList.remove("ffg_not_confirmed_move"); 
                a.classList.remove("ffg_delivery_done"); 
                a.classList.remove("ffg_temp_selection"); 
                if(notConfirmed){
                    a.classList.add("ffg_not_confirmed_move"); 
                }
                if(isDelivery){
                    a.classList.add("ffg_delivery_done"); 
                }
                if(Array.isArray(moreCss) ){
                    moreCss.forEach( (i) => { a.classList.add(i); });
                }
            });
        },
        /**
        Opposite of drawTruckLine()
        */
        undrawTruckLine: function(player_id, posId){
            debug( "undrawTruckLine() ",player_id, posId);
            dojo.query("#ffg_truck_line_"+player_id+"_"+posId+", #ffg_truck_route_"+player_id+"_"+posId).forEach((a) => {
                dojo.removeClass(a,"ffg_not_confirmed_move ffg_delivery_done"); 
                dojo.addClass(a,"ffg_hidden"); 
                a.classList.add("ffg_hidden"); 
                a.classList.remove("ffg_not_confirmed_move"); 
                a.classList.remove("ffg_delivery_done"); 
                a.classList.remove("ffg_temp_selection"); 
            });
        },
        unselectCard : function()
        {
            debug( "unselectCard ... ");
            
            this.selectedCard = null;
            this.selectedAmount = null;
            this.selectedSuit = null;
            this.selectedSuitCost = null;
            this.selectedCargoContainer = null;
            this.cleanMultiMoveSelection();
            dojo.query(".ffg_card").removeClass("ffg_selected") ;
            dojo.query(".ffg_card_wrapper").removeClass("ffg_selected") ;
            dojo.query(".ffg_container").removeClass("ffg_selectable") ;
            dojo.query(".ffg_truck_pos").removeClass("ffg_selectable") ;
            dojo.query(".ffg_cargo_amount").removeClass("ffg_selectable");
            this.closeCargoAmountList();
        },
        disableCard : function( cardId)
        {
            debug( "disableCard ... ",cardId);
            let cardRow = this.getCardRowFromId(cardId);
            $("ffg_card_"+cardRow).classList.remove("ffg_selectable");
        },
        
        /**
        Delete temporary elements which come from this player choosing where to move
        */
        cleanMultiMoveSelection: function()
        {
            debug( "cleanMultiMoveSelection ... ");
            this.selectedMoves = {};
            this.selectedMoves.usedOvertime = 0;
            this.selectedMoves.cardUsage = 0;
            this.undrawSelectedMoves();
            dojo.query(".ffg_truck_pos[data_player='"+this.player_id+"']").forEach((i) => {
                dojo.removeClass(i,"ffg_selected_move ffg_selected_delivery ffg_selection_disabled ffg_temp_selection");
                this.removeTooltip(i.id);
                });
                
            if($("ffg_button_stopmoving") !=null ){
                $("ffg_button_stopmoving").classList.add("disabled");
            }
            this.resetMainTitle();
        },
        cleanMultiMoveSelectionOnTruck: function(truckId, closeIfEmpty = false)
        {
            debug( "cleanMultiMoveSelectionOnTruck ... ",truckId, closeIfEmpty);
            this.undrawSelectedMoves(truckId);
            dojo.query("#ffg_truck_"+this.player_id+"_"+truckId+" .ffg_temp_selection").forEach((i) => {
                dojo.removeClass(i,"ffg_selected_move ffg_selected_delivery ffg_temp_selection");
                });
               
            //remove from selectedMoves in order to keep only 1 element by truck
            let index = this.selectedMoves.truckId.indexOf(truckId);
            if (index > -1) {
                this.selectedMoves.truckId.splice(index, 1);
                this.selectedMoves.position.splice(index, 1);
                this.selectedMoves.isDelivery.splice(index, 1);
                let moveLength = this.selectedMoves.moveLength.splice(index, 1)[0];
                this.increasePossibleMovesForOtherTrucks(moveLength,truckId);
            }
            if(closeIfEmpty && this.selectedMoves.truckId.length==0 ){
                this.cleanMultiMoveSelection();
            }
        },
        /**
        Save in memory + UI
        */
        saveSelectedMove: function(div, cardId, truckId,position,isDelivery )
        {
            debug( 'saveSelectedMove',div,cardId, truckId,position,isDelivery );
            
            this.selectedMoves.cardId = cardId;
            if(this.selectedMoves.truckId ==undefined) this.selectedMoves.truckId = [];
            if(this.selectedMoves.position ==undefined) this.selectedMoves.position = [];
            if(this.selectedMoves.isDelivery ==undefined) this.selectedMoves.isDelivery = [];
            if(this.selectedMoves.moveLength ==undefined) this.selectedMoves.moveLength = [];
            //Unselect other moves on same line if already done
            this.cleanMultiMoveSelectionOnTruck(truckId,false);
            
            //count from last other card move
            let previousPosition = this.getTruckCurrentPosition(this.player_id,truckId);
            let moveLength = parseInt(position);
            if( !isNaN(previousPosition)) {
                moveLength = moveLength - previousPosition;
            }
            this.selectedMoves.moveLength.push( moveLength );
            this.selectedMoves.truckId.push( truckId );
            this.selectedMoves.position.push( position);
            this.selectedMoves.isDelivery.push( isDelivery);
            
            div.classList.add("ffg_selected_move");
            if(isDelivery) div.classList.add("ffg_selected_delivery");
            if($("ffg_button_stopmoving") !=null ){
                $("ffg_button_stopmoving").classList.remove("disabled");
            }
            this.decreasePossibleMovesForOtherTrucks(moveLength,truckId);
            
            this.setMainTitle(_('Keep moving or stop your trucks when ready'));
            this.drawSelectedMoves();
        },
        getTruckSelectedMovePosition: function(truckId)
        {
            debug( "getTruckSelectedMovePosition()", truckId);
            let index = this.selectedMoves.truckId.indexOf(truckId);
            if (index > -1) {
                return this.selectedMoves.position[index];
            }
            return 0;
        },
        getTruckSelectedMoveLength: function(truckId)
        {
            debug( "getTruckSelectedMoveLength()", truckId);
            let index = this.selectedMoves.truckId.indexOf(truckId);
            if (index > -1) {
                return this.selectedMoves.moveLength[index];
            }
            return 0;
        },
        
        decreasePossibleMovesForOtherTrucks: function(moveLength, truckId)
        {
            debug( "decreasePossibleMovesForOtherTrucks()", moveLength, truckId);
            
            let cardUsage = this.selectedMoves.moveLength.reduce((a,b)=>a+b);
            dojo.query(`.ffg_truck[data_player="${this.player_id}"]`).forEach((i) => {
                let otherTruckId = i.getAttribute("data_id");
                if( truckId != otherTruckId) {
                    let currentTruckPosition = this.getTruckCurrentPosition(this.player_id,otherTruckId);
                    let currentSelectedPosition = this.getTruckSelectedMovePosition(otherTruckId);
                    let currentSelectedMoveLength = this.getTruckSelectedMoveLength(otherTruckId);
                    let selectablePositions = dojo.query(`#${i.id} .ffg_truck_pos:not(.ffg_selected_move):not(.ffg_selection_disabled).ffg_selectable[data_truck="${otherTruckId}"]`) ;
                    selectablePositions.forEach( (pos) => {
                        let p = pos.getAttribute("data_position");
                        if(p>currentSelectedPosition && p>currentTruckPosition + parseInt( this.selectedAmount - cardUsage + currentSelectedMoveLength ) ) {
                            debug( "decreasePossibleMovesForOtherTrucks() for position", otherTruckId,pos);
                            pos.classList.add("ffg_selection_disabled");
                            this.addTooltip(pos.id,_("You can move here if you move another truck backward") , '' );
                        }
                    });
                }
            });
        },
        
        increasePossibleMovesForOtherTrucks: function(moveLength, truckId)
        {
            debug( "increasePossibleMovesForOtherTrucks()", moveLength, truckId);
            
            dojo.query(`.ffg_truck[data_player="${this.player_id}"]`).forEach((i) => {
                let otherTruckId = i.getAttribute("data_id");
                if( truckId != otherTruckId) {
                    let notselectablePositions = dojo.query(`#${i.id} .ffg_truck_pos:not(.ffg_selected_move).ffg_selection_disabled.ffg_selectable[data_truck="${otherTruckId}"]`) ;
                    let quantity = Math.min(notselectablePositions.length,moveLength);
                    if(quantity > 0){
                        for(let k=quantity-1; k>=0; k--) {//from farest to nearest pos on the line
                            let pos = notselectablePositions[k];
                            debug( "increasePossibleMovesForOtherTrucks() for position", pos);
                            pos.classList.remove("ffg_selection_disabled");
                            this.removeTooltip(pos);
                        }
                    }
                }
            });
            
        },
        /**
        Draw lines corresponding to the temporary player selection, before it is sent to server (and drawn on response)
        */
        drawSelectedMoves: function()
        {
            debug( "drawSelectedMoves()");
            let player_id = this.player_id;
            let cssPos = "ffg_not_confirmed_pos ffg_temp_selection";
            
            if(this.selectedMoves.truckId.length>0 ){
                for (let i=0 ; i< this.selectedMoves.truckId.length; i++ ){
                    let truckId = this.selectedMoves.truckId[i];
                    let position = this.selectedMoves.position[i];
                    let isDelivery = this.selectedMoves.isDelivery[i];
                    
                    let fromPosition = this.getTruckCurrentPosition(player_id,truckId);
            
                    //CODE similar with the end of the updateMove() function
                    for (let k=fromPosition+1 ; k<= position; k++ ){
                        let posId = truckId+"_"+k;
                        let posDivId = "ffg_truck_pos_"+player_id+"_"+posId;
                        dojo.removeClass(posDivId,"ffg_not_drawn_pos") ;
                        dojo.addClass(posDivId,cssPos ) ;
                        //this.animateMovePosition(posDivId);
                        let state = (isDelivery ? this.constants.STATE_MOVE_DELIVERED_TO_CONFIRM : this.constants.STATE_MOVE_TO_CONFIRM);
                        
                        this.drawTruckLine(player_id, posId,state, ["ffg_temp_selection"]);
                        
                        let truckIconDivId = posDivId + "_icon";
                        dojo.addClass(truckIconDivId,"ffg_hidden" ) ;
                        if( k== position){
                            dojo.removeClass(truckIconDivId,"ffg_hidden" ) ;
                        }
                    }
                }
            }
        },
        undrawSelectedMoves: function(truckId= undefined)
        {
            debug( "undrawSelectedMoves()",truckId);
            let player_id = this.player_id;
            let truckPositions = dojo.query(`.ffg_truck[data_player="${player_id}"] .ffg_truck_pos.ffg_temp_selection`);
            let truckIcons = dojo.query(`.ffg_truck[data_player="${player_id} .ffg_temp_selection .ffg_icon_truck_pos`);
            
            if(truckId != undefined) {
                truckPositions = dojo.query(`#ffg_truck_${player_id}_${truckId} .ffg_truck_pos.ffg_temp_selection`);
                truckIcons = dojo.query(`#ffg_truck_${player_id}_${truckId} .ffg_temp_selection .ffg_icon_truck_pos`);
            }
            truckPositions.forEach((i) => {
                dojo.addClass(i,"ffg_not_drawn_pos"); 
                dojo.removeClass(i,"ffg_not_confirmed_pos");
                let posId = i.getAttribute("data_truck")+ "_"+i.getAttribute("data_position");
                this.undrawTruckLine(player_id, posId);
            });
            truckIcons.forEach((i) => { 
                dojo.addClass(i,"ffg_hidden"); 
            });
        },
        getTruckCurrentPosition: function(player_id,truckId)
        {
            debug( "getTruckCurrentPosition()", player_id,truckId);
            let truckDiv = $(`ffg_truck_${player_id}_${truckId}`);
            let confirmed_position = parseInt(truckDiv.getAttribute("data_confirmed_position") );
            let not_confirmed_position = parseInt(truckDiv.getAttribute("data_not_confirmed_position") );
            if( !isNaN(not_confirmed_position)) {
                return not_confirmed_position;
            }
            if( !isNaN(confirmed_position)) {
                return confirmed_position;
            }
            return 0;
        },

        /**
        Return true if at least 1 card is still playable
                false otherwise  (ie all cards are non playable)
        */
        existPossibleCard: function()
        {
            debug( "existPossibleCard()", this.possibleCards);
            
            for(let i in this.possibleCards){
                if(i == 'LOAD_KO') {
                    continue;
                }
                if(i == 'cardAlreadyUsed') {
                    continue;
                }
                if(this.isPossibleCard(i)) return true;
            }
            
            return false;
        },
        
        isPossibleCard: function(card_id)
        {
            debug( "isPossibleCard()", card_id);
         
            let pcard = this.possibleCards[card_id];
            let cardRow = this.getCardRowFromId(card_id);
            if(this.dayCards[cardRow].usedPower > 0) return false;//Cannot move 2 different times anymore
            if( pcard["LOAD"].length > 0 ) return true;
            if( pcard["MOVE"].length > 0 ) return true; 
            
            //Information about cards used during this turn by this player
            let cardAlreadyUsedArray = this.possibleCards['cardAlreadyUsed'];
            let availableOvertime = this.gamedatas.players[this.player_id].availableOvertime > 0;
            //IF player delivered all trucks, nothing can be done, even with overtime
            let nothingTodo = (this.gamedatas.players[this.player_id].score_aux ==  Object.keys(this.material.trucks_types).length);
            if(!nothingTodo && this.overtimeSuitVariant && availableOvertime && ! cardAlreadyUsedArray.includes(card_id)) {
                //Enable card also when not possible to play because it could be possible to play after change suit, but it costs overtime
                return true;
            }
        
            return false;
        },
        
        updatePossibleCards: function()
        {
            debug( "updatePossibleCards()");
         
            dojo.query(".ffg_card").removeClass("ffg_selectable");
            
            for(let card_id in this.possibleCards){
                if(card_id == 'LOAD_KO') {//Index for KOs
                    this.updateImpossibleLoads(this.player_id,this.possibleCards[card_id]);
                    continue;
                }
                if(card_id == 'cardAlreadyUsed') {
                    continue;
                }
                if(this.isPossibleCard(card_id)){
                    dojo.query(".ffg_card[data_id='"+card_id+"']").addClass("ffg_selectable");
                }
            }
        },
        updateImpossibleLoads: function(player_id,datas)
        {
            debug( "updateImpossibleLoads()",player_id,datas);
            this.impossibleLoads.set( parseInt(player_id),datas);
            this.displayImpossibleLoads(player_id);
        },
        
        resizeCargoAmountList: function(nbLoad = parseInt(this.selectedAmount)){
            debug( "resizeCargoAmountList()",nbLoad );
            let divAmountList = document.getElementById(`ffg_cargo_amount_list`);
            divAmountList.classList.remove("ffg_reverse_direction");
            //Resize mini popin for joker selection : (when displayed)
            if( !dojo.hasClass(divAmountList.id,"ffg_hidden") && this.selectedCargoContainer != undefined){
                let cargo_to_fill = document.getElementById(`ffg_container_${this.player_id}_${this.selectedCargoContainer}`) ;
                let cargoBox = cargo_to_fill.getBoundingClientRect();
                //we expect nbLoad spaces + 1 arrow + 1 close icon
                //this.placeOnObjectPos("ffg_cargo_amount_list",cargo_to_fill.id,cargoBox.width * (nbLoad+2)/2 ,cargoBox.height * 1.5);
                
                let gamecontainer = $('ffg_game_container');
                let box = gamecontainer.getBoundingClientRect();
                let width = divAmountList.getBoundingClientRect().width;
                let right = divAmountList.getBoundingClientRect().right;
                
                this.placeOnObjectPos("ffg_cargo_amount_list",cargo_to_fill.id,width/2 - cargoBox.width/2  ,cargoBox.height * 1.5); 
                
                if(right >= box.right) { //If this is gonna be too far on the right
                    divAmountList.classList.add("ffg_reverse_direction");
                    this.placeOnObjectPos("ffg_cargo_amount_list",cargo_to_fill.id, 0 - width*0.8 /2, cargoBox.height * 1.5);
                }
            }
        },
        updateCargoAmountList: function(div_id,container_id,amount){
            debug( "updateCargoAmountList()", div_id,container_id,amount);
            
            dojo.query("#ffg_cargo_amount_list").removeClass("ffg_hidden");
            dojo.query("#"+div_id).addClass("ffg_cargo_to_fill");
            this.resizeCargoAmountList(1); // expect only 1 space for spinner and wait response
            
            dojo.query("#ffg_cargo_amount_loading").removeClass("ffg_no_display");
            dojo.query(".ffg_cargo_amount").removeClass("ffg_selectable").addClass("ffg_no_display");
            for(let k=1;k<= this.constants.MAX_LOAD;k++) dojo.query("#ffg_button_amount_"+k).removeClass("ffg_selectable").addClass("ffg_no_display disabled");
            
            for(let k=1; k<= amount; k++){
                dojo.query("#ffg_cargo_amount_list_"+k).removeClass("ffg_no_display");
                dojo.query("#ffg_button_amount_"+k).removeClass("ffg_no_display");
            }
            //RECOMPUTE status bar length with buttons
            //gameui.adaptStatusBar();
            this.setMainTitle(_('Please select a possible load for this joker...'));
        
            let truck_id = $(div_id).getAttribute("data_truck");
            let truck_material = this.material.trucks_types[truck_id];
            if(truck_material.cargo_value_filter != this.constants.CARGO_TYPE_ALL_VALUES ){
                //CALL SERVER to get updated possible numbers :
                this.ajaxcallwrapper("getPossibleLoads", {'containerId': container_id});
            }
            else {
                //For PERFORMANCE, don't call server for 1/2 trucks that we know allow all numbers
                let allPossibleLoads = Array.from({length: this.selectedAmount}, (_, i) => i + 1) ;
                let fakeNotif = {'name' : 'MOCK', 'args':{'possibles': allPossibleLoads  }};
                this.notif_possibleLoads(fakeNotif);
            }
        },
        closeCargoAmountList: function(){
            debug( "closeCargoAmountList()");
            dojo.query(".ffg_cargo_to_fill").removeClass("ffg_cargo_to_fill");
            dojo.query("#ffg_cargo_amount_list").addClass("ffg_hidden");
            this.selectedCargoContainer = null;
            
            for(let k=1;k<= this.constants.MAX_LOAD;k++) dojo.query("#ffg_button_amount_"+k).removeClass("ffg_selectable").addClass("ffg_no_display");
            
            this.resetMainTitle();
        },
        
        resetContainer: function(containerDiv){
            debug( "resetContainer()",containerDiv);
            containerDiv.setAttribute("data_amount", "");
            containerDiv.setAttribute("data_state","0") ;
            containerDiv.setAttribute("data_card","") ;
            containerDiv.setAttribute("data_overtime","") ;
            let numberDiv = dojo.query("#"+containerDiv.id+">.ffg_container_number")[0];
            numberDiv.innerHTML = "";
        },
        
        displayOvertimeHoursOnCard: function()
        {
            debug( "displayOvertimeHoursOnCard()");
             
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
        
        resetOvertimeHourOnCard: function(cardDiv, updatePossibleValues = false){
            debug( "resetOvertimeHourOnCard()",cardDiv,updatePossibleValues);
            let cardModifier =  dojo.query("#"+cardDiv.id+" .ffg_cardModifier")[0];
            let amount = parseInt(cardDiv.getAttribute("data_amount") ) ;
            let card_value = parseInt(cardDiv.getAttribute("data_value") ) ;
            let card_id = parseInt(cardDiv.getAttribute("data_id") ) ;
            let card_suit = parseInt(cardDiv.getAttribute("data_suit") ) ;
            cardDiv.setAttribute("data_amount", card_value);
            cardModifier.setAttribute("data_value",0) ;
            if(updatePossibleValues ){
                /*
                if( amount!=card_value){
                    debug( "resetOvertimeHourOnCard()... recall server to get updated values for card ", card_id);
                    this.ajaxcallwrapper("getPossibleActionsForCard", {'cardId': card_id,'amount': card_value, 'suit':card_suit, 'refreshNoDisplay':true });
                }*/
                //Instead of recalling server and create race conditions, let's reset to values of this turn :
                this.possibleCards[card_id] = dojo.clone(this.possibleCardsBeforeOvertime [card_id]);
                //Reset suit:
                let row = cardDiv.id.split("_").lastItem;
                if(this.dayCards[row] != undefined) {
                    cardDiv.setAttribute('data_suit',this.dayCards[row].type);
                }
            }
            
            this.updateOvertimeHourOnCard(cardDiv);
        },
        setOvertimeHourOnCard: function(cardDiv, overtime,pAmount){
            debug( "setOvertimeHourOnCard()",cardDiv,overtime,pAmount);
            let amount = pAmount;
            /*Only rely on pAmount because overtime may include suit cost (that we don't display here)
            let card_value = parseInt(cardDiv.getAttribute("data_value") ) ;
            if(pAmount<card_value){ 
                amount = card_value - overtime;
            } else if(pAmount>card_value) {
                    amount = card_value + overtime;
            }*/
            cardDiv.setAttribute("data_amount", amount);
            this.updateOvertimeHourOnCard(cardDiv, overtime);
        },
        updateOvertimeHourOnCard: function(cardDiv, forceOvertimeValue = null){
            debug( "updateOvertimeHourOnCard()",cardDiv,forceOvertimeValue);
            let cardModifier =  dojo.query("#"+cardDiv.id+" .ffg_cardModifier")[0];
            let amount = parseInt(cardDiv.getAttribute("data_amount") ) ;
            let card_value = parseInt(cardDiv.getAttribute("data_value") ) ;

            let addClass ="";
            let delta = amount - card_value;
            let innerHTML ="";
            if( delta>0 ){
                innerHTML ="+";
                addClass = "ffg_positive_value";
            } else if( delta<0 ) {
                innerHTML ="";
                addClass = "ffg_negative_value";
            }
            else {
                innerHTML = "";
                addClass = "ffg_empty_value";
            }
            if(forceOvertimeValue != null){
                dojo.removeClass(cardModifier,"ffg_empty_value ffg_negative_value ffg_positive_value");
                cardModifier.setAttribute("data_value",forceOvertimeValue) ;
            }
            cardModifier.innerHTML = innerHTML +delta;
            dojo.addClass(cardModifier,addClass);

            return addClass;
        },
        
        updateOvertimeHoursOnCurrentBoard: function(overtime_hours,addClass)
        {
            debug( "updateOvertimeHoursOnCurrentBoard()",overtime_hours,addClass);
            dojo.query(".ffg_current_player .ffg_overtime").forEach( (item) =>{
                dojo.removeClass(item,"ffg_empty_value ffg_positive_value ffg_negative_value"); 
                if( parseInt(item.getAttribute("data_index"))<= overtime_hours ){
                    dojo.addClass(item,addClass); 
                } 
                else { 
                    dojo.addClass(item,"ffg_empty_value ");
                }
            });
        },
        increaseOvertimeHoursOnCurrentBoard: function(overtime_hours_delta)
        {
            debug( "increaseOvertimeHoursOnCurrentBoard()",overtime_hours_delta);
            let cpt =0;
            if(overtime_hours_delta>0){ 
                //ADD overtime_hours_delta TOKEN 
                for(let k=0; k<overtime_hours_delta;k++){
                    let nextToken = dojo.query(".ffg_current_player .ffg_overtime:not(.ffg_negative_value):not(.ffg_positive_value)" )[0]; 
                    if(nextToken !=undefined ){
                        dojo.addClass(nextToken,"ffg_positive_value"); 
                        cpt++;
                    }
                }
            }
            else if(overtime_hours_delta<0){
                //or REMOVE overtime_hours_delta TOKEN 
                for(let k=overtime_hours_delta; k<0;k++){
                    let nextToken = dojo.query(".ffg_current_player .ffg_overtime.ffg_positive_value").lastItem; 
                    if(nextToken !=undefined ){
                        dojo.removeClass(nextToken,"ffg_positive_value"); 
                        cpt++;
                    }
                }
            }
            return cpt;
        },
        
        setOvertimeHoursOnCard: function(divCard, set_val)
        {
            debug( "setOvertimeHoursOnCard()",divCard.id, null, set_val);
            this.increaseOvertimeHoursOnCard(divCard,null,set_val);
        },
        
        increaseOvertimeHoursOnCard: function(divCard, inc_val, set_val = undefined)
        {
            debug( "increaseOvertimeHoursOnCard()",divCard.id,inc_val,set_val);
             
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
            
            this.updateOvertimeHoursOnCurrentBoard(Math.abs(delta),addClass);
            this.increaseOvertimeHoursOnCurrentBoard(this.selectedSuitCost,"ffg_positive_value");
            
            //disable buttons and enable them again after receiving notif
            this.removeButtonsSelection();
            
            if(this.selectedAmount >0){
                //CALL SERVER to refresh possible actions for this card ;
                let callDone = this.ajaxcallwrapper("getPossibleActionsForCard", {'cardId': card_id,'amount': this.selectedAmount, 'suit':this.selectedSuit, });
                if(!callDone) {
                    this.resetButtonsSelection();
                }
            }
            else {
                this.possibleCards[card_id] = [];
                this.possibleCards[card_id]["LOAD"] = [];
                this.possibleCards[card_id]["MOVE"] = [];
                this.displayPossibleLoads( card_id);
                this.displayPossibleMoves( card_id);
                this.resetButtonsSelection();
            }
        },
        
        removeButtonsSelection: function(){
            debug("removeButtonsSelection");
            dojo.query(".ffg_button_card_plus").removeClass("ffg_selectable");
            dojo.query(".ffg_button_card_minus").removeClass("ffg_selectable");
            dojo.query(".ffg_button_card_suit_modifier").removeClass("ffg_selectable");
            dojo.query(".ffg_overtime.ffg_selectable").addClass("ffg_selectable_wait");
        },
        resetButtonsSelection: function(){
            debug("resetButtonsSelection");
            dojo.query(".ffg_button_card_plus").addClass("ffg_selectable");
            dojo.query(".ffg_button_card_minus").addClass("ffg_selectable");
            dojo.query(".ffg_button_card_suit_modifier").addClass("ffg_selectable");
            dojo.query(".ffg_overtime.ffg_selectable_wait").removeClass("ffg_selectable_wait");
        },
        
        displayTruckScore: function(player_id, truckScore, truckDivId){
            debug("displayTruckScore",player_id, truckScore, truckDivId);
            
            let numberDivs = dojo.query("#"+truckDivId+" .ffg_score_number");
            
            for(let i in numberDivs){
                numberDivs[i].innerHTML=truckScore;
            }
           
        },
        
        displayPlayerScores: function(playerDatas){
            debug("displayPlayerScores",playerDatas);
            
            let k=1;
            while( k<= this.currentRound ){
                let weekscore = playerDatas['score_week'+k];
                this.updatePlayerWeekScore(playerDatas.id,k,weekscore);
                k++;
            }
            
            //display sum of all weeks at end of game ? or whenever because we already display the player score on player panel
            this.updatePlayerTotalScore(playerDatas.id, playerDatas.score);
        },
        
        updatePlayerWeekScore: function(player_id, round,weekscore) {
            debug("updatePlayerWeekScore",player_id, weekscore , round);
            
            let numberDiv = dojo.query("#ffg_week_score_"+player_id+"_"+round+" .ffg_score_number")[0];
            numberDiv.innerHTML = weekscore;
            
            this.gamedatas.players[player_id]['score_week'+round] = weekscore;
        },
        increasePlayerWeekScore: function(player_id, round,delta_score) {
            debug("increasePlayerWeekScore",player_id, round,delta_score);
            
            let numberDiv = dojo.query("#ffg_week_score_"+player_id+"_"+round+" .ffg_score_number")[0];
            let current_value = parseInt(numberDiv.innerHTML);
            if( isNaN(current_value) ) current_value =0;
            let value = current_value + parseInt(delta_score);
            numberDiv.innerHTML = value;
            
            this.gamedatas.players[player_id]['score_week'+round] = value;
        },
        
        updatePlayerTotalScore: function(player_id, score) {
            debug("updatePlayerTotalScore",player_id, score);
            
            let numberDiv = dojo.query("#ffg_total_score_"+player_id+" .ffg_score_number")[0];
            numberDiv.innerHTML = score;
        },
        
        /**
        Update BGA player panel score
        */
        updatePlayerScore: function(player_id,score) {
            debug("updatePlayerScore",player_id, score);
            this.scoreCtrl[ player_id ].toValue( score );
            
            this.updatePlayerTotalScore(player_id, score);
            
            this.gamedatas.players[player_id].score = score;
        },
        
        /**
        Update BGA player panel score : by increasing whatever the current score value is
        (Useful when we don't want to compute all the score again)
        */
        increasePlayerScore: function(player_id,delta_score) {
            debug("increasePlayerScore",player_id, delta_score);
            this.scoreCtrl[ player_id ].incValue( delta_score );
            
            let value = this.scoreCtrl[ player_id ].getValue();
            this.updatePlayerTotalScore(player_id, value);
            
            this.gamedatas.players[player_id].score = value;
        },
        
        /**
        LOOP on players
        */
        updatePlayersScoreAux: function(players)
        {
            debug( "updatePlayersScoreAux" ,players); 
            //RESET to 0 in case some player is not in the array
            for ( let i in this.counterDelivered) {
                this.counterDelivered[i].toValue(0);
            }
            for ( let player_id in players) {
                let nb = players[player_id].score_aux; 
                this.updatePlayerScoreAux(player_id,nb);
            }
        },
        updatePlayerScoreAux: function(player_id,score) {
            debug("updatePlayerScoreAux",player_id, score);
            this.counterDelivered[player_id].toValue( score );
            
            this.gamedatas.players[player_id].score_aux = score;
        },
        increasePlayerScoreAux: function(player_id,delta_score) {
            debug("increasePlayerScoreAux",player_id, delta_score);
            this.counterDelivered[player_id].incValue( delta_score );
            
            this.gamedatas.players[player_id].score_aux = this.counterDelivered[player_id].getValue();
        },
        
        updateRoundLabel: function() {
            debug("updateRoundLabel");
            
            let translated = dojo.string.substitute( _("Week ${x}/${totalX} - Day ${y}/${totalY}"), {
                x: this.currentRound,
                y: this.currentTurn,
                totalX: this.constants.NB_ROUNDS,
                totalY: this.constants.NB_TURNS,
            } );
            dojo.query("#ffg_round_label")[0].innerHTML = translated;
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
        onSliderChangeBoard: function( evt )
        {
            //debug( 'onBoardSliderChange',evt.currentTarget.value );
            this.setScoreSheetZoom(parseInt(evt.currentTarget.value));
        },
        onSliderChangeCards: function( evt )
        {
            this.setCardsRatio(parseInt(evt.currentTarget.value));
        },
        
        /**
        Click Handler for choosing a card on the left : 
        */
        onSelectCard: function( evt )
        {
            debug( 'onSelectCard',evt );
            
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
            this.closeCargoAmountList();
            
            let card_id= evt.currentTarget.getAttribute("data_id") ;
            let data_value= evt.currentTarget.getAttribute("data_value") ;
            let data_suit= evt.currentTarget.getAttribute("data_suit") ;
            let data_amount= evt.currentTarget.getAttribute("data_amount") ;
            let card_row = div_id.split("_").lastItem;
            let suit_reset = undefined;
            let elt = dojo.query("#ffg_card_wrapper_"+card_row+" .ffg_button_card_suit_reset")[0]; 
            if (elt != undefined) suit_reset = elt.getAttribute("data_suit"); 
            
            //Reset overtime indicator on ALL CARDS which are not used yet :
            dojo.query(".ffg_card.ffg_selectable:not(.ffg_animation_copy)").forEach((i) => {
                    this.resetOvertimeHourOnCard(i, true);
                });
            //RESET board overtime tokens to 0 :
            this.updateOvertimeHoursOnCurrentBoard(0,''); 
            
            if(this.selectedCard == card_id ){
                //IF ALREADY DISPLAYED , hide
                debug("onSelectCard() => Hide :",card_id);
                this.unselectCard();
                this.displayPossibleLoads( null);
                this.displayPossibleMoves( null);
                return;
            } //ELSE continue to SHOW
            
            dojo.addClass(div_id,"ffg_selected") ;
            dojo.query("#"+evt.currentTarget.parentElement.id ).addClass("ffg_selected") ; 
                
            this.selectedCard = card_id;
            this.selectedAmount = data_amount;
            this.selectedSuit = data_suit;
            this.selectedSuitCost = (this.overtimeSuitVariant && suit_reset !=data_suit && suit_reset != undefined ) ? 1 : null;//suit_reset undefined for Joker
            this.displayOvertimeHoursOnCard();
            this.cleanMultiMoveSelection();
            
            this.displayPossibleLoads( card_id);
            this.displayPossibleMoves( card_id);

        },     
        onClickCardPlus: function( evt )
        {
            debug( 'onClickCardPlus',evt );
            
            let div_id = evt.currentTarget.id;
            if(! dojo.hasClass( div_id, 'ffg_selectable' ) )
            {
                return ;
            }
            
            let delta_value = parseInt(dojo.query(".ffg_card.ffg_selected .ffg_cardModifier")[0].getAttribute("data_value") ) ;
            if(Math.abs(delta_value +1) + this.selectedSuitCost > this.counterOvertime[this.player_id].current_value ){
                //We cannot use more tokens
                return;
            }
            
            this.increaseOvertimeHoursOnCard(evt.currentTarget,1);
            this.cleanMultiMoveSelection();
        },
        onClickCardMinus: function( evt )
        {
            debug( 'onClickCardMinus',evt );
            
            let div_id = evt.currentTarget.id;
            if(! dojo.hasClass( div_id, 'ffg_selectable' ) )
            {
                return ;
            }
            
            let delta_value = parseInt(dojo.query(".ffg_card.ffg_selected .ffg_cardModifier")[0].getAttribute("data_value") ) ;
            if( Math.abs(delta_value - 1) + this.selectedSuitCost > this.counterOvertime[this.player_id].current_value ){
                //We cannot use more tokens
                return;
            }
            let card_value = parseInt(dojo.query(".ffg_card.ffg_selected")[0].getAttribute("data_value") ) ;
            if( card_value + delta_value <=1 ){
                // we cannot use values under 1
                return;
            }
            
            this.increaseOvertimeHoursOnCard(evt.currentTarget,-1);
            this.cleanMultiMoveSelection();
            
        },
        
        onClickChangeSuit: function( evt )
        {
            debug( 'onClickChangeSuit',evt );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );
            
            let div_id = evt.currentTarget.id;
            let target_suit = evt.currentTarget.getAttribute("data_suit");
            if( ! dojo.hasClass( div_id, 'ffg_selectable' ) || this.selectedSuit!=null && this.selectedSuit == target_suit) {
                return ;
            }
            let suit_reset = dojo.query(".ffg_card_wrapper.ffg_selected .ffg_button_card_suit_reset")[0].getAttribute("data_suit"); 
            let delta_value = parseInt(dojo.query(".ffg_card.ffg_selected .ffg_cardModifier")[0].getAttribute("data_value") ) ;
            if(target_suit != suit_reset && this.selectedSuitCost!=1 && Math.abs(delta_value) + this.selectedSuitCost >= this.counterOvertime[this.player_id].current_value ){
                //We cannot use more tokens
                return;
            }
            
            //ACTION : USE 1 token , as we do when click +1 BUT update the suit of the card instead of amount
            let selectedCardDiv = dojo.query(".ffg_card.ffg_selected")[0] ;
            let card_id = parseInt(selectedCardDiv.getAttribute("data_id") ) ;
            this.selectedSuit = target_suit;
            selectedCardDiv.setAttribute("data_suit",this.selectedSuit);//UPDATE UI of the card
            
            //disable buttons and enable them again after receiving notif
            this.removeButtonsSelection();
            
            //TODO JSA ? add a 'global class' variable to keep track of overtime used on each button : only 1 overtime is needed when we change the suit of the card, but it adds to the ones played on the same card to modify amount
            let addClass = "ffg_positive_value";
            if(this.selectedSuit != suit_reset ){
                if( this.selectedSuitCost == null || this.selectedSuitCost ==0) {
                    //IF no suit has been selected yet
                    this.increaseOvertimeHoursOnCurrentBoard(1,addClass);
                }
                this.selectedSuitCost = 1;
            }
            else {
                if( this.selectedSuitCost != null) {
                    //IF another suit has been selected before
                    this.increaseOvertimeHoursOnCurrentBoard(-1,addClass);
                }
                this.selectedSuitCost = 0;
            }
            
            //CALL SERVER to refresh possible actions for this card ;
            let callDone = this.ajaxcallwrapper("getPossibleActionsForCard", {'cardId': card_id,'amount': this.selectedAmount, 'suit': this.selectedSuit,});
            if(!callDone) {
                this.resetButtonsSelection();
            }
        },
        
        /**
        Click Handler for the trucks cargo containers : 
        */
        onSelectLoadTarget: function( evt )
        {
            debug( 'onSelectLoadTarget',evt );
            
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
                this.closeCargoAmountList();
                return ;
            }
            this.closeCargoAmountList();
            this.selectedCargoContainer = container_id;
            let cardSuit = dojo.query(".ffg_card[data_id="+cardId+"]")[0].getAttribute("data_suit") ;
            
            let amount = this.selectedAmount;
            
            if( cardSuit == this.constants.JOKER_TYPE){
                this.updateCargoAmountList(div_id,container_id,amount);
                return ;
            }
            
            this.ajaxcallwrapper("loadTruck", {'cardId': cardId, 'containerId': container_id, 'amount': amount, 'suit': this.selectedSuit,});
        },
        
        onSelectCargoAmount: function( evt )
        {
            debug( 'onSelectCargoAmount',evt )
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
            
            this.ajaxcallwrapper("loadTruck", {'cardId': this.selectedCard, 'containerId': this.selectedCargoContainer, 'amount': this.selectedAmount, 'suit': this.selectedSuit, });
        },
        // SAME as previous method, but clicking on a button
        onClickCargoAmount: function( evt )
        {
            debug( 'onClickCargoAmount',evt )
            // Preventing default browser reaction
            dojo.stopEvent( evt );
            
            let div_id = evt.currentTarget.id;
            this.selectedAmount = div_id.split("_").lastItem;
            
            if( ! dojo.hasClass( div_id, 'ffg_selectable' ) )
            {
                // This is not a possible action => the click does nothing
                return ;
            }
            
            this.ajaxcallwrapper("loadTruck", {'cardId': this.selectedCard, 'containerId': this.selectedCargoContainer, 'amount': this.selectedAmount, 'suit': this.selectedSuit, });
        },
        
        onCloseCargoAmountSelection: function( evt )
        {
            debug( 'onCloseCargoAmountSelection',evt )
            // Preventing default browser reaction
            dojo.stopEvent( evt );
            
            this.closeCargoAmountList();
        },

        /**
        Click Handler for the trucks moves positions : 
        */
        onSelectTruckPos: function( evt )
        {
            debug( 'onSelectTruckPos',evt );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );
            
            let div = evt.currentTarget;
            let div_id = div.id;
            let position = div.getAttribute("data_position") ;
            let truck_id = div.getAttribute("data_truck") ;
            let cardId = this.selectedCard;
            let isDelivery = false;
            let truck_material = this.material.trucks_types[truck_id];
            
            
            if( ! dojo.hasClass( div_id, 'ffg_selectable' ) )
            {
                // This is not a possible action => the click does nothing
                return ;
            }
            if( dojo.hasClass( div_id, 'ffg_selected_move' ) ) {
                //Reclick means unselect
                this.cleanMultiMoveSelectionOnTruck(truck_id,true);
                return ;
            }
            if( dojo.hasClass( div_id, 'ffg_selection_disabled' ) ) {
                //Temporary disabled because of other selections
                return ;
            }
            
            //Close joker selection if opened
            this.closeCargoAmountList();
            
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
                    
                    //Obsolete : save move for moveMultiTrucks
                    //this.ajaxcallwrapper("moveTruck", {'cardId': cardId, 'truckId': truck_id, 'position': position,'isDelivery': isDelivery,});
                    this.saveSelectedMove(div, cardId, truck_id,position,isDelivery );
                });
                return; //(multipleChoiceDialog is async function)
            }
            
            this.saveSelectedMove(div,cardId, truck_id,position,isDelivery );
            //Obsolete : save move for moveMultiTrucks
            //this.ajaxcallwrapper("moveTruck", {'cardId': cardId, 'truckId': truck_id, 'position': position,'isDelivery': isDelivery,});
        },
        
        onStopMoving: function( evt )
        {
            debug( 'onStopMoving',evt );
            // Preventing default browser reaction
            dojo.stopEvent( evt );
            
            let cardId = this.selectedCard;
            let amount = this.selectedAmount;
            let truckIds = this.selectedMoves.truckId.toString().replaceAll(","," ");
            let positions = this.selectedMoves.position.toString().replaceAll(",",";");
            let isDelivery = this.selectedMoves.isDelivery.toString().replaceAll(","," ");
            
            //These values are to store REAL computation from server response :
            this.selectedMoves.usedOvertime = 0;
            this.selectedMoves.cardUsage = 0;
            
            //Example : this.ajaxcallwrapper("moveMultiTrucks", {'cardId': 12, 'amount': 3,'truckId': 'truck2 truck3', 'position': "1;3;" ,'isDelivery': "false false",});
            this.ajaxcallwrapper("moveMultiTrucks", { 
                'cardId': cardId, 
                'amount': amount, 
                'truckId': truckIds, 
                'position': positions,
                'isDelivery': isDelivery,
                });
        },
        
        onSelectOvertimeHour: function( evt )
        {
            debug( 'onSelectOvertimeHour',evt )
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
            this.updateOvertimeHoursOnCurrentBoard(data_amount,eltClass);
            this.increaseOvertimeHoursOnCurrentBoard(this.selectedSuitCost,"ffg_positive_value");
            
            this.selectedAmount = null;
            this.selectedOvertimeToken = div_id;
            
            this.displayOvertimeHoursOnCard();
            dojo.query(".ffg_card.ffg_selected .ffg_cardModifier").addClass(eltClass);
            
        },
        
        onEndTurn: function( evt )
        {
            debug( 'onEndTurn',evt );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );
            
            if(this.existPossibleCard()){
                let confirmMessage = _("You still have cards to play, are you sure to end your turn ?");
                if( $("ffg_button_stopmoving").classList.contains("disabled") == false ){
                    //if button to confirm is active
                    confirmMessage = _("You didn't confirm your moving action, are you sure to end your turn ?");
                }
                
                this.confirmationDialog(confirmMessage, () => {
                    this.ajaxcallwrapper("endTurn", { }, () => { debug("endTurn ajaxcall end"); } );
                    /* sometimes good, but leads to race conditions with enteringState :
                    this.ajaxcallwrapper("endTurn", { }, () => { debug("endTurn call end"); this.
                    clearActionButtons(); });
                    */
                });
                return;
            }
            
            this.ajaxcallwrapper("endTurn", { }, () => { debug("endTurn ajaxcall end"); } );
            /* sometimes good, but leads to race conditions with enteringState :
            this.ajaxcallwrapper("endTurn", { }, () => { debug("endTurn call end"); this.
            clearActionButtons(); });
            */
        },   
        
        onCancelTurn: function( evt )
        {
            debug( 'onCancelTurn',evt );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );
            
            this.unselectCard();
            
            this.confirmationDialog(_("Are you sure you want to cancel your whole turn ?"), () => {
                this.ajaxcallwrapperNoCheck("cancelTurn", { }, () => {
                    debug("cancelTurn ajaxcall end");  
                    this.addCustomActionButtons(); 
                });
            });
            return;
        },
        
        onClickShowScore: function( evt )
        {
            debug( 'onClickShowScore',evt );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );
            
            this.selectedPlayerId = evt.currentTarget.id.split("_").lastItem;
            
            //Don't call server, use client datas instead to display modal with details about score
            //this.ajaxcallwrapperNoCheck("showScoringDialog", { });
            this.initShowScoreDialog();
            this.showScoreDialog.show();
        },
        onClickShowBoard: function( evt )
        {
            debug( 'onClickShowBoard',evt );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );
            
            this.selectedPlayerId = evt.currentTarget.id.split("_").lastItem;
            
            this.initShowBoardDialog(this.selectedPlayerId);
            this.showBoardDialog.show();
            
            this.initTooltips(this.material.tooltips);
        },
        
        onClickSlideShowLeft: function( evt )
        {
            debug( 'onClickSlideShowLeft',evt );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );
            
            if(Object.keys(this.gamedatas.players).length == 1 ) return;
            
            this.selectedPlayerId = this.getNextPlayerId(this.selectedPlayerId, "left");
            
            dojo.query("#modal_ffg_all_players_board_wrap *").removeClass("ffg_selectedPlayerId"); 
            dojo.addClass("modal_ffg_board_player_container_wrapper_"+this.selectedPlayerId,"ffg_selectedPlayerId");
        },
        
        onClickSlideShowRight: function( evt )
        {
            debug( 'onClickSlideShowRight',evt );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );
            
            if(Object.keys(this.gamedatas.players).length == 1 ) return;
            
            this.selectedPlayerId = this.getNextPlayerId(this.selectedPlayerId, "right");
            
            dojo.query("#modal_ffg_all_players_board_wrap *").removeClass("ffg_selectedPlayerId"); 
            dojo.addClass("modal_ffg_board_player_container_wrapper_"+this.selectedPlayerId,"ffg_selectedPlayerId");
        },
        
        onClickDiscardPile: function( evt )
        {
            debug( 'onClickDiscardPile',evt );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );
            
            this.initShowDiscardPileDialog();
            this.showDiscardPileDialog.show();
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
            debug( 'notifications subscriptions setup' );
            
            // TODO: here, associate your game notifications with local methods
            dojo.subscribe( 'newTurn', this, "notif_newTurn" );
            dojo.subscribe( 'possibleLoads', this, "notif_possibleLoads" );
            dojo.subscribe( 'loadTruck', this, "notif_loadTruck" );
            dojo.subscribe( 'moveTruck', this, "notif_moveTruck" );
            dojo.subscribe( 'moveMultiTrucks', this, "notif_moveMultiTrucks" );
            dojo.subscribe( 'possibleCards', this, "notif_possibleCards" );
            dojo.subscribe( 'cancelTurnDatas', this, "notif_cancelTurnDatas" );
            
            dojo.subscribe( 'endTurnActions', this, "notif_endTurnActions" );
            dojo.subscribe( 'endTurnScore', this, "notif_endTurnScore" );
            dojo.subscribe( 'endTurnImpossibleLoads', this, "notif_endTurnImpossibleLoads" );
            dojo.subscribe( 'endTurnPlayerDatas', this, "notif_endTurnPlayerDatas" );
            dojo.subscribe( 'newWeekScore', this, "notif_newWeekScore" );
            
        },  
        
        //  from this point and below, you can write your game notifications handling methods
        
        notif_newTurn: function( notif )
        {
            debug( 'notif_newTurn',notif );
            
            this.updatePlayersOvertimeHours(notif.args.availableOvertimes);
            dojo.query(".ffg_card:not(.ffg_animation_copy)").forEach( dojo.hitch(this, "resetOvertimeHourOnCard"));
            dojo.query(".ffg_card .ffg_cardModifier").removeClass("ffg_positive_value").removeClass("ffg_negative_value").addClass("ffg_empty_value");
            dojo.query(".ffg_card .ffg_cardModifier").forEach(" item.innerHTML = ''"); 
        },  
        
        notif_possibleLoads: function( notif )
        {
            debug( 'notif_possibleLoads',notif );
             
            dojo.query("#ffg_cargo_amount_loading").addClass("ffg_no_display");
            
            for ( let k in notif.args.possibles) {
                let value = notif.args.possibles[k];
                dojo.query("#ffg_cargo_amount_list_"+value).addClass("ffg_selectable");
                dojo.query("#ffg_button_amount_"+value).removeClass("disabled").addClass("ffg_selectable");
            }
            let visiblecount = dojo.query("#ffg_cargo_amount_list .ffg_cargo_amount.ffg_selectable:not(.ffg_no_display)").length ;
            this.resizeCargoAmountList(visiblecount);
        },  

        notif_possibleCards: function( notif )
        {
            debug( 'notif_possibleCards',notif );
            
            let card_id = notif.args.cardId;
            if(card_id !=undefined){
                //SPECIFIC CASE, retrieve 1 card infos via getPossibleActionsForCard
                this.possibleCards[card_id] = [];
                if(notif.args.possibleCards !=undefined){
                    this.possibleCards[card_id] = notif.args.possibleCards;
                }
                //if(notif.args.refreshNoDisplay == false){
                this.displayPossibleLoads( card_id);
                this.displayPossibleMoves( card_id);
                //}
                
                //Don't call updatePossibleCards because we don't want the current card to be disabled (in order to be able to modify it again) and there is no reason to update other cards
            }  
            else { //GENERAL CASE, get all 3 cards infos
                this.possibleCards = [];
                if(notif.args.possibleCards !=undefined){
                    this.possibleCards = notif.args.possibleCards;
                }
                this.possibleCardsBeforeOvertime = dojo.clone(this.possibleCards);
                this.updatePossibleCards();
            }
            
            this.resetButtonsSelection();
            
        },  
        notif_loadTruck: function( notif )
        {
            debug( 'notif_loadTruck',notif );
            
            let containerDivId = "ffg_container_"+this.player_id+"_"+notif.args.containerId;
            
            this.updateLoad(this.player_id,notif.args.containerId,notif.args.amount,notif.args.state,notif.args.card_id,notif.args.usedOvertime);
            
            this.updatePlayerOvertimeHours(this.player_id,notif.args.availableOvertime);
            this.increasePlayerScore(this.player_id, 0 - notif.args.usedOvertime * this.constants.SCORE_BY_REMAINING_OVERTIME ) ;
            
            //Remove possible selection of this place
            dojo.removeClass(containerDivId,"ffg_selectable") ;
            dojo.query(".ffg_cargo_amount").removeClass("ffg_selectable");
            dojo.query(".ffg_cargo_to_fill").removeClass("ffg_cargo_to_fill");
            
            let cardRow = this.getCardRowFromId(notif.args.card_id);
            if(notif.args.usedOvertime == 0){
                //For example if we had a JOKER+1 and we click on load 1-6, it doesn't cost anything
                this.resetOvertimeHourOnCard($("ffg_card_"+cardRow), true);
            }
            else {
                let modifier = notif.args.usedOvertime;
                this.setOvertimeHourOnCard($("ffg_card_"+cardRow),notif.args.usedOvertime, notif.args.amount);
            }
            //unselect card
            this.unselectCard();
            
        },
        
        notif_moveTruck: function( notif )
        {
            debug( 'notif_moveTruck',notif );
            
            this.updateMove(this.player_id, notif.args.truckId,notif.args.position, parseInt(notif.args.fromPosition) +1,notif.args.truckState.confirmed_position,notif.args.truckState.confirmed_state,notif.args.truckState.not_confirmed_state,notif.args.truckState.not_confirmed_position, notif.args.truckScore,"ffg_not_confirmed_pos");
            
            this.updatePlayerOvertimeHours(this.player_id,notif.args.availableOvertime);
            this.increasePlayerScore(this.player_id, 0 - notif.args.usedOvertime * this.constants.SCORE_BY_REMAINING_OVERTIME ) ;
            
            this.selectedMoves.usedOvertime += notif.args.usedOvertime;
            //this.selectedMoves.cardUsage += notif.args.cardUsage;
            //In case we move a long path before a short path, keep the longest :
            this.selectedMoves.cardUsage = Math.max(this.selectedMoves.cardUsage, notif.args.cardUsage );
            
            let cardRow = this.getCardRowFromId(notif.args.card_id);
            this.dayCards[cardRow].usedPower = this.selectedMoves.cardUsage;
            this.updateCardUsage(cardRow);
            
            if(this.selectedMoves.usedOvertime == 0){
                //For example if we had a 6 +/-1 and we click on position 2, it doesn't cost anything
                this.resetOvertimeHourOnCard($("ffg_card_"+cardRow), true);
            }
            else {
                this.setOvertimeHourOnCard($("ffg_card_"+cardRow),this.selectedMoves.usedOvertime, this.selectedMoves.cardUsage);
            }
            
            //Don't unselect card because we will receive several of this notif
            //this.unselectCard(); 
            
        },
        
        notif_moveMultiTrucks: function( notif )
        {
            debug( 'notif_moveMultiTrucks',notif );
            
            //unselect card
            this.unselectCard();
            //Will be useless when updatePossibleCards is correct :
            this.disableCard(notif.args.cardId);
        },
        
        notif_cancelTurnDatas: function( notif )
        {
            debug( 'notif_cancelTurnDatas',notif );
            
            this.updatePlayerOvertimeHours(this.player_id,notif.args.availableOvertime);
            dojo.query(".ffg_card:not(.ffg_animation_copy)").forEach( dojo.hitch(this, "resetOvertimeHourOnCard"));
            
            //CANCEL SUIT optional Changes
            for(let row in this.dayCards){
                //Clean cards usage :
                notif.args.dayCards[row].usedPower = 0;
                this.resetDayCardFromJson(row,notif.args.dayCards[row]);
                
                let divId = "ffg_card_"+row;
                let div = dojo.query("#"+divId)[0];
                div.setAttribute("data_suit", this.dayCards[row].type);
            }
            
            this.possibleCards = [];
            if(notif.args.possibleCards !=undefined){
                this.possibleCards = notif.args.possibleCards;
            } 
            this.possibleCardsBeforeOvertime = dojo.clone(this.possibleCards);
            this.updatePossibleCards();
            
            //Clean containers :
            let playerContainers = dojo.query(".ffg_container[data_player='"+this.player_id+"'][data_state="+this.constants.STATE_LOAD_TO_CONFIRM+"]");
            playerContainers.forEach( dojo.hitch(this, "resetContainer"));
            
            //Clean truck positions :
            dojo.query(".ffg_truck_pos.ffg_not_confirmed_pos[data_player='"+this.player_id+"']").forEach((i) => { 
                dojo.addClass(i,"ffg_not_drawn_pos"); 
                dojo.removeClass(i,"ffg_not_confirmed_pos");
                    
                //Clean lines between positions
                let posId = i.getAttribute("data_truck")+ "_"+i.getAttribute("data_position");
                this.undrawTruckLine(this.player_id, posId);
                });
                
            //Clean truck positions selection
            this.cleanMultiMoveSelection();
            
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
            
            //Clean week score
            this.updatePlayerWeekScore(this.player_id,this.currentRound,notif.args.score_week);
            
            this.updatePlayerScore(this.player_id,notif.args.newScore );
            this.updatePlayerScoreAux(this.player_id,notif.args.newScoreAux );
            
        },  
        
        notif_endTurnActions: function( notif )
        {
            debug( 'notif_endTurnActions',notif );

            let listActions = notif.args.listActions;
            for (let i in listActions.trucks_cargos){
                let load = listActions.trucks_cargos[i];
                this.updateLoad(load.player_id,load.id,load.amount,load.state,load.card_id,load.overtime);
            }
            for (let i in listActions.trucks_positions){
                let player = listActions.trucks_positions[i];
                for (let j in player){
                    let move = player[j];
                    this.updateMove(move.player_id, move.truck_id,move.confirmed_position, 1,move.confirmed_position,move.confirmed_state,move.not_confirmed_state,move.not_confirmed_position, move.truckScore,"ffg_confirmed_pos");
                }
            }
            
        },
        notif_endTurnScore: function( notif )
        {
            debug( 'notif_endTurnScore',notif );
            this.updatePlayerWeekScore(notif.args.player_id,notif.args.k,notif.args.nb );
            this.updatePlayerScore(notif.args.player_id,notif.args.newScore );
        },
        
        notif_endTurnImpossibleLoads: function( notif )
        {
            debug( 'notif_endTurnImpossibleLoads',notif );
            
            for( let player_id in notif.args.LOAD_KO )
            {
                this.updateImpossibleLoads(player_id,notif.args.LOAD_KO[player_id]);
            }
        },
        notif_endTurnPlayerDatas: function( notif )
        {
            debug( 'notif_endTurnPlayerDatas',notif );
            
            //Update  gamedatas.players
            for( let player_id in notif.args.players )
            {
                this.updatePlayerDatas(player_id, notif.args.players[player_id]);
            }
            
        },
        
        notif_newWeekScore: function( notif )
        {
            debug( 'notif_newWeekScore',notif );
            this.updatePlayerWeekScore(notif.args.player_id,notif.args.k,notif.args.nb );
            this.updatePlayerScore(notif.args.player_id,notif.args.newScore );
        },
   });             
});

//# sourceURL=flipfreighters.js