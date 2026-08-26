import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject, of, debounceTime, distinctUntilChanged, switchMap, catchError, filter } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { StepsModule } from 'primeng/steps';
import { ChipModule } from 'primeng/chip';
import { BadgeModule } from 'primeng/badge';
import { CarouselModule } from 'primeng/carousel';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Services
import { PaymentService } from '../../services/payment.service';
import { ClienteService } from '../../core/services/cliente.service';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../services/booking.service';
import { ConteudoService, ChaletImage } from '../../core/services/conteudo.service';
import { ConfiguracaoService } from '../../core/services/configuracao.service';
import { CepService, EnderecoCompleto } from '../../core/services/cep.service';
import { DisponibilidadeService } from '../../core/services/disponibilidade.service';

// Custom Components
import { PricingSummaryComponent } from '../../components/pricing-summary/pricing-summary.component';

// Models
import { PricingBreakdown } from '../../components/pricing-summary/pricing-summary.component';
import { Configuracao, FaixaPreco } from '../../models/configuracao.model';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    DividerModule,
    MessageModule,
    ProgressSpinnerModule,
    StepsModule,
    ChipModule,
    BadgeModule,
    CarouselModule,
    DialogModule,
    ToastModule,
    PricingSummaryComponent
  ],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss',
  animations: [
    trigger('slideInUp', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          transform: 'translateY(30px)' 
        }),
        animate('600ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
          style({ 
            opacity: 1, 
            transform: 'translateY(0)' 
          })
        )
      ]),
      transition(':leave', [
        animate('300ms ease-in', 
          style({ 
            opacity: 0, 
            transform: 'translateY(-20px)' 
          })
        )
      ])
    ]),
    trigger('fadeInSlide', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          transform: 'translateX(30px)' 
        }),
        animate('800ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
          style({ 
            opacity: 1, 
            transform: 'translateX(0)' 
          })
        )
      ]),
      transition(':leave', [
        animate('400ms ease-in', 
          style({ 
            opacity: 0, 
            transform: 'translateX(30px)' 
          })
        )
      ])
    ])
  ]
})
export class BookingComponent implements OnInit {
  
  bookingForm!: FormGroup;
  currentStep = 0;
  isLoading = false;
  disponibilidadeVerificada = false;
  disponibilidadeResultado: any = null;
  valorCalculado = 0;
  // true somente quando valorCalculado veio da cotação oficial do backend,
  // não do cálculo local de fallback — usado para bloquear o envio final
  // enquanto não tivermos um valor confirmado pelo servidor.
  precoConfirmadoPeloBackend = false;
  
  // Configurações de preços
  configuracao: Configuracao | null = null;
  faixasPreco: FaixaPreco[] = [];
  precoChale: number = 150;
  precoBatismo: number = 300;
  quantidadeMaximaChales: number = 4;
  diasAntecedenciaMinima: number = 2;
  qtdMaxPessoas: number = 200;
  
  // Propriedades para pagamento ASAAS
  paymentData: any = null;
  paymentLink: string = '';
  qrCode: string = '';
  isProcessingPayment = false;
  
  // Adicionar flag para controlar se o formulário está inicializado
  formInitialized = false;
  
  // Flags para controlar visibilidade das seções
  showQuantitiesSection = false;
  showPeriodSection = false;
  showObservationsSection = false;
  
  // Dados para o componente de pricing
  pricingData: PricingBreakdown = {
    tipoReserva: '',
    quantidadePessoas: 0,
    quantidadeChales: 0,
    quantidadeDias: 0,
    valorDiaria: 0,
    valorChales: 0,
    valorBatismo: 0,
    valorTotal: 0,
    isLoading: true
  };
  
  // Opções para os selects
  tiposReserva = [
    { value: 'diaria', label: 'Diária Completa', description: `Até ${this.qtdMaxPessoas} pessoas - Inclui cozinha, churrasqueira, banheiros e piscina` },
    { value: 'batismo', label: 'Cerimônia de Batismo', description: 'Incluso apenas o uso da piscina e banheiros' }
  ];

  modosPagamento = [
    { value: 'PIX', label: 'PIX', description: 'Pagamento instantâneo' },
    { value: 'CARTAO', label: 'Cartão de Crédito', description: 'À vista ou parcelado' }
    // { value: 'BOLETO', label: 'Boleto Bancário', description: 'Pagamento em até 3 dias' } // Temporariamente desabilitado
  ];

  // Propriedades para expansão de imagem
  imagemExpandidaVisible = false;
  
  // Propriedades para diálogo de informações
  infoItensVisible = false;
  
  // Propriedade para diálogo de tabela de preços
  tabelaPrecosVisible = false;

  // Propriedades para o calendário
  minDate: Date = new Date();
  maxDate: Date = new Date(new Date().getFullYear() + 1, 11, 31); // 1 ano no futuro
  datasBloqueadas: Date[] = [];
  isLoadingDatasBloqueadas = false;
  
  // Função para desabilitar datas no calendário
  disabledDates = (date: Date): boolean => {
    if (!date) return false;
    
    // Desabilitar datas passadas
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (date < hoje) {
      return true;
    }
    
    // Desabilitar datas com reservas confirmadas
    if (this.datasBloqueadas.length > 0) {
      const dataString = date.toDateString();
      return this.datasBloqueadas.some(dataBloqueada => 
        dataBloqueada.toDateString() === dataString
      );
    }
    
    return false;
  };

  // Steps para o stepper
  steps = [
    { label: 'Tipo de Reserva', icon: 'pi pi-info-circle' },
    { label: 'Chalés', icon: 'pi pi-plus-circle' },
    { label: 'Hóspede', icon: 'pi pi-user' },
    { label: 'Pagamento', icon: 'pi pi-credit-card' }
  ];

  // Getter para retornar os steps apropriados baseado no tipo de reserva
  get filteredSteps() {
    const tipo = this.bookingForm.get('tipo')?.value;
    
    if (tipo === 'batismo') {
      // Para batismo, mostrar apenas: Tipo, Hóspede, Pagamento
      return [
        { label: 'Tipo de Reserva', icon: 'pi pi-info-circle' },
        { label: 'Hóspede', icon: 'pi pi-user' },
        { label: 'Pagamento', icon: 'pi pi-credit-card' }
      ];
    }
    
    // Para outros tipos, mostrar todos os steps
    return this.steps;
  }

  // Getter para retornar o índice ativo ajustado baseado no tipo de reserva
  get adjustedActiveIndex() {
    const tipo = this.bookingForm.get('tipo')?.value;
    
    if (tipo === 'batismo') {
      // Para batismo, ajustar o índice:
      // currentStep 0 -> índice 0 (Tipo)
      // currentStep 2 -> índice 1 (Hóspede) 
      // currentStep 3 -> índice 2 (Pagamento)
      return this.currentStep === 0 ? 0 : this.currentStep - 1;
    }
    
    // Para outros tipos, usar o índice normal
    return this.currentStep;
  }

  // Dados dos chalés carregados do painel administrativo
  chaletImages: ChaletImage[] = [];
  chaletImagesLoading = true;

  // Estados para busca de CEP
  buscandoCep = false;
  cepEncontrado = false;
  private cepSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private paymentService: PaymentService,
    private clienteService: ClienteService,
    private authService: AuthService,
    private bookingService: BookingService,
    private conteudoService: ConteudoService,
    private configuracaoService: ConfiguracaoService,
    private cepService: CepService,
    private disponibilidadeService: DisponibilidadeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.scrollToTop();
    this.preencherDadosUsuario();
    this.updatePricingData();
    this.carregarImagensChales();
    this.carregarConfiguracoes();
    this.carregarDatasBloqueadas();
    
    // Configurar busca automática de CEP
    this.configurarBuscaAutomaticaCep();

