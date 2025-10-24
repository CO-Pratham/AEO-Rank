import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export const UpgradeDialog = ({ 
  isOpen, 
  onClose, 
  featureName = "this feature" 
}: UpgradeDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px] p-0 gap-0 bg-white">
        <div className="p-6 pb-8">
          <DialogHeader className="space-y-4 pb-0">
            <DialogTitle className="text-2xl font-semibold text-gray-900 text-center">
              Upgrade Plan!
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 space-y-2 text-center">
            <p className="text-gray-600 text-[15px]">
              Upgrade your plan to use {featureName}.
            </p>
            <p className="text-gray-600 text-[15px]">
              Book a call or send an email to{" "}
              <a 
                href="mailto:support@aeorank.ai" 
                className="text-gray-900 font-semibold hover:underline"
              >
                support@aeorank.ai
              </a>
            </p>
          </div>
          
          <div className="flex justify-end mt-8">
            <Button
              onClick={() => window.location.href = "mailto:support@aeorank.ai"}
              className="bg-black hover:bg-black/90 text-white px-6 py-2 rounded-md text-sm font-medium h-auto"
            >
              Write us
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

