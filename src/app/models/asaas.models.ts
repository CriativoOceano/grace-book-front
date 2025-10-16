// Modelos para integração com ASAAS
export interface AsaasCustomer {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  cpfCnpj?: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  city?: string;
  state?: string;
  country?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
  additionalEmails?: string;
  municipalInscription?: string;
  stateInscription?: string;
  canDelete?: boolean;
  cannotBeDeletedReason?: string;
  canDeleteReason?: string;
  personType?: 'FISICA' | 'JURIDICA';
  companyType?: string;
}

export interface AsaasPayment {
  id?: string;
  customer: string;
  billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO' | 'UNDEFINED';
  dueDate: string;
  value: number;
  description?: string;
  externalReference?: string;
  installmentCount?: number;
  installmentValue?: number;
  discount?: {
    value: number;
    dueDateLimitDays: number;
    type: 'FIXED' | 'PERCENTAGE';
  };
  interest?: {
    value: number;
    type: 'PERCENTAGE';
  };
  fine?: {
    value: number;
    type: 'FIXED' | 'PERCENTAGE';
  };
  postalService?: boolean;
  split?: AsaasSplit[];
  callback?: {
    successUrl?: string;
    autoRedirect?: boolean;
  };
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
  creditCardToken?: string;
  remoteIp?: string;
}

export interface AsaasSplit {
  walletId: string;
  fixedValue?: number;
  percentualValue?: number;
  totalValue?: number;
}

export interface AsaasPaymentResponse {
  id: string;
  dateCreated: string;
  customer: string;
  paymentLink?: string;
  value: number;
  netValue: number;
  originalValue?: number;
  interestValue?: number;
  description?: string;
  billingType: string;
  pixTransaction?: string;
  status: 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'RECEIVED_IN_CASH' | 'OVERDUE' | 'REFUNDED' | 'RECEIVED_IN_CASH_AFTER_DUE_DATE';
  pixQrCodeId?: string;
  pixQrCode?: string;
  dueDate: string;
  originalDueDate: string;
  paymentDate?: string;
  clientPaymentDate?: string;
  installmentNumber?: number;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  transactionReceiptUrl?: string;
  invoiceNumber?: string;
  externalReference?: string;
  deleted: boolean;
  postalService?: boolean;
  anticipated?: boolean;
  anticipable?: boolean;
  creditCard?: {
    creditCardNumber: string;
    creditCardBrand: string;
    creditCardToken: string;
  };
  discount?: {
    value: number;
    dueDateLimitDays: number;
    type: string;
  };
  interest?: {
    value: number;
    type: string;
  };
  fine?: {
    value: number;
    type: string;
  };
  chargeback?: {
    status: string;
    reason: string;
  };
  refunds?: any[];
}

export interface AsaasWebhookPayload {
  event: 'PAYMENT_CREATED' | 'PAYMENT_AWAITING_PAYMENT' | 'PAYMENT_RECEIVED' | 'PAYMENT_OVERDUE' | 'PAYMENT_DELETED' | 'PAYMENT_RESTORED' | 'PAYMENT_REFUNDED' | 'PAYMENT_RECEIVED_IN_CASH_UNDONE' | 'PAYMENT_CHARGEBACK_REQUESTED' | 'PAYMENT_CHARGEBACK_DISPUTE' | 'PAYMENT_AWAITING_CHARGEBACK_REVERSAL' | 'PAYMENT_DUNNING_RECEIVED' | 'PAYMENT_DUNNING_REQUESTED' | 'PAYMENT_BANK_SLIP_VIEWED' | 'PAYMENT_CHECKOUT_VIEWED';
  payment: AsaasPaymentResponse;
}

export interface AsaasErrorResponse {
  errors: Array<{
    code: string;
    description: string;
  }>;
}

// Modelos para controle de idempotência
export interface PaymentRequest {
  idempotencyKey: string;
  customerId: string;
  amount: number;
  description: string;
  billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO';
  dueDate: string;
  externalReference?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  paymentLink?: string;
  qrCode?: string;
  error?: string;
  idempotencyKey: string;
  timestamp: string;
}

// Modelos para logs e auditoria
export interface PaymentLog {
  id: string;
  idempotencyKey: string;
  action: 'CREATE_PAYMENT' | 'WEBHOOK_RECEIVED' | 'PAYMENT_STATUS_CHANGED';
  status: 'SUCCESS' | 'ERROR' | 'PENDING';
  requestData?: any;
  responseData?: any;
  errorMessage?: string;
  timestamp: string;
  userId?: string;
  ipAddress?: string;
}
