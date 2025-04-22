import { ApplicationRef, ComponentFactoryResolver, EmbeddedViewRef, Injectable, Injector } from "@angular/core";

@Injectable({
    providedIn: 'root'
  })
  export class ModalService {
    constructor(private componentFactoryResolver: ComponentFactoryResolver,
                private appRef: ApplicationRef,
                private injector: Injector) {}
    
    // Méthode pour ouvrir un modal
    open<T>(component: any, data?: any) {
      // Créer une instance du composant
      const componentRef = this.componentFactoryResolver
        .resolveComponentFactory(component)
        .create(this.injector);
      
      // Passer des données au composant si nécessaire
      if (data) {
        Object.assign(componentRef.instance as object, data);
      }
      
      // Attacher le composant à l'application
      this.appRef.attachView(componentRef.hostView);
      
      // Ajouter le composant au DOM
      const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
        .rootNodes[0] as HTMLElement;
      document.body.appendChild(domElem);
      
      // Appeler la méthode openModal du composant si elle existe
      if ((componentRef.instance as any).openModal) {
        (componentRef.instance as any).openModal();
      }
      
      // Retourner une référence au composant pour pouvoir le fermer plus tard
      return componentRef;
    }
    
    // Méthode pour fermer un modal
    close(componentRef: any) {
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
    }
  }