    // Avisar usuário se o período selecionado contém datas bloqueadas
    const periodoCtrl = this.bookingForm.get('periodoReserva');
    if (periodoCtrl) {
      periodoCtrl.valueChanges.pipe(debounceTime(150)).subscribe(() => {
        const errors = periodoCtrl.errors;
        if (errors?.['dataBloqueada']) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Período indisponível',
            detail: 'O período selecionado contém datas já reservadas.',
            life: 3500
          });
        }
      });
    }
  }

  // Carregar imagens dos chalés do painel administrativo
  private carregarImagensChales(): void {
    this.conteudoService.conteudo$.subscribe({
      next: (conteudo) => {
        this.chaletImages = conteudo.chaletImages || [];
        this.chaletImagesLoading = false;
      },
      error: (error) => {
        // Usar imagens padrão em caso de erro
        this.chaletImages = this.conteudoService.getChaletImages();
        this.chaletImagesLoading = false;
      }
    });
  }

  // Carregar datas bloqueadas (reservas confirmadas)
  private carregarDatasBloqueadas(): void {
    this.isLoadingDatasBloqueadas = true;
    
    // Limpar array antes de carregar
    this.datasBloqueadas = [];

    this.bookingService.getReservasConfirmadas().subscribe({
      next: (reservas: any[]) => {
        // Processar reservas sem logar dados sensíveis
        
        reservas.forEach(reserva => {
          const dataInicio = new Date(reserva.dataInicio);
          const dataFim = new Date(reserva.dataFim);
          
          // Adicionar todas as datas do período da reserva
          const dataAtual = new Date(dataInicio);
          dataAtual.setHours(0, 0, 0, 0); // Normalizar para meia-noite
          
          while (dataAtual <= dataFim) {
            const dataNormalizada = new Date(dataAtual);
            dataNormalizada.setHours(0, 0, 0, 0);
            this.datasBloqueadas.push(dataNormalizada);
            dataAtual.setDate(dataAtual.getDate() + 1);
          }
        });
        
        // Além das reservas confirmadas, também bloquear visualmente os
        // dias que o admin bloqueou manualmente (painel Disponibilidade de
        // Datas) — sem isso o cliente só descobria que a data estava
        // bloqueada ao tentar finalizar a reserva.
        this.disponibilidadeService.getBloqueiosPublico().subscribe({
          next: (bloqueios) => {
            bloqueios.forEach(bloqueio => {
              // O backend guarda a data como meia-noite UTC. Usar
              // setHours(0,0,0,0) no fuso local (ex: Brasília, UTC-3)
              // "voltava" um dia — construir a partir dos componentes UTC
              // garante que o dia bloqueado bate com o que o admin marcou.
              const dataUtc = new Date(bloqueio.data);
              const dataLocal = new Date(
                dataUtc.getUTCFullYear(),
                dataUtc.getUTCMonth(),
                dataUtc.getUTCDate(),
              );
              this.datasBloqueadas.push(dataLocal);
            });
            this.isLoadingDatasBloqueadas = false;
            this.aplicarEstilosReservasConfirmadas();
          },
          error: () => {
            // Se isso falhar, ainda temos as datas de reservas confirmadas
            this.isLoadingDatasBloqueadas = false;
            this.aplicarEstilosReservasConfirmadas();
          }
        });
      },
      error: (error) => {
        // Erro ao carregar datas bloqueadas - não logar detalhes
        this.isLoadingDatasBloqueadas = false;
        // Continuar sem bloquear datas em caso de erro
      }
    });
  }

  // Atualizar data mínima baseada na configuração de dias de antecedência
  private atualizarDataMinima(): void {
    const hoje = new Date();
    const dataMinima = new Date(hoje);
    dataMinima.setDate(hoje.getDate() + this.diasAntecedenciaMinima);
    this.minDate = dataMinima;
  }

  // Carregar configurações de preços
  private carregarConfiguracoes(): void {
    this.configuracaoService.getConfiguracoes().subscribe({
      next: (config: Configuracao) => {
        this.configuracao = config;
        this.faixasPreco = config.precoDiaria || [];
        this.precoChale = config.precoChale || 150;
        this.precoBatismo = config.precoBatismo || 300;
        this.quantidadeMaximaChales = config.quantidadeMaximaChales || 4;
        this.diasAntecedenciaMinima = config.diasAntecedenciaMinima || 2;
        this.qtdMaxPessoas = config.qtdMaxPessoas || 200;
        
        // 🔍 DEBUG: Log das configurações carregadas
        // Configurações carregadas com sucesso
        
        // Atualizar validadores do formulário com os novos valores
        this.atualizarValidadoresFormulario();
        
        // Atualizar descrições dos tipos de reserva
        this.atualizarDescricoesTiposReserva();
        
        // Atualizar data mínima baseada na configuração
        this.atualizarDataMinima();
        
        // Recalcular valores com os novos preços
        this.calcularValor();
      },
      error: (error) => {
        // Usar valores padrão em caso de erro
        this.faixasPreco = [
          { maxPessoas: 30, valor: 1000 },
          { maxPessoas: 60, valor: 1500 },
          { maxPessoas: 100, valor: 2000 },
          { maxPessoas: 200, valor: 2500 }
        ];
        this.precoChale = 150;
        this.precoBatismo = 300;
      }
    });
  }

  // Método para expandir imagem
  expandirImagem(): void {
    this.imagemExpandidaVisible = true;
  }

  // Método para mostrar informações sobre itens necessários
  mostrarInfoItensNecessarios(): void {
    const quantidadeChales = this.bookingForm.get('quantidadeChales')?.value || 0;
    if (quantidadeChales > 0) {
      this.infoItensVisible = true;
    }
  }

  // Método para mostrar tabela de preços
  mostrarTabelaPrecos(): void {
    this.tabelaPrecosVisible = true;
  }

  // Preencher dados do usuário logado
  private preencherDadosUsuario(): void {
    const usuario = this.getUsuarioLogado();
    if (usuario) {
      this.bookingForm.patchValue({
        usuarioNome: usuario.nome,
        usuarioEmail: usuario.email
      });
    }
  }

  // Scroll para o topo da página
  private scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Função para desabilitar datas passadas e datas com reservas confirmadas (mantido para compatibilidade)
  disabledDate = (current: Date): boolean => {
    if (!current) return false;
    
    // Desabilitar datas passadas
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (current < hoje) {
      return true;
    }
    
    // Desabilitar datas com reservas confirmadas
    if (this.datasBloqueadas.length > 0) {
      const dataString = current.toDateString();
      const isBlocked = this.datasBloqueadas.some(dataBloqueada => 
        dataBloqueada.toDateString() === dataString
      );
      
      if (isBlocked) {
        // Data bloqueada encontrada
      }
      
      return isBlocked;
    }
    
    return false;
  };

  // Método para aplicar estilos específicos às datas de reservas confirmadas
  private aplicarEstilosReservasConfirmadas(): void {
    // Verificar se estamos no browser (não no server-side rendering)
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    setTimeout(() => {
      this.datasBloqueadas.forEach(dataReserva => {
        // Converter a data para o formato usado pelo PrimeNG (YYYY-M-D)
        const ano = dataReserva.getFullYear();
        const mes = dataReserva.getMonth(); // JavaScript usa 0-11 para meses
        const dia = dataReserva.getDate();
        const dataFormatada = `${ano}-${mes}-${dia}`;
        
        // Encontrar elementos com essa data específica
        const elementos = document.querySelectorAll(`[data-date="${dataFormatada}"]`);
        elementos.forEach(el => {
          if (el.classList.contains('p-disabled')) {
            el.classList.add('reserva-confirmada');
          }
        });
      });
    }, 200); // Aguardar o calendário ser renderizado
  }

  private initForm(): void {
    this.bookingForm = this.fb.group({
      // Passo 1: Informações básicas
      tipo: ['', [Validators.required]],
      periodoReserva: ['', [Validators.required, this.dataBloqueadaValidator.bind(this), this.periodoValidoValidator.bind(this)]],
      quantidadePessoas: [1, [Validators.required, Validators.min(1), Validators.max(this.qtdMaxPessoas)]],
      quantidadeChales: [0, [Validators.min(0), Validators.max(4)]],
      observacoes: [''],
      
      // Passo 2: Informações do hóspede
      nomeHospede: ['', [Validators.required, Validators.minLength(2)]],
      sobrenomeHospede: ['', [Validators.required, Validators.minLength(2)]],
      emailHospede: ['', [Validators.required, Validators.email]],
      cpfHospede: ['', [Validators.required, this.cpfValidator]],
      telefoneHospede: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/)]],
      observacoesHospede: [''],
      
      // Campos de endereço — obrigatórios porque o Asaas exige endereço
      // completo no cadastro do cliente pra gerar qualquer cobrança
      // (PIX ou cartão). Sem isso aqui, o erro só aparecia depois, na
      // hora de gerar a cobrança, como um 500 confuso.
      enderecoHospede: ['', [Validators.required]],
      numeroHospede: ['', [Validators.required]],
      cepHospede: ['', [Validators.required]],
      bairroHospede: ['', [Validators.required]],
      cidadeHospede: ['', [Validators.required]],
      ufHospede: ['', [Validators.required]],
      
      // Passo 3: Pagamento
      modoPagamento: ['', [Validators.required]],
      parcelas: [1, [Validators.min(1), Validators.max(12)]],
      
      // Dados do usuário (preenchidos automaticamente)
      usuarioNome: [''],
      usuarioEmail: ['']
    });
    
    // Marcar formulário como inicializado
    this.formInitialized = true;
    
    // Observar mudanças no formulário para atualizar pricing
    this.bookingForm.valueChanges.subscribe(() => {
      this.updatePricingData();
      this.checkFormProgress();
    });

    // Observar mudanças no tipo para limpar período ao mudar para batismo
    this.bookingForm.get('tipo')?.valueChanges.subscribe(tipo => {
      if (tipo === 'batismo') {
        // Limpar seleção de período ao mudar para batismo
        this.bookingForm.get('periodoReserva')?.setValue(null);
        // Resetar quantidade de chalés para batismo
        this.bookingForm.get('quantidadeChales')?.setValue(0);
      }
      // Revalidar período quando o tipo muda
      this.bookingForm.get('periodoReserva')?.updateValueAndValidity();
    });
  }

  // Atualizar dados de pricing
  private updatePricingData(): void {
    if (!this.formInitialized) return;
    
    const formValue = this.bookingForm.value;
    const tipo = formValue.tipo;
    const periodoReserva = formValue.periodoReserva;
    
    let quantidadeDias = 0;
    
    if (tipo === 'batismo') {
      // Para batismo, sempre é 1 dia
      if (periodoReserva) {
        quantidadeDias = 1;
      }
    } else if (periodoReserva && periodoReserva.length === 2) {
      // Para outros tipos, calcular diferença de dias
      const dataInicio = new Date(periodoReserva[0]);
      const dataFim = new Date(periodoReserva[1]);
      
      // Validar se as datas são válidas
      if (!isNaN(dataInicio.getTime()) && !isNaN(dataFim.getTime())) {
        const diffTime = Math.abs(dataFim.getTime() - dataInicio.getTime());
        quantidadeDias = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        
        // Limitar a quantidade de dias para evitar valores absurdos
        if (quantidadeDias > 365) {
          quantidadeDias = 0; // Resetar se for um valor inválido
        }
      }
    }
    
    const valorChales = (formValue.quantidadeChales || 0) * this.precoChale * quantidadeDias;
    
    // 🔍 DEBUG: Log do cálculo dos chalés
    // Cálculo dos chalés realizado
    
    const valorTotalCalculado = this.calculateTotalValue(formValue.tipo, formValue.quantidadePessoas, formValue.quantidadeChales, quantidadeDias);
    
    this.pricingData = {
      tipoReserva: formValue.tipo || '',
      quantidadePessoas: formValue.quantidadePessoas || 0,
      quantidadeChales: formValue.quantidadeChales || 0,
      quantidadeDias: quantidadeDias,
      valorDiaria: this.calculateDiariaValue(formValue.tipo, formValue.quantidadePessoas),
      valorChales: valorChales,
      valorBatismo: formValue.tipo === 'batismo' ? this.precoBatismo : 0,
      valorTotal: valorTotalCalculado,
      isLoading: false
    };
    
    this.valorCalculado = this.pricingData.valorTotal;
    // Qualquer mudança no formulário invalida a última cotação confirmada
    // pelo backend — calcularValor() precisa rodar de novo para recuperá-la.
    this.precoConfirmadoPeloBackend = false;
  }

  // Calcular valor da diária baseado na faixa de pessoas
  private calculateDiariaValue(tipo: string, pessoas: number): number {
    if (tipo !== 'diaria') return 0;
    
    // Encontrar a faixa de preço baseada na quantidade de pessoas
    const faixaEncontrada = this.faixasPreco.find(faixa => pessoas <= faixa.maxPessoas);
    return faixaEncontrada ? faixaEncontrada.valor : this.faixasPreco[this.faixasPreco.length - 1]?.valor || 2500;
  }

  // Calcular valor total
  private calculateTotalValue(tipo: string, pessoas: number, chales: number, dias: number): number {
    // Se não há dias selecionados, retornar 0
    if (dias === 0) {
      return 0;
    }
    
    let valorTotal = 0;
    
    switch (tipo) {
      case 'diaria':
        const valorDiaria = this.calculateDiariaValue(tipo, pessoas);
        const valorChales = chales * this.precoChale * dias;
        valorTotal = (valorDiaria * dias) + valorChales;
        
        // 🔍 DEBUG: Log do cálculo total para diária
        // Cálculo total para diária realizado
        break;
        
      case 'batismo':
        const valorBatismo = this.precoBatismo;
        const valorChalesBatismo = chales * this.precoChale * dias;
        valorTotal = valorBatismo + valorChalesBatismo;
        
        // 🔍 DEBUG: Log do cálculo total para batismo
        // Cálculo total para batismo realizado
        break;
        
      default:
        valorTotal = 0;
    }
    
    return valorTotal;
  }

  // Verificar disponibilidade
  // Extrai dataInicio/dataFim do valor atual de periodoReserva, tratando o
  // caso de batismo (data única) e hospedagem (range). Retorna null e já
  // mostra o toast de erro quando o formato selecionado não é válido.
  private extrairPeriodoSelecionado(): { dataInicio: Date; dataFim: Date } | null {
    const periodoReserva = this.bookingForm.get('periodoReserva')?.value;
    const tipo = this.bookingForm.get('tipo')?.value;

    if (tipo === 'batismo') {
      if (periodoReserva instanceof Date) {
        return { dataInicio: new Date(periodoReserva), dataFim: new Date(periodoReserva) };
      }
      if (Array.isArray(periodoReserva) && periodoReserva.length === 1) {
        return { dataInicio: new Date(periodoReserva[0]), dataFim: new Date(periodoReserva[0]) };
      }
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Selecione uma data válida para o batismo' });
      return null;
    }

    if (!periodoReserva || !Array.isArray(periodoReserva) || periodoReserva.length !== 2) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Selecione um período válido' });
      return null;
    }

    return { dataInicio: new Date(periodoReserva[0]), dataFim: new Date(periodoReserva[1]) };
  }

  // Verificação de disponibilidade logo ao sair do step de datas (step 0)
  // — antes disso, o cliente só descobria que o período estava indisponível
  // depois de preencher todos os dados pessoais no step de hóspede.
  verificarDisponibilidadeInicial(): void {
    this.bookingForm.get('tipo')?.markAsTouched();
    this.bookingForm.get('periodoReserva')?.markAsTouched();

    if (!this.bookingForm.get('tipo')?.valid || !this.bookingForm.get('periodoReserva')?.valid) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Selecione o tipo de reserva e o período antes de continuar.' });
      return;
    }

    const periodo = this.extrairPeriodoSelecionado();
    if (!periodo) return;

    const tipo = this.bookingForm.get('tipo')?.value;
    const quantidadeChales = this.bookingForm.get('quantidadeChales')?.value || 0;

    this.isLoading = true;
    this.bookingService.verificarDisponibilidade({
      dataInicio: periodo.dataInicio.toISOString(),
      dataFim: periodo.dataFim.toISOString(),
      tipo: this.mapTipoToBackend(tipo),
      quantidadeChales: quantidadeChales
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.disponivel) {
          this.nextStep();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Período indisponível', detail: 'Essas datas não estão disponíveis. Tente outro período.', life: 5000 });
        }
      },
      error: () => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível verificar a disponibilidade. Tente novamente em instantes.',
          life: 5000
        });
      }
    });
  }

  verificarDisponibilidade(): void {
    this.markFormGroupTouched();

    if (this.bookingForm.get('tipo')?.valid &&
        this.bookingForm.get('periodoReserva')?.valid &&
        this.bookingForm.get('nomeHospede')?.valid &&
        this.bookingForm.get('sobrenomeHospede')?.valid &&
        this.bookingForm.get('emailHospede')?.valid &&
        this.bookingForm.get('cpfHospede')?.valid &&
        this.bookingForm.get('telefoneHospede')?.valid &&
        this.bookingForm.get('cepHospede')?.valid &&
        this.bookingForm.get('enderecoHospede')?.valid &&
        this.bookingForm.get('numeroHospede')?.valid &&
        this.bookingForm.get('bairroHospede')?.valid &&
        this.bookingForm.get('cidadeHospede')?.valid &&
        this.bookingForm.get('ufHospede')?.valid) {

      this.isLoading = true;

      const periodo = this.extrairPeriodoSelecionado();
      if (!periodo) {
        this.isLoading = false;
        return;
      }
      const { dataInicio, dataFim } = periodo;
      const tipo = this.bookingForm.get('tipo')?.value;
      const quantidadeChales = this.bookingForm.get('quantidadeChales')?.value || 0;

      this.bookingService.verificarDisponibilidade({
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim.toISOString(),
        tipo: this.mapTipoToBackend(tipo),
        quantidadeChales: quantidadeChales
      }).subscribe({
        next: (response) => {
          this.disponibilidadeResultado = {
            disponivel: response.disponivel,
            mensagem: response.disponivel ? 'Período disponível!' : 'Período indisponível'
          };
          this.disponibilidadeVerificada = true;

          if (response.disponivel) {
            this.calcularValor();
            this.nextStep();
          } else {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Período indisponível. Tente outras datas.' });
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.disponibilidadeResultado = null;
          this.disponibilidadeVerificada = false;

          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível verificar a disponibilidade. Tente novamente em instantes.',
            life: 5000
          });
          this.isLoading = false;
        }
      });
    } else {
      const camposInvalidos = this.getInvalidFieldsForAvailability();
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: `Preencha os campos obrigatórios: ${camposInvalidos.join(', ')}` });
    }
  }

  // Calcular valor da reserva baseado nos preços reais do backend
  private calcularValor(): void {
    const tipo = this.bookingForm.get('tipo')?.value;
    const periodoReserva = this.bookingForm.get('periodoReserva')?.value;
    const quantidadePessoas = this.bookingForm.get('quantidadePessoas')?.value || 1;
    const quantidadeChales = this.bookingForm.get('quantidadeChales')?.value || 0;
    
    if (!periodoReserva || periodoReserva.length !== 2) {
      this.valorCalculado = 0;
      return;
    }
    
    const dataInicio = new Date(periodoReserva[0]);
    const dataFim = new Date(periodoReserva[1]);
    
    this.bookingService.cotarReserva({
      tipo: this.mapTipoToBackend(tipo),
      dataInicio: dataInicio.toISOString(),
      dataFim: dataFim.toISOString(),
      quantidadePessoas: quantidadePessoas,
      quantidadeChales: quantidadeChales,
      observacoes: this.bookingForm.get('observacoes')?.value || ''
    }).subscribe({
      next: (response) => {
        if (response && response.valorTotal) {
          this.valorCalculado = response.valorTotal;
          this.precoConfirmadoPeloBackend = true;
        } else {
          this.precoConfirmadoPeloBackend = false;
          this.calcularValorLocal();
        }
      },
      error: (error) => {
        this.precoConfirmadoPeloBackend = false;
        this.calcularValorLocal();
        this.messageService.add({ severity: 'warn', summary: 'Valor estimado', detail: 'Não foi possível confirmar o valor exato com o servidor agora. O valor mostrado é uma estimativa e será conferido antes do pagamento.' });
      }
    });
  }

  // Cálculo local como fallback — apenas para exibição enquanto a cotação
  // oficial não responde. Nunca é o valor usado para cobrar: finalizarReserva()
  // exige uma cotação confirmada pelo backend antes de prosseguir.
  private calcularValorLocal(): void {
    const tipo = this.bookingForm.get('tipo')?.value;
    const periodoReserva = this.bookingForm.get('periodoReserva')?.value;
    const quantidadePessoas = this.bookingForm.get('quantidadePessoas')?.value || 1;
    const quantidadeChales = this.bookingForm.get('quantidadeChales')?.value || 0;
    
    let valorBase = 0;
    let multiplicadorDias = 0; // Mudado de 1 para 0
    
    if (periodoReserva && periodoReserva.length === 2) {
      const dataInicio = new Date(periodoReserva[0]);
      const dataFim = new Date(periodoReserva[1]);
      
      // Validar se as datas são válidas
      if (!isNaN(dataInicio.getTime()) && !isNaN(dataFim.getTime())) {
        const diffTime = Math.abs(dataFim.getTime() - dataInicio.getTime());
        multiplicadorDias = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        
        // Limitar a quantidade de dias para evitar valores absurdos
        if (multiplicadorDias > 365) {
          multiplicadorDias = 0; // Resetar se for um valor inválido
        }
      }
    }
    
    switch (tipo) {
      case 'diaria':
        // Encontrar a faixa de preço baseada na quantidade de pessoas
        const faixaEncontrada = this.faixasPreco.find(faixa => quantidadePessoas <= faixa.maxPessoas);
        valorBase = faixaEncontrada ? faixaEncontrada.valor : this.faixasPreco[this.faixasPreco.length - 1]?.valor || 2500;
        break;
        
      case 'batismo':
        valorBase = this.precoBatismo;
        multiplicadorDias = 1;
        break;
    }
    
    // Adicionar valor dos chalés para qualquer tipo de reserva
    const valorChales = quantidadeChales * this.precoChale * multiplicadorDias;
    
    // 🔍 DEBUG: Log do cálculo local dos chalés
    // Cálculo local dos chalés realizado
    
    this.valorCalculado = valorBase * multiplicadorDias + valorChales;
  }

  // Navegação entre passos
  nextStep(): void {
    if (this.currentStep < 3) {
      const tipo = this.bookingForm.get('tipo')?.value;
      
      // Se está saindo do step de tipo (step 0) e o tipo é batismo, pular o step de chalés
      if (this.currentStep === 0 && tipo === 'batismo') {
        this.currentStep = 2; // Pular direto para o step de hóspede
      } else {
        // Se está saindo do step de chalés (step 1) para hóspede (step 2), mostrar informações
        if (this.currentStep === 1) {
          this.infoItensVisible = true;
        }
        
        this.currentStep++;
      }
      
      this.scrollToTop();
    }
  }

  // Método para validar e avançar (com verificação automática de disponibilidade)
  nextStepWithValidation(): void {
    if (this.currentStep === 2) {
      // Step de hóspede - verificar disponibilidade automaticamente
      this.verificarDisponibilidade();
    } else {
      this.nextStep();
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      const tipo = this.bookingForm.get('tipo')?.value;
      
      // Se está no step de hóspede (step 2) e o tipo é batismo, voltar direto para o step de tipo
      if (this.currentStep === 2 && tipo === 'batismo') {
        this.currentStep = 0; // Voltar direto para o step de tipo
      } else {
        this.currentStep--;
      }
      
      this.scrollToTop();
    }
  }

  // Método para abrir seletor de data (placeholder)
  openDatePicker(): void {
    // Por enquanto, apenas mostra uma mensagem
    // Em uma implementação real, você abriria um modal ou date picker customizado
    // Abrir seletor de data
  }
  
  // Validar campos do step atual
  private validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 0: // Step 1: Informações básicas
        const camposStep1 = ['tipo', 'periodoReserva', 'quantidadePessoas'];
        const camposInvalidosStep1 = camposStep1.filter(campo => 
          !this.bookingForm.get(campo)?.valid
        );
        
        if (camposInvalidosStep1.length > 0) {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Preencha todos os campos obrigatórios antes de continuar' });
          this.markFormGroupTouched();
          return false;
        }
        return true;
        
      case 1: // Step 2: Informações do hóspede
        const camposStep2 = ['nomeHospede', 'sobrenomeHospede', 'emailHospede', 'cpfHospede', 'telefoneHospede'];
        const camposInvalidosStep2 = camposStep2.filter(campo => 
          !this.bookingForm.get(campo)?.valid
        );
        
        if (camposInvalidosStep2.length > 0) {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Preencha todos os campos obrigatórios antes de continuar' });
          this.markFormGroupTouched();
          return false;
        }
        return true;
        
      case 2: // Step 3: Pagamento
        const camposStep3 = ['modoPagamento'];
        const camposInvalidosStep3 = camposStep3.filter(campo => 
          !this.bookingForm.get(campo)?.valid
        );
        
        if (camposInvalidosStep3.length > 0) {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Selecione a forma de pagamento antes de continuar' });
          this.markFormGroupTouched();
          return false;
        }
        return true;
        
      default:
        return true;
    }
  }

  // Finalizar reserva via backend
  finalizarReserva(): void {
    // Proteção contra cliques duplos
    if (this.isProcessingPayment) {
      // Processamento já em andamento, ignorando clique duplo
      return;
    }
    
    this.markFormGroupTouched();

    if (this.bookingForm.valid) {
      this.isProcessingPayment = true;

      const customerData = this.getCustomerData();

      // Reconferir disponibilidade imediatamente antes de enviar, para reduzir a
      // janela de corrida com outra pessoa reservando as mesmas datas.
      this.bookingService.verificarDisponibilidade({
        dataInicio: customerData.dataInicio,
        dataFim: customerData.dataFim,
        tipo: customerData.tipo,
        quantidadeChales: customerData.quantidadeChales
      }).subscribe({
        next: (dispResponse) => {
          if (!dispResponse.disponivel) {
            this.isProcessingPayment = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Datas indisponíveis',
              detail: 'Essas datas foram reservadas por outra pessoa enquanto você preenchia o formulário. Escolha outro período.',
              life: 6000
            });
            this.disponibilidadeVerificada = false;
            this.currentStep = 0;
            this.carregarDatasBloqueadas();
            return;
          }

          this.confirmarPrecoAntesDeEnviar(customerData);
        },
        error: () => {
          this.isProcessingPayment = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível confirmar a disponibilidade das datas. Tente novamente.',
            life: 5000
          });
        }
      });
    } else {
      const camposInvalidos = this.getInvalidFields();
      
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: `Preencha os campos obrigatórios: ${camposInvalidos.join(', ')}` });
    }
  }

  // Garante que valorCalculado (e o que vai em dadosPagamento.valorTotal)
  // veio da cotação oficial do backend antes de seguir para o pagamento.
  // Se a última cotação foi só o cálculo local de fallback, refaz a chamada
  // ao backend agora; se ainda assim falhar, bloqueia o envio em vez de
  // deixar o usuário seguir com um valor que pode não bater com o cobrado.
  private confirmarPrecoAntesDeEnviar(customerData: any): void {
    if (this.precoConfirmadoPeloBackend) {
      this.enviarReserva({ ...customerData, dadosPagamento: { ...customerData.dadosPagamento, valorTotal: this.valorCalculado } });
      return;
    }

    this.bookingService.cotarReserva({
      tipo: customerData.tipo,
      dataInicio: customerData.dataInicio,
      dataFim: customerData.dataFim,
      quantidadePessoas: customerData.quantidadePessoas,
      quantidadeChales: customerData.quantidadeChales,
      observacoes: customerData.observacoes
    }).subscribe({
      next: (response) => {
        if (response && response.valorTotal) {
          this.valorCalculado = response.valorTotal;
          this.precoConfirmadoPeloBackend = true;
          this.enviarReserva({ ...customerData, dadosPagamento: { ...customerData.dadosPagamento, valorTotal: this.valorCalculado } });
        } else {
          this.isProcessingPayment = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Não foi possível confirmar o valor',
            detail: 'Não conseguimos confirmar o valor exato da reserva com o servidor. Tente novamente em instantes.',
            life: 6000
          });
        }
      },
      error: () => {
        this.isProcessingPayment = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Não foi possível confirmar o valor',
          detail: 'Não conseguimos confirmar o valor exato da reserva com o servidor. Tente novamente em instantes.',
          life: 6000
        });
      }
    });
  }

  // Envia a reserva já confirmada como disponível para o backend
  private enviarReserva(customerData: any): void {
    const reservaData = {
      tipo: customerData.tipo,
      dataInicio: customerData.dataInicio,
      dataFim: customerData.dataFim,
      quantidadePessoas: customerData.quantidadePessoas,
      quantidadeChales: customerData.quantidadeChales,
      observacoes: customerData.observacoes,
      dadosPagamento: customerData.dadosPagamento,
      dadosHospede: customerData.dadosHospede
    };

    this.bookingService.createBooking(reservaData).subscribe({
      next: (response) => {
        const hasReserva = response.reserva;
        const hasLinkPagamento = response.pagamento?.linkPagamento;

        if (hasReserva && hasLinkPagamento) {
          this.paymentData = response;
          this.paymentLink = response.pagamento.linkPagamento;

          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Reserva criada com sucesso! Redirecionando para o pagamento...' });
          this.isProcessingPayment = false;

          this.redirectToCheckout(response);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao processar pagamento - dados incompletos' });
          this.isProcessingPayment = false;
        }
      },
      error: (error) => {
        this.isProcessingPayment = false;

        // Conflito de datas: outra pessoa reservou o mesmo período entre a
        // reconferência e o envio final.
        if (error.status === 409) {
          this.messageService.add({
            severity: 'error',
            summary: 'Datas indisponíveis',
            detail: 'Essas datas foram reservadas por outra pessoa. Escolha outro período.',
            life: 6000
          });
          this.disponibilidadeVerificada = false;
          this.currentStep = 0;
          this.carregarDatasBloqueadas();
          return;
        }

        let errorMessage = 'Erro ao processar reserva. Tente novamente.';

        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.status === 500) {
          errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.';
        } else if (error.status === 0) {
          errorMessage = 'Erro de conexão. Verifique se o backend está rodando.';
        }

        // Mensagens de conflito de data podem vir com outro status (400) e
        // texto específico do backend — cobrir esse caso também.
        if (/reservad|indispon|conflito|ocupad/i.test(errorMessage)) {
          this.disponibilidadeVerificada = false;
          this.currentStep = 0;
          this.carregarDatasBloqueadas();
        }

        this.messageService.add({ severity: 'error', summary: 'Erro', detail: errorMessage });
      }
    });
  }

  // Redirecionar para o checkout do ASAAS
  private redirectToCheckout(response: any): void {
    // Redirecionando para checkout
    
    const checkoutUrl = response.pagamento?.linkPagamento;
    
    if (checkoutUrl) {
      // Abrindo URL do checkout
      window.location.href = checkoutUrl;
    } else {
      // URL de checkout não encontrada na resposta
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Link de pagamento não disponível' });
    }
  }

  // Configurar busca automática de CEP
  private configurarBuscaAutomaticaCep(): void {
    this.cepSubject.pipe(
      debounceTime(500), // Aguardar 500ms após parar de digitar
      distinctUntilChanged(), // Só buscar se o CEP mudou
      switchMap(cep => {
        if (!cep || !this.cepService.validarCep(cep)) {
          this.buscandoCep = false;
          this.cepEncontrado = false;
          return of(null);
        }

        this.buscandoCep = true;
        this.cepEncontrado = false;

        // Precisa tratar o erro AQUI, dentro do switchMap — um erro que
        // escape até o subscribe() de fora mata a inscrição inteira (é
        // assim que Observable funciona: erro = fim da assinatura), e
        // digitar um CEP certo depois de um errado nunca mais dispara
        // busca nenhuma, porque ninguém está mais ouvindo o Subject.
        return this.cepService.buscarCep(cep).pipe(
          catchError((error) => {
            this.buscandoCep = false;
            this.cepEncontrado = false;
            this.messageService.add({
              severity: 'warn',
              summary: 'CEP não encontrado',
              detail: 'Não conseguimos encontrar esse CEP. Confira o número ou preencha o endereço manualmente.',
              life: 5000
            });
            return of(null);
          })
        );
      }),
      filter((endereco): endereco is EnderecoCompleto => endereco !== null)
    ).subscribe((endereco: EnderecoCompleto) => {
      this.buscandoCep = false;
      this.cepEncontrado = true;

      // Preencher automaticamente os campos do endereço
      this.bookingForm.patchValue({
        enderecoHospede: endereco.endereco,
        bairroHospede: endereco.bairro,
        cidadeHospede: endereco.cidade,
        ufHospede: endereco.uf
      });

      // Formatar CEP
      const cepFormatado = this.cepService.formatarCep(endereco.cep);
      this.bookingForm.patchValue({
        cepHospede: cepFormatado
      });

      // Campos readonly são automaticamente definidos pelo template
      // Não é necessário chamar disable() pois readonly não desabilita o campo
    });
  }

  // Buscar endereço por CEP (método público para uso manual se necessário)
  buscarEnderecoPorCep(): void {
    const cep = this.bookingForm.get('cepHospede')?.value;
    this.cepSubject.next(cep);
  }

  // Limpar campos de endereço e permitir edição manual
  limparEndereco(): void {
    this.bookingForm.patchValue({
      enderecoHospede: '',
      numeroHospede: '',
      bairroHospede: '',
      cidadeHospede: '',
      ufHospede: '',
      cepHospede: ''
    });
    this.cepEncontrado = false;
    
    // Campos readonly são automaticamente editáveis quando cepEncontrado = false
    // Não é necessário chamar enable() pois readonly não desabilita o campo
  }

  // Obter dados do cliente para o backend
  private getCustomerData(): any {
    const formValue = this.bookingForm.value;
    
    // ✅ Validar campos obrigatórios antes de enviar
    if (!formValue.emailHospede || !formValue.cpfHospede) {
      throw new Error('Email e CPF são obrigatórios para criar uma reserva');
    }
    
    const periodoReserva = formValue.periodoReserva;
    const tipoReserva = formValue.tipo;
    
    let dataInicio: Date;
    let dataFim: Date;
    let quantidadeDiarias: number;
    
    if (tipoReserva === 'batismo') {
      // Para batismo: data única
      
      if (periodoReserva instanceof Date) {
        dataInicio = new Date(periodoReserva);
        dataFim = new Date(periodoReserva); // Mesma data para início e fim
        quantidadeDiarias = 1; // Batismo sempre é 1 diária
      } else if (Array.isArray(periodoReserva) && periodoReserva.length === 1) {
        dataInicio = new Date(periodoReserva[0]);
        dataFim = new Date(periodoReserva[0]);
        quantidadeDiarias = 1;
      } else {
        throw new Error('Data de batismo inválida');
      }
    } else {
      // Para hospedagem: período (range)
      if (periodoReserva && Array.isArray(periodoReserva) && periodoReserva.length === 2) {
        dataInicio = new Date(periodoReserva[0]);
        dataFim = new Date(periodoReserva[1]);
        
        // Calcular quantidade de diárias
        const diferencaMS = dataFim.getTime() - dataInicio.getTime();
        quantidadeDiarias = Math.max(1, Math.ceil(diferencaMS / (1000 * 60 * 60 * 24)));
      } else {
        throw new Error('Período de reserva inválido');
      }
    }
    
    return {
      tipo: this.mapTipoToBackend(formValue.tipo),
      dataInicio: dataInicio.toISOString(),
      dataFim: dataFim.toISOString(),
      quantidadePessoas: formValue.quantidadePessoas || 1,
      quantidadeChales: formValue.quantidadeChales || 0,
      quantidadeDiarias: quantidadeDiarias, // Adicionar quantidade de diárias calculada
      observacoes: formValue.observacoes || '',
      dadosPagamento: {
        modoPagamento: formValue.modoPagamento,
        tipoPagamento: (formValue.parcelas && formValue.parcelas > 1) ? 'PARCELADO' : 'AVISTA',
        parcelas: formValue.parcelas || 1,
        valorTotal: this.valorCalculado
      },
      dadosHospede: {
        nome: formValue.nomeHospede || '',
        sobrenome: formValue.sobrenomeHospede || '',
        email: formValue.emailHospede || '',
        cpf: formValue.cpfHospede || '',
        telefone: formValue.telefoneHospede || '',
        observacoes: formValue.observacoesHospede || '',
        endereco: formValue.enderecoHospede || '',
        numero: formValue.numeroHospede || '',
        cep: formValue.cepHospede || '',
        bairro: formValue.bairroHospede || '',
        cidade: formValue.cidadeHospede || '',
        uf: formValue.ufHospede || ''
      },
      valorCalculado: this.valorCalculado,
      usuarioNome: formValue.usuarioNome,
      usuarioEmail: formValue.usuarioEmail
    };
  }

  // Obter dados do usuário logado
  private getUsuarioLogado(): any {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return null;
    }
    return {
      nome: user.nome,
      email: user.email,
      telefone: ''
    };
  }

  // Formatar telefone com máscara
  formatPhone(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 2) {
      value = value;
    } else if (value.length <= 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length <= 10) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
    } else {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
    }
    
    event.target.value = value;
    this.bookingForm.get('telefoneHospede')?.setValue(value);
  }

  // Formatar CPF com máscara
  formatCPF(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    event.target.value = value;
    this.bookingForm.get('cpfHospede')?.setValue(value);
  }

  // Formatar CEP com máscara e buscar automaticamente
  formatCEP(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 8) {
      value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    
    event.target.value = value;
    this.bookingForm.get('cepHospede')?.setValue(value);
    
    // Disparar busca automática se CEP tiver 8 dígitos
    const cepLimpo = value.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      this.cepSubject.next(cepLimpo);
    } else {
      // Limpar indicadores e permitir edição se CEP não estiver completo
      this.buscandoCep = false;
      this.cepEncontrado = false;
      
      // Campos readonly são automaticamente editáveis quando cepEncontrado = false
      // Não é necessário chamar enable() pois readonly não desabilita o campo
    }
  }

  // Validador para formato de período válido
  periodoValidoValidator(control: any) {
    if (!control.value) return null;
    
    const periodo = control.value;
    const tipoReserva = this.bookingForm.get('tipo')?.value;
    
    if (tipoReserva === 'batismo') {
      // Para batismo: deve ser uma data única
      if (periodo instanceof Date) {
        return null; // Válido
      } else if (Array.isArray(periodo) && periodo.length === 1) {
        return null; // Válido
      } else {
        return { periodoInvalido: true };
      }
    } else {
      // Para hospedagem: deve ser um período (range)
      if (Array.isArray(periodo) && periodo.length === 2) {
        return null; // Válido
      } else {
        return { periodoInvalido: true };
      }
    }
  }

  // Validador para datas bloqueadas
  dataBloqueadaValidator(control: any) {
    if (!control.value) return null;
    
    const periodo = control.value;
    const tipoReserva = this.bookingForm.get('tipo')?.value;
    
    if (tipoReserva === 'batismo') {
      // Para batismo: verificar data única
      let dataParaVerificar: Date;
      
      if (periodo instanceof Date) {
        dataParaVerificar = periodo;
      } else if (Array.isArray(periodo) && periodo.length === 1) {
        dataParaVerificar = new Date(periodo[0]);
      } else {
        return null; // Formato inválido, deixar outros validadores tratarem
      }
      
      const dataString = dataParaVerificar.toDateString();
      if (this.datasBloqueadas.some(dataBloqueada => 
        dataBloqueada.toDateString() === dataString
      )) {
        return { dataBloqueada: true };
      }
    } else {
      // Para hospedagem: verificar período (range)
      if (Array.isArray(periodo) && periodo.length === 2) {
        const dataInicio = new Date(periodo[0]);
        const dataFim = new Date(periodo[1]);
        
        // Verificar se alguma data do período está bloqueada
        const dataAtual = new Date(dataInicio);
        while (dataAtual <= dataFim) {
          const dataString = dataAtual.toDateString();
          if (this.datasBloqueadas.some(dataBloqueada => 
            dataBloqueada.toDateString() === dataString
          )) {
            return { dataBloqueada: true };
          }
          dataAtual.setDate(dataAtual.getDate() + 1);
        }
      }
    }
    
    return null;
  }

  // Validador de CPF
  cpfValidator(control: any) {
    if (!control.value) return null;
    
    const cpf = control.value.replace(/\D/g, '');
    
    if (cpf.length !== 11) {
      return { invalidCpf: true };
    }
    
    if (/^(\d)\1{10}$/.test(cpf)) {
      return { invalidCpf: true };
    }
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) {
      return { invalidCpf: true };
    }
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) {
      return { invalidCpf: true };
    }
    
    return null;
  }
  
  // Mapear tipo do frontend para o backend
  private mapTipoToBackend(tipoFrontend: string): string {
    const mapping: { [key: string]: string } = {
      'diaria': 'diaria',
      'chale': 'chale', 
      'batismo': 'batismo'
    };
    return mapping[tipoFrontend] || 'diaria';
  }

  // Obter label do tipo de reserva
  getTipoLabel(tipo: string): string {
    const tipoObj = this.tiposReserva.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  }

  // Formatar período para exibição
  getPeriodoFormatado(): string {
    const periodo = this.bookingForm.get('periodoReserva')?.value;
    const tipoReserva = this.bookingForm.get('tipo')?.value;
    
    if (!periodo) {
      return 'Período não selecionado';
    }
    
    const formatoData = (data: Date) => {
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };
    
    if (tipoReserva === 'batismo') {
      // Para batismo: data única
      if (periodo instanceof Date) {
        return formatoData(periodo);
      } else if (Array.isArray(periodo) && periodo.length === 1) {
        return formatoData(new Date(periodo[0]));
      } else {
        return 'Data não selecionada';
      }
    } else {
      // Para hospedagem: período (range)
      if (Array.isArray(periodo) && periodo.length === 2) {
        const dataInicio = new Date(periodo[0]);
        const dataFim = new Date(periodo[1]);
        
        if (dataInicio.getTime() === dataFim.getTime()) {
          return formatoData(dataInicio);
        } else {
          return `${formatoData(dataInicio)} - ${formatoData(dataFim)}`;
        }
      } else {
        return 'Período não selecionado';
      }
    }
  }

  // Marcar todos os campos do formulário como tocados
  private markFormGroupTouched(): void {
    Object.keys(this.bookingForm.controls).forEach(key => {
      const control = this.bookingForm.get(key);
      control?.markAsTouched();
    });
  }

  // Obter lista de campos inválidos para disponibilidade
  private getInvalidFieldsForAvailability(): string[] {
    const camposInvalidos: string[] = [];
    
    if (!this.bookingForm.get('tipo')?.valid) {
      camposInvalidos.push('Tipo de Reserva');
    }
    
    if (!this.bookingForm.get('periodoReserva')?.valid) {
      camposInvalidos.push('Período da Reserva');
    }
    
    if (!this.bookingForm.get('quantidadePessoas')?.valid) {
      camposInvalidos.push('Quantidade de Pessoas');
    }
    
    if (!this.bookingForm.get('nomeHospede')?.valid) {
      camposInvalidos.push('Nome');
    }
    
    if (!this.bookingForm.get('sobrenomeHospede')?.valid) {
      camposInvalidos.push('Sobrenome');
    }
    
    if (!this.bookingForm.get('emailHospede')?.valid) {
      camposInvalidos.push('Email');
    }
    
    if (!this.bookingForm.get('cpfHospede')?.valid) {
      camposInvalidos.push('CPF');
    }
    
    if (!this.bookingForm.get('telefoneHospede')?.valid) {
      camposInvalidos.push('Telefone');
    }

    if (!this.bookingForm.get('cepHospede')?.valid) {
      camposInvalidos.push('CEP');
    }

    if (!this.bookingForm.get('enderecoHospede')?.valid) {
      camposInvalidos.push('Endereço');
    }

    if (!this.bookingForm.get('numeroHospede')?.valid) {
      camposInvalidos.push('Número');
    }

    if (!this.bookingForm.get('bairroHospede')?.valid) {
      camposInvalidos.push('Bairro');
    }

    if (!this.bookingForm.get('cidadeHospede')?.valid) {
      camposInvalidos.push('Cidade');
    }

    if (!this.bookingForm.get('ufHospede')?.valid) {
      camposInvalidos.push('UF');
    }

    return camposInvalidos;
  }

  // Obter lista de campos inválidos para finalização
  private getInvalidFields(): string[] {
    const camposInvalidos: string[] = [];
    
    if (!this.bookingForm.get('tipo')?.valid) {
      camposInvalidos.push('Tipo de Reserva');
    }
    
    if (!this.bookingForm.get('periodoReserva')?.valid) {
      camposInvalidos.push('Período da Reserva');
    }
    
    if (!this.bookingForm.get('quantidadePessoas')?.valid) {
      camposInvalidos.push('Quantidade de Pessoas');
    }
    
    if (!this.bookingForm.get('nomeHospede')?.valid) {
      camposInvalidos.push('Nome');
    }
    
    if (!this.bookingForm.get('sobrenomeHospede')?.valid) {
      camposInvalidos.push('Sobrenome');
    }
    
    if (!this.bookingForm.get('emailHospede')?.valid) {
      camposInvalidos.push('Email');
    }
    
    if (!this.bookingForm.get('cpfHospede')?.valid) {
      camposInvalidos.push('CPF');
    }
    
    if (!this.bookingForm.get('telefoneHospede')?.valid) {
      camposInvalidos.push('Telefone');
    }

    if (!this.bookingForm.get('cepHospede')?.valid) {
      camposInvalidos.push('CEP');
    }

    if (!this.bookingForm.get('enderecoHospede')?.valid) {
      camposInvalidos.push('Endereço');
    }

    if (!this.bookingForm.get('numeroHospede')?.valid) {
      camposInvalidos.push('Número');
    }

    if (!this.bookingForm.get('bairroHospede')?.valid) {
      camposInvalidos.push('Bairro');
    }

    if (!this.bookingForm.get('cidadeHospede')?.valid) {
      camposInvalidos.push('Cidade');
    }

    if (!this.bookingForm.get('ufHospede')?.valid) {
      camposInvalidos.push('UF');
    }

    if (!this.bookingForm.get('modoPagamento')?.valid) {
      camposInvalidos.push('Modo de Pagamento');
    }
    
    return camposInvalidos;
  }

  // Métodos auxiliares para o template
  getTypeIcon(tipo: string): string {
    const icons: { [key: string]: string } = {
      'diaria': 'pi pi-home',
      'batismo': 'pi pi-sun'
    };
    return icons[tipo] || 'pi pi-info-circle';
  }

  getTypePrice(tipo: string): string {
    if (tipo === 'diaria') {
      const menorPreco = Math.min(...this.faixasPreco.map(f => f.valor));
      return `A partir de R$ ${menorPreco.toLocaleString('pt-BR')}`;
    } else if (tipo === 'batismo') {
      return `R$ ${this.precoBatismo.toLocaleString('pt-BR')}`;
    }
    return '';
  }

  getPaymentIcon(modo: string): string {
    const icons: { [key: string]: string } = {
      'PIX': 'pi pi-qrcode',
      'CARTAO': 'pi pi-credit-card',
      'BOLETO': 'pi pi-file-text'
    };
    return icons[modo] || 'pi pi-money-bill';
  }

  getPessoasRange(pessoas: number): string {
    if (pessoas <= 30) return 'até 30 pessoas';
    if (pessoas <= 60) return '31-60 pessoas';
    if (pessoas <= 100) return '61-100 pessoas';
    if (pessoas <= this.qtdMaxPessoas) return `101-${this.qtdMaxPessoas} pessoas`;
    return `mais de ${this.qtdMaxPessoas} pessoas`;
  }

  getParcelasOptions(): any[] {
    return [
      { label: 'À vista', value: 1 },
      { label: '2x sem juros', value: 2 },
      { label: '3x sem juros', value: 3 },
      { label: '6x sem juros', value: 6 },
      { label: '12x com juros', value: 12 }
    ];
  }

  increaseQuantity(field: string): void {
    const currentValue = this.bookingForm.get(field)?.value || 0;
    const maxValue = field === 'quantidadePessoas' ? this.qtdMaxPessoas : this.quantidadeMaximaChales;
    if (currentValue < maxValue) {
      this.bookingForm.get(field)?.setValue(currentValue + 1);
    }
  }

  decreaseQuantity(field: string): void {
    const currentValue = this.bookingForm.get(field)?.value || 0;
    const minValue = field === 'quantidadePessoas' ? 1 : 0;
    if (currentValue > minValue) {
      this.bookingForm.get(field)?.setValue(currentValue - 1);
    }
  }

  validateStep(step: number): boolean {
    const tipo = this.bookingForm.get('tipo')?.value;
    
    switch (step) {
      case 0: // Informações
        return !!(this.bookingForm.get('tipo')?.valid && 
               this.bookingForm.get('periodoReserva')?.valid &&
               this.bookingForm.get('quantidadePessoas')?.valid);
      case 1: // Adicionais (sempre válido, pois é opcional) - mas não aplicável para batismo
        return tipo !== 'batismo';
      case 2: // Hóspede
        return !!(this.bookingForm.get('nomeHospede')?.valid &&
               this.bookingForm.get('sobrenomeHospede')?.valid &&
               this.bookingForm.get('emailHospede')?.valid &&
               this.bookingForm.get('cpfHospede')?.valid &&
               this.bookingForm.get('telefoneHospede')?.valid &&
               this.bookingForm.get('cepHospede')?.valid &&
               this.bookingForm.get('enderecoHospede')?.valid &&
               this.bookingForm.get('numeroHospede')?.valid &&
               this.bookingForm.get('bairroHospede')?.valid &&
               this.bookingForm.get('cidadeHospede')?.valid &&
               this.bookingForm.get('ufHospede')?.valid);
      case 3: // Pagamento
        return !!(this.bookingForm.get('modoPagamento')?.valid);
      default:
        return false;
    }
  }

  // Método para validar input de pessoas
  validatePessoasInput(event: any): void {
    const value = parseInt(event.target.value);
    if (value > this.qtdMaxPessoas) {
      event.target.value = this.qtdMaxPessoas;
      this.bookingForm.get('quantidadePessoas')?.setValue(this.qtdMaxPessoas);
    } else if (value < 1) {
      event.target.value = 1;
      this.bookingForm.get('quantidadePessoas')?.setValue(1);
    }
  }

  // Método para prevenir entrada inválida
  preventInvalidInput(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    const isNumber = event.key >= '0' && event.key <= '9';
    
    if (!allowedKeys.includes(event.key) && !isNumber) {
      event.preventDefault();
    }
  }

  // Verificar progresso do formulário e controlar visibilidade das seções
  private checkFormProgress(): void {
    const tipo = this.bookingForm.get('tipo')?.value;
    
    // Mostrar seções gradualmente baseado no tipo selecionado
    if (tipo) {
      setTimeout(() => {
        this.showQuantitiesSection = true;
      }, 300);
      
      setTimeout(() => {
        this.showPeriodSection = true;
      }, 600);
    } else {
      // Resetar visibilidade se tipo não estiver selecionado
      this.showQuantitiesSection = false;
      this.showPeriodSection = false;
    }
  }

  // Verificar se alguma informação foi preenchida para mostrar o resumo
  hasFormData(): boolean {
    const formValue = this.bookingForm.value;
    
    // Só mostra o resumo se pelo menos o tipo de reserva estiver selecionado
    // e pelo menos uma informação adicional dos steps estiver preenchida
    const hasTipo = !!formValue.tipo;
    const hasAdditionalInfo = !!(
      formValue.periodoReserva || 
      formValue.quantidadePessoas > 0 || 
      formValue.quantidadeChales > 0 ||
      formValue.observacoes
    );
    
    return hasTipo && hasAdditionalInfo;
  }

  // Método para atualizar validadores do formulário com valores das configurações
  private atualizarValidadoresFormulario(): void {
    if (this.bookingForm) {
      // Atualizar validador de quantidade máxima de pessoas
      const quantidadePessoasControl = this.bookingForm.get('quantidadePessoas');
      if (quantidadePessoasControl) {
        quantidadePessoasControl.setValidators([
          Validators.required, 
          Validators.min(1), 
          Validators.max(this.qtdMaxPessoas)
        ]);
        quantidadePessoasControl.updateValueAndValidity();
      }

      // Atualizar validador de quantidade máxima de chalés
      const quantidadeChalesControl = this.bookingForm.get('quantidadeChales');
      if (quantidadeChalesControl) {
        quantidadeChalesControl.setValidators([
          Validators.min(0), 
          Validators.max(this.quantidadeMaximaChales)
        ]);
        quantidadeChalesControl.updateValueAndValidity();
      }
    }
  }

  // Método para atualizar descrições dos tipos de reserva com valores dinâmicos
  private atualizarDescricoesTiposReserva(): void {
    this.tiposReserva = [
      { value: 'diaria', label: 'Diária Completa', description: `Até ${this.qtdMaxPessoas} pessoas - Inclui cozinha, churrasqueira, banheiros e piscina` },
      { value: 'batismo', label: 'Cerimônia de Batismo', description: 'Incluso apenas o uso da piscina e banheiros' }
    ];
  }
}