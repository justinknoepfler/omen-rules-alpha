# OmenRules

## Overview

The OmenRules library implements the rules of Omen.

The library consists of the following:

* Rules: the Rules library contains functions from (gameState, event) => action. In other words, they consume a gameState and some event
(a player message, a timer event), and turn them into actions.

* GameState: the Game library contains function from (gameState, action) => gameState. In other words, the consume an Action and a GameState,
and produce the next game state.

* Events: the Events library defines factories for Events. Events are the common language used to generate actions in order to update
the game state.

* Actions: the Actions library defines factories for Actions. Actions are consumed by GameStates to produce new GameStates.


