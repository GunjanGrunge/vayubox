import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      style: {
        background: '#000000',
        color: '#FAEB92',
        border: '1px solid #9929EA',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        padding: '12px 16px',
      },
      iconTheme: {
        primary: '#9929EA',
        secondary: '#FAEB92',
      },
    });
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
      style: {
        background: '#000000',
        color: '#CC66DA',
        border: '1px solid #9929EA',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        padding: '12px 16px',
      },
      iconTheme: {
        primary: '#CC66DA',
        secondary: '#000000',
      },
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: '#000000',
        color: '#FAEB92',
        border: '1px solid #9929EA',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        padding: '12px 16px',
      },
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, msgs, {
      style: {
        background: '#000000',
        border: '1px solid #9929EA',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        padding: '12px 16px',
      },
      success: {
        style: {
          color: '#FAEB92',
        },
        iconTheme: {
          primary: '#9929EA',
          secondary: '#FAEB92',
        },
      },
      error: {
        style: {
          color: '#CC66DA',
        },
        iconTheme: {
          primary: '#CC66DA',
          secondary: '#000000',
        },
      },
      loading: {
        style: {
          color: '#FAEB92',
        },
      },
    });
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  custom: (message: string, options?: Record<string, unknown>) => {
    toast(message, {
      style: {
        background: '#000000',
        color: '#FAEB92',
        border: '1px solid #9929EA',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        padding: '12px 16px',
      },
      ...options,
    });
  },
};

export default showToast;
