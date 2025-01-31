interface MenuItem {
  route: string;
  title: string;
  permission?: string;
  icon?: string;
  children?: MenuItem[];
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
      route: '/finance',
      title: 'Gestion Finance',
      permission: 'view_finances',
      children: [
        {
          route: '/finance/gains',
          title: 'Gains',
          permission: 'view_gains'
        },
        {
          route: '/finance/courses',
          title: 'Courses',
          permission: 'view_courses'
        }/* ,
        {
          route: '/finance/rapports',
          title: 'Rapports financiers',
          permission: 'view_rapports_finances'
        } */
      ]
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
    },
    {
      route: '/roles',
      title: 'Roles',
      permission: 'manage_roles'
    },
    {
      route: '/faqs',
      title: 'FAQs',
      permission: 'manage_faqs'
    }
  ]
};