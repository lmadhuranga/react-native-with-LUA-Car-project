conWifi = require("conWifi")
mymotor = require("mymotor")
conWifi.start(function(ipaddress)
    print('wifi ok ip',ipaddress)
end)

----------------
-- Web Server --
----------------
print("Starting Web Server...")
-- Create a server object with 30 second timeout
srv = net.createServer(net.TCP, 30)

-- server listen on 80,
-- if data received, print data to console,
-- then serve up a sweet little website
srv:listen(80,function(conn)
    conn:on("receive", function(conn, payload)
        --print(payload) -- Print data from browser to serial terminal

        function esp_update()
            vspeed = 70
            goto=string.sub(payload,postparse[2]+1,#payload)
            print('======= Direction ======= ', goto)
            if goto == "left" then
                print("lefte")
                mymotor.motor_a(FWD, 0)
                mymotor.motor_b(FWD, vspeed)
            end

            if goto == "right" then
                print("right")
                mymotor.motor_a(FWD, vspeed)
                mymotor.motor_b(FWD, 0)
            end

            if goto == "forward" then
                print("forward")
                mymotor.motor_a(FWD, vspeed)
                mymotor.motor_b(FWD, vspeed)
            end
            if goto == "back" then
                print("back")
                mymotor.motor_a(REV, vspeed)
                mymotor.motor_b(REV, vspeed)
            end
            if goto == "stop" then
                print("back")
                mymotor.motor_a(FWD, 0)
                mymotor.motor_b(FWD, 0)
            end
        end

        --parse position POST value from header
        postparse={string.find(payload,"goto=")}
        --If POST value exist, set LED power
        if postparse[2]~=nil then esp_update()end


        -- CREATE WEBSITE --

        -- HTML Header Stuff
        conn:send('HTTP/1.1 200 OK\n\n')
        conn:send('<html>\n')
        conn:send('<form action="" method="POST">\n')
        conn:send('<input type="submit" name="goto" value="left">\n')
        conn:send('<input type="submit" name="goto" value="right">\n')
        conn:send('<input type="submit" name="goto" value="forward">\n')
        conn:send('<input type="submit" name="goto" value="back">\n')
        conn:send('<input type="submit" name="goto" value="stop">\n')
        conn:send('</form>\n')
        conn:send('</body></html>\n')
        conn:on("sent", function(conn) conn:close() end)
    end)
end)
