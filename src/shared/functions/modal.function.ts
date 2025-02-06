import { FormGroup } from "@angular/forms";
import bootstrap from "bootstrap";

export class GlabalFunctions {
    roleForm!: FormGroup;


    private getModalInstance(modalId: string): any {
        const modalElement = document.getElementById(modalId);
        return modalElement ? bootstrap.Modal.getInstance(modalElement) : null;
    }
    
    private hideModal(modalId: string): void {
        const modalInstance = this.getModalInstance(modalId);
        if (modalInstance) {
        modalInstance.hide();
        this.roleForm.reset();
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        }
    }
}