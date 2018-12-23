local module={}
function module.start(callback)
    -- -- One time ESP Setup --
    wifi.setmode(wifi.STATION)
    wifi.sta.config("mad-host","madhost1")  
    return callback(wifi.sta.getip())
end

return module