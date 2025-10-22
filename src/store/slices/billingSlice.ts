import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PaymentMethod {
  last4: string;
  expiry: string;
  brand: string;
}

interface Subscription {
  plan: string;
  amount: number;
  interval: string;
  status: string;
  nextBillingDate: string;
  paymentMethod?: PaymentMethod;
}

interface Usage {
  promptsUsed: number;
  promptsLimit: number;
  competitors: number;
  competitorsLimit: number;
  apiCalls: number;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: string;
  downloadUrl?: string;
}

interface BillingState {
  subscription: Subscription;
  usage: Usage;
  invoices: Invoice[];
  loading: boolean;
}

const initialState: BillingState = {
  subscription: {
    plan: 'Free',
    amount: 0,
    interval: 'month',
    status: 'active',
    nextBillingDate: '',
  },
  usage: {
    promptsUsed: 0,
    promptsLimit: 100,
    competitors: 0,
    competitorsLimit: 5,
    apiCalls: 0,
  },
  invoices: [],
  loading: false,
};

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    setSubscription: (state, action: PayloadAction<Subscription>) => {
      state.subscription = action.payload;
    },
    setUsage: (state, action: PayloadAction<Usage>) => {
      state.usage = action.payload;
    },
    updateUsage: (state, action: PayloadAction<Partial<Usage>>) => {
      state.usage = {
        ...state.usage,
        ...action.payload
      };
    },
    setInvoices: (state, action: PayloadAction<Invoice[]>) => {
      state.invoices = action.payload;
    },
    updatePaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.subscription.paymentMethod = action.payload;
    },
    changePlan: (state, action: PayloadAction<{ plan: string; amount: number }>) => {
      state.subscription.plan = action.payload.plan;
      state.subscription.amount = action.payload.amount;
    },
    cancelSubscription: (state) => {
      state.subscription.status = 'cancelled';
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setSubscription,
  setUsage,
  updateUsage,
  setInvoices,
  updatePaymentMethod,
  changePlan,
  cancelSubscription,
  setLoading
} = billingSlice.actions;

export default billingSlice.reducer;