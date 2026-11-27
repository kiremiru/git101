clear @s feather 0 1
execute as @s at @s run particle minecraft:egg_destroy_emitter ^ ^-0.5 ^
effect @s[tag=axe] speed 3 255 true
effect @s[tag=!axe] speed 5 10 true
scoreboard players set @s skill_1 0
scoreboard players set @s time 0