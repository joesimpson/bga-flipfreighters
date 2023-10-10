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
 * material.inc.php
 *
 * FlipFreighters game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *   
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */

//Couleurs de nos cartes  
//spade, heart, club, diamond
$this->card_types  = array(
    1 => array( 'name' => clienttranslate('spade'),
                'nametr' => self::_('spade') ),    
    2 => array( 'name' => clienttranslate('heart'),
                'nametr' => self::_('heart') ),
    3 => array( 'name' => clienttranslate('club'),
                'nametr' => self::_('club') ),
    4 => array( 'name' => clienttranslate('diamond'),
                'nametr' => self::_('diamond') ),
);
    //we have two of each label for suits. This is because sometimes we need translated values on the php side and sometimes we don't.
        // In this case nametr will return a translated value in php, which is only useful when you throw exceptions to show the right strings.



