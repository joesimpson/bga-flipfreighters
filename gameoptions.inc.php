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
 * gameoptions.inc.php
 *
 * FlipFreighters game options description
 * 
 * In this file, you can define your game options (= game variants).
 *   
 * Note: If your game has no variant, you don't have to modify this file.
 *
 * Note²: All options defined in this file should have a corresponding "game state labels"
 *        with the same ID (see "initGameStateLabels" in flipfreighters.game.php)
 *
 * !! It is not a good idea to modify this file when a game is running !!
 *
 */

$game_options = array(

    100 => array(
                'name' => totranslate('Overtime Hours'),    
                'values' => array(
                            1 => array( 'name' => totranslate('Basic'), 'description' => totranslate('Overtime Hours let you either increase or decrease a card value by 1')),
                            2 => array( 'name' => totranslate('Overtime Variant Rule'), 'description' => totranslate('In addition to changing the value of a card players may also choose to use overtime hours to change the suit of a card'), 'nobeginner' => true),
                        ),
                'default' => 1
            ),
            
    101 => array(
                'name' => totranslate('Show discard pile'),    
                'values' => array(
                            1 => array( 'name' => totranslate('Enabled'), 'description' => totranslate('Players can look at already played cards in the discard pile. (Not the cards staying in the game box)')),
                            2 => array( 'name' => totranslate('Disabled'), 'description' => totranslate('Players cannot see the discard pile')),
                        ),
                'default' => 1
            ),
);

$game_preferences = array(

    100 => array(
            'name' => totranslate('Interface theme'),
            'needReload' => true, // after user changes this preference game interface would auto-reload
            'values' => array(
                    1 => array( 'name' => totranslate( 'Standard' ), 'cssPref' => 'ffg_theme_standard' ),
                    2 => array( 'name' => totranslate( 'Darker' ), 'cssPref' => 'ffg_theme_dark' )
            ),
            'default' => 1
    ),
    
    101 => array(
            'name' => totranslate('Display all players board'),
            'needReload' => true, // after user changes this preference game interface would auto-reload
            'values' => array(
                    1 => array( 'name' => totranslate( 'Disabled' ), 'cssPref' => 'ffg_display_all_no' ),
                    2 => array( 'name' => totranslate( 'Enabled' ), 'cssPref' => 'ffg_display_all_yes' )
            ),
            'default' => 1
    ),
    
    105 => array(
            'name' => totranslate('Display route taken by trucks'),
            'needReload' => true, // after user changes this preference game interface would auto-reload
            'values' => array(
                    1 => array( 'name' => totranslate( 'Disabled' ), 'cssPref' => 'ffg_display_truck_route_no' ),
                    2 => array( 'name' => totranslate( 'Enabled' ), 'cssPref' => 'ffg_display_truck_route_yes' )
            ),
            'default' => 2
    ),
    103 => array(
            'name' => totranslate('Route style'),
            'needReload' => true, // after user changes this preference game interface would auto-reload
            'values' => array(
                    1 => array( 'name' => totranslate( 'Accurate' ), 'cssPref' => 'ffg_display_truck_route_accurate' ),
                    2 => array( 'name' => totranslate( 'Straight lines' ), 'cssPref' => 'ffg_display_truck_route_straight' )
            ),
            'default' => 1
    ),
    104 => array(
            'name' => totranslate('Route colors'),
            'needReload' => true, // after user changes this preference game interface would auto-reload
            'values' => array(
                    1 => array( 'name' => totranslate( 'Depends on position' ), 'cssPref' => 'ffg_display_truck_route_mutlicolors' ),
                    11 => array( 'name' => totranslate( 'Black' ), 'cssPref' => 'ffg_display_truck_route_black' ),
                    12 => array( 'name' => totranslate( 'Blue' ), 'cssPref' => 'ffg_display_truck_route_blue' ),
                    13 => array( 'name' => totranslate( 'Gray' ), 'cssPref' => 'ffg_display_truck_route_gray' ),
                    14 => array( 'name' => totranslate( 'Turquoise' ), 'cssPref' => 'ffg_display_truck_route_turquoise' ),
                    15 => array( 'name' => totranslate( 'Violet' ), 'cssPref' => 'ffg_display_truck_route_violet' ),
            ),
            'default' => 1
    ),
    
    //Leave space for future others prefs, because this one seems to be the most useless
    120 => array(
            'name' => totranslate('Display mini truck icons'),
            'needReload' => true, // after user changes this preference game interface would auto-reload
            'values' => array(
                    1 => array( 'name' => totranslate( 'Disabled' ), 'cssPref' => 'ffg_display_truck_icon_no' ),
                    2 => array( 'name' => totranslate( 'Enabled' ), 'cssPref' => 'ffg_display_truck_icon_yes' )
            ),
            'default' => 1
    ),
);

