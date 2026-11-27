clear @s nautilus_shell 0 1
structure load "shell" ~ ~ ~
tp @e[type=nautilus,c=1] @s
ride @s start_riding @e[type=nautilus,c=1]
scoreboard players set @s skill_1 0
scoreboard players set @s time 0
