-- -- One time ESP Setup --
wifi.setmode(wifi.STATION)
wifi.sta.config ("mad-host","madhost1")  
print(wifi.sta.getip())

dofile("httpclient.lua")