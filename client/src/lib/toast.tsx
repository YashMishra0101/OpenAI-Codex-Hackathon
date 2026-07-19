import { toast, Toast } from 'react-hot-toast';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export const TOAST_DURATION = 2200;

interface ToastOptions {
  title: string;
  description?: string;
}

const CustomToast = ({ t, title, description, type }: ToastOptions & { t: Toast; type: 'success' | 'error' | 'info' }) => {
  const isSuccess = type === 'success';
  const isError = type === 'error';
  
  const Icon = isSuccess ? CheckCircle2 : isError ? XCircle : Info;
  const iconColor = isSuccess ? 'text-success' : isError ? 'text-error' : 'text-info';

  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-surface-raised shadow-xl shadow-black/40 border border-border/60 rounded-xl pointer-events-auto flex overflow-hidden transition-all duration-300`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-foreground tracking-tight">
              {title}
            </p>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex border-l border-border/50">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-xl px-4 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 focus:outline-none transition-colors"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export const authToast = {
  success: (title: string, description?: string, id?: string) => {
    toast.custom((t) => (
      <CustomToast t={t} title={title} description={description} type="success" />
    ), { id, duration: TOAST_DURATION });
  },
  error: (title: string, description?: string, id?: string) => {
    toast.custom((t) => (
      <CustomToast t={t} title={title} description={description} type="error" />
    ), { id, duration: TOAST_DURATION });
  },
  info: (title: string, description?: string, id?: string) => {
    toast.custom((t) => (
      <CustomToast t={t} title={title} description={description} type="info" />
    ), { id, duration: TOAST_DURATION });
  }
};
