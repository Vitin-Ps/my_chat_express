import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server, Socket } from 'socket.io';
import { User } from './interfaces/User';
import { Mensagem } from './interfaces/Mensagem';

const PORT = process.env.PORT || 3005;

// Crie a aplicação Express
const app = express();

// Configure o middleware CORS
app.use(cors({
  origin: '*', // Permite todas as origens, ajuste conforme necessário
  methods: ['GET', 'POST'],
}));

// Crie o servidor HTTP
const server = http.createServer(app);

// Configure o Socket.IO com a configuração de CORS
const io = new Server(server, {
  cors: {
    origin: '*', // Permite todas as origens, ajuste conforme necessário
    methods: ['GET', 'POST'],
  },
});

let users: User[] = [];
let peersConectados: String[] = [];

io.on('connection', (socket: Socket) => {
  console.log('Usuários: ', users);
  // Lida com o evento 'addCodigoUser'
  peersConectados.push(socket.id);
  console.log('Peers: ', peersConectados);

  socket.on('addCodigoUser', (codigo: string) => {
    let user: User | undefined = users.find((user) => user.codigo === codigo);

    if (!user) {
      user = {
        codigo,
        peer: socket.id,
      };

      users.push(user);

      console.log('Usuário Conectado: ', users);
    } else {
      console.log('usuário já conectado');
    }
  });

  socket.on('entrarSala', (codSala: string) => {
    socket.join(codSala);
    console.log(`Usuário ${socket.id} entrou na sala ${codSala}`);
  });

  // Lida com o evento 'addMensagem'
  socket.on('addMensagem', (data: Mensagem) => {
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
