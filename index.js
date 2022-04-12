
const http = require("http");
const express = require("express");

const app = express()
const server = http.createServer(app)
// const io = require('socket.io')(server, {
//     cors: {
//         origin: "http://localhost:3333",
//         methods: ["GET", "POST"],
//         allowedHeaders: ["my-custom-header"],
//         credentials: true,
//     },
// })
const io = require('socket.io')(server)
const { addUser, getRoomUsers, removeUser } = require('./users')

const PORT = process.env.PORT || 3333

app.get('/', (req, res) => {
    res.send("Server is up and running")
})

io.on("connection", (socket) => {
    socket.on("join-room", ({ userName, room }) => {
        console.log("Someone Connected to the Server")
        console.log('User Joined Room')
        console.log('RoomID--->', room)
        console.log('UserName--->', userName)
        const { user, error } = addUser({ roomId: socket.id, userName, room });
        if (room && userName) {
            socket.join(user.room);
            addUser(userName, room)

            //will tell everyone else that you connected but not yourself
            socket.to(room).emit('user-connected', userName)

            // emit to all users in that room
            io.to(room).emit('all-users', getRoomUsers(room))
        }
        socket.emit("message", {
            user: "Admin",
            text: `Welocome to ${user.room}`,
        });

        socket.broadcast
            .to(user.room)
            .emit("message", { user: "Admin", text: `${user.userName} has joined!` });

        socket.on("sendMessage", ({ message }) => {
            console.log('message sent-->', message)
            io.to(user.room).emit("message", {
                user: user.userName,
                text: message,
            });
        });
        socket.on("disconnect", () => {
            const user = removeUser(socket.id);
            console.log(user);
            io.to(user.room).emit("message", {
                user: "Admin",
                text: `${user.userName} just left the room`,
            });
            console.log("A disconnection has been made");
        });
    });
});


server.listen(PORT, function (err) {
    if (err) console.log("Error in server setup")
    console.log("Server listening on Port", PORT);
})
