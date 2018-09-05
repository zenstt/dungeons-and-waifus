# dungeons-and-waifus
Dungeons and waifus is a HTML MMORPG simple game.

You need to survive on a world full of waifus that want to kill you. (You can call them kinda yandere if you want).

Your objective is to get stuff to be stronger and defeat stronger waifus.

---
## Ideas
I'll write here all that I need to know for making this proyect
Let's start.

### Interface
There are draws of this on idea images folder.

First of all, login screen, 2 inputs.
(See login/register pic)
* User
* Password

Then 2 buttons bellow, basic stuff huh.

* Login - This will redirect you to main player menu
* Register - This will redirect you to register menu

#### Player menu
(See player menu pic)

Here we have a side menu with account name on top.

Followed by "Create new character" option

On the center, we have the characters created with a play button on the side.

Or "No characters created" text will appears.

* Create new character - This will redirect you to create character menu
* Play button - This will redirect you to play menu

#### Register menu
(See login/register pic)
Just typical register form.
* Email
* User - IDK/IDC 4-10 chars
* Password
* Repeat password
* Register (Button) - This will register the user and redirect to main player menu
* Log in (Button) - This will redirect to login

---
## Not ordered
* Map is full of boxes as positions
* Player will be on center box
* Player can only see certain number of boxes arround
* Mobs, chest and stuff spawn near players.
* Update only when a player is near
* Update = Mobs move, player move, some changes
* Update tick global on server every 2 seconds?
* Check what will update
* Despawn when can't update (players too far)
* Near = 1.5 times boxes of vision
* If something updated on any player vision, server send update by soquet
* Limited movements on player by time (like 1s)
* Stats
* Classes
* Races?
* Weapons and armor
* Items (consumables)
* Health and Mana
* Exp
* Levels