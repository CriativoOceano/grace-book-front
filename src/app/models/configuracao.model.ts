export interface FaixaPreco {
  maxPessoas: number;
  valor: number;
}

export interface Configuracao {
  id?: string;
  precoDiaria: FaixaPreco[];
  precoChale: number;
  precoBatismo: number;
  quantidadeMaximaChales: number;
  diasAntecedenciaMinima: number;
  qtdMaxPessoas: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateConfiguracaoDto {
  precoDiaria?: FaixaPreco[];
  precoChale?: number;
  precoBatismo?: number;
  quantidadeMaximaChales?: number;
  diasAntecedenciaMinima?: number;
  qtdMaxPessoas?: number;
}

export interface BloquearDataDto {
  dataInicio: string;
  dataFim: string;
  observacoes?: string;
  disponibilidadeDiaria?: boolean;
  disponibilidadeBatismo?: boolean;
  chalesDisponiveis?: number;
}

export interface DisponibilidadeBloqueio {
  _id: string;
  data: string;
  disponibilidadeDiaria: boolean;
  disponibilidadeBatismo: boolean;
  chalesDisponiveis: number;
  observacoes?: string;
}