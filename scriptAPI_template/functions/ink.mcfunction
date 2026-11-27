clear @s minecraft:ink_sac 0 1
execute as @s at @s run summon armor_stand "ink" ~ ~ ~
tag @s add ink
execute as @e[name=ink] at @s run tp @s @a[c=1,tag=ink]
scoreboard players set @s skill_2 0
scoreboard players set @s time 0