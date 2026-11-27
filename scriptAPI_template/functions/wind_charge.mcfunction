clear @s wind_charge 0 1
execute as @s at @s run kill @e[type=wind_charge_projectile,c=1]
execute as @s at @s run summon armor_stand "wind" ~ ~ ~
scoreboard players set @s skill_1 0
scoreboard players set @s time 0