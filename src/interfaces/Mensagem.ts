import { Grupo } from "./Grupo";
import { Usuario } from "./Usuario";

export interface Mensagem {
  id?: number;
  grupo: Grupo;
  usuario_remetente: Usuario;
  mensagem: string;
  data_hora: Date;
}
