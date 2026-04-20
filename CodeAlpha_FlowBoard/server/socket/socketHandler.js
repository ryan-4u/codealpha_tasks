module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Join a project room
    socket.on("joinBoard", (projectId) => {
      socket.join(projectId);
      console.log(`Socket ${socket.id} joined board: ${projectId}`);
    });

    // Card moved between columns
    socket.on("taskMoved", (data) => {
      socket.to(data.projectId).emit("taskMoved", data);
    });

    // New task created
    socket.on("taskCreated", (data) => {
      socket.to(data.projectId).emit("taskCreated", data);
    });

    // Task updated
    socket.on("taskUpdated", (data) => {
      socket.to(data.projectId).emit("taskUpdated", data);
    });

    // Task deleted
    socket.on("taskDeleted", (data) => {
      socket.to(data.projectId).emit("taskDeleted", data);
    });

    // New comment
    socket.on("newComment", (data) => {
      socket.to(data.projectId).emit("newComment", data);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};