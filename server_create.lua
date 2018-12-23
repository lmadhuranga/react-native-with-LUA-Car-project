server = "192.168.15.5"
port = 3000
srv = net.createConnection(net.TCP, 0)
srv:on("receive", function(sck, c) print(c) end)
-- Wait for connection before sending.
srv:on("connection", function(sck, c)
  sck:send("GET /get HTTP/1.1\r\nHost: httpbin.org\r\nConnection: close\r\nAccept: */*\r\n\r\n")
end)
print("connecting to server", server, port)
srv:connect(port,server)