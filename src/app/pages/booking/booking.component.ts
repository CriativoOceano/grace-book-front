import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
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
    valorTotal: 0,
    isLoading: true
  };
  
  // Opções para os selects
  tiposReserva = [
    { value: 'diaria', label: 'Diária Completa', description: 'Até 200 pessoas - Inclui cozinha, churrasqueira, banheiros e piscina' },
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
        console.error('Erro ao carregar imagens dos chalés:', error);
        // Usar imagens padrão em caso de erro
        this.chaletImages = this.conteudoService.getChaletImages();
        this.chaletImagesLoading = false;
      }
    });
  }

  // Carregar datas bloqueadas (reservas confirmadas)
  private carregarDatasBloqueadas(): void {
    this.isLoadingDatasBloqueadas = true;
    console.log('🔄 Iniciando carregamento de datas bloqueadas...');
    
    // Limpar array antes de carregar
    this.datasBloqueadas = [];
    
    // Adicionar uma data de teste para debug
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    amanha.setHours(0, 0, 0, 0); // Normalizar para meia-noite
    this.datasBloqueadas.push(amanha);
    console.log('🧪 Data de teste adicionada:', amanha.toDateString());
    
    this.bookingService.getReservasConfirmadas().subscribe({
      next: (reservas: any[]) => {
        console.log('📅 Reservas confirmadas recebidas:', reservas);
        
        reservas.forEach(reserva => {
          const dataInicio = new Date(reserva.dataInicio);
          const dataFim = new Date(reserva.dataFim);
          
          console.log(`📆 Processando reserva: ${dataInicio.toDateString()} até ${dataFim.toDateString()}`);
          
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
        
        this.isLoadingDatasBloqueadas = false;
        console.log('✅ Datas bloqueadas carregadas:', this.datasBloqueadas.length);
        console.log('📋 Lista de datas bloqueadas:', this.datasBloqueadas.map(d => d.toDateString()));
        
        // Aplicar estilos específicos às datas de reservas confirmadas
        this.aplicarEstilosReservasConfirmadas();
      },
      error: (error) => {
        console.error('❌ Erro ao carregar datas bloqueadas:', error);
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
        console.log('🔍 DEBUG - Configurações carregadas:', {
          config: config,
          precoChale: this.precoChale,
          precoBatismo: this.precoBatismo,
          faixasPreco: this.faixasPreco
        });
        
        // Atualizar data mínima baseada na configuração
        this.atualizarDataMinima();
        
        // Recalcular valores com os novos preços
        this.calcularValor();
      },
      error: (error) => {
        console.error('Erro ao carregar configurações:', error);
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
        console.log(`🚫 Data bloqueada encontrada: ${dataString}`);
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
      quantidadePessoas: [1, [Validators.required, Validators.min(1), Validators.max(200)]],
      quantidadeChales: [0, [Validators.min(0), Validators.max(4)]],
      observacoes: [''],
      
      // Passo 2: Informações do hóspede
      nomeHospede: ['', [Validators.required, Validators.minLength(2)]],
      sobrenomeHospede: ['', [Validators.required, Validators.minLength(2)]],
      emailHospede: ['', [Validators.required, Validators.email]],
      cpfHospede: ['', [Validators.required, this.cpfValidator]],
      telefoneHospede: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/)]],
      observacoesHospede: [''],
      
      // Campos de endereço
      enderecoHospede: [''],
      numeroHospede: [''],
      cepHospede: [''],
      bairroHospede: [''],
      cidadeHospede: [''],
      ufHospede: [''],
      
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
    console.log('🔍 DEBUG - Cálculo dos chalés:', {
      quantidadeChales: formValue.quantidadeChales || 0,
      precoChale: this.precoChale,
      quantidadeDias: quantidadeDias,
      valorChales: valorChales
    });
    
    const valorTotalCalculado = this.calculateTotalValue(formValue.tipo, formValue.quantidadePessoas, formValue.quantidadeChales, quantidadeDias);
    
    this.pricingData = {
      tipoReserva: formValue.tipo || '',
      quantidadePessoas: formValue.quantidadePessoas || 0,
      quantidadeChales: formValue.quantidadeChales || 0,
      quantidadeDias: quantidadeDias,
      valorDiaria: this.calculateDiariaValue(formValue.tipo, formValue.quantidadePessoas),
      valorChales: valorChales,
      valorTotal: valorTotalCalculado,
      isLoading: false
    };
    
    // 🔍 DEBUG: Log do pricingData atualizado
    console.log('🔍 DEBUG - PricingData atualizado:', {
      pricingData: this.pricingData,
      valorCalculado: this.valorCalculado
    });
    
    this.valorCalculado = this.pricingData.valorTotal;
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
        console.log('🔍 DEBUG - Cálculo TOTAL para diária:', {
          tipo: tipo,
          pessoas: pessoas,
          chales: chales,
          dias: dias,
          valorDiaria: valorDiaria,
          valorDiariaTotal: valorDiaria * dias,
          valorChales: valorChales,
          valorTotal: valorTotal
        });
        break;
        
      case 'batismo':
        const valorBatismo = this.precoBatismo;
        const valorChalesBatismo = chales * this.precoChale * dias;
        valorTotal = valorBatismo + valorChalesBatismo;
        
        // 🔍 DEBUG: Log do cálculo total para batismo
        console.log('🔍 DEBUG - Cálculo TOTAL para batismo:', {
          tipo: tipo,
          pessoas: pessoas,
          chales: chales,
          dias: dias,
          valorBatismo: valorBatismo,
          valorChalesBatismo: valorChalesBatismo,
          valorTotal: valorTotal
        });
        break;
        
      default:
        valorTotal = 0;
    }
    
    return valorTotal;
  }

  // Verificar disponibilidade
  verificarDisponibilidade(): void {
    this.markFormGroupTouched();
    
    if (this.bookingForm.get('tipo')?.valid && 
        this.bookingForm.get('periodoReserva')?.valid &&
        this.bookingForm.get('nomeHospede')?.valid &&
        this.bookingForm.get('sobrenomeHospede')?.valid &&
        this.bookingForm.get('emailHospede')?.valid &&
        this.bookingForm.get('cpfHospede')?.valid &&
        this.bookingForm.get('telefoneHospede')?.valid) {
      
      this.isLoading = true;
      
      const periodoReserva = this.bookingForm.get('periodoReserva')?.value;
      const tipo = this.bookingForm.get('tipo')?.value;
      const quantidadeChales = this.bookingForm.get('quantidadeChales')?.value || 0;
      
      let dataInicio: Date;
      let dataFim: Date;
      
      if (tipo === 'batismo') {
        // Para batismo: data única
        if (!periodoReserva) {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Selecione uma data válida para o batismo' });
          this.isLoading = false;
          return;
        }
        
        if (periodoReserva instanceof Date) {
          dataInicio = new Date(periodoReserva);
          dataFim = new Date(periodoReserva);
        } else if (Array.isArray(periodoReserva) && periodoReserva.length === 1) {
          dataInicio = new Date(periodoReserva[0]);
          dataFim = new Date(periodoReserva[0]);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Selecione uma data válida para o batismo' });
          this.isLoading = false;
          return;
        }
      } else {
        // Para hospedagem: período (range)
        if (!periodoReserva || !Array.isArray(periodoReserva) || periodoReserva.length !== 2) {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Selecione um período válido' });
          this.isLoading = false;
          return;
        }
        
        dataInicio = new Date(periodoReserva[0]);
        dataFim = new Date(periodoReserva[1]);
      }
      
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
          console.error('Erro ao verificar disponibilidade:', error);
          
          this.disponibilidadeResultado = {
            disponivel: true,
            mensagem: 'Backend não disponível - assumindo período disponível para teste'
          };
          this.disponibilidadeVerificada = true;
          
          this.calcularValor();
          this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Backend não disponível. Continuando em modo de teste...' });
          this.nextStep();
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
        } else {
          this.calcularValorLocal();
        }
      },
      error: (error) => {
        console.error('Erro ao calcular valor no backend:', error);
        this.calcularValorLocal();
        this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Backend não disponível. Usando cálculo local...' });
      }
    });
  }
  
  // Cálculo local como fallback
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
    console.log('🔍 DEBUG - Cálculo LOCAL dos chalés:', {
      quantidadeChales: quantidadeChales,
      precoChale: this.precoChale,
      multiplicadorDias: multiplicadorDias,
      valorChales: valorChales,
      valorBase: valorBase,
      valorTotal: valorBase * multiplicadorDias + valorChales
    });
    
    this.valorCalculado = valorBase * multiplicadorDias + valorChales;
  }

  // Navegação entre passos
  nextStep(): void {
    if (this.currentStep < 3) {
      // Se está saindo do step de chalés (step 1) para hóspede (step 2), mostrar informações
      if (this.currentStep === 1) {
        this.infoItensVisible = true;
      }
      
      this.currentStep++;
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
      this.currentStep--;
      this.scrollToTop();
    }
  }

  // Método para abrir seletor de data (placeholder)
  openDatePicker(): void {
    // Por enquanto, apenas mostra uma mensagem
    // Em uma implementação real, você abriria um modal ou date picker customizado
    console.log('Abrir seletor de data');
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
      console.log('⚠️ Processamento já em andamento, ignorando clique duplo');
      return;
    }
    
    this.markFormGroupTouched();
    
    if (this.bookingForm.valid) {
      this.isProcessingPayment = true;
      
      const customerData = this.getCustomerData();
      
      console.log('🚀 BookingComponent: Enviando dados para o backend');
      console.log('📋 Dados da reserva:', customerData);
      
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
          console.log('✅ Resposta do backend:', response);
          
          const hasReserva = response.reserva;
          const hasLinkPagamento = response.pagamento?.linkPagamento;
          
          if (hasReserva && hasLinkPagamento) {
            this.paymentData = response;
            this.paymentLink = response.pagamento.linkPagamento;
            
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Reserva criada com sucesso! Redirecionando para o pagamento...' });
            this.isProcessingPayment = false;
            
            this.redirectToCheckout(response);
          } else {
            console.error('❌ Estrutura de resposta inesperada:', response);
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao processar pagamento - dados incompletos' });
            this.isProcessingPayment = false;
          }
        },
        error: (error) => {
          console.error('❌ Erro ao criar reserva:', error);
          
          // Extrair mensagem específica do backend
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
          
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: errorMessage });
          this.isProcessingPayment = false;
        }
      });
    } else {
      const camposInvalidos = this.getInvalidFields();
      console.log('❌ Campos inválidos encontrados:', camposInvalidos);
      
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: `Preencha os campos obrigatórios: ${camposInvalidos.join(', ')}` });
    }
  }

  // Redirecionar para o checkout do ASAAS
  private redirectToCheckout(response: any): void {
    console.log('🔗 Redirecionando para checkout:', response);
    
    const checkoutUrl = response.pagamento?.linkPagamento;
    
    if (checkoutUrl) {
      console.log('✅ Abrindo URL do checkout:', checkoutUrl);
      window.location.href = checkoutUrl;
    } else {
      console.error('❌ URL de checkout não encontrada na resposta:', response);
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
          return [];
        }
        
        this.buscandoCep = true;
        this.cepEncontrado = false;
        
        return this.cepService.buscarCep(cep);
      })
    ).subscribe({
      next: (endereco: EnderecoCompleto) => {
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
      },
      error: (error) => {
        this.buscandoCep = false;
        this.cepEncontrado = false;
        
        // Só mostrar erro se não for erro de validação
        if (error.message && !error.message.includes('8 dígitos')) {
          console.warn('Erro ao buscar CEP:', error.message);
        }
      }
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
    
    // 🔍 DEBUG: Log dos valores do formulário
    console.log('🔍 DEBUG - Valores do formulário:', formValue);
    console.log('🔍 DEBUG - Campos do hóspede:', {
      nomeHospede: formValue.nomeHospede,
      sobrenomeHospede: formValue.sobrenomeHospede,
      emailHospede: formValue.emailHospede,
      cpfHospede: formValue.cpfHospede,
      telefoneHospede: formValue.telefoneHospede
    });
    
    // ✅ Validar campos obrigatórios antes de enviar
    if (!formValue.emailHospede || !formValue.cpfHospede) {
      console.error('❌ Campos obrigatórios ausentes:', {
        email: formValue.emailHospede,
        cpf: formValue.cpfHospede
      });
      throw new Error('Email e CPF são obrigatórios para criar uma reserva');
    }
    
    const periodoReserva = formValue.periodoReserva;
    const tipoReserva = formValue.tipo;
    
    let dataInicio: Date;
    let dataFim: Date;
    let quantidadeDiarias: number;
    
    if (tipoReserva === 'batismo') {
      // Para batismo: data única
      console.log('🔍 DEBUG - Processando batismo com data:', periodoReserva);
      
      if (periodoReserva instanceof Date) {
        dataInicio = new Date(periodoReserva);
        dataFim = new Date(periodoReserva); // Mesma data para início e fim
        quantidadeDiarias = 1; // Batismo sempre é 1 diária
        console.log('🔍 DEBUG - Batismo: data única processada:', { dataInicio, dataFim, quantidadeDiarias });
      } else if (Array.isArray(periodoReserva) && periodoReserva.length === 1) {
        dataInicio = new Date(periodoReserva[0]);
        dataFim = new Date(periodoReserva[0]);
        quantidadeDiarias = 1;
        console.log('🔍 DEBUG - Batismo: array com 1 data processada:', { dataInicio, dataFim, quantidadeDiarias });
      } else {
        console.error('❌ DEBUG - Batismo: formato de data inválido:', periodoReserva);
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
        
        // 🔍 DEBUG: Log detalhado do cálculo
        console.log('🔍 DEBUG - Cálculo de diárias:', {
          dataInicio: dataInicio.toISOString(),
          dataFim: dataFim.toISOString(),
          diferencaMS: diferencaMS,
          diferencaDias: diferencaMS / (1000 * 60 * 60 * 24),
          quantidadeDiarias: quantidadeDiarias
        });
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
    if (pessoas <= 200) return '101-200 pessoas';
    return 'mais de 200 pessoas';
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
    switch (step) {
      case 0: // Informações
        return !!(this.bookingForm.get('tipo')?.valid && 
               this.bookingForm.get('periodoReserva')?.valid &&
               this.bookingForm.get('quantidadePessoas')?.valid);
      case 1: // Adicionais (sempre válido, pois é opcional)
        return true;
      case 2: // Hóspede
        return !!(this.bookingForm.get('nomeHospede')?.valid &&
               this.bookingForm.get('sobrenomeHospede')?.valid &&
               this.bookingForm.get('emailHospede')?.valid &&
               this.bookingForm.get('cpfHospede')?.valid &&
               this.bookingForm.get('telefoneHospede')?.valid);
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
}