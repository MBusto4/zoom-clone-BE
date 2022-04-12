
let users = [];

exports.addUser = ({ roomId, userName, room }) => {
    if (!userName || !room) return { error: "userName and room required." };
    const user = { roomId, userName, room };

    users.push(user);

    return { user };
};

exports.getRoomUsers = (room) => {
    return users.filter(user => (user.room == room))
}

exports.removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    return users[index];
};