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

/**
Definition of different trucks of the board, each with different cargos zones inside

    TODO JSA : add missing specific rules for trucks & for cargo spaces
*/
$this->trucks_types = array(
    "truck1" => array(
        "truck_id" => "truck1",
        "path_size" => array(5), 
        "delivery_score" => array(SCORE_TYPE_NUMBER_OF_GOODS_X5),
        "containers" => array(
            "1" , "2" , "3" ,  "4" 
        ),
    ),
    "truck2" => array(
        "truck_id" => "truck2",
        "path_size" => array(5),
        "delivery_score" => array(SCORE_TYPE_NUMBER_OF_GOODS_X5),
        "containers" => array(
            "1" , "2" , "3" ,  "4" 
        ),
    ),
    "truck3" => array(
        "truck_id" => "truck3",
        "path_size" => array(7),
        "delivery_score" => array(SCORE_TYPE_NUMBER_OF_GOODS_3_TO_30),
        "containers" => array(
            "1" , "2" , "3" ,  "4" ,  "5" ,  "6" 
        ),
    ),
    "truck4" => array(
        "truck_id" => "truck4",
        "path_size" => array(7),
        "delivery_score" => array(SCORE_TYPE_NUMBER_OF_GOODS_3_TO_30),
        "containers" => array(
            6 , 5 , 4 ,  3 ,  2 ,  1
        ),
    ),
    "truck5" => array(
        "truck_id" => "truck5",
        "path_size" => array(5),
        "delivery_score" => array(SCORE_TYPE_SUM_GOODS_X1),
        "containers" => array(
            1,2,3,4,5,6,
        ),
    ),
    "truck6" => array(
        "truck_id" => "truck6",
        "path_size" => array(5,8),
        "delivery_score" => array(SCORE_TYPE_SUM_GOODS_X1,SCORE_TYPE_SUM_GOODS_X2),
        "containers" => array(
            1,2,3,4,
        ),
    ),
    "truck7" => array(
        "truck_id" => "truck7",
        "path_size" => array(5,8),
        "delivery_score" => array(SCORE_TYPE_SUM_GOODS_X1,SCORE_TYPE_SUM_GOODS_X2),
        "containers" => array(
            1,2,3,4,
        ),
    ),
    "truck8" => array(
        "truck_id" => "truck8",
        "path_size" => array(5,8),
        "delivery_score" => array(SCORE_TYPE_SUM_GOODS_X1,SCORE_TYPE_SUM_GOODS_X2),
        "containers" => array(
            1,2,3,4,
        ),
    ),
    "truck9" => array(
        "truck_id" => "truck9",
        "path_size" => array(5,8),
        "delivery_score" => array(SCORE_TYPE_SUM_GOODS_X1,SCORE_TYPE_SUM_GOODS_X2),
        "containers" => array(
            1,2,3,4,
        ),
    ),
);
