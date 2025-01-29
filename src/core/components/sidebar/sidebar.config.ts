interface MenuItem {
  route: string;
  title: string;
  permission: string;
  icon?: string;
}


export const MENU_CONFIG = {
  menuItems: [
    {
      route: '/dashboard',
      title: 'Tableau de bord',
      //permission: 'view_dashboard'
    },
    {
      route: '/cartes',
      title: 'Cartes en temps réel',
      permission: 'view_cartes'
    },
    {
      route: '/users',
      title: 'Utilisateurs',
      permission: 'view_users'
    },
    {
      route: '/tickets',
      title: 'Tickets',
      permission: 'view_tickets'
    },
    {
      route: '/settings',
      title: 'Paramètres',
      permission: 'manage_settings'
    },
    {
      route: '/assureurs',
      title: 'Assureurs',
      permission: 'view_assureurs'
    },
    {
      route: '/statistiques',
      title: 'Statistiques',
      permission: 'view_statistics'
    }
    ,
    {
      route: '/roles',
      title: 'Roles',
      permission: 'manage_roles'
    }
    ,
    {
      route: '/faqs',
      title: 'FAQs',
      permission: 'manage_faqs'
    }
  ]
};
