function initSocket(io) {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join_room', (role) => {
      socket.join(role);
      console.log(`Socket ${socket.id} joined room: ${role}`);
    });

    socket.on('dashboard_subscribe', () => {
      socket.join('dashboard');
      console.log(`Socket ${socket.id} joined dashboard`);
    });

    socket.on('vc_initiate', (data) => {
      io.to(data.target_user_id).emit('vc_incoming', data);
    });

    socket.on('vc_accept', (data) => {
      io.to(data.initiator_id).emit('vc_accepted', data);
    });

    socket.on('vc_reject', (data) => {
      io.to(data.initiator_id).emit('vc_rejected', data);
    });

    socket.on('vc_signal', (data) => {
      io.to(data.to).emit('vc_signal', data);
    });

    socket.on('vc_end', (data) => {
      io.to(data.target_user_id).emit('vc_ended', data);
      io.to(data.initiator_id).emit('vc_ended', data);
    });

    socket.on('send_alert', (alert) => {
      io.to('dashboard').emit('new_alert', alert);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
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
