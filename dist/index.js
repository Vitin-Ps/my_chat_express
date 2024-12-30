"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const PORT = process.env.PORT || 3005;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.get('/', (req, res) => {
    res.send('Você entrou no servidor');
});
app.use((0, cors_1.default)());
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
let users = [];
let peersConectados = [];
io.on('connection', (socket) => {
    console.log('Usuários: ', users);
    // Lida com o evento 'addCodigoUser'
    peersConectados.push(socket.id);
    console.log('Peers: ', peersConectados);
    socket.on('addCodigoUser', (codigo) => {
        let user = users.find((user) => user.codigo === codigo);
        if (!user) {
            user = {
                codigo,
                peer: socket.id,
            };
            users.push(user);
            console.log('Usuário Conectado: ', users);
        }
        else {
            console.log('usuário já conectado');
        }
    });
    socket.on('entrarSala', (codSala) => {
        socket.join(codSala);
        console.log(`Usuário ${socket.id} entrou na sala ${codSala}`);
    });
    // Lida com o evento 'addMensagem'
    socket.on('addMensagem', (data) => {
        socket.to(data.grupo.uuid).emit('receberMensagem', data);
    });
    // Lida com o evento 'disconnect'
    socket.on('disconnect', () => {
        console.log('Usuário desconectado');
        peersConectados = peersConectados.filter((peerSocketId) => peerSocketId !== socket.id);
        users = users.filter((user) => user.peer !== socket.id);
        console.log('Peers Conectados: ', peersConectados);
    });
});
// Inicie o servidor HTTP
server.listen(PORT, () => {
    console.log(`Server iniciado na porta ${PORT}`);
});
