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
            goto=string.sub(payload,postparse[2]+1,#payload)
            print('======= Direction ======= ', goto)
            if goto == "left" then
                print("lefte")
            end

            if goto == "right" then
                print("right")
            end

            if goto == "forward" then
                print("forward")
            end
            if goto == "back" then
                print("back")
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
        conn:send('</form>\n')
        conn:send('</body></html>\n')
        conn:on("sent", function(conn) conn:close() end)
    end)
end)
