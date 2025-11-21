import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Check, AlertCircle } from 'lucide-react-native';

export const isSuccesReqDialogComp = ({ message }: { message: string | undefined }) => {
  return (
    <DialogHeader className="w-full flex-col items-center justify-center gap-2">
      <Check stroke={'green'} strokeWidth={2.5} size={48} />

      <DialogTitle className="text-xl font-bold text-primary">{message}</DialogTitle>
    </DialogHeader>
  );
};

export const IsErrorReqDialogComp = ({ message }: { message: string | undefined }) => {
  return (
    <DialogHeader className="w-full flex-col items-center justify-center gap-2">
      <AlertCircle stroke={'red'} strokeWidth={2.5} size={48} />

      <DialogTitle className="text-xl font-bold text-destructive">{message}</DialogTitle>
    </DialogHeader>
  );
};
