const onlineUsers = new Map();

function initSocket(io) {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('register_user', (user) => {
      if (user && user.id) {
        socket.join(user.id);
        if (user.role) socket.join(user.role);
        if (user.ngo_id) socket.join(`ngo_${user.ngo_id}`);

        onlineUsers.set(socket.id, { ...user, socketId: socket.id });
        console.log(`User ${user.name} (${user.role}) registered on socket ${socket.id}`);
        io.emit('online_users_update', Array.from(onlineUsers.values()));
      }
    });

    socket.on('join_room', (role) => {
      if (role) socket.join(role);
    });

    socket.on('dashboard_subscribe', () => {
      socket.join('dashboard');
    });

    // ─── WebRTC Video Call Signaling Events ───────────────────────────────────
    socket.on('vc_initiate', (data) => {
      console.log(`VC initiate from ${data.initiator_name} to ${data.target_user_id || 'random target'}`);
      if (data.target_user_id) {
        io.to(data.target_user_id).emit('vc_incoming', data);
      } else {
        // Broadcast to NGO role or all users
        socket.broadcast.emit('vc_incoming', data);
      }
    });

    socket.on('vc_accept', (data) => {
      console.log(`VC accept by ${data.target_name} for ${data.initiator_id}`);
      if (data.initiator_id) {
        io.to(data.initiator_id).emit('vc_accepted', data);
      } else {
        socket.broadcast.emit('vc_accepted', data);
      }
    });

    socket.on('vc_reject', (data) => {
      console.log(`VC reject by target`);
      if (data.initiator_id) {
        io.to(data.initiator_id).emit('vc_rejected', data);
      } else {
        socket.broadcast.emit('vc_rejected', data);
      }
    });

    socket.on('vc_signal', (data) => {
      if (data.to) {
        io.to(data.to).emit('vc_signal', data);
      } else {
        socket.broadcast.emit('vc_signal', data);
      }
    });

    socket.on('vc_end', (data) => {
      console.log(`VC ended`);
      if (data.target_user_id) io.to(data.target_user_id).emit('vc_ended', data);
      if (data.initiator_id) io.to(data.initiator_id).emit('vc_ended', data);
      socket.broadcast.emit('vc_ended', data);
    });

    socket.on('send_alert', (alert) => {
      io.to('dashboard').emit('new_alert', alert);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      onlineUsers.delete(socket.id);
      io.emit('online_users_update', Array.from(onlineUsers.values()));
    });
  });
}

function emitAlert(io, alert) {
  io.to('dashboard').emit('new_alert', alert);
}

function emitInspectionUpdate(io, inspection) {
  io.to('dashboard').emit('inspection_update', inspection);
}

module.exports = { initSocket, emitAlert, emitInspectionUpdate };
