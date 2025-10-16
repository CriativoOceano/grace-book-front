import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';

// PrimeNG Components
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { StepsModule } from 'primeng/steps';
import { ChipModule } from 'primeng/chip';
import { BadgeModule } from 'primeng/badge';
import { MessageService } from 'primeng/api';

// Services
import { PaymentService } from '../../services/payment.service';
import { ClienteService } from '../../core/services/cliente.service';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../services/booking.service';

// Custom Components
import { ChaletGalleryComponent } from '../../components/chalet-gallery/chalet-gallery.component';
import { PricingSummaryComponent } from '../../components/pricing-summary/pricing-summary.component';

// Models
import { PricingBreakdown } from '../../components/pricing-summary/pricing-summary.component';

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
    DropdownModule,
    DatePickerModule,
    DividerModule,
    MessageModule,
    ProgressSpinnerModule,
    StepsModule,
    ChipModule,
    BadgeModule,
    ChaletGalleryComponent,
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
    { value: 'batismo', label: 'Cerimônia de Batismo', description: 'Incluse uso da piscina e banheiros' }
  ];

  modosPagamento = [
    { value: 'PIX', label: 'PIX', description: 'Pagamento instantâneo' },
    { value: 'CARTAO', label: 'Cartão de Crédito', description: 'À vista ou parcelado' },
    { value: 'BOLETO', label: 'Boleto Bancário', description: 'Pagamento em até 3 dias' }
  ];

  // Propriedades para o calendário
  minDate: Date = new Date();
  maxDate: Date = new Date(new Date().getFullYear() + 1, 11, 31); // 1 ano no futuro

  // Steps para o stepper
  steps = [
    { label: 'Tipo de Reserva', icon: 'pi pi-info-circle' },
    { label: 'Extras', icon: 'pi pi-plus-circle' },
    { label: 'Hóspede', icon: 'pi pi-user' },
    { label: 'Pagamento', icon: 'pi pi-credit-card' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private paymentService: PaymentService,
    private clienteService: ClienteService,
    private authService: AuthService,
    private bookingService: BookingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.scrollToTop();
    this.preencherDadosUsuario();
    this.updatePricingData();
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

  // Função para desabilitar datas passadas
  disabledDate = (current: Date): boolean => {
    return current && current < new Date();
  };

  private initForm(): void {
    this.bookingForm = this.fb.group({
      // Passo 1: Informações básicas
      tipo: ['', [Validators.required]],
      periodoReserva: ['', [Validators.required]],
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
  }

  // Atualizar dados de pricing
  private updatePricingData(): void {
    if (!this.formInitialized) return;
    
    const formValue = this.bookingForm.value;
    const periodoReserva = formValue.periodoReserva;
    
    let quantidadeDias = 0; // Mudado de 1 para 0 - não deve ter valor padrão
    if (periodoReserva && periodoReserva.length === 2) {
      const dataInicio = new Date(periodoReserva[0]);
      const dataFim = new Date(periodoReserva[1]);
      
      // Validar se as datas são válidas
      if (!isNaN(dataInicio.getTime()) && !isNaN(dataFim.getTime())) {
        const diffTime = Math.abs(dataFim.getTime() - dataInicio.getTime());
        quantidadeDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        // Limitar a quantidade de dias para evitar valores absurdos
        if (quantidadeDias > 365) {
          quantidadeDias = 0; // Resetar se for um valor inválido
        }
      }
    }
    
    this.pricingData = {
      tipoReserva: formValue.tipo || '',
      quantidadePessoas: formValue.quantidadePessoas || 0,
      quantidadeChales: formValue.quantidadeChales || 0,
      quantidadeDias: quantidadeDias,
      valorDiaria: this.calculateDiariaValue(formValue.tipo, formValue.quantidadePessoas),
      valorChales: (formValue.quantidadeChales || 0) * 150,
      valorTotal: this.calculateTotalValue(formValue.tipo, formValue.quantidadePessoas, formValue.quantidadeChales, quantidadeDias),
      isLoading: false
    };
    
    this.valorCalculado = this.pricingData.valorTotal;
  }

  // Calcular valor da diária baseado na faixa de pessoas
  private calculateDiariaValue(tipo: string, pessoas: number): number {
    if (tipo !== 'diaria') return 0;
    
    if (pessoas <= 30) return 1000;
    if (pessoas <= 60) return 1500;
    if (pessoas <= 100) return 2000;
    if (pessoas <= 200) return 2500;
    return 2500;
  }

  // Calcular valor total
  private calculateTotalValue(tipo: string, pessoas: number, chales: number, dias: number): number {
    // Se não há dias selecionados, retornar 0
    if (dias === 0) {
      return 0;
    }
    
    switch (tipo) {
      case 'diaria':
        const valorDiaria = this.calculateDiariaValue(tipo, pessoas);
        const valorChales = chales * 150;
        return (valorDiaria + valorChales) * dias;
      case 'batismo':
        const valorBatismo = 300;
        const valorChalesBatismo = chales * 150;
        return valorBatismo + valorChalesBatismo;
      default:
        return 0;
    }
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
      
      if (!periodoReserva || periodoReserva.length !== 2) {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Selecione um período válido' });
        this.isLoading = false;
        return;
      }
      
      const dataInicio = new Date(periodoReserva[0]);
      const dataFim = new Date(periodoReserva[1]);
      
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
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Período disponível!' });
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
        multiplicadorDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        // Limitar a quantidade de dias para evitar valores absurdos
        if (multiplicadorDias > 365) {
          multiplicadorDias = 0; // Resetar se for um valor inválido
        }
      }
    }
    
    switch (tipo) {
      case 'diaria':
        if (quantidadePessoas <= 30) {
          valorBase = 1000;
        } else if (quantidadePessoas <= 60) {
          valorBase = 1500;
        } else if (quantidadePessoas <= 100) {
          valorBase = 2000;
        } else if (quantidadePessoas <= 200) {
          valorBase = 2500;
        } else {
          valorBase = 2500;
        }
        break;
        
      case 'batismo':
        valorBase = 300;
        multiplicadorDias = 1;
        break;
    }
    
    // Adicionar valor dos chalés para qualquer tipo de reserva
    const valorChales = quantidadeChales * 150;
    
    this.valorCalculado = valorBase * multiplicadorDias;
  }

  // Navegação entre passos
  nextStep(): void {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
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
        dadosHospede: {
          nome: customerData.nomeHospede,
          sobrenome: customerData.sobrenomeHospede,
          email: customerData.emailHospede,
          cpf: customerData.cpfHospede,
          telefone: customerData.telefoneHospede,
          observacoes: customerData.observacoesHospede
        }
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
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao processar reserva. Tente novamente.' });
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

  // Obter dados do cliente para o backend
  private getCustomerData(): any {
    const formValue = this.bookingForm.value;
    const periodoReserva = formValue.periodoReserva;
    
    let dataInicio: Date;
    let dataFim: Date;
    
    if (periodoReserva && periodoReserva.length === 2) {
      dataInicio = new Date(periodoReserva[0]);
      dataFim = new Date(periodoReserva[1]);
    } else {
      throw new Error('Período de reserva inválido');
    }
    
    return {
      tipo: this.mapTipoToBackend(formValue.tipo),
      dataInicio: dataInicio.toISOString(),
      dataFim: dataFim.toISOString(),
      quantidadePessoas: formValue.quantidadePessoas || 1,
      quantidadeChales: formValue.quantidadeChales || 0,
      observacoes: formValue.observacoes || '',
      dadosPagamento: {
        modoPagamento: formValue.modoPagamento,
        parcelas: formValue.parcelas || 1,
        valorTotal: this.valorCalculado
      },
      nomeHospede: formValue.nomeHospede,
      sobrenomeHospede: formValue.sobrenomeHospede,
      emailHospede: formValue.emailHospede,
      cpfHospede: formValue.cpfHospede,
      telefoneHospede: formValue.telefoneHospede,
      observacoesHospede: formValue.observacoesHospede,
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
    if (!periodo || periodo.length !== 2) {
      return 'Período não selecionado';
    }
    
    const dataInicio = new Date(periodo[0]);
    const dataFim = new Date(periodo[1]);
    
    const formatoData = (data: Date) => {
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };
    
    if (dataInicio.getTime() === dataFim.getTime()) {
      return formatoData(dataInicio);
    }
    
    return `${formatoData(dataInicio)} - ${formatoData(dataFim)}`;
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
    const prices: { [key: string]: string } = {
      'diaria': 'A partir de R$ 1.000',
      'batismo': 'R$ 300,00'
    };
    return prices[tipo] || '';
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
    const maxValue = field === 'quantidadePessoas' ? 200 : 4;
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
    if (value > 200) {
      event.target.value = 200;
      this.bookingForm.get('quantidadePessoas')?.setValue(200);
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