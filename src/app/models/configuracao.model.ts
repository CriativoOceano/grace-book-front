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
  data: string;
  motivo: string;
}

export interface DisponibilidadeBloqueio {
  id?: string;
  data: string;
  motivo: string;
  createdAt?: Date;
}