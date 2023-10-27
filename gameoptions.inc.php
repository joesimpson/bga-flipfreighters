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
);